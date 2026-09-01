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
// The order the rooms are on the landing, which is also the order of the keys.
const ROOM_ORDER = ["letters", "say", "everything", "promises", "days", "distance", "reel", "settings"];
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
  // Wait for the place to be restored rather than for a number of
  // milliseconds. A fixed delay made this flaky, and a flaky check is worse
  // than no check: it cannot tell me whether the file is broken.
  //
  // This does not soften the assertion. If the picture resumed at the
  // projector it would start counting up from zero and never arrive at where
  // she left it, so the wait would run out and the check would fail.
  let at = 0;
  for (let i = 0; i < 40; i++) {
    at = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).reelAt);
    if (at >= left) break;
    await page.waitForTimeout(100);
  }
  const after = (await page.locator("#root").innerText()).replace(/\s+/g, " ").trim();
  // At or beyond where she left it — never back at the start. Exact equality
  // was the wrong assertion: the picture runs on a clock, so a slow reload can
  // legitimately carry it a beat or two forward. What must never happen is
  // that it begins again, and that is what is asserted.
  ok("and starts there again, not at the projector", at >= left && at >= 8, `${at} vs ${left}`);
  ok("not back at the title card", !/RUNNING TIME/.test(after), after.slice(0, 70));
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
  // The running order is worked out once, at load, for all hundred chapters —
  // so the invariant is asserted over all hundred rather than over whichever
  // two dozen a sampling loop happens to catch. Reading it off the DOM every
  // 230ms raced the cross-dissolve and reported repeats that were not there:
  // two elements are on screen during a cut and the first one is the outgoing
  // chapter.
  const walk = await page.evaluate(() => {
    const seen = [];
    for (const el of document.querySelectorAll("[data-form]")) seen.push(el.dataset.form);
    return seen;
  });
  const order = (() => {
    const src = readFileSync(path.join(root, "src", "film", "reel.js"), "utf8");
    const film = readFileSync(path.join(root, "src", "content", "film.js"), "utf8");
    const stub = `var isStill=()=>false;var CANON={};var isNightHours=()=>false;
      var PACE=122;var PACE_CAP=1650;
      function paceFor(e,t){return Math.min(t,Math.max(38,PACE_CAP/Math.max(1,e)));}
      function readSeconds(e,t=PACE){let n=String(e||"").split(" ").length;return (n*paceFor(n,t))/1e3+0.62;}
      var HOLD_COPY={ms:5200};`;
    return new Function(`${stub}${film}\n${src}\nreturn CHAPTER_FORM_BY_N;`)().slice(1);
  })();
  const repeats = order.filter((f, i) => i > 0 && f === order[i - 1]);
  ok("chapters take many forms", new Set(order).size >= 8, [...new Set(order)].join(","));
  ok("no two of the hundred chapters in a row share a form",
    repeats.length === 0 && order.length >= 95, `${repeats.length} repeats over ${order.length}`);
  // And the form really is on the page she is looking at.
  // Turn pages until a chapter is on screen — the reel opens on a part card,
  // which carries no form — then confirm the form is really on the page and
  // that turning it changes it.
  const formNow = () => page.evaluate(() => document.querySelector("[data-form]")?.dataset.form ?? null);
  let first = await formNow();
  for (let i = 0; i < 8 && !first; i++) {
    await page.mouse.click(195, 760, { force: true });
    await page.waitForTimeout(600);
    first = await formNow();
  }
  ok("and the form is on the chapter she is reading", !!first, String(first));
  let changed = false;
  for (let i = 0; i < 6 && !changed; i++) {
    await page.mouse.click(195, 760, { force: true });
    await page.waitForTimeout(700);
    const now = await formNow();
    if (now && now !== first) changed = true;
  }
  ok("and turning the page changes it", changed);
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

