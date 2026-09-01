// ── the copy she can keep ─────────────────────────────────────────────────
//
// "Keep a copy" used to write a JSON file. That is a save file: if HER.html
// is ever lost — a new phone, a dead drive, 2035 — her words become a string
// of braces that mean nothing to anybody.
//
// So the copy is a document now. It opens in any browser, on any machine,
// with no fonts to fetch and no script to run, and it prints. A person who
// has never heard of this house can read it.
//
// The state is still in there, in a script tag at the foot, so putting the
// copy back into a working house also still works. One file, both jobs.

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphs(text) {
  return String(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function stampDay(at) {
  return at ? formatStamp(at) : "";
}

function heirloomSections(state) {
  let out = [];

  let septembers = Object.entries(state.sameHour ?? {})
    .filter(([, entry]) => entry?.answer)
    .sort((a, b) => Number(b[0]) - Number(a[0]));
  if (septembers.length) {
    out.push(`<section><h2>The Septembers</h2>
      <p class="ask">${escapeHtml(SAME_HOUR_ASK.question)}</p>
      ${septembers
        .map(
          ([year, entry]) =>
            `<article><h3>${escapeHtml(year)}</h3>${paragraphs(entry.answer)}</article>`,
        )
        .join("\n")}</section>`);
  }

  // The hours of each third September she was awake for, and what he said in
  // them. The copy she keeps should hold the day as well as the night.
  let days = Object.entries(state.theDay ?? {}).sort((a, b) => Number(b[0]) - Number(a[0]));
  if (days.length) {
    out.push(`<section><h2>The hours of the third September</h2>
      ${days
        .map(([year, hours]) => {
          let kept = Object.keys(hours ?? {})
            .map(Number)
            .filter((h) => Number.isFinite(h) && h >= 0 && h < 24)
            .sort((a, b) => a - b);
          if (!kept.length) return "";
          return `<article><h3>${escapeHtml(year)}</h3>
            ${kept
              .map((h) => {
                let door = THE_DAY[h];
                if (!door) return "";
                return `<p class="hour"><span class="mark">${escapeHtml(door.kicker)}</span> ${escapeHtml(
                  door.line,
                )}${door.under ? ` ${escapeHtml(door.under)}` : ""}</p>`;
              })
              .join("\n")}</article>`;
        })
        .filter(Boolean)
        .join("\n")}</section>`);
  }

  let written = (state.replies ?? []).filter((note) => note?.text?.trim());
  if (written.length) {
    out.push(`<section><h2>What she wrote</h2>
      ${written
        .map((note) => {
          let when = stampDay(note.at);
          let mark = note.private ? ' <span class="mark">kept to herself</span>' : "";
          return `<article><h3>${escapeHtml(when)}${mark}</h3>${paragraphs(note.text)}</article>`;
        })
        .join("\n")}</section>`);
  }

  let words = Object.entries(state.words ?? {})
    .filter(([, word]) => String(word ?? "").trim())
    .sort((a, b) => Number(b[0]) - Number(a[0]));
  if (words.length) {
    out.push(`<section><h2>One word for the day</h2><ul class="words">
      ${words
        .map(([day, word]) => {
          let date = new Date(Number(day) * DAY_MS);
          let label = formatParts({
            y: date.getUTCFullYear(),
            m: date.getUTCMonth() + 1,
            d: date.getUTCDate(),
          });
          return `<li><span>${escapeHtml(label)}</span> ${escapeHtml(word)}</li>`;
        })
        .join("\n")}</ul></section>`);
  }

  let opened = LETTERS.filter((letter) => state.opened?.[letter.id]).sort(
    (a, b) => (state.opened[a.id] ?? 0) - (state.opened[b.id] ?? 0),
  );
  if (opened.length) {
    out.push(`<section><h2>The letters she opened</h2><ul class="list">
      ${opened
        .map(
          (letter) =>
            `<li><span>${escapeHtml(stampDay(state.opened[letter.id]))}</span> ${escapeHtml(letter.open)}</li>`,
        )
        .join("\n")}</ul>
      <p class="fine">The letters themselves are in the house. There are ${LETTERS.length} of them.</p></section>`);
  }

  let kept = PROMISES.filter((vow) => state.kept?.[vow.id]);
  if (kept.length) {
    out.push(`<section><h2>The promises she says he kept</h2><ul class="list">
      ${kept
        .map(
          (vow) =>
            `<li><span>${escapeHtml(stampDay(state.kept[vow.id]))}</span> ${escapeHtml(vow.text)}</li>`,
        )
        .join("\n")}</ul></section>`);
  }

  return out.join("\n");
}

function heirloomDocument(state = snapshot(), when = new Date()) {
  let days = daysTogether(when);
  let visits = new Set(state.visits ?? []).size;
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HER — a copy kept ${escapeHtml(formatParts(civilToday(when)))}</title>
<style>
  :root { color-scheme: light }
  body { max-width: 34rem; margin: 0 auto; padding: 6vh 7vw 12vh;
         background: #f6f0e6; color: #2a2019;
         font: 1.05rem/1.68 Georgia, "Times New Roman", serif; }
  header { border-bottom: 1px solid #cbb89c; padding-bottom: 2rem; margin-bottom: 2.5rem }
  h1 { letter-spacing: .34em; font-size: 1.5rem; font-weight: 400; margin: 0 0 .8rem }
  .sub { color: #7a6a58; font-style: italic; margin: 0 }
  .facts { color: #7a6a58; font-size: .86rem; margin-top: 1.4rem }
  h2 { letter-spacing: .18em; text-transform: uppercase; font-size: .74rem;
       font-weight: 400; color: #9a7d4e; margin: 3rem 0 1rem }
  h3 { font-size: .78rem; letter-spacing: .1em; text-transform: uppercase;
       font-weight: 400; color: #8a7864; margin: 1.8rem 0 .4rem }
  article p { margin: 0 0 .9rem; white-space: pre-wrap }
  .ask { font-style: italic; color: #6a5a48; margin: 0 }
  .mark { color: #9a7d4e; font-style: italic; text-transform: none; letter-spacing: 0 }
  ul { padding: 0; margin: .6rem 0 0; list-style: none }
  li { padding: .35rem 0; border-bottom: 1px solid #e2d6c2 }
  li span { color: #9a8a74; font-size: .8rem; display: inline-block; min-width: 11rem }
  .words li span { min-width: 11rem }
  .fine { color: #8a7864; font-size: .84rem; font-style: italic; margin-top: 1rem }
  footer { border-top: 1px solid #cbb89c; margin-top: 4rem; padding-top: 1.6rem;
           color: #8a7864; font-size: .84rem }
  @media print { body { background: #fff } }
</style>
<header>
  <h1>HER</h1>
  <p class="sub">A copy, kept on ${escapeHtml(formatParts(civilToday(when)))}.</p>
  <p class="facts">
    ${escapeHtml(CANON.name)} and ${escapeHtml(CANON.you)} &middot;
    ${escapeHtml(CANON.herCity)} and ${escapeHtml(CANON.hisCity)} &middot;
    ${escapeHtml(formatNumber(CANON.kilometres))} kilometres<br>
    Since ${escapeHtml(START_LABEL)} &middot; ${escapeHtml(formatNumber(days))} days &middot;
    ${escapeHtml(String(visits))} of them spent in this house
  </p>
</header>
${heirloomSections(state)}
<footer>
  <p>Everything above was written on a phone with no connection to anything,
  for one reader. This page needs nothing either — no internet, no fonts, no
  program. It will open on whatever you have.</p>
  <p>The house itself is a file called HER.html. If you still have it, open
  this page in it under the fuse box, and everything comes back exactly as it
  was.</p>
</footer>
<script id="her-state" type="application/json">${JSON.stringify({ her: STORE_KEY, at: Date.now(), store: state }).replace(/</g, "\\u003c")}</script>
`;
}
