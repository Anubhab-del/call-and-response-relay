// Opens the built file the way she will: local, offline, one thumb.
// Walks the house on a set of real calendar days and asserts what should be true.
import { chromium } from "playwright";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] ?? path.join(root, "dist", "HER.html");
const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const results = [];
const ok = (name, pass, detail = "") => results.push({ name, pass, detail });

// Pretend it is a given local wall-clock moment, without freezing timers.
const fakeClock = (iso) => `(() => {
  const target = new Date(${JSON.stringify(iso)}).getTime();
  const real = Date.now();
  const shift = target - real;
  const RealDate = Date;
  class ShiftedDate extends RealDate {
    constructor(...args) { if (args.length === 0) super(RealDate.now() + shift); else super(...args); }
    static now() { return RealDate.now() + shift; }
  }
  ShiftedDate.parse = RealDate.parse; ShiftedDate.UTC = RealDate.UTC;
  globalThis.Date = ShiftedDate;
})()`;

const browser = await chromium.launch({ executablePath: CHROME });

async function visit(iso, { entered = true, viewport = { width: 390, height: 844 } } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  const external = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("request", (r) => { const u = r.url(); if (u !== "file://" + FILE && !/^(data|blob):/.test(u)) external.push(u); });
  await page.addInitScript(fakeClock(iso));
  if (entered) {
    await page.addInitScript(() => {
      if (localStorage.getItem("her.v1")) return;
      localStorage.setItem(
        "her.v1",
        JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true, reelAt: 0, reelFurthest: 0,
          opened: {}, spentOnce: false, kept: {}, collected: {}, pulls: {}, replies: [], words: {},
          visits: [], sound: false, motion: "full", inbox: [], nameWritten: true, firstOpen: 0, lastOpen: 0 }),
      );
    });
  }
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1400);
  const text = async () => (await page.locator("#root").innerText()).replace(/\s+/g, " ").trim();
  const room = async (name) => {
    const el = page.getByText(name, { exact: true }).first();
    if (!(await el.count())) return "";
    await el.click();
    await page.waitForTimeout(900);
    const t = await text();
    const back = page.getByRole("button", { name: /back|the house|←/i }).first();
    if (await back.count()) { await back.click(); await page.waitForTimeout(700); }
    return t;
  };
  return { page, ctx, text, room, errors, external, close: () => ctx.close() };
}

// ── a plain Tuesday ────────────────────────────────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  const home = await v.text();
  ok("plain day: no anniversary takeover", !/September the second/i.test(home.split("ROOMS")[0]), home.slice(0, 90));
  ok("plain day: day count present", /\d[\d,]* DAYS/.test(home));
  ok("plain day: no console errors", v.errors.length === 0, v.errors.join(" | "));
  ok("plain day: nothing fetched", v.external.length === 0, v.external.join(" | "));
  const letters = await v.room("Letters");
  ok("plain day: birthday letter sealed", /on your birthday/i.test(letters));
  await v.close();
}

// ── the second of September ────────────────────────────────────────────────
{
  const v = await visit("2026-09-02T10:00:00");
  const home = await v.text();
  ok("Sept 2: the house knows the day", /September the second/i.test(home), home.slice(0, 140));
  ok("Sept 2: says Today, not a countdown", !/DAYS TO THE NEXT SEPTEMBER/i.test(home), home.slice(0, 140));
  ok("Sept 2: three years exactly", /1,096 DAYS/.test(home), home.match(/[\d,]+ DAYS/)?.[0] ?? "");
  await v.close();
}

// ── her birthday ───────────────────────────────────────────────────────────
{
  const v = await visit("2026-06-13T08:00:00");
  const letters = await v.room("Letters");
  ok("birthday: the sealed letter has opened", /on your birthday/i.test(letters) && !/on your birthday[^]{0,80}opens in/i.test(letters), letters.slice(0, 200));
  const home = await v.text();
  ok("birthday: the house says so", /birthday/i.test(home), home.slice(0, 140));
  await v.close();
}

// ── the third of May ───────────────────────────────────────────────────────
{
  const v = await visit("2027-05-03T20:00:00");
  const home = await v.text();
  ok("May 3: the house knows the day", /third of May/i.test(home), home.slice(0, 140));
  await v.close();
}

// ── the week of the wedding ────────────────────────────────────────────────
{
  const v = await visit("2027-11-26T09:00:00");
  const letters = await v.room("Letters");
  ok("wedding week: that letter has opened", /week of the wedding/i.test(letters), letters.slice(0, 200));
  ok("wedding week: the tenth September is still sealed", /tenth September/i.test(letters));
  await v.close();
}

// ── the day before the wedding-week letter ─────────────────────────────────
{
  const v = await visit("2027-11-23T09:00:00");
  const letters = await v.room("Letters");
  const seg = letters.match(/the week of the wedding[^]{0,60}/i)?.[0] ?? "";
  ok("day before: wedding-week letter still sealed", /opens|sealed|\d/.test(seg), seg);
  await v.close();
}

// ── first class ────────────────────────────────────────────────────────────
{
  const v = await visit("2028-06-01T07:30:00");
  const letters = await v.room("Letters");
  ok("first class: that letter has opened", /first class/i.test(letters), letters.slice(0, 200));
  await v.close();
}

// ── two in the morning ─────────────────────────────────────────────────────
{
  const v = await visit("2026-10-07T02:00:00");
  const home = await v.text();
  ok("2am: the greeting knows the hour", /late|awake|lamp/i.test(home), home.slice(0, 120));
  await v.close();
}