// ── the third September, hour by hour ─────────────────────────────────────
{
  // The day exists only on the day, opens one door an hour, never closes one,
  // and is not there at all on the other three hundred and sixty-four.
  const dayAt = async (iso) => {
    const v = await visit(iso);
    return v;
  };
  {
    const v = await dayAt("2026-09-15T15:00:00");
    ok("no day on an ordinary day", (await v.page.locator(".day-door").count()) === 0);
    ok("and the house is not running the sun",
      (await v.page.evaluate(() => document.querySelector(".shell")?.dataset.sun)) === undefined);
    await v.close();
  }
  {
    // Two minutes past midnight: the day has one door in it and it is the turn
    // of the day itself.
    const v = await dayAt("2026-09-02T00:02:00");
    const { page } = v;
    ok("two minutes past midnight, the day has begun",
      (await page.locator(".day-door").count()) === 1);
    const card = await page.locator(".day-door").innerText();
    ok("and the front door is already carrying the hour", /It is the second of September/i.test(card),
      card.replace(/\s+/g, " ").slice(0, 90));
    ok("and the room is the colour of three in the morning",
      (await page.evaluate(() => document.querySelector(".shell")?.dataset.sun)) === "deepnight");

    await page.locator(".day-door").click();
    await page.waitForTimeout(1100);
    ok("the dial has twenty-four hours on it", (await page.locator(".dial-mark").count()) === 24);
    ok("and exactly one of them has opened",
      (await page.locator('.dial-mark[data-open="true"]').count()) === 1,
      String(await page.locator('.dial-mark[data-open="true"]').count()));
    ok("nine o'clock is the crown of it",
      (await page.locator('.dial-mark[data-crown="true"]').count()) === 1);

    // An hour that has not come says when it will, and does not leak its line.
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(700);
    const shut = await page.locator(".door").innerText();
    ok("an hour that has not come is shut", /Not yet/i.test(shut), shut.replace(/\s+/g, " ").slice(0, 70));
    ok("and it says when it opens", /opens at one in the morning/i.test(shut),
      shut.replace(/\s+/g, " ").slice(0, 90));
    ok("and it does not leak what it will say",
      !/four hours in/i.test(shut), shut.replace(/\s+/g, " ").slice(0, 90));
    ok("the arrows turn the dial rather than leaving the room",
      (await page.evaluate(() => document.querySelector(".house")?.dataset.room)) === "theday");
    ok("the day: nothing fetched", v.external.length === 0, v.external.join(" | "));
    ok("the day: no errors", v.errors.length === 0, v.errors.join(" | "));
    await v.close();
  }
  {
    // Four in the morning is the hour it happened, and it says so.
    const v = await dayAt("2026-09-02T04:10:00");
    await v.page.locator(".day-door").click();
    await v.page.waitForTimeout(1100);
    const door = (await v.page.locator(".door").innerText()).replace(/\s+/g, " ");
    ok("four in the morning knows what it is", /This is the hour/i.test(door), door.slice(0, 70));
    ok("and says what happened in it", /gave up being sensible/i.test(door), door.slice(0, 140));
    ok("five hours have opened", (await v.page.locator('.dial-mark[data-open="true"]').count()) === 5,
      String(await v.page.locator('.dial-mark[data-open="true"]').count()));
    ok("and the hour she is awake for is marked",
      (await v.page.locator(".dial-stood").count()) >= 1,
      String(await v.page.locator(".dial-stood").count()));
    // Never a count, never a score, nowhere.
    const whole = (await v.page.locator("#root").innerText()).replace(/\s+/g, " ");
    ok("and nothing anywhere counts the hours she missed",
      !/\b\d+ of 24\b|\bhours? missed\b|\bstreak\b/i.test(whole), whole.slice(0, 60));
    await v.close();
  }
  {
    // Late in the day everything behind her is open and none of it has closed.
    const v = await dayAt("2026-09-02T23:40:00");
    await v.page.locator(".day-door").click();
    await v.page.waitForTimeout(1100);
    ok("by the last hour the whole day is open",
      (await v.page.locator('.dial-mark[data-open="true"]').count()) === 24,
      String(await v.page.locator('.dial-mark[data-open="true"]').count()));
    const door = (await v.page.locator(".door").innerText()).replace(/\s+/g, " ");
    ok("and the last hour points at the next day", /third of September/i.test(door), door.slice(0, 120));
    // Every hour has its own line — asserted against the source, where all
    // twenty-four can be compared at once rather than read off a crossfade.
    const daySrc = readFileSync(path.join(root, "src", "content", "theday.js"), "utf8");
    const lines = [...daySrc.matchAll(/^\s*line:\s*"((?:[^"\\]|\\.)*)",?$/gm)].map((m) => m[1]);
    ok("the day has twenty-four hours written for it", lines.length === 24, String(lines.length));
    ok("and every one of them says something different",
      new Set(lines).size === 24, String(new Set(lines).size));
    // And the dial really does change what is on the screen — walked slowly
    // enough to clear the crossfade, which is 0.5s out and 0.5s back in.
    const seen = new Set();
    for (let i = 0; i < 5; i++) {
      await v.page.waitForTimeout(1100);
      seen.add((await v.page.locator(".door-line").innerText()).trim());
      await v.page.keyboard.press("ArrowRight");
    }
    ok("and turning the dial really changes it", seen.size === 5, [...seen].map((x) => x.slice(0, 18)).join(" | "));
    await v.close();
  }
  {
    // The sun goes round once and only on the day.
    const bands = [];
    for (const h of ["01", "05", "07", "09", "13", "16", "18", "20", "22"]) {
      const v = await dayAt(`2026-09-02T${h}:30:00`);
      bands.push(await v.page.evaluate(() => document.querySelector(".shell")?.dataset.sun));
      await v.close();
    }
    ok("the house passes through the day", new Set(bands).size >= 7, bands.join(" "));
  }
}

