import { chromium } from "playwright";
const FILE = "/home/user/call-and-response-relay/her/dist/HER.html";
const OUT = "/tmp/claude-0/-home-user-call-and-response-relay/6efff641-7ce7-51ce-9bf0-7a70e0cfe12a/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, iso, state] of [
  ["film", "2026-09-15T21:30:00", { watched: false, reelAt: 26, reelFurthest: 300 }],
  ["hour", "2026-09-02T21:03:30", { watched: true, reelAt: 0, reelFurthest: 0 }],
  ["address", "2026-09-02T21:09:34", { watched: true, reelAt: 0, reelFurthest: 0 }],
]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message)));
  await page.addInitScript(`(() => {
    const target = new Date(${JSON.stringify(iso)}).getTime();
    const real = Date.now(); const shift = target - real; const RealDate = Date;
    class S extends RealDate { constructor(...a){ if(a.length===0) super(RealDate.now()+shift); else super(...a);} static now(){return RealDate.now()+shift;} }
    S.parse = RealDate.parse; S.UTC = RealDate.UTC; globalThis.Date = S;
    localStorage.setItem("her.v1", JSON.stringify(Object.assign({ schema:1, greeted:true, entered:true,
      opened:{}, spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[], words:{}, visits:[],
      sound:false, motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1, sameHour:{} },
      ${JSON.stringify(state)})));
  })()`);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(3200);
  await page.screenshot({ path: `${OUT}/noir-${name}.png` });
  const on = await page.evaluate(() => ({
    blinds: getComputedStyle(document.querySelector(".blinds")).opacity,
    smoke: document.querySelectorAll(".smoke span").length,
    mode: document.querySelector(".shell")?.dataset.mode,
    address: document.querySelector(".shell")?.dataset.address ?? "",
  }));
  console.log(`${name.padEnd(8)} mode=${String(on.mode).padEnd(6)} blinds=${on.blinds} smoke=${on.smoke} address=${on.address} errors=${errs.length ? errs[0] : "none"}`);
  await ctx.close();
}
await b.close();