// ── the fuse box round-trips a real backup ────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.addInitScript(fakeClock("2026-09-15T15:00:00"));
  await page.addInitScript(() => {
    if (localStorage.getItem("her.v1")) return;
    localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true,
      reelFurthest: 41, sound: false, motion: "full", nameWritten: true }));
  });
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1300);

  const enter = async (name) => { await page.getByText(name, { exact: true }).first().click(); await page.waitForTimeout(800); };
  const leave = async () => { const b = page.getByRole("button", { name: /back|the house|←/i }).first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(700); } };

  // open a letter
  await enter("Letters");
  await page.getByText("when you doubt this", { exact: false }).first().click();
  await page.waitForTimeout(900);
  const close = page.getByRole("button", { name: /close it/i }).first();
  if (await close.count()) { await close.click(); await page.waitForTimeout(600); }
  await leave();
  // mark a promise kept
  await enter("Promises");
  await page.getByText("I stay.", { exact: true }).first().click();
  await page.waitForTimeout(500);
  const keep = page.getByRole("button", { name: /kept|you kept it|mark/i }).first();
  if (await keep.count()) { await keep.click(); await page.waitForTimeout(600); }
  await leave();

  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")));
  ok("a letter opened is remembered", Object.keys(before.opened).length > 0, JSON.stringify(before.opened));
  ok("a vow kept is remembered", Object.keys(before.kept).length > 0, JSON.stringify(before.kept));

  // save everything
  await enter("The fuse box");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /save everything/i }).first().click(),
  ]);
  const backupPath = path.join(os.tmpdir(), "her-check-backup.json");
  await download.saveAs(backupPath);

  await ctx.close();

  // a brand new phone: fresh profile, nothing remembered
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page2 = await ctx2.newPage();
  const errors2 = [];
  page2.on("pageerror", (e) => errors2.push(String(e.message)));
  await page2.addInitScript(fakeClock("2026-09-15T15:00:00"));
  await page2.goto("file://" + FILE, { waitUntil: "load" });
  await page2.waitForTimeout(1300);
  const fresh = await page2.evaluate(() => localStorage.getItem("her.v1"));
  ok("a new phone remembers nothing", !fresh || Object.keys(JSON.parse(fresh).opened ?? {}).length === 0, String(fresh).slice(0, 80));

  // walk in and put the copy back
  await page2.getByRole("button", { name: /I am ready/i }).first().click();
  await page2.waitForFunction(() => document.querySelector("input") !== null, null, { timeout: 8000 });
  await page2.locator("input").first().fill("september");
  await page2.keyboard.press("Enter");
  await page2.waitForTimeout(2400);
  // First watch: there is no side door on the frame. The way through is at the
  // foot of the contents.
  await page2.getByRole("button", { name: /^contents$/i }).first().waitFor({ timeout: 15000 });
  ok("no side door on a first watch", (await page2.getByRole("button", { name: /^the house$/i }).count()) === 0);
  await page2.getByRole("button", { name: /^contents$/i }).first().click();
  await page2.waitForTimeout(900);
  const door = page2.locator(".contents-leave");
  await door.scrollIntoViewIfNeeded();
  await page2.waitForTimeout(400);
  ok("the contents has a way through", (await door.count()) === 1);
  await door.click();
  await page2.getByText("The fuse box", { exact: true }).first().waitFor({ timeout: 15000 });
  await page2.getByText("The fuse box", { exact: true }).first().click();
  await page2.waitForTimeout(1000);
  await page2.locator("input[type=file]").last().setInputFiles(backupPath);
  await page2.waitForTimeout(1500);
  const after = await page2.evaluate(() => JSON.parse(localStorage.getItem("her.v1")));
  ok("backup restores opened letters", JSON.stringify(after.opened) === JSON.stringify(before.opened),
     JSON.stringify(after.opened) + " vs " + JSON.stringify(before.opened));
  ok("backup restores kept vows", JSON.stringify(after.kept) === JSON.stringify(before.kept),
     JSON.stringify(after.kept) + " vs " + JSON.stringify(before.kept));
  ok("backup restores how far the picture ran", after.reelFurthest === before.reelFurthest,
     after.reelFurthest + " vs " + before.reelFurthest);
  ok("restore raises no errors", errors.length === 0 && errors2.length === 0, [...errors, ...errors2].join(" | "));
  await ctx2.close();
}

// ── the picture changes weather between beats, not at them ────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  await v.page.getByText("The picture", { exact: true }).first().click();
  await v.page.waitForTimeout(900);
  const again = v.page.getByRole("button", { name: /from the start|start again|watch it/i }).first();
  if (await again.count()) { await again.click(); await v.page.waitForTimeout(1500); }
  const frame = async () => v.page.evaluate(() => {
    const el = document.querySelector(".letterbox");
    return el && { weather: el.dataset.weather, cut: el.dataset.cut, dur: getComputedStyle(el).transitionDuration };
  });
  const seen = [];
  for (let i = 0; i < 10; i++) { await v.page.mouse.click(195, 700); await v.page.waitForTimeout(70); seen.push(await frame()); }
  const cuts = seen.filter((f) => f?.cut === "true");
  const dissolves = seen.filter((f) => f && f.cut !== "true");
  ok("cuts land instantly", cuts.length > 0 && cuts.every((f) => f.dur.startsWith("0s")), JSON.stringify(cuts[0]));
  ok("everything else dissolves", dissolves.length > 0 && dissolves.every((f) => f.dur.startsWith("1.9s")), JSON.stringify(dissolves[0]));
  await v.close();
}

// ── the storm does not follow her indoors ─────────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  const storm = await v.page.evaluate(() => document.querySelector(".house-frame")?.dataset.storm ?? null);
  ok("the house has no storm on it", storm == null, String(storm));
  await v.close();
}

// ── sealed letters wear no counter ────────────────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  const letters = await v.room("Letters");
  ok("no day counter on a sealed letter", !/sealed · \d/.test(letters), (letters.match(/sealed[^A-Z]{0,24}/g) ?? []).join(" | "));
  ok("the tenth September says only sealed", /tenth September SEALED/i.test(letters.replace(/\s+/g, " ")), letters.match(/tenth September[^]{0,40}/i)?.[0] ?? "");
  ok("sealed letters still show their date", /September 2, 2033/.test(letters));
  await v.close();
}