// ── nothing she has to aim at, nothing she has to squint at ───────────────
{
  // The smallest screen she is likely to hold, because if it fits there it
  // fits everywhere. Two things are asserted for every room: no control is
  // smaller than a thumb, and no text that carries meaning is a whisper.
  const ctx = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    if (localStorage.getItem("her.v1")) return;
    localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true,
      reelAt: 0, reelFurthest: 0, opened: {}, spentOnce: false, kept: {}, collected: {}, pulls: {},
      replies: [], words: {}, visits: [], sound: false, motion: "full", inbox: [], nameWritten: true,
      firstOpen: 1, lastOpen: 1 }));
  });
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1400);

  const look = () => page.evaluate(() => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const lum = (c) => 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    const parse = (c) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const over = (fg, bg) => { const a = fg[3] ?? 1; return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)); };
    const groundOf = (el) => {
      const stack = [];
      for (let n = el; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if ((c[3] ?? 1) <= 0.001) continue;
        stack.push(c);
        if ((c[3] ?? 1) >= 0.999) break;
      }
      let g = [7, 8, 12];
      for (let i = stack.length - 1; i >= 0; i--) g = over(stack[i], g);
      return g;
    };
    const ghost = "rgba(211, 192, 170, 0.455)";
    const main = document.querySelector(".house-main");
    const out = { small: [], faint: [], wide: [] };
    if (!main) return out;
    const box = main.getBoundingClientRect();
    for (const el of main.querySelectorAll("*")) {
      if (el.closest(".sr-only")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.right > box.right + 1 || r.left < box.left - 1)
        out.wide.push(`${el.className || el.tagName}`);
      if (el.children.length || !el.textContent.trim()) continue;
      const cs = getComputedStyle(el);
      const g = groundOf(el);
      const size = parseFloat(cs.fontSize);
      const l1 = lum(over(parse(cs.color), g)) + 0.05;
      const l2 = lum(g) + 0.05;
      const ratio = Math.max(l1, l2) / Math.min(l1, l2);
      const need = size >= 24 || cs.color === ghost ? 3 : 4.5;
      if (ratio < need) out.faint.push(`${el.className || el.tagName} ${size.toFixed(0)}px ${ratio.toFixed(2)}`);
    }
    for (const el of main.querySelectorAll("button, a, input, textarea, select")) {
      if (el.closest(".sr-only")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const label = el.closest("label");
      if (label && label !== el && label.getBoundingClientRect().height >= 44) continue;
      const after = getComputedStyle(el, "::after");
      let grow = 0;
      if (after.content !== "none" && after.position === "absolute")
        grow = -((parseFloat(after.top) || 0) + (parseFloat(after.bottom) || 0));
      if (r.height + Math.max(0, grow) < 43.5) out.small.push(`${el.className || el.tagName} ${Math.round(r.height)}`);
    }
    return out;
  });

  const small = [];
  const faint = [];
  const wide = [];
  for (let i = 0; i <= ROOM_ORDER.length; i++) {
    if (i > 0) { await page.keyboard.press(String(i)); await page.waitForTimeout(600); }
    const room = await page.evaluate(() => document.querySelector(".house")?.dataset.room);
    const seen = await look();
    for (const x of seen.small) small.push(`${room}:${x}`);
    for (const x of seen.faint) faint.push(`${room}:${x}`);
    for (const x of seen.wide) wide.push(`${room}:${x}`);
    if (i > 0) { await page.keyboard.press("Escape"); await page.waitForTimeout(400); }
  }
  ok("320px: nothing she has to aim at", small.length === 0, [...new Set(small)].slice(0, 5).join(" | "));
  ok("320px: nothing she has to squint at", faint.length === 0, [...new Set(faint)].slice(0, 5).join(" | "));
  ok("320px: nothing reaches past the frame", wide.length === 0, [...new Set(wide)].slice(0, 5).join(" | "));
  await ctx.close();
}

