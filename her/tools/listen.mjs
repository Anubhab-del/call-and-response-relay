// What the night sounds like, counted rather than assumed.
//
// Headless Chromium has no speaker, so an analyser tap reads silence however
// loud the room is. Counting the nodes the score actually builds is the honest
// measure: every struck note is a stack of oscillators, so the count is the
// number of notes, and it is zero when nothing is playing.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] ?? path.join(root, "dist", "HER.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const clockAt = (iso) => `(() => {
  const target = new Date(${JSON.stringify(iso)}).getTime();
  const real = Date.now(); const shift = target - real; const RealDate = Date;
  class S extends RealDate { constructor(...a){ if(a.length===0) super(RealDate.now()+shift); else super(...a);} static now(){return RealDate.now()+shift;} }
  S.parse = RealDate.parse; S.UTC = RealDate.UTC; globalThis.Date = S;
  localStorage.setItem("her.v1", JSON.stringify({ schema:1, greeted:true, entered:true, watched:true,
    reelAt:0, reelFurthest:0, opened:{}, spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[],
    words:{}, visits:[], sound:true, motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1, sameHour:{} }));
  window.__n = 0;
  const make = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function () { window.__n++; return make.call(this); };
})()`;

const browser = await chromium.launch({ executablePath: CHROME, args: ["--autoplay-policy=no-user-gesture-required"] });
const rows = [];
// Each phase of the night, opened at that moment, listened to for twenty
// seconds. The theme loops every twenty-eight, so a fifth of it at least.
for (const [label, iso] of [
  ["the house, before", "2026-09-02T18:00:00"],
  ["the night opens", "2026-09-02T21:00:03"],
  ["the night, middle", "2026-09-02T21:04:00"],
  ["the silence", "2026-09-02T21:09:05"],
  ["the address", "2026-09-02T21:10:40"],
  ["after it closes", "2026-09-02T21:14:30"],
]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e.message)));
  await page.addInitScript(clockAt(iso));
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.mouse.click(195, 700);
  await page.waitForTimeout(2500);
  await page.evaluate(() => (window.__n = 0));
  await page.waitForTimeout(20000);
  const notes = await page.evaluate(() => window.__n);
  const mode = await page.evaluate(() => document.querySelector(".shell")?.dataset.mode);
  rows.push({ label, notes, mode, errs: errs.length });
  console.log(`${label.padEnd(20)} mode:${String(mode).padEnd(6)} oscillators in 20s: ${String(notes).padStart(3)}  errors:${errs.length}`);
  await ctx.close();
}
await browser.close();

const by = (l) => rows.find((r) => r.label === l)?.notes ?? -1;
const fail = [];
if (by("the night opens") < 20) fail.push("the night has no theme under it");
if (by("the night opens") <= by("the house, before")) fail.push("the night is no fuller than the house");
if (by("the address") >= by("the night, middle")) fail.push("the score does not drop for the address");
if (by("after it closes") > 12) fail.push("the theme is still going after the night ends");
if (fail.length) (console.log("\n" + fail.join("\n")), process.exit(1));
console.log("\nthe night has its own score, it drops for the words, and it stops.");
