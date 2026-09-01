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
npm install                 # esbuild, plus playwright for the checks
npm run check               # the suite — 199 checks against dist/HER.html
npm run audit               # fit, touch targets and contrast, at three widths
npm run read                # every sentence the house can build, over 3 years
```

It opens the built file the way she will — `file://`, offline, 390×844, one
thumb — and walks it on real calendar days with the clock shifted: a plain
Tuesday, the second of September, her birthday, the third of May, the week
before the wedding and the day before that week, the morning of the first
class, and two in the morning. It also:

- opens a letter, keeps a vow, saves the file, throws the profile away, walks
  back in on a fresh one and puts the copy back;
- corrupts a save and checks she is still left with a house and a copy of the
  old one set aside;
- runs the whole thing under `prefers-reduced-motion`;
- switches all three motion modes and checks each one changes something;
- serves the file over a local HTTP server and asserts the host is asked for
  exactly one thing;
- walks the whole thing forward to 2036 and reads it there, and opens a save
  with ten years of writing in it;
- at 320 px, asserts that nothing is smaller than a thumb, nothing that
  carries meaning is under 4.5:1 against its own ground, and nothing reaches
  past the frame.

Nothing in it asserts on a screenshot. It asserts on what the house says.

### The other two

`npm run audit` is the same fit-and-contrast pass at 320, 390 and 430 px, and
prints what it finds rather than asserting. Use it when moving type around.

`npm run read` opens the house on seventy-eight different days spread over
three years — every date it keeps, and the day either side of each — and reads
every screen looking for the faults a spellchecker cannot see: "1 days", a
sentence starting in lower case, a doubled word, a value that got out. It found
"Three years in 1 days" on the eve of the third September, which is precisely
the night it would have been read.

`--paper-ghost` is a deliberate 3:1 floor and the checks know it. It is only
for a word that repeats what is directly beside it — "days" under a number
that is already enormous. Everything else owes 4.5:1.

## The vendor chunk

`vendor/runtime.js` is React 19 plus Motion, as they were built into the file
this source tree was recovered from. It is not edited by hand and it is not
re-bundled — the seam at the end of it is where the house begins.
`src/runtime-bindings.js` names the five things the house borrows from it.