// ── a letter can always be got out of ─────────────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  await v.page.getByText("Letters", { exact: true }).first().click();
  await v.page.waitForTimeout(800);
  await v.page.getByText("when you cannot sleep", { exact: false }).first().click();
  await v.page.waitForTimeout(400);
  const early = await v.page.locator(".reading").count();
  await v.page.keyboard.press("Escape");
  await v.page.waitForTimeout(700);
  const gone = await v.page.locator(".reading").count();
  ok("a letter opens", early === 1);
  ok("escape closes it before the tools arrive", gone === 0);
  await v.close();
}

// ── the once letter changes tense, and stays ──────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  await v.page.getByText("Letters", { exact: true }).first().click();
  await v.page.waitForTimeout(800);
  const before = await v.page.locator(".envelope[data-once=true]").innerText();
  ok("unopened, it says once, ever", /once, ever/i.test(before), before.replace(/\s+/g, " "));
  await v.page.locator(".envelope[data-once=true]").click();
  await v.page.waitForTimeout(600);
  ok("it asks first", (await v.page.locator(".confirm").count()) === 1);
  await v.page.getByRole("button", { name: /break the seal/i }).click();
  await v.page.waitForTimeout(900);
  await v.page.keyboard.press("Escape");
  await v.page.waitForTimeout(800);
  const after = await v.page.locator(".envelope[data-once=true]").innerText();
  ok("opened, it says once, spent", /once, spent/i.test(after), after.replace(/\s+/g, " "));
  const spent = await v.page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).spentOnce);
  ok("and the house remembers it was spent", spent === true);
  await v.close();
}

// ── the fuse box has three motion modes and they do something ─────────────
{
  const v = await visit("2026-09-15T15:00:00");
  await v.page.getByText("The fuse box", { exact: true }).first().click();
  await v.page.waitForTimeout(900);
  const read = () => v.page.evaluate(() => ({
    lean: document.documentElement.classList.contains("is-lean"),
    still: document.documentElement.classList.contains("is-still"),
    parX: getComputedStyle(document.documentElement).getPropertyValue("--par-x").trim(),
    weave: getComputedStyle(document.querySelector(".film") ?? document.body).animationName,
  }));
  for (const [label, expect] of [["the whole storm", { lean: false, still: false }],
                                 ["less of it", { lean: true, still: false }],
                                 ["keep it still", { lean: true, still: true }]]) {
    await v.page.getByRole("button", { name: label, exact: true }).click();
    await v.page.waitForTimeout(500);
    const got = await read();
    ok(`motion "${label}" sets the right classes`, got.lean === expect.lean && got.still === expect.still,
       JSON.stringify(got));
    const saved = await v.page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).motion);
    ok(`motion "${label}" is remembered`, saved === (label === "the whole storm" ? "full" : label === "less of it" ? "lean" : "still"), String(saved));
  }
  await v.close();
}

// ── an old save that says "calm" still means still ────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true, sound: false, motion: "calm" })));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1300);
  const still = await page.evaluate(() => document.documentElement.classList.contains("is-still"));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).motion);
  ok("an old calm save is still", still === true);
  ok("and is written back as still", saved === "still", String(saved));
  await ctx.close();
}

// ── two in the morning has a way through ──────────────────────────────────
{
  const v = await visit("2026-10-07T02:00:00");
  const home = await v.text();
  ok("the small-hours line is there", /letter for this hour/i.test(home), home.slice(0, 160));
  await v.page.getByText("There is a letter for this hour.", { exact: true }).click();
  await v.page.waitForTimeout(1500);
  const open = await v.page.locator(".reading").innerText();
  ok("it opens the letter for it", /cannot sleep/i.test(open), open.slice(0, 120));
  ok("and the letter is the right one", /it is lying to you/i.test(open), open.slice(0, 200));
  await v.close();
}

// ── and daylight does not offer it ────────────────────────────────────────
{
  const v = await visit("2026-10-07T14:00:00");
  const home = await v.text();
  ok("no small-hours line in the afternoon", !/letter for this hour/i.test(home), home.slice(0, 120));
  await v.close();
}

// ── the prompt changes when she asks again ────────────────────────────────
{
  const v = await visit("2026-10-07T02:00:00");
  await v.page.getByText("Say something", { exact: true }).first().click();
  await v.page.waitForTimeout(900);
  const ask = v.page.getByRole("button", { name: /give me a question/i }).first();
  const seen = new Set();
  let repeated = false;
  let last = null;
  for (let i = 0; i < 8; i++) {
    await ask.click();
    await v.page.waitForTimeout(220);
    const q = (await v.page.locator(".prompt-live").innerText()).trim();
    if (q === last) repeated = true;
    last = q;
    seen.add(q);
  }
  ok("never the same question twice running", !repeated, last ?? "");
  ok("the hour's own questions are in the pool",
     [...seen].some((q) => /keeping you up|smaller in the morning/i.test(q)) || seen.size >= 5,
     [...seen].slice(0, 3).join(" | "));
  await v.close();
}