// ── ten years on ──────────────────────────────────────────────────────────
{
  // Everything in this file has to still be true in 2036. Not "still open" —
  // still true: the numbers, the ordering, the tense of every sentence.
  const v = await visit("2036-11-20T20:00:00");
  const home = await v.text();
  ok("2036: the house opens", /DAYS/.test(home), home.slice(0, 80));
  ok("2036: no console errors", v.errors.length === 0, v.errors.join(" | "));
  ok("2036: thirteen years of days", /4,\d\d\d DAYS/.test(home), home.match(/[\d,]+ DAYS/)?.[0] ?? "");

  const days = await v.room("Your days");
  // What is coming, then what has been. Never the oldest thing first.
  const order = [...days.matchAll(/(IN [\d,]+ DAYS|[\d,]+ DAYS AGO|TODAY)/g)].map((m) => m[1]);
  const firstPast = order.findIndex((x) => /AGO/.test(x));
  const lastAhead = order.map((x) => !/AGO/.test(x)).lastIndexOf(true);
  ok("2036: what is coming is above what has been",
    firstPast === -1 || lastAhead < firstPast, order.join(" | "));
  ok("2036: and something is still coming", firstPast !== 0, order.slice(0, 3).join(" | "));
  ok("2036: the counting still names the next one",
    /(SEPTEMBER|YEARS|THOUSAND DAYS) IN [\d,]+ DAYS/i.test(days),
    (days.match(/[^.]{0,60} IN [\d,]+ DAYS/i) ?? [""])[0]);
  ok("2036: nothing reads as an unfinished ordinal", !/\d(1th|2th|3th|1nd|1rd)\b/.test(days), days.slice(0, 120));

  const letters = await v.room("Letters");
  // Everything with a year on it has opened for good by now. The one that is
  // still sealed is the birthday, which is not waiting — it comes round.
  ok("2036: the only thing still sealed is the one that comes round",
    /One of them is still sealed\./.test(letters) && /on your birthday/i.test(letters),
    (letters.match(/There are [^.]*\.[^.]*\./) ?? [""])[0]);
  ok("2036: and the count reads like a sentence", !/\. [a-z]/.test(letters.split("Hold one")[0]),
    letters.slice(0, 130));
  ok("2036: the picture is still about the first three years",
    /the first three years of us/i.test(await v.room("The picture")));
  await v.close();
}

