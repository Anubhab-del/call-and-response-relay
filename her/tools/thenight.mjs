// The second of September, 2026, from ten to nine until it lets her go.
// Walked at the real pace of the beats, screenshotting each one, because this
// happens once and there is no second take.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = path.join(root, "dist", "HER.html");
const OUT = process.argv[2];
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

// The clock runs, shifted. Nothing is frozen: the night is driven by it.
const clockAt = (iso) => `(() => {
  const target = new Date(${JSON.stringify("PLACEHOLDER")}).getTime();
})()`;

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, offline: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

// Time runs sixteen times faster than life, from ten to nine. Sixty seconds of
// watching covers the whole night.
await page.addInitScript(() => {
  const start = new Date("2026-09-02T20:50:00").getTime();
  const real = Date.now();
  const RATE = 16;
  const RealDate = Date;
  const now = () => start + (RealDate.now() - real) * RATE;
  class ShiftedDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(now()); else super(...a); }
    static now() { return now(); }
  }
  ShiftedDate.parse = RealDate.parse; ShiftedDate.UTC = RealDate.UTC;
  globalThis.Date = ShiftedDate;
  localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true,
    reelAt: 0, reelFurthest: 0, opened: {}, spentOnce: false, kept: {}, collected: {}, pulls: {},
    replies: [], words: {}, visits: [], sound: false, motion: "full", inbox: [], nameWritten: true,
    firstOpen: 1, lastOpen: 1, sameHour: {} }));
});
await page.goto("file://" + FILE, { waitUntil: "load" });
await page.waitForTimeout(1200);

const clock = () => page.evaluate(() => new Date().toTimeString().slice(0, 8));
const state = () => page.evaluate(() => ({
  mode: document.querySelector(".shell")?.dataset.mode,
  address: document.querySelector(".shell")?.dataset.address,
  text: (document.querySelector("#root")?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 150),
}));

let last = "";
const log = [];
for (let i = 0; i < 520; i++) {
  const s = await state();
  const key = s.mode + "|" + s.address + "|" + s.text;
  if (key !== last) {
    last = key;
    const at = await clock();
    log.push(`${at}  [${s.mode}${s.address ? "/" + s.address : ""}]  ${s.text}`);
    if (OUT) await page.screenshot({ path: `${OUT}/night-${String(log.length).padStart(2, "0")}.png` });
  }
  await page.waitForTimeout(320);
  if ((await page.evaluate(() => new Date().getHours() * 60 + new Date().getMinutes())) > 21 * 60 + 22) break;
}
for (const line of log) console.log(line);
console.log(`\n${log.length} states · ${errors.length} errors`);
if (errors.length) console.log(errors.slice(0, 3).join("\n"));
const done = await page.evaluate(() => JSON.parse(localStorage.getItem("her.v1")).sameHour);
console.log("sealed:", JSON.stringify(done));
await browser.close();
