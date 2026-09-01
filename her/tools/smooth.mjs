// Frames, on a phone. Not "does it look smooth" — how many frames land in a
// fixed window, on hardware throttled to something like a mid-range Android.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] ?? path.join(root, "dist", "HER.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SLOW = Number(process.env.SLOW ?? 4);

const clock = (iso) => `(() => {
  const target = new Date(${JSON.stringify(iso)}).getTime();
  const real = Date.now(); const shift = target - real; const RealDate = Date;
  class S extends RealDate { constructor(...a){ if(a.length===0) super(RealDate.now()+shift); else super(...a);} static now(){return RealDate.now()+shift;} }
  S.parse = RealDate.parse; S.UTC = RealDate.UTC; globalThis.Date = S;
})()`;
const seed = (extra) => `localStorage.setItem("her.v1", JSON.stringify(Object.assign(
  { schema:1, greeted:true, entered:true, watched:true, reelAt:0, reelFurthest:0, opened:{},
    spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[], words:{}, visits:[], sound:false,
    motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1, sameHour:{} }, ${extra})));`;

const browser = await chromium.launch({ executablePath: CHROME });
const rows = [];
for (const [label, iso, extra] of [
  ["the picture", "2026-09-15T21:30:00", '{ watched:false, reelAt:26, reelFurthest:300 }'],
  ["the house", "2026-09-15T21:30:00", "{}"],
  ["the letters", "2026-09-15T21:30:00", "{}"],
  ["the night", "2026-09-02T21:03:00", "{}"],
  ["the address", "2026-09-02T21:10:00", "{}"],
  ["the day dial", "2026-09-02T16:00:00", "{}"],
]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, offline: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e.message)));
  await page.addInitScript(clock(iso));
  await page.addInitScript(seed(extra));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: SLOW });
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  if (label === "the letters") { await page.keyboard.press("1"); await page.waitForTimeout(1200); }
  if (label === "the day dial") { await page.locator(".day-door").click(); await page.waitForTimeout(1200); }
  // Count real frames over four seconds.
  const fps = await page.evaluate(() => new Promise((done) => {
    let n = 0; const t0 = performance.now();
    const tick = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(tick); else done(n / ((performance.now() - t0) / 1000)); };
    requestAnimationFrame(tick);
  }));
  // And how long the main thread is busy — the thing that makes a tap feel late.
  const busy = await page.evaluate(() => new Promise((done) => {
    let long = 0, count = 0;
    const po = new PerformanceObserver((l) => { for (const e of l.getEntries()) { long += e.duration; count++; } });
    try { po.observe({ entryTypes: ["longtask"] }); } catch { return done({ long: -1, count: -1 }); }
    setTimeout(() => { po.disconnect(); done({ long: Math.round(long), count }); }, 4000);
  }));
  rows.push({ label, fps, busy });
  console.log(`${label.padEnd(14)} ${fps.toFixed(1).padStart(5)} fps   long tasks: ${String(busy.count).padStart(2)} / ${String(busy.long).padStart(4)}ms   errors:${errs.length}`);
  await ctx.close();
}
await browser.close();
const worst = rows.reduce((a, b) => (a.fps < b.fps ? a : b));
console.log(`\nCPU throttled ${SLOW}×. Worst: ${worst.label} at ${worst.fps.toFixed(1)} fps.`);
process.exit(worst.fps < 40 ? 1 : 0);
