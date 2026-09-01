import { chromium } from "playwright";
const FILE = "/home/user/call-and-response-relay/her/dist/HER.html";
const OUT = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const iso of ["2026-09-02T00:02:00", "2026-09-02T04:10:00", "2026-09-02T13:20:00", "2026-09-02T20:05:00", "2026-09-03T11:00:00"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, offline: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message)));
  page.on("console", m => m.type() === "error" && errs.push(m.text()));
  await page.addInitScript(`(() => {
    const t = new Date(${JSON.stringify("X")}).getTime();
  })()`.replace("X", iso));
  await page.addInitScript(`(() => {
    const target = new Date(${JSON.stringify(iso)}).getTime();
    const real = Date.now(); const shift = target - real; const RealDate = Date;
    class S extends RealDate { constructor(...a){ if(a.length===0) super(RealDate.now()+shift); else super(...a);} static now(){return RealDate.now()+shift;} }
    S.parse = RealDate.parse; S.UTC = RealDate.UTC; globalThis.Date = S;
    localStorage.setItem("her.v1", JSON.stringify({ schema:1, greeted:true, entered:true, watched:true,
      reelAt:0, reelFurthest:0, opened:{}, spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[],
      words:{}, visits:[], sound:false, motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1 }));
  })()`);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  const sun = await page.evaluate(() => document.querySelector(".shell")?.dataset.sun ?? "none");
  const card = await page.locator(".day-door").count();
  let room = "—", marks = 0, open = 0, face = "—";
  if (card) {
    await page.locator(".day-door").click();
    await page.waitForTimeout(1200);
    room = await page.evaluate(() => document.querySelector(".house")?.dataset.room);
    marks = await page.locator(".dial-mark").count();
    open = await page.locator('.dial-mark[data-open="true"]').count();
    face = (await page.locator(".dial-face").innerText()).replace(/\s+/g, " ");
    if (OUT) await page.screenshot({ path: `${OUT}/day-${iso.slice(8, 13).replace("T", "-")}.png` });
  }
  console.log(`${iso}  sun=${String(sun).padEnd(11)} card=${card} room=${String(room).padEnd(7)} marks=${marks} open=${String(open).padStart(2)} face="${face}" errors=${errs.length ? errs[0] : "none"}`);
  await ctx.close();
}
await b.close();

// Turn the dial by hand and read what the middle says at each stop.
{
  const b2 = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await b2.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message)));
  await page.addInitScript(`(() => {
    const target = new Date("2026-09-02T13:20:00").getTime();
    const real = Date.now(); const shift = target - real; const RealDate = Date;
    class S extends RealDate { constructor(...a){ if(a.length===0) super(RealDate.now()+shift); else super(...a);} static now(){return RealDate.now()+shift;} }
    S.parse = RealDate.parse; S.UTC = RealDate.UTC; globalThis.Date = S;
    localStorage.setItem("her.v1", JSON.stringify({ schema:1, greeted:true, entered:true, watched:true,
      reelAt:0, reelFurthest:0, opened:{}, spentOnce:false, kept:{}, collected:{}, pulls:{}, replies:[],
      words:{}, visits:[], sound:false, motion:"full", inbox:[], nameWritten:true, firstOpen:1, lastOpen:1 }));
  })()`);
  await page.goto("file://" + FILE, { waitUntil: "load" });
  await page.waitForTimeout(1600);
  await page.locator(".day-door").click();
  await page.waitForTimeout(1000);
  console.log("\nturning the dial:");
  for (const step of ["ArrowLeft", "ArrowLeft", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]) {
    await page.keyboard.press(step);
    await page.waitForTimeout(320);
    const face = (await page.locator(".dial-face").innerText()).replace(/\s+/g, " ");
    const door = (await page.locator(".door").innerText()).replace(/\s+/g, " ").slice(0, 62);
    const room = await page.evaluate(() => document.querySelector(".house")?.dataset.room);
    console.log(`  ${step.padEnd(11)} room=${room}  face="${face}"  door="${door}"`);
  }
  console.log("errors:", errs.length ? errs[0] : "none");
  await b2.close();
}