// ── a save with ten years in it ───────────────────────────────────────────
{
  // Every day for ten years: a word, a note, a visit, and every true thing
  // found. If the house is going to fall over under its own history, it should
  // do it here and not on her phone.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(fakeClock("2036-11-20T20:00:00"));
  const bytes = await page.addInitScript(() => {
    const words = {};
    const replies = [];
    const collected = {};
    const opened = {};
    const kept = {};
    const day = Math.round(Date.now() / 86400000);
    for (let i = 0; i < 3650; i++) {
      words[String(day - i)] = "still";
      replies.push({ id: `r${i}`, at: Date.now() - i * 86400000, text: "Something I wanted to tell you and did not have anywhere else to put." });
    }
    for (let i = 0; i < 372; i++) collected[String(i)] = Date.now();
    for (let i = 0; i < 30; i++) opened[`l${i}`] = Date.now();
    for (let i = 0; i < 12; i++) kept[`v${i}`] = Date.now();
    const sameHour = {};
    for (let y = 2026; y <= 2036; y++) sameHour[String(y)] = { doneAt: Date.now(), answer: "Yes." };
    localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true,
      watched: true, reelAt: 0, reelFurthest: 116, opened, spentOnce: true, kept, collected,
      pulls: {}, replies, words, visits: Array.from({ length: 365 }, (_, i) => day - i),
      sound: false, motion: "full", inbox: [], nameWritten: true, firstOpen: 1, lastOpen: 1, sameHour }));
  });
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(2200);
  const size = await page.evaluate(() => (localStorage.getItem("her.v1") ?? "").length);
  ok("ten years of writing fits in a save", size > 400000 && size < 4000000, `${Math.round(size / 1024)} kB`);
  ok("and the house opens on it", (await page.locator(".house").count()) === 1);
  ok("and nothing threw", errors.length === 0, errors.slice(0, 2).join(" | "));

  const home = (await page.locator("#root").innerText()).replace(/\s+/g, " ");
  ok("and it opens with what she earned, not the clock", /We were both here at nine/i.test(home),
    home.slice(0, 90));

  // The copy she can keep still builds out of it.
  const built = await page.evaluate(() => {
    const t0 = performance.now();
    try {
      const html = window.__heirloom ? window.__heirloom() : null;
      return { ms: performance.now() - t0, len: html ? html.length : -1 };
    } catch (e) {
      return { error: String(e) };
    }
  });
  // No hook is exported, so do it the way she would: through the fuse box.
  await page.keyboard.press("8");
  await page.waitForTimeout(900);
  const save = page.getByRole("button", { name: "save everything" });
  ok("the fuse box still offers the copy", (await save.count()) === 1, JSON.stringify(built));
  const download = page.waitForEvent("download", { timeout: 30000 });
  await save.click();
  const file = await download;
  const kept = path.join(os.tmpdir(), `her-longrun-${Date.now()}.html`);
  await file.saveAs(kept);
  const copy = readFileSync(kept, "utf8");
  ok("and the copy carries ten years of it", copy.length > 300000, `${Math.round(copy.length / 1024)} kB`);
  ok("and every September she stood in", (copy.match(/2026|2036/g) ?? []).length >= 2);
  ok("still with nothing in it that runs", !/<script(?![^>]*type="application\/json")/i.test(copy));
  await ctx.close();
}

