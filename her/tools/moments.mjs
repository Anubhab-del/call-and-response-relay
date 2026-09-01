import { chromium } from "playwright";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = path.join(root, "dist", "HER.html");
const OUT = process.argv[2];
const src = readFileSync(path.join(root, "src", "content", "samehour.js"), "utf8");
const beats = [...src.matchAll(/\{\s*at:\s*(\d+),\s*kind:\s*"(\w+)"(?:,\s*text:\s*"([^"]*)")?/g)]
  .map((m) => ({ at: +m[1], kind: m[2], text: m[3] }));
const b = (k, n = 0) => beats.filter((x) => x.kind === k)[n].at;
const moments = [
  ["name", b("name") + 8],
  ["silence", b("still") + 10],
  ...beats.filter((x) => x.kind === "address").map((x, i) => [`address-${i}`, x.at + 8]),
  ["held", beats.filter((x) => x.kind === "address").pop().at + 45],
  ["closing", b("close") + 2],
];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, sec] of moments) {
  const at = new Date(Date.UTC(2026, 8, 2, 21, 0, 0) + sec * 1000);
  const iso = `2026-09-02T${String(21 + Math.floor(sec / 3600)).padStart(2, "0")}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  const ctx = await browser.newContext({ viewport: { width: Number(process.env.W ?? 390), height: Number(process.env.H ?? 844) }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  await page.addInitScript(`(() => {
    const target = new Date(${JSON.stringify(iso)}).getTime();
    const real = Date.now(); const shift = target - real; const RealDate = Date;
    class S extends RealDate { constructor(...a){ if(a.length===0) super(RealDate.now()+shift); else super(...a);} static now(){return RealDate.now()+shift;} }
    S.parse = RealDate.parse; S.UTC = RealDate.UTC; globalThis.Date = S;
    localStorage.setItem("her.v1", JSON.stringify({ schema:1, greeted:true, entered:true, watched:true,
      reelAt:0, reelFurthest:0, opened:{}, spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[],
      words:{}, visits:[], sound:false, motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1, sameHour:{} }));
  })()`);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(2600);
  const stage = await page.evaluate(() => (document.querySelector(".hour-stage")?.innerText ?? "«no stage»").trim());
  const fits = await page.evaluate(() => {
    const el = document.querySelector(".hour-address");
    if (!el) return "—";
    const r = el.getBoundingClientRect();
    return `${Math.round(r.width)}x${Math.round(r.height)} ${r.right <= innerWidth + 1 && r.left >= -1 && r.bottom <= innerHeight + 1 ? "fits" : "OVERFLOWS"}`;
  });
  const extras = await page.evaluate(() => ({
    buttons: document.querySelectorAll(".hour button").length,
    slip: document.querySelectorAll(".hour-slip, .hour-together").length,
    address: document.querySelector(".shell")?.dataset.address ?? "",
  }));
  console.log(`${iso}  ${name.padEnd(12)} ${fits.padEnd(16)} b:${extras.buttons} s:${extras.slip}  "${stage.slice(0, 76)}"`);
  if (OUT) await page.screenshot({ path: `${OUT}/moment-${name}.png` });
  await ctx.close();
}
await browser.close();
