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

const html =
  head +
  '<script type="module" crossorigin>' +
  script +
  "</script>\n    " +
  '<style rel="stylesheet" crossorigin>' +
  css +
  "</style>" +
  tail;

await mkdir(at("dist"), { recursive: true });
await writeFile(at("dist", "HER.html"), html, "utf8");

const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
console.log(`dist/HER.html  ${kb(html.length)}   script ${kb(script.length)}  styles ${kb(css.length)}`);
