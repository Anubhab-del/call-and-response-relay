// Every sentence the house can build, read on a wide spread of days, for the
// kind of fault a spellchecker cannot see: "1 days", a lowercase word starting
// a sentence, a stray undefined, a doubled word.
//
// One page, one init script, the clock moved from inside — creating a context
// per day took longer than anyone would wait, so nobody would have run it.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] ?? path.join(root, "dist", "HER.html");
const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const FAULTS = [
  [/\b1 (days|letters|chapters|rooms|words|things|years|months|hours|minutes|Septembers)\b/i, "a plural on one"],
  [/undefined|NaN|\[object |Infinity/, "a value that got out"],
  // Within a line only. Across a line break the next block is often a letter's
  // own opening, which is lower case on purpose.
  [/[.!?] [a-z]/, "a sentence starting in lower case"],
  [/\s,|\s\.|\(\)|\bin 0 days\b|\bin -/, "punctuation that came out wrong"],
  [/\b(\w{4,})\b \1\b/i, "a word said twice"],
];

const days = [];
for (let i = 0; i < 3 * 365; i += 23) days.push(i);
for (const key of ["09-01", "09-02", "09-03", "06-12", "06-13", "06-14", "05-03", "11-30", "12-01", "06-01"])
  for (const year of [2026, 2027, 2028]) days.push(`${year}-${key}`);

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, offline: true });
const page = await ctx.newPage();
await page.addInitScript(() => {
  const iso = localStorage.getItem("__clock");
  if (iso) {
    const shift = new Date(iso).getTime() - Date.now();
    const RealDate = Date;
    class ShiftedDate extends RealDate {
      constructor(...a) { if (a.length === 0) super(RealDate.now() + shift); else super(...a); }
      static now() { return RealDate.now() + shift; }
    }
    ShiftedDate.parse = RealDate.parse; ShiftedDate.UTC = RealDate.UTC;
    globalThis.Date = ShiftedDate;
  }
  localStorage.setItem("her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true, watched: true,
    reelAt: 0, reelFurthest: 0, opened: {}, spentOnce: false, kept: {}, collected: {}, pulls: {}, replies: [],
    words: {}, visits: [], sound: false, motion: "still", inbox: [], nameWritten: true, firstOpen: 1, lastOpen: 1 }));
});
await page.goto("file://" + FILE, { waitUntil: "load" });

const found = new Map();
let read = 0;
for (const spec of days) {
  const iso = typeof spec === "number"
    ? new Date(Date.UTC(2026, 8, 1) + spec * 86400000).toISOString().slice(0, 10)
    : spec;
  await page.evaluate((v) => localStorage.setItem("__clock", v), `${iso}T20:30:00`);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(320);
  for (const key of ["", "1", "4", "5", "7"]) {
    if (key) { await page.keyboard.press(key); await page.waitForTimeout(200); }
    const text = (await page.locator("#root").innerText()).replace(/ /g, " ");
    read += 1;
    for (const [re, label] of FAULTS) {
      const hit = text.match(re);
      if (!hit || found.has(hit[0])) continue;
      const at = text.indexOf(hit[0]);
      found.set(hit[0], `${iso} · ${label} · …${text.slice(Math.max(0, at - 48), at + hit[0].length + 26).replace(/\n/g, " ")}…`);
    }
    if (key) { await page.keyboard.press("Escape"); await page.waitForTimeout(150); }
  }
}
await browser.close();
for (const line of found.values()) console.log(line);
console.log(`${read} screens read across ${days.length} days · ${found.size} faults`);
process.exit(found.size ? 1 : 0);
