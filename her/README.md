# HER — build notes

One HTML file. No network, no account, no analytics. It has to work on a phone
in airplane mode, opened from `file://`, with a dead battery's worth of patience.

## Build

```
cd her
npm install
npm run build     # -> dist/HER.html
npm run dev       # same, unminified, for reading stack traces
```

`dist/HER.html` is the whole product. Fonts, styles and script are inlined at
build time; nothing is fetched at runtime.

## Layout

```
vendor/runtime.js     React 19 + Motion, built once, never hand-edited.
src/runtime-bindings  The five names the house borrows from it.
src/order.json        Concatenation order. One module scope, so order matters.
src/content/          Prose. Edit here — no animation code lives in these files.
src/lib/              Time, storage, score, haptics, device, sealing.
src/film/             The picture: weather, layers, beats, the reel.
src/house/            The rooms.
src/app.js            Shell, modes, the fuse.
styles/her.css        One stylesheet. Font payloads are `__FONT:name__` slots.
assets/fonts/         woff2 files inlined into those slots at build.
shell/                The <head> and the <body> around it all.
tools/                Checks that run against a built file.
```

## Editing prose

Everything a reader sees lives under `src/content/`:

| file             | what is in it                                       |
|------------------|-----------------------------------------------------|
| `canon.js`       | names, cities, kilometres, the dates, lock copy      |
| `film.js`        | the picture, as a small text format (see below)      |
| `letters.js`     | the letters, their open-labels and their gating      |
| `everything.js`  | the daily shards, filed under `# ── section ──`      |
| `promises.js`    | the twelve                                           |
| `milestones.js`  | the dates the house knows, and the long counts       |
| `prompts.js`     | what her page asks                                   |

### The film format

```
=== years | title | weather | lights, separated, by, commas
--- Chapter title
Line.
Another line.
--- A named scene @sceneid
```

`===` starts a part. `---` starts a chapter; add `@id` to hand that chapter to a
purpose-built scene component instead of the default typesetting.

## Checks

```
node tools/check.mjs        # gating, dates, offline, structure
```

Run it against `dist/HER.html` before shipping. It opens the built file the way
she will: local, offline, one thumb.