// ── the picture keeps her place across a cold return ──────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(fakeClock("2026-09-15T21:00:00"));
  await page.addInitScript(() => {
    if (localStorage.getItem("her.v1")) return;
    localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true,
      watched: false, reelAt: 0, reelFurthest: 0, sound: false, motion: "still", nameWritten: true }));
  });
  await page.goto("file://" + FILE, { waitUntil: "load" });
  // Wait for the picture to actually be running before tapping at it, and let
  // the last write settle — otherwise this races the app's own mount.
  await page.waitForSelector(".film", { timeout: 10000 });
  await page.waitForTimeout(900);
  for (let i = 0; i < 12; i++) { await page.mouse.click(195, 700); await page.waitForTimeout(200); }
  await page.waitForTimeout(400);
  const left = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).reelAt);
  ok("the picture records where she is", left >= 8, String(left));
  const before = (await page.locator("#root").innerText()).replace(/\s+/g, " ").trim();
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".film", { timeout: 10000 });
  await page.waitForTimeout(600);
  const at = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).reelAt);
  const after = (await page.locator("#root").innerText()).replace(/\s+/g, " ").trim();
  ok("and starts there again, not at the projector", at === left, `${at} vs ${left}`);
  ok("the same beat is on screen", after.slice(0, 60) === before.slice(0, 60), after.slice(0, 70));
  await ctx.close();
}

// ── the door takes the word, or her name ──────────────────────────────────
for (const [word, label] of [["september", "the word"], ["Smruti", "her name"], ["  SEPTEMBER  ", "the word, shouted, with spaces"]]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1300);
  await page.getByRole("button", { name: /I am ready/i }).click();
  await page.waitForFunction(() => document.querySelector("input") !== null, null, { timeout: 8000 });
  await page.locator("input").first().fill(word);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2400);
  const inside = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).entered);
  ok(`the door opens to ${label}`, inside === true);
  await ctx.close();
}

// ── the picture keeps up ──────────────────────────────────────────────────
// Software rendering in CI is far slower than a phone with a GPU, so the bar
// is deliberately loose. It is here to catch a layer that costs twice what it
// should — an animated blur, a fifth blended full-frame layer — not to prove
// sixty.
for (const mode of ["full", "lean"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(`localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true,
    entered: true, watched: false, reelAt: 12, reelFurthest: 130, sound: false, motion: "${mode}",
    nameWritten: true, visits: [], firstOpen: 1 }))`);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1400);
  const frames = await page.evaluate(
    () =>
      new Promise((res) => {
        const out = [];
        let last = performance.now();
        const t0 = last;
        const step = (now) => {
          out.push(now - last);
          last = now;
          if (now - t0 < 4000) requestAnimationFrame(step);
          else res(out);
        };
        requestAnimationFrame(step);
      }),
  );
  const sorted = [...frames].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  ok(`${mode}: frames keep up`, median <= 40, `median ${median.toFixed(1)}ms over ${frames.length} frames`);
  await ctx.close();
}

// ── no animated blur anywhere ─────────────────────────────────────────────
{
  const css = (await readFile(FILE, "utf8")).match(/<style[^>]*>([^]*?)<\/style>/)?.[1] ?? "";
  // An animated filter: blur() is a full re-rasterisation every frame. It cost
  // this page half its frame rate once; it does not come back by accident.
  // Balance the braces rather than regexing across them, and do not let
  // backdrop-filter (which is fine, and static) read as a hit.
  const blurInKeyframes = (sheet) => {
    for (const m of sheet.matchAll(/@keyframes\s+[\w-]+\s*\{/g)) {
      let depth = 1;
      let i = m.index + m[0].length;
      const from = i;
      while (depth > 0 && i < sheet.length) {
        if (sheet[i] === "{") depth++;
        else if (sheet[i] === "}") depth--;
        i++;
      }
      if (/(^|[^-])filter:\s*blur/.test(sheet.slice(from, i))) return m[0];
    }
    return null;
  };
  const found = blurInKeyframes(css);
  ok("no blur inside a keyframe", found === null, String(found));
  const leakBlur = /\.light-leak[^{]*\{[^}]*[^-]filter:\s*blur/.test(css);
  ok("the light leaks are gradients, not blurs", !leakBlur);
}

// ── no two chapters in a row look alike ───────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true,
    entered: true, watched: false, reelAt: 4, reelFurthest: 250, sound: false, motion: "still", nameWritten: true })));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForSelector(".film", { timeout: 10000 });
  await page.waitForTimeout(900);
  const forms = [];
  for (let i = 0; i < 24; i++) {
    const f = await page.evaluate(() => document.querySelector(".chapter")?.dataset.form ?? null);
    if (f) forms.push(f);
    await page.mouse.click(195, 760, { force: true });
    await page.waitForTimeout(230);
  }
  const repeats = forms.filter((f, i) => i > 0 && f === forms[i - 1]);
  ok("chapters take many forms", new Set(forms).size >= 8, [...new Set(forms)].join(","));
  ok("no two chapters in a row share a form", repeats.length === 0, repeats.join(","));
  await ctx.close();
}

