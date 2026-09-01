// Builds the one file the house ships as: dist/HER.html
// Everything is inlined — fonts, styles, script. Nothing is fetched.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import esbuild from "esbuild";

const root = path.dirname(fileURLToPath(import.meta.url));
const at = (...p) => path.join(root, ...p);
const read = (...p) => readFile(at(...p), "utf8");

const dev = process.argv.includes("--dev");
// A copy of the file for him, not for her.
//
// The night runs at nine on the second of September and at no other time,
// which means the person who wrote it is the one person who cannot check it.
// `--rehearse` builds a second file whose clock starts twenty seconds before
// nine and whose writes go nowhere, so it can be watched end to end, tonight,
// as many times as he likes, without sealing the real one.
const rehearse = process.argv.includes("--rehearse");

const order = JSON.parse(await read("src", "order.json"));
const vendor = await read("vendor", "runtime.js");
const modules = await Promise.all(
  order.map(async (file) => `// ── src/${file} ${"─".repeat(Math.max(0, 62 - file.length))}\n` + (await read("src", file))),
);

const source = vendor + "\n" + modules.join("\n");

const script = dev
  ? source
  : (
      await esbuild.transform(source, {
        loader: "js",
        format: "esm",
        target: "es2022",
        minify: true,
        legalComments: "none",
      })
    ).code;

let css = await read("styles", "her.css");
if (!dev) {
  css = (await esbuild.transform(css, { loader: "css", minify: true })).code;
}
const fonts = [...css.matchAll(/__FONT:([a-z0-9-]+)__/g)].map((m) => m[1]);
for (const name of new Set(fonts)) {
  const bytes = await readFile(at("assets", "fonts", `${name}.woff2`));
  css = css.replaceAll(`__FONT:${name}__`, bytes.toString("base64"));
}

const head = await read("shell", "head.html");
const tail = await read("shell", "tail.html");

// Everything below runs before the house does, and only in the rehearsal.
// It shifts the clock and swaps storage for a bucket that is thrown away, so
// nothing watched here can ever be mistaken for something she did.
const REHEARSAL = `
(() => {
  const start = new Date();
  start.setMonth(8, 2);
  start.setHours(20, 59, 40, 0);
  const shift = start.getTime() - Date.now();
  const RealDate = Date;
  class D extends RealDate {
    constructor(...a) { if (a.length === 0) super(RealDate.now() + shift); else super(...a); }
    static now() { return RealDate.now() + shift; }
  }
  D.parse = RealDate.parse; D.UTC = RealDate.UTC;
  globalThis.Date = D;
  const held = new Map([["her.v1", JSON.stringify({ schema: 1, greeted: true, entered: true,
    watched: true, reelAt: 0, reelFurthest: 0, opened: {}, spentOnce: false, kept: {}, collected: {},
    pulls: {}, replies: [], words: {}, visits: [], sound: true, motion: "full", inbox: [],
    nameWritten: true, firstOpen: 1, lastOpen: 1, sameHour: {}, theDay: {} })]]);
  const shim = {
    getItem: (k) => (held.has(k) ? held.get(k) : null),
    setItem: (k, v) => held.set(k, String(v)),
    removeItem: (k) => held.delete(k),
    clear: () => held.clear(),
    key: (i) => [...held.keys()][i] ?? null,
    get length() { return held.size; },
  };
  try { Object.defineProperty(window, "localStorage", { value: shim, configurable: true }); } catch {}
  addEventListener("DOMContentLoaded", () => {
    const mark = document.createElement("p");
    mark.textContent = "rehearsal · not her copy · reload to run it again";
    mark.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:9999;margin:0;padding:5px;" +
      "text-align:center;font:10px/1.6 system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase;" +
      "color:#0c0906;background:#d8b877;pointer-events:none";
    document.body.appendChild(mark);
  });
})();
`;

const html =
  head +
  (rehearse ? "<script>" + REHEARSAL + "</script>" : "") +
  '<script type="module" crossorigin>' +
  script +
  "</script>\n    " +
  '<style rel="stylesheet" crossorigin>' +
  css +
  "</style>" +
  tail;

const name = rehearse ? "HER-rehearsal.html" : "HER.html";
await mkdir(at("dist"), { recursive: true });
await writeFile(at("dist", name), html, "utf8");

const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
console.log(`dist/${name}  ${kb(html.length)}   script ${kb(script.length)}  styles ${kb(css.length)}`);