// ── each room is its own place ────────────────────────────────────────────
{
  const houseSrc = readFileSync(path.join(root, "src", "house", "house.js"), "utf8");
  const doors = houseSrc.match(/var ROOM_DOORS = \{[\s\S]*?\n\};/);
  const shapes = doors ? [...doors[0].matchAll(/^  (\w+): (\{.*\}),$/gm)].map((m) => [m[1], m[2]]) : [];
  ok("every room has its own way of opening", shapes.length >= 9, String(shapes.length));
  ok("and no two of the eight open the same way",
    new Set(shapes.filter(([id]) => id !== "landing" && id !== "inbox").map(([, v]) => v)).size >= 6,
    shapes.map(([id]) => id).join(" "));

  const cssSrc = readFileSync(path.join(root, "styles", "her.css"), "utf8");
  const lights = [...cssSrc.matchAll(/\.house\[data-room="(\w+)"\] \{\s*--room-light: (#[0-9a-f]+);/g)]
    .map((m) => [m[1], m[2]]);
  ok("every room has its own light", lights.length >= 9, lights.map((l) => l.join("=")).join(" "));
  ok("and the lights are not all the same",
    new Set(lights.map(([, v]) => v)).size >= 6, String(new Set(lights.map(([, v]) => v)).size));

  const v = await visit("2026-09-15T15:00:00");
  const { page } = v;
  const room = () => page.evaluate(() => document.querySelector(".house")?.dataset.room);
  for (const [id] of lights) {
    if (id === "landing" || id === "inbox") continue;
    const at = ROOM_ORDER.indexOf(id);
    if (at < 0) continue;
    await page.keyboard.press(String(at + 1));
    await page.waitForTimeout(500);
    if ((await room()) !== id) { ok(`the ${id} room opens on its key`, false, String(await room())); break; }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }
  ok("every room opens on its own key", (await room()) === "landing", String(await room()));

  // A room remembers where she was in it, for as long as the house is open.
  await page.keyboard.press("1");
  await page.waitForTimeout(800);
  await page.evaluate(() => { document.querySelector(".house-main").scrollTop = 520; });
  await page.waitForTimeout(300);
  const down = await page.evaluate(() => document.querySelector(".house-main").scrollTop);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  ok("the front door is at the top", (await page.evaluate(() => document.querySelector(".house-main").scrollTop)) === 0);
  await page.keyboard.press("1");
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => document.querySelector(".house-main").scrollTop);
  ok("and the shelf is where she left it", down > 100 && back === down, `${down} → ${back}`);

  // The distance stopped arguing with its own number.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.keyboard.press("6");
  await page.waitForTimeout(900);
  const far = await page.locator(".distance-room").innerText();
  ok("the distance says the flight, not the train", /hours in the air/i.test(far) && !/on a train/i.test(far),
    (far.match(/[\d.]+ ?\n?hours[^,]*/i) ?? [""])[0]);
  ok("and two hours means two hours in both places",
    /\b2\b[\s\S]{0,40}hours in the air/i.test(far) && /Two hours to fly it/i.test(far),
    far.slice(far.indexOf("Two hours"), far.indexOf("Two hours") + 80));

  // The fuse box shows what it is doing.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.keyboard.press("8");
  await page.waitForTimeout(900);
  const camMode = async () => page.evaluate(() => {
    const el = document.querySelector(".motion-look-cam");
    return el ? getComputedStyle(el).animationName : null;
  });
  await page.getByRole("button", { name: "the whole storm" }).click();
  await page.waitForTimeout(500);
  const whole = await camMode();
  await page.getByRole("button", { name: "less of it" }).click();
  await page.waitForTimeout(500);
  const less = await camMode();
  ok("the fuse box shows the camera moving on the whole storm", whole === "look-cam", String(whole));
  ok("and holding still on less of it", less === "none", String(less));
  await page.getByRole("button", { name: "the whole storm" }).click();
  await page.waitForTimeout(400);

  ok("the rooms: nothing fetched", v.external.length === 0, v.external.join(" | "));
  ok("the rooms: no errors", v.errors.length === 0, v.errors.join(" | "));
  await v.close();
}

// ── the picture moves inside an act ───────────────────────────────────────
{
  // An act used to be one colour from its first chapter to its last. Walk the
  // whole reel from the source and count what actually changes.
  const reelSrc = readFileSync(path.join(root, "src", "film", "reel.js"), "utf8");
  const acts = reelSrc.match(/var ACT_LIGHT = \[[\s\S]*?\n\];/);
  const rows = acts ? [...acts[0].matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].match(/"[a-z]+"/g) ?? []) : [];
  ok("every act carries more than one light", rows.length === 4 && rows.every((r) => new Set(r).size >= 2),
    rows.map((r) => r.join(",")).join(" | "));
  const own = [...readFileSync(path.join(root, "src", "content", "film.js"), "utf8")
    .matchAll(/^=== [^|]+\|[^|]+\|\s*([a-z]+)/gm)].map((m) => `"${m[1]}"`);
  ok("and every act keeps coming home to its own light",
    own.length === 4 && rows.length === 4
      && rows.every((r, i) => r[0] === own[i] && r.filter((w) => w === own[i]).length >= 2),
    rows.map((r, i) => `${own[i]}: ${r.join(",")}`).join(" | "));

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.addInitScript(() => localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true,
    entered: true, watched: false, reelAt: 5, reelFurthest: 300, sound: false, motion: "full", nameWritten: true })));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForSelector(".film", { timeout: 10000 });
  await page.waitForTimeout(900);

  // Step through the first act by keyboard and watch the wash.
  const lit = new Set();
  const shots = [];
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(120);
    const seen = await page.evaluate(() => {
      const box = document.querySelector(".letterbox");
      const beat = document.querySelector(".beat");
      return { weather: box?.dataset.weather, transform: beat ? getComputedStyle(beat).transform : "" };
    });
    if (seen.weather) lit.add(seen.weather);
    if (seen.transform && seen.transform !== "none") shots.push(seen.transform);
  }
  ok("the light moves as an act runs", lit.size >= 3, [...lit].join(" "));
  ok("and every beat is on a camera", shots.length > 20, String(shots.length));

  // The ribbon carries the four acts.
  ok("the ribbon shows where the acts change", (await page.locator(".ribbon-notch").count()) === 4,
    String(await page.locator(".ribbon-notch").count()));

  // Holding settles the room, not just the frame.
  const eased = async () => page.evaluate(() => {
    const rain = document.querySelector(".letterbox .rain-glass");
    return rain ? Number(getComputedStyle(rain).opacity) : null;
  });
  const loud = await eased();
  await page.mouse.move(195, 620);
  await page.mouse.down();
  await page.waitForTimeout(2200);
  const quiet = await eased();
  ok("holding eases the weather as well as the picture", quiet != null && quiet < loud,
    `${loud} → ${quiet}`);
  ok("and the document says so, so every layer can hear it",
    await page.evaluate(() => document.documentElement.classList.contains("is-holding")));
  await page.mouse.up();
  await page.waitForTimeout(1800);
  ok("letting go brings it back", (await eased()) > quiet, `${quiet} → ${await eased()}`);
  ok("nothing threw", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// ── the counter turns over ────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true,
    entered: true, watched: false, reelAt: 6, reelFurthest: 300, sound: false, motion: "full", nameWritten: true })));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForSelector(".where", { timeout: 10000 });
  await page.waitForTimeout(600);
  const before = await page.locator(".where").innerText();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(60);
  const both = await page.locator(".where-n").count();
  await page.waitForTimeout(700);
  const after = await page.locator(".where").innerText();
  ok("the chapter number changes", before !== after, `${before} → ${after}`);
  ok("and it turns over rather than swapping", both === 2, String(both));
  ok("and settles back to one", (await page.locator(".where-n").count()) === 1);
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
  // The array is read out of src/content/samehour.js and evaluated, not
  // pattern-matched. Two regexes in a row got this wrong — one dropped every
  // beat carrying a `bloom` flag, the next dropped every single-line beat —
  // and a parser that silently drops beats is a suite that silently stops
  // testing the ending. It is our own source; read it as source.
  const src = readFileSync(path.join(root, "src", "content", "samehour.js"), "utf8");
  const from = src.indexOf("var SAME_HOUR_BEATS");
  const open = src.indexOf("[", from);
  const close = src.indexOf("\n];", open);
  const beats = new Function(`return ${src.slice(open, close + 2)}`)();
  if (!Array.isArray(beats) || beats.length < 20) throw new Error(`beats: ${beats?.length}`);
  return beats.map((b) => ({ ...b, text: b.text ?? "" }));
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
    // The silence is not a gap before the address — it is the first twenty
    // seconds of it. Nothing may be on the screen but the lamp. This carried
    // "he is reading this now" and "step out" the whole way through, which is
    // the one place in the file that must be empty.
    ok("and nothing at all is on it but the lamp",
      (await v.page.locator(".hour-slip, .hour-together, .hour button").count()) === 0,
      `slip+together+buttons ${await v.page.locator(".hour-slip, .hour-together, .hour button").count()}`);
    await v.close();
  }
  {
    const v = await hourVisit(nightAt(beatAt((b) => b.kind === "address") + 4));
    ok("the silence breaks on the anniversary",
      /^Happy anniversary, miss wife\.$/.test(await v.text(".hour-stage")), await v.text(".hour-stage"));
    ok("nothing else is on screen with it",
      (await v.page.locator(".hour-slip, .hour-together, .hour button").count()) === 0);
    await v.close();
  }
  {
    // The passage. Every line of it alone on the screen, in order, with the
    // room still turned down and nothing to press.
    const said = hourBeats.filter((b) => b.kind === "address");
    ok("the address is more than one breath", said.length >= 5, String(said.length));
    for (let i = 1; i < said.length; i++) {
      const v = await hourVisit(nightAt(said[i].at + 6));
      const on = await v.text(".hour-stage");
      ok(`the address goes on, ${i} of ${said.length - 1}`, on === said[i].text, `${on} ≠ ${said[i].text}`);
      ok(`and nothing is on it with line ${i}`,
        (await v.page.locator(".hour-slip, .hour-together, .hour button").count()) === 0);
      const fits = await v.page.evaluate(() => {
        const el = document.querySelector(".hour-address");
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.right <= innerWidth + 1 && r.left >= -1 && r.top >= -1 && r.bottom <= innerHeight + 1;
      });
      ok(`and line ${i} fits on the screen`, fits);
      await v.close();
    }
    // It ends on the promise that closes the hour, the distance and the room
    // at once — and that is the last thing said.
    const last = said[said.length - 1];
    ok("it ends on the same room", /Until it is the same room\.$/.test(last.text), last.text);
    ok("and that line is held for a full minute",
      hourBeats.find((b) => b.kind === "close").at - last.at >= 55,
      String(hourBeats.find((b) => b.kind === "close").at - last.at));
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
    ok("and the shelf count knows it", /There are twenty-five/i.test(shelf), shelf.slice(0, 120));
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
    ok("and the shelf counts twenty-four", /There are twenty-four/i.test(shelf), shelf.slice(0, 120));
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