// ── the picture answers her hand ──────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.addInitScript(() => localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true,
    entered: true, watched: false, reelAt: 10, reelFurthest: 250, sound: false, motion: "full", nameWritten: true })));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForSelector(".film", { timeout: 10000 });
  await page.waitForTimeout(900);
  const at = () => page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).reelAt);

  const before = await at();
  await page.mouse.move(195, 600);
  await page.mouse.down();
  await page.waitForTimeout(2600);
  const flag = await page.evaluate(() => document.querySelector(".film")?.dataset.holding);
  await page.mouse.up();
  await page.waitForTimeout(300);
  ok("holding stops the picture turning", flag === "true" && (await at()) === before, `${flag} / moved ${(await at()) - before}`);

  const b2 = await at();
  await page.mouse.move(300, 600);
  await page.mouse.down();
  await page.mouse.move(160, 604, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  ok("dragging turns the page", (await at()) > b2);

  await page.mouse.move(195, 600);
  await page.mouse.down();
  await page.mouse.move(196, 455, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  ok("swiping up opens the contents", (await page.locator(".contents").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  await page.mouse.move(195, 400);
  await page.mouse.down();
  await page.mouse.move(196, 565, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(2200);
  ok("swiping down goes in to the house", (await page.evaluate(() => document.querySelector(".shell")?.dataset.mode)) === "house");
  ok("no errors from any of it", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// ── the house answers the same hand ───────────────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00");
  const { page } = v;
  const room = () => page.evaluate(() => document.querySelector(".house")?.dataset.room);

  // keys
  await page.keyboard.press("3");
  await page.waitForTimeout(600);
  ok("a digit opens the third room", (await room()) === "everything", String(await room()));
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(600);
  ok("the arrow walks to the next room", (await room()) === "promises", String(await room()));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  ok("escape is back", (await room()) === "landing", String(await room()));
  await page.keyboard.press("?");
  await page.waitForTimeout(500);
  ok("the key card is one keystroke away", (await page.locator(".key-card").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  ok("and one keystroke gone", (await page.locator(".key-card").count()) === 0);

  // the edge swipe
  await page.keyboard.press("1");
  await page.waitForTimeout(700);
  ok("letters open on the first key", (await room()) === "letters", String(await room()));
  await page.mouse.move(8, 500);
  await page.mouse.down();
  await page.mouse.move(150, 504, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok("a thumb from the edge is back", (await room()) === "landing", String(await room()));

  // a swipe that starts inside a room is not a swipe back
  await page.keyboard.press("1");
  await page.waitForTimeout(700);
  await page.mouse.move(200, 500);
  await page.mouse.down();
  await page.mouse.move(340, 504, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok("a swipe from the middle is not", (await room()) === "letters", String(await room()));
  ok("and brushing past an envelope does not open it", (await page.locator(".reading").count()) === 0,
    String(await page.locator(".reading").count()));

  // holding an envelope says what it is, and does not open it
  const shut = await page.locator('.envelope[data-locked="true"]').first();
  await shut.hover();
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok("holding a sealed letter shows the day, not the letter",
    (await page.locator(".envelope-peek").count()) >= 1 && (await page.locator(".reading").count()) === 0,
    `${await page.locator(".envelope-peek").count()} peeks / ${await page.locator(".reading").count()} open`);
  const peek = await page.locator(".envelope-peek").first().innerText();
  ok("and the peek is the date it comes", /not yet/i.test(peek), peek.slice(0, 60));

  // holding a once letter never spends it
  const once = page.locator('.envelope[data-once="true"]').first();
  if (await once.count()) {
    await once.hover();
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    await page.waitForTimeout(600);
    const spent = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).spentOnce);
    ok("holding the once letter does not spend it", !spent, String(spent));
  } else {
    ok("holding the once letter does not spend it", false, "no once letter on the shelf");
  }

  // walking the shelf, and closing with a swipe down
  await page.locator('.envelope:not([data-locked]):not([data-once])').first().click();
  await page.waitForTimeout(900);
  ok("a letter opens on a tap", (await page.locator(".reading").count()) === 1);
  const first = await page.locator(".reading-open").innerText();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(900);
  const second = await page.locator(".reading-open").innerText();
  ok("the arrow walks to the letter next to it", first !== second, `${first} → ${second}`);
  await page.mouse.move(195, 300);
  await page.mouse.down();
  await page.mouse.move(196, 470, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok("a swipe down puts it back on the shelf", (await page.locator(".reading").count()) === 0);

  // a vow, pushed
  await page.keyboard.press("4");
  await page.waitForTimeout(800);
  const kept = () => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("her.v1")).kept ?? {}).length);
  const before = await kept();
  const vow = page.locator(".vow-list li").first();
  const box = await vow.boundingBox();
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + box.height / 2 + 3, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  ok("pushing a vow rightward marks it kept", (await kept()) === before + 1, `${before} → ${await kept()}`);
  ok("and pushing a vow does not leave the room", (await room()) === "promises", String(await room()));
  await page.mouse.move(box.x + 160, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + box.height / 2 + 3, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  ok("and leftward takes it back out", (await kept()) === before, `${await kept()}`);

  // one more true thing, by flick
  await page.keyboard.press("3");
  await page.waitForTimeout(800);
  const things = () => page.locator(".thing").count();
  const t0 = await things();
  const card = await page.locator(".thing.today").boundingBox();
  await page.mouse.move(card.x + card.width / 2, card.y + card.height - 8);
  await page.mouse.down();
  await page.mouse.move(card.x + card.width / 2 + 1, card.y + card.height - 130, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok("a flick upward pulls one more", (await things()) === t0 + 1, `${t0} → ${await things()}`);

  // holding a thing hands it to her page, quoted
  await page.locator(".thing.today").hover();
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await page.waitForTimeout(900);
  ok("holding a true thing opens her page with it", (await room()) === "say"
    && (await page.locator(".answering").count()) === 1, String(await room()));

  // escape gets her out of a field without losing a word, and then out of the
  // room — the same key, twice, meaning the same thing
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  ok("escape in a field puts the keyboard away", await page.evaluate(() => document.activeElement?.id !== "say-text"),
    String(await page.evaluate(() => document.activeElement?.id)));

  // the distance closes under a finger
  await page.keyboard.press("6");
  await page.waitForTimeout(800);
  ok("and the keys work again straight after", (await room()) === "distance", String(await room()));
  const km = () => page.locator(".km-number").innerText();
  const far = await km();
  const map = await page.locator(".map").boundingBox();
  await page.mouse.move(map.x + map.width * 0.14, map.y + map.height * 0.7);
  await page.mouse.down();
  await page.mouse.move(map.x + map.width * 0.55, map.y + map.height * 0.4, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const mid = await km();
  ok("dragging the arc closes the distance", far !== mid && Number(mid.replace(/,/g, "")) < Number(far.replace(/,/g, "")), `${far} → ${mid}`);
  await page.mouse.move(map.x + map.width * 0.55, map.y + map.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(map.x + map.width * 0.95, map.y + map.height * 0.35, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  ok("and it can be crossed", /that is all it ever was/i.test(await page.locator(".map-drag-hint").innerText()),
    await page.locator(".map-drag-hint").innerText());

  // a part of the picture, opened from the doorway
  await page.keyboard.press("7");
  await page.waitForTimeout(800);
  await page.locator(".part-list li button").first().hover();
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await page.waitForTimeout(800);
  ok("holding a part shows its chapters without playing it",
    (await page.locator(".part-inside li").count()) > 3 && (await page.evaluate(() => document.querySelector(".shell")?.dataset.mode)) === "house",
    String(await page.locator(".part-inside li").count()));

  ok("the house: nothing fetched by any of it", v.external.length === 0, v.external.join(" | "));
  ok("the house: no errors from any of it", v.errors.length === 0, v.errors.join(" | "));
  await v.close();
}

// ── none of it is required ────────────────────────────────────────────────
{
  // Every gesture has a button that does the same job. A gesture she is never
  // told about must never be the only way through.
  const v = await visit("2026-09-15T15:00:00");
  const { page } = v;
  const letters = await page.locator(".room-card").first();
  await letters.click();
  await page.waitForTimeout(800);
  await page.locator('.envelope:not([data-locked]):not([data-once])').first().click();
  await page.waitForTimeout(1000);
  ok("a letter still closes on the button", (await page.getByRole("button", { name: "close it" }).count()) === 1);
  await page.getByRole("button", { name: "close it" }).click();
  await page.waitForTimeout(700);
  ok("and it closed", (await page.locator(".reading").count()) === 0);
  await page.getByRole("button", { name: /←/ }).first().click();
  await page.waitForTimeout(700);
  ok("back is still a button", (await page.evaluate(() => document.querySelector(".house")?.dataset.room)) === "landing");
  await v.close();
}

// ── The Same Hour ─────────────────────────────────────────────────────────
// The times below are read out of src/content/samehour.js rather than typed
// in, so re-pacing the night can never quietly stop these from testing it.
const hourBeats = (() => {
  const src = readFileSync(path.join(root, "src", "content", "samehour.js"), "utf8");
  const list = src.slice(src.indexOf("var SAME_HOUR_BEATS"), src.indexOf("var SAME_HOUR_NAME"));
  return [...list.matchAll(/at:\s*(\d+),\s*\n?\s*kind:\s*"(\w+)"(?:,\s*\n?\s*text:\s*"((?:[^"\\]|\\.)*)")?/g)]
    .map((m) => ({ at: Number(m[1]), kind: m[2], text: m[3] ?? "" }));
})();
const beatAt = (match) => {
  const found = typeof match === "string"
    ? hourBeats.find((b) => b.kind === match)
    : hourBeats.find(match);
  if (!found) throw new Error("no such beat: " + match);
  return found.at;
};
// a moment a few seconds into a given beat, as a wall clock on the night
const nightAt = (seconds) => {
  const t = new Date("2026-09-02T21:00:00");
  t.setSeconds(t.getSeconds() + seconds);
  return `2026-09-02T${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`;
};
// Nine o'clock on the second of September, worked out from the clock alone.
{
  const hourVisit = async (iso, seed) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message)));
    await page.addInitScript(fakeClock(iso));
    await page.addInitScript(`if (!localStorage.getItem("her.v1")) localStorage.setItem("her.v1", ${JSON.stringify(JSON.stringify(seed ?? { schema: 1, greeted: true, entered: true, watched: true, sound: false, motion: "still", nameWritten: true, firstOpen: 1 }))})`);
    await page.goto("file://" + FILE, { waitUntil: "load" });
    await page.waitForTimeout(1700);
    const mode = () => page.evaluate(() => document.querySelector(".shell")?.dataset.mode);
    const text = async (sel) => (await page.locator(sel).innerText().catch(() => "")).replace(/\s+/g, " ").trim();
    return { page, ctx, mode, text, errors, close: () => ctx.close() };
  };

  {
    // Nothing here can send her a notification, so the night before has to.
    const v = await hourVisit("2026-09-01T20:00:00");
    ok("the night before tells her to be there", /Nine o.clock tomorrow night/i.test(await v.text(".hour-card")));
    await v.close();
  }
  {
    const v = await hourVisit("2026-09-02T14:00:00");
    ok("Sept 2 afternoon: the house says tonight", /Nine o.clock. Come back then/i.test(await v.text(".hour-card")));
    ok("and it has not started", (await v.mode()) === "house");
    await v.close();
  }
  {
    const v = await hourVisit("2026-09-02T20:52:00");
    ok("ten to nine: the house tells her to sit down", /Sit down/i.test(await v.text(".hour-card")));
    await v.close();
  }
  {
    const v = await hourVisit("2026-09-02T21:00:04");
    ok("nine o'clock: it takes the screen", (await v.mode()) === "hour");
    ok("it opens on the hour", /It is nine o.clock/i.test(await v.text(".hour-stage")), await v.text(".hour-stage"));
    ok("and it says he is reading it too", /he is reading this now/i.test(await v.text(".hour-together")));
    await v.close();
  }
  {
    // Beat placement is by the clock, so a later moment shows a later line.
    const v = await hourVisit(nightAt(beatAt("count") + 5));
    ok("the count lands where it was placed", /1,096/.test(await v.text(".hour-stage")), await v.text(".hour-stage"));
    await v.close();
  }
  {
    const v = await hourVisit(nightAt(beatAt("name") + 6));
    ok("her name and the year, before the silence", /Happy third September, Smruti/i.test(await v.text(".hour-stage")), await v.text(".hour-stage"));
    await v.close();
  }
  {
    // The address. Twenty seconds of nothing, then two lines and no third.
    const v = await hourVisit(nightAt(beatAt("still") + 6));
    ok("after the name there is silence", (await v.text(".hour-stage")) === "", JSON.stringify(await v.text(".hour-stage")));
    ok("and the room is turned down for it",
       (await v.page.evaluate(() => document.querySelector(".shell")?.dataset.address)) === "true");
    await v.close();
  }
  {
    const v = await hourVisit(nightAt(beatAt((b) => b.kind === "address") + 4));
    ok("the silence breaks on the anniversary", /^Happy anniversary\.$/.test(await v.text(".hour-stage")), await v.text(".hour-stage"));
    ok("nothing else is on screen with it", (await v.page.locator(".hour-slip, .hour-together").count()) === 0);
    await v.close();
  }
  {
    const v = await hourVisit(nightAt(hourBeats.filter((b) => b.kind === "address")[1].at + 4));
    ok("then the address, alone", /^Miss wife\.$/.test(await v.text(".hour-stage")), await v.text(".hour-stage"));
    ok("there is no third line and no button", (await v.page.locator(".hour button").count()) === 0);
    await v.close();
  }
  {
    // The night ends by itself and the house is permanently altered.
    const v = await hourVisit(nightAt(beatAt("close") + 3));
    await v.page.waitForFunction(() => document.querySelector(".shell")?.dataset.mode === "house", null, { timeout: 25000 }).catch(() => {});
    ok("the night closes itself and hands her back", (await v.mode()) === "house");
    const sealed = await v.page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).sameHour?.["2026"]?.doneAt);
    ok("and it is sealed without her dismissing it", !!sealed);
    ok("the question waits in the house, quietly", /would like to ask you/i.test(await v.text(".hour-card")));
    await v.page.getByText("Letters", { exact: true }).first().click();
    await v.page.waitForTimeout(900);
    const shelf = await v.text(".letters");
    ok("a letter is on the shelf that was not there before", /on the third September/i.test(shelf));
    ok("and the shelf count knows it", /There are 25/.test(shelf), shelf.slice(0, 90));
    await v.close();
  }
  {
    // The sentence the house earned, from the next morning on, forever.
    const kept = { schema: 1, greeted: true, entered: true, watched: true, sound: false,
      motion: "still", nameWritten: true, firstOpen: 1,
      sameHour: { "2026": { seenAt: 1, doneAt: 2, answer: "It stopped feeling temporary.", answeredAt: 3 } } };
    const a = await hourVisit("2026-09-03T10:00:00", kept);
    ok("the morning after, the greeting has changed", /We were both here at nine/i.test(await a.text(".greeting")), await a.text(".greeting"));
    await a.close();
    const c = await hourVisit("2027-02-14T21:00:00", kept);
    ok("and it never goes back", /We were both here at nine/i.test(await c.text(".greeting")), await c.text(".greeting"));
    await c.close();
    const d = await hourVisit("2027-06-13T09:00:00", kept);
    ok("except on the days the house already keeps", /Happy birthday/i.test(await d.text(".greeting")), await d.text(".greeting"));
    await d.close();
  }
  {
    // Before the hour is kept, that letter is not on the shelf at all.
    const v = await hourVisit("2026-09-02T14:00:00");
    await v.page.getByText("Letters", { exact: true }).first().click();
    await v.page.waitForTimeout(900);
    const shelf = await v.text(".letters");
    ok("before the night it is not there, not even sealed", !/on the third September/i.test(shelf));
    ok("and the shelf counts 24", /There are 24/.test(shelf), shelf.slice(0, 80));
    await v.close();
  }
  {
    const v = await hourVisit("2026-09-02T22:10:00");
    ok("late: she is let in anyway", /a little late/i.test(await v.text(".hour-card")));
    await v.close();
  }
  {
    const v = await hourVisit("2026-09-03T10:00:00");
    ok("the next morning it is gone", (await v.page.locator(".hour-card").count()) === 0 && (await v.mode()) === "house");
    await v.close();
  }
  {
    const v = await hourVisit("2027-09-02T21:00:04");
    ok("next year it comes round again", (await v.mode()) === "hour");
    await v.close();
  }
  {
    // Stepping out has to be real, and coming back has to be in step.
    const v = await hourVisit("2026-09-02T21:00:20");
    await v.page.getByRole("button", { name: /step out/i }).click();
    await v.page.waitForTimeout(1400);
    ok("stepping out leaves the hour", (await v.mode()) === "house");
    await v.page.waitForTimeout(7000);
    ok("and it does not drag her back", (await v.mode()) === "house");
    await v.page.getByRole("button", { name: /come back/i }).click();
    await v.page.waitForTimeout(1200);
    const on = await v.text(".hour-stage");
    // Whatever the pacing, coming back must land on the beat the clock is on
    // — not on the first one, which is what a cursor would have done.
    const expected = hourBeats.filter((b) => b.at <= 32).pop();
    ok("coming back rejoins where the clock is, not where she left",
       on !== hourBeats[0].text && (expected.text === "" || on.startsWith(expected.text.slice(0, 24))),
       `showing ${JSON.stringify(on.slice(0, 40))}, clock is on ${JSON.stringify(expected.text.slice(0, 40))}`);
    await v.close();
  }
}

// ── the copy she can keep ─────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.addInitScript(`if (!localStorage.getItem("her.v1")) localStorage.setItem("her.v1", ${JSON.stringify(JSON.stringify({
    schema: 1, greeted: true, entered: true, watched: true, sound: false, motion: "still", nameWritten: true,
    firstOpen: 1, reelFurthest: 64, visits: [20690, 20691],
    opened: { doubt: 1756000000000 }, kept: { stay: 1756200000000 }, words: { 20692: "quiet" },
    replies: [{ id: "a", text: "I read that one twice.", at: 1756400000000 },
              { id: "b", text: "Not sending this.", at: 1756500000000, private: true }],
    sameHour: { "2026": { seenAt: 1, doneAt: 2, answer: "It stopped feeling temporary.", answeredAt: 3 } },
  }))})`);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.getByText("The fuse box", { exact: true }).first().click();
  await page.waitForTimeout(900);
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /save everything/i }).click(),
  ]);
  const copy = path.join(os.tmpdir(), "her-check-copy.html");
  await dl.saveAs(copy);
  const html = await readFile(copy, "utf8");

  ok("the copy is a document, not a blob", html.startsWith("<!doctype html>"));
  ok("it carries nothing that runs", !/<script(?![^>]*application\/json)/.test(html));
  ok("it says who and where and how far", /Smruti and Anubhab/.test(html) && /1,287 kilometres/.test(html));
  for (const [label, want] of [["the Septembers", "The Septembers"], ["her answer", "stopped feeling temporary"],
       ["what she wrote", "I read that one twice"], ["what she kept back", "kept to herself"],
       ["the letters she opened", "when you doubt this"], ["the promises she marked", "I stay."],
       ["her one word", "quiet"]])
    ok(`the copy holds ${label}`, html.includes(want));
  ok("and the state, for putting it back", /id="her-state"/.test(html));

  // It has to open on its own, with no house anywhere near it.
  const alone = await browser.newContext({ offline: true });
  const solo = await alone.newPage();
  const soloErrors = [];
  solo.on("pageerror", (e) => soloErrors.push(String(e.message)));
  await solo.goto("file://" + copy);
  await solo.waitForTimeout(500);
  const read = (await solo.locator("body").innerText()).replace(/\s+/g, " ");
  ok("it opens with no house and no internet", /HER/.test(read) && /A copy, kept on/.test(read) && soloErrors.length === 0,
     soloErrors.join(" | ") || read.slice(0, 70));
  await alone.close();
  await ctx.close();

  // And it still restores into a fresh house.
  const back = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const r = await back.newPage();
  await r.goto("file://" + FILE, { waitUntil: "load" });
  await r.waitForTimeout(1400);
  await r.getByRole("button", { name: /I am ready/i }).click();
  await r.waitForFunction(() => document.querySelector("input") !== null, null, { timeout: 9000 });
  await r.locator("input").first().fill("september");
  await r.keyboard.press("Enter");
  await r.waitForTimeout(2400);
  const contents = r.getByRole("button", { name: /^contents$/i }).first();
  await contents.waitFor({ timeout: 14000 });
  await contents.click();
  await r.waitForTimeout(900);
  await r.locator(".contents-leave").scrollIntoViewIfNeeded();
  await r.locator(".contents-leave").click();
  await r.waitForTimeout(1800);
  await r.getByText("The fuse box", { exact: true }).first().click();
  await r.waitForTimeout(900);
  await r.locator("input[type=file]").last().setInputFiles(copy);
  await r.waitForTimeout(1500);
  const state = await r.evaluate(() => JSON.parse(localStorage.getItem("her.v1")));
  ok("the copy goes back into a fresh house",
     state.opened?.doubt && state.kept?.stay && state.replies?.length === 2 &&
     state.reelFurthest === 64 && state.sameHour?.["2026"]?.answer === "It stopped feeling temporary.",
     JSON.stringify({ o: Object.keys(state.opened ?? {}), r: state.replies?.length, f: state.reelFurthest }));
  ok("and nothing threw", errors.length === 0, errors.join(" | "));
  await back.close();
}

// ── a broken save leaves her the house ─────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.addInitScript(() => localStorage.setItem("her.v1", "{ this is not json"));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1400);
  const t = (await page.locator("#root").innerText()).replace(/\s+/g, " ").trim();
  const kept = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("her.v1.broken.")).length);
  ok("broken save: the house still opens", t.length > 20 && errors.length === 0, errors.join(" | "));
  ok("broken save: the old one is kept aside", kept === 1, "copies: " + kept);
  await ctx.close();
}

// ── reduced motion is complete, not merely off ─────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.addInitScript(() => localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true, sound: false })));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1400);
  const t = (await page.locator("#root").innerText()).replace(/\s+/g, " ").trim();
  const still = await page.evaluate(() => document.documentElement.classList.contains("is-still"));
  ok("reduced motion: the house is whole", t.includes("Letters") && t.includes("The fuse box"), t.slice(0, 80));
  ok("reduced motion: is-still is set", still);
  ok("reduced motion: no errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// ── the desktop print keeps its frame ──────────────────────────────────────
{
  const v = await visit("2026-09-15T15:00:00", { entered: false, viewport: { width: 1440, height: 900 } });
  const ratio = await v.page.evaluate(() => {
    const el = document.querySelector(".letterbox");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width / r.height;
  });
  ok("desktop: letterbox holds 2.35", ratio !== null && Math.abs(ratio - 2.35) < 0.06, String(ratio));
  const scrollX = await v.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok("desktop: nothing scrolls sideways", !scrollX);
  await v.close();
}

// ── served from a static host, it still asks for nothing ──────────────────
{
  const body = await readFile(FILE);
  const asked = [];
  const server = http.createServer((req, res) => {
    asked.push(req.url);
    if (req.url === "/" || req.url === "/HER.html") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(body);
    } else {
      res.writeHead(404).end("no");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const beyond = asked.filter((u) => u !== "/" && u !== "/favicon.ico");
  ok("a static host is asked for one file", beyond.length === 0, asked.join(" "));
  const workers = await page.evaluate(async () =>
    (await navigator.serviceWorker?.getRegistrations?.())?.length ?? 0);
  ok("no service worker is registered", workers === 0, String(workers));
  ok("no errors over http", errors.length === 0, errors.join(" | "));
  await ctx.close();
  server.close();
}

await browser.close();

const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "ok  " : "FAIL"}  ${pad(r.name, 48)} ${r.pass ? "" : r.detail.slice(0, 120)}`);
}
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
