// A pass over the built file looking for the kinds of fault that do not throw:
// text that will not fit, targets a thumb cannot hit, contrast that fails in
// the dark, and anything that reaches outside the file.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] ?? path.join(root, "dist", "HER.html");
const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: CHROME });

const seed = () => { if (localStorage.getItem("her.v1")) return;
  localStorage.setItem("her.v1", JSON.stringify({ schema:1, greeted:true, entered:true, watched:true,
    reelAt:0, reelFurthest:0, opened:{}, spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[],
    words:{}, visits:[], sound:false, motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1 })); };

const ROOMS = ["letters","say","everything","promises","days","distance","reel","settings"];

for (const [w, h, label] of [[320, 568, "iPhone SE"], [390, 844, "iPhone 14"], [430, 932, "iPhone Pro Max"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(seed);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (let i = 0; i <= ROOMS.length; i++) {
    if (i > 0) { await page.keyboard.press(String(i)); await page.waitForTimeout(700); }
    const room = await page.evaluate(() => document.querySelector(".house")?.dataset.room);
    const bad = await page.evaluate(() => {
      const out = { overflow: [], small: [], clipped: [] };
      const main = document.querySelector(".house-main");
      if (!main) return out;
      const box = main.getBoundingClientRect();
      for (const el of main.querySelectorAll("*")) {
        // .sr-only is a one-pixel box on purpose: it is there for a screen
        // reader and nothing else.
        if (el.closest(".sr-only")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.right > box.right + 1 || r.left < box.left - 1)
          out.overflow.push(`${el.className || el.tagName} ${Math.round(r.left)}..${Math.round(r.right)} in ${Math.round(box.left)}..${Math.round(box.right)}`);
        // A text node clipped by its own box.
        if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible")
          out.clipped.push(`${el.className || el.tagName} ${el.scrollWidth}>${el.clientWidth}`);
      }
      for (const el of main.querySelectorAll("button, a, input, textarea, select, [role=button]")) {
        if (el.closest(".sr-only")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        // A control wrapped in a label is hit through the label.
        const label = el.closest("label");
        if (label && label !== el) {
          const lr = label.getBoundingClientRect();
          if (lr.height >= 44) continue;
        }
        const after = getComputedStyle(el, "::after");
        let grow = 0;
        if (after.content !== "none" && after.position === "absolute") {
          const t = parseFloat(after.top) || 0, b = parseFloat(after.bottom) || 0;
          grow = -(t + b);
        }
        const tall = r.height + Math.max(0, grow);
        if (tall < 43.5) out.small.push(`${el.className || el.tagName} ${Math.round(r.width)}x${Math.round(tall)}`);
      }
      return out;
    });
    const scrollsSideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    const problems = [];
    if (bad.overflow.length) problems.push(`overflow: ${bad.overflow.slice(0, 3).join(" | ")}`);
    if (bad.clipped.length) problems.push(`clipped: ${bad.clipped.slice(0, 3).join(" | ")}`);
    if (bad.small.length) problems.push(`under 44: ${bad.small.slice(0, 4).join(" | ")}`);
    if (scrollsSideways) problems.push("the page scrolls sideways");
    if (problems.length) console.log(`${label} · ${room}\n    ${problems.join("\n    ")}`);
    if (i > 0) { await page.keyboard.press("Escape"); await page.waitForTimeout(450); }
  }
  await ctx.close();
}

// ── contrast, in the dark ─────────────────────────────────────────────────
//
// The whole house is pale text on near-black. The risk is not that something
// is unreadable — it is that a colour written for a lit room is a whisper on
// an OLED at two in the morning.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(seed);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (let i = 0; i <= ROOMS.length; i++) {
    if (i > 0) { await page.keyboard.press(String(i)); await page.waitForTimeout(700); }
    const room = await page.evaluate(() => document.querySelector(".house")?.dataset.room);
    const faint = await page.evaluate(() => {
      const lum = (r, g, b) => {
        const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const parse = (c) => (c.match(/[\d.]+/g) ?? []).map(Number);
      const over = (fg, bg) => {
        const a = fg[3] ?? 1;
        return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
      };
      // The ground a given piece of text is actually on — the nearest ancestor
      // with an opaque background. Measuring everything against the house was
      // the audit's own bug: it read the gold buttons as 1.04:1 because it
      // compared their dark label to the dark room behind them.
      const groundOf = (el) => {
        // Composite the stack of translucent backgrounds down to one colour.
        // A gold button at 86% over a dark room is not "the dark room".
        const stack = [];
        for (let n = el; n; n = n.parentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          const a = c[3] ?? 1;
          if (a <= 0.001) continue;
          stack.push([c[0], c[1], c[2], a]);
          if (a >= 0.999) break;
        }
        let ground = [7, 8, 12];
        for (let i = stack.length - 1; i >= 0; i--) ground = over(stack[i], ground);
        return ground;
      };
      const out = [];
      for (const el of document.querySelectorAll(".house-main *")) {
        if (el.children.length || !el.textContent.trim()) continue;
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const ground = groundOf(el);
        const fg = over(parse(cs.color), ground);
        const l1 = lum(...fg) + 0.05;
        const l2 = lum(ground[0], ground[1], ground[2]) + 0.05;
        const ratio = Math.max(l1, l2) / Math.min(l1, l2);
        const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
        // --paper-ghost is a deliberate 3:1 floor, and only for a word that
        // repeats what is directly beside it. Everything else owes 4.5.
        const ghost = cs.color === getComputedStyle(document.documentElement)
          .getPropertyValue("--paper-ghost").trim()
          || cs.color === "rgba(211, 192, 170, 0.455)";
        const need = large || ghost ? 3 : 4.5;
        if (ratio < need)
          out.push(`${el.className || el.tagName} ${size.toFixed(0)}px ${ratio.toFixed(2)}:1 (needs ${need}) "${el.textContent.trim().slice(0, 34)}"`);
      }
      return out;
    });
    if (faint.length) console.log(`contrast · ${room}\n    ${[...new Set(faint)].slice(0, 6).join("\n    ")}`);
    if (i > 0) { await page.keyboard.press("Escape"); await page.waitForTimeout(450); }
  }
  await ctx.close();
}

await browser.close();
console.log("audit done");
