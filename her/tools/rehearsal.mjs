// Watch the rehearsal the way he will: open it, wait, see the night arrive.
import { chromium } from "playwright";
const FILE = "/home/user/call-and-response-relay/her/dist/HER-rehearsal.html";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, offline: true });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e.message)));
page.on("console", m => m.type() === "error" && errs.push(m.text()));
await page.goto("file://" + FILE, { waitUntil: "load" });
await page.waitForTimeout(1500);
console.log("clock says:", await page.evaluate(() => new Date().toString().slice(0, 24)));
console.log("mark:", await page.evaluate(() => [...document.querySelectorAll("p")].map(p => p.textContent).find(t => /rehearsal/i.test(t ?? "")) ?? "MISSING"));
console.log("mode:", await page.evaluate(() => document.querySelector(".shell")?.dataset.mode));
console.log("first screen:", (await page.locator("#root").innerText()).replace(/\s+/g, " ").slice(0, 100));
// Nothing it does may touch real storage.
console.log("real storage untouched:", await page.evaluate(() => {
  try { return Object.keys(window.localStorage).join(",") || "(shim)"; } catch { return "blocked"; }
}));
// Wait for nine to arrive on its own.
for (let i = 0; i < 14; i++) {
  await page.waitForTimeout(3000);
  const mode = await page.evaluate(() => document.querySelector(".shell")?.dataset.mode);
  if (mode === "hour") { console.log(`the night arrived after ~${(i + 1) * 3}s`); break; }
}
console.log("now:", (await page.locator("#root").innerText()).replace(/\s+/g, " ").slice(0, 90));
console.log("errors:", errs.length ? errs[0] : "none");
await b.close();
