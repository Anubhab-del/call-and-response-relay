// Opens the built file the way she will: local, offline, one thumb.
// Walks the house on a set of real calendar days and asserts what should be true.
import { chromium } from "playwright";
import path from "node:path";
import os from "node:os";
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
  page.on("request", (r) => !/^(file|data|blob):/.test(r.url()) && external.push(r.url()));
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
  const toHouse2 = page2.getByRole("button", { name: /the house/i }).first();
  await toHouse2.waitFor({ timeout: 15000 });
  await toHouse2.click();
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
  ok("and the letter is the right one", /The hour is lying to you/i.test(open), open.slice(0, 200));
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

await browser.close();

const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "ok  " : "FAIL"}  ${pad(r.name, 48)} ${r.pass ? "" : r.detail.slice(0, 120)}`);
}
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
