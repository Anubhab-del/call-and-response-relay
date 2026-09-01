function buildReel() {
  let e = [
    {
      type: "projector",
    },
    {
      type: "title",
    },
    {
      type: "overture",
    },
    {
      type: "threshold",
    },
  ];
  return (
    PARTS.forEach((t) => {
      e.push({
        type: "part",
        part: t.index,
      });
      for (let n of CHAPTERS)
        n.part === t.index &&
          e.push(
            n.scene
              ? {
                  type: "scene",
                  n: n.n,
                  scene: n.scene,
                }
              : {
                  type: "chapter",
                  n: n.n,
                },
          );
    }),
    e.push(
      {
        type: "care",
      },
      {
        type: "vow",
      },
      {
        type: "credits",
      },
      {
        type: "after",
      },
      {
        type: "codaStill",
      },
      {
        type: "codaLine",
      },
      {
        type: "last",
      },
      {
        type: "nameFlash",
      },
      {
        type: "doorway",
      },
    ),
    e
  );
}
function beatKey(e, t) {
  return e.type === "chapter" || e.type === "scene"
    ? `ch-${e.n}`
    : e.type === "part"
      ? `part-${e.part}`
      : `${e.type}-${t}`;
}
function chapterAt(e) {
  return CHAPTERS[e - 1];
}
// ── the light inside an act ──────────────────────────────────────────────
//
// An act used to be one colour from its first chapter to its last: twenty-five
// chapters, four or five minutes, and the room never moved. The part still has
// its own light — that is what makes an act an act — but it passes through it
// rather than sitting in it, the way an evening does.
//
// Each act carries four stretches. The first and the third are the act's own
// weather, so it always comes home; the second and the fourth lean somewhere
// the act has a reason to go. The rain, the lightning and the wash of the
// whole frame all follow, because they all read from the same word.
var ACT_LIGHT = [
  // The year I loved a voice — a lamp, then the dark she was talking out of,
  // the lamp again, and her.
  ["tungsten", "silence", "tungsten", "hers"],
  // The year of ordinary love — evening, a kitchen light, evening, an answer.
  ["dusk", "tungsten", "dusk", "reply"],
  // The year you became real — held still, an evening, her, still again.
  ["still", "dusk", "hers", "still"],
  // Everything still coming — embers, the quiet after, embers, her.
  ["ember", "still", "ember", "hers"],
];
function actLight(n) {
  let chapter = chapterAt(n);
  let part = PARTS[chapter?.part ?? 0];
  let list = ACT_LIGHT[chapter?.part ?? 0];
  if (!part || !list) return part?.weather ?? "void";
  let span = Math.max(1, part.to - part.from + 1);
  let through = (n - part.from) / span;
  return list[Math.min(list.length - 1, Math.floor(through * list.length))];
}
function weatherFor(e) {
  switch (e.type) {
    case "part":
      return PARTS[e.part]?.weather ?? "void";
    case "chapter":
      return actLight(e.n);
    case "scene":
      return e.scene === "twohours"
        ? "still"
        : e.scene === "dance"
          ? "hers"
          : e.scene === "distance"
            ? "dusk"
            : (e.scene, "silence");
    case "threshold":
      return "silence";
    case "title":
    case "overture":
    case "credits":
      return "tungsten";
    case "care":
    case "vow":
      return "reply";
    case "after":
    case "codaStill":
    case "codaLine":
    case "last":
      return "still";
    case "nameFlash":
      return "hers";
    case "doorway":
      return "ember";
    default:
      return "void";
  }
}
function cueFor(e) {
  switch (e.type) {
    case "projector":
      return "projector";
    case "title":
    case "overture":
    case "threshold":
      return "title";
    case "part":
      return `/score/part-${e.part + 1}.mp3`;
    case "chapter":
      return `part-${chapterAt(e.n)?.part ?? 0}`;
    case "scene":
      return e.scene;
    case "care":
      return "care";
    case "vow":
      return "vow";
    case "credits":
    case "after":
      return "credits";
    case "codaStill":
    case "codaLine":
    case "last":
    case "nameFlash":
      return "coda";
    case "doorway":
      return "house";
    default:
      return "silent";
  }
}
function beatDuration(e) {
  switch (e.type) {
    case "projector":
      return 1800;
    case "title":
      return 4600;
    case "overture":
      return 3400;
    case "threshold":
      return 1700;
    case "part":
      return 3600;
    case "chapter": {
      let chapter = chapterAt(e.n);
      if (!chapter) return 3600;
      let lines = chapter.lines;
      let words = lines.join(" ").split(/\s+/).length;
      // A beat has to last until she has finished reading it, not until some
      // round number of seconds. Three parts: the time the last line takes to
      // finish arriving, the time it takes to actually read the whole thing,
      // and a breath at the end before the cut.
      //
      // This was capped at nine seconds when a chapter was twenty words. They
      // are nearly forty now, which gave her about a third of the time she
      // needed, and the line went out from under her.
      let arrive =
        750 +
        lines.slice(0, -1).reduce((sum, line) => sum + readSeconds(line) * 720, 0) +
        readSeconds(lines[lines.length - 1]) * 1000;
      // Display serif, large, unhurried: about two and a half words a second.
      let read = (words / 2.5) * 1000;
      return Math.round(Math.min(26e3, Math.max(4200, arrive + read + 1800)));
    }
    case "scene":
      return e.scene === "twohours"
        ? 6400
        : e.scene === "distance"
          ? 5400
          : e.scene === "sleep"
            ? 5e3
            : e.scene === "dance"
              ? 4800
              : e.scene === "hold"
                ? HOLD_COPY.ms
                : 4200;
    case "care":
      return 3800;
    case "vow":
      return 4600;
    case "credits":
      return 4400;
    case "after":
      return 5200;
    case "codaStill":
      return 3600;
    case "codaLine":
      return 3200;
    case "last":
      return 6e3;
    case "nameFlash":
      return 5200;
    default:
      return 0;
  }
}
function isHeldBeat(e) {
  return e.type === "vow" || e.type === "care";
}
function stormPulseFor(e, t) {
  return e.type === "vow" || e.type === "part" || (e.type === "scene" && e.scene === "twohours")
    ? t + 1
    : 0;
}
function showsHud(e) {
  return e.type !== "doorway";
}
function isFullBleed(e) {
  let t = chapterAt(e);
  if (!t) return false;
  let n = PARTS[t.part];
  return n ? (e - n.from) % 5 == 0 : false;
}
// ── the forms ────────────────────────────────────────────────────────────
//
// A hundred chapters laid out identically is a hundred slides. Each one is
// given a form instead — a different way of standing on the screen — so that
// turning the page is always worth doing.
//
// The walk uses a stride coprime with the list length, so it runs through
// every form before repeating and two chapters in a row can never share one.
var CHAPTER_FORMS = [
  "plain", // number, title, lines, centred
  "lead", // the first line large, the rest small beneath it
  "stack", // left aligned, wide leading, number in the corner
  "rule", // a hairline draws itself between the title and the lines
  "watermark", // the title enormous and faint behind the words
  "subtitle", // pinned to the lower third, like a subtitle
  "drop", // a raised initial on the first word
  "apart", // first line at the top of the frame, last at the bottom
  "close", // small, tight, intimate
  "breath", // a long pause between the first line and the rest
  "flare", // light comes up behind the first line
  "column", // a narrow measure, set like a poem
  "corner", // title in the corner, the lines given the room
  "wide", // letter-spaced, one line at a time
  "twoup", // title and first line on the same row
  "quiet", // no number, no title. Only the words.
];

// Over a still, most of the forms would fight the picture. These do not.
var CALM_FORMS = ["subtitle", "quiet", "close", "plain"];

function formSuits(form, chapter) {
  let lines = chapter?.lines?.length ?? 0;
  if (form === "apart" || form === "breath" || form === "twoup") return lines >= 2;
  if (form === "drop") return !!chapter?.lines?.[0];
  return true;
}

// The whole running order is worked out once, in one pass, rather than per
// chapter. Computing each one independently gave an uneven spread and let a
// still-backed chapter land on the same form as its neighbour.
//
// The cursor walks the list seven at a time — coprime with sixteen, so it
// visits every form before returning — and only steps off that walk when a
// form would repeat the one before it or does not suit the chapter.
function buildChapterForms() {
  let out = new Array(CHAPTERS.length + 1).fill("plain");
  let shots = new Array(CHAPTERS.length + 1).fill(null);
  let cursor = 0;
  let calm = 0;
  let camera = 0;
  let previous = null;
  let previousShot = -1;
  for (let n = 1; n <= CHAPTERS.length; n++) {
    let over = isFullBleed(n);
    let list = over ? CALM_FORMS : CHAPTER_FORMS;
    let from = over ? calm : cursor;
    let chapter = chapterAt(n);
    let pick = null;
    // What the chapter itself asks for, first — unless the one before it just
    // used that shape, or the shape does not suit the number of lines it has.
    // Over a still, only the four calm forms are available at all.
    for (let asked of formsWanted(chapter)) {
      if (asked === previous || !formSuits(asked, chapter) || !list.includes(asked)) continue;
      pick = asked;
      break;
    }
    for (let step = 0; !pick && step < list.length; step++) {
      let form = list[(from + step) % list.length];
      if (form === previous) continue;
      if (!formSuits(form, chapter)) continue;
      pick = form;
      break;
    }
    out[n] = pick ?? (previous === "plain" ? "close" : "plain");
    // The camera is decided in the same pass, for the same reason the form is.
    // A form that wants a particular move gets it — unless the chapter before
    // it just used that move, in which case the form takes the next camera on
    // the walk instead. Two chapters running never share a camera, even when
    // two different forms both ask for the push.
    let wanted = wantsShot(out[n]);
    let shot = wanted;
    if (shot == null || shot === previousShot) {
      // The free walk keeps its own place and is never reset by a form that
      // asked for something: resetting it was what left two of the six cameras
      // carrying a quarter of the picture each while two others barely ran.
      camera = (camera + 1) % SHOT_COUNT;
      if (camera === previousShot) camera = (camera + 1) % SHOT_COUNT;
      shot = camera;
    }
    shots[n] = shot;
    previousShot = shot;
    previous = out[n];
    if (over) calm = (calm + 1) % list.length;
    else cursor = (cursor + 7) % list.length;
  }
  return { forms: out, shots: shots };
}

// The camera list itself lives with the beats, which are concatenated after
// this file — the walk below runs at load, so it keeps its own count of them.
// beats.js asserts the two agree.
var SHOT_COUNT = 6;

// ── the form answers the words ───────────────────────────────────────────
//
// The walk below spreads sixteen forms evenly across a hundred chapters, which
// is the right answer to "no two look alike" and the wrong answer to what a
// form is for. A chapter about going quiet should be set quiet. A chapter
// about eleven hundred kilometres should have its first line at the top of the
// frame and its last at the bottom. A chapter about a voice should lead with
// one large line, because that is what a voice is.
//
// So each chapter is read first, and asks for the shape that suits it. Only
// when it asks for nothing — or asks for something the chapter before it just
// used — does it fall back to the even walk. That keeps the guarantee (no two
// in a row alike, every form used) and spends it on meaning.
var FORM_FOR_WORDS = [
  // Silence, and things not said.
  [/\bsilen|\bquiet|said nothing|not say|unsaid|without a word|stopped talking\b/i, "quiet"],
  // The distance itself: two ends and the gap between them.
  [/\bkilometre|\bmiles?\b|\bdistance|\bfar\b|\bapart\b|\baway\b|two cities|train|airport|platform/i, "apart"],
  // A voice, a call, a thing heard.
  [/\bvoice|\bcall(ed|ing)?\b|\bphone\b|\bheard\b|\blisten|\bsaid\b|\btold\b|\bspoke\b/i, "lead"],
  // Light, and the times of day that carry it.
  [/\blight\b|\bmorning|\bdawn\b|\bsun\b|\bwindow|\blamp\b|\bgold|\bglow|\bburn/i, "flare"],
  // Night, sleep, and the small hours.
  [/\bnight\b|\bsleep|\bawake\b|\bbed\b|\bdark\b|four in the morning|\btired\b|\bdream/i, "close"],
  // Counting: years, days, the hour.
  [/\byears?\b|\bdays?\b|\bhours?\b|\bcounting\b|\bSeptember\b|\banniversar/i, "wide"],
  // Her name, and the pieces of her.
  [/\bSmruti\b|your name|handwriting|your face|your hands|your laugh/i, "watermark"],
  // The two of us, paired.
  [/\bwe\b.*\bboth\b|you and me|the two of us|\bus\b.*\btogether\b|\bmarried\b|\bwedding\b/i, "twoup"],
  // A first, a turn, a thing beginning.
  [/\bfirst time\b|the first\b|\bbegan\b|\bstarted\b|\bmoment\b|\bthe day (I|you|we)\b/i, "drop"],
  // A question, or a thing being weighed.
  [/\?|\bwonder|\bwhether\b|\bif I\b|\bwhat if\b|\bmaybe\b|\bperhaps\b/i, "breath"],
  // A place with things in it.
  [/\broom\b|\btable\b|\bkitchen|\bhouse\b|\bhome\b|\bdoor\b|\bchair|\bfloor\b|\bstreet/i, "corner"],
  // A line being drawn, a thing written down.
  [/\bwrote\b|\bwriting\b|\bwritten\b|\bletter\b|\blist\b|\bpaper\b|\bink\b|\bpage\b/i, "rule"],
  // An aside, said under the breath.
  [/\bbriefly\b|\bactually\b|\bI admit|\bconfess|\bto be fair|\bsmall\b|\bnothing much/i, "subtitle"],
  // Ordinary, plural, one thing after another.
  [/\bordinary\b|\bevery day\b|\bagain\b|\bhabit|\broutine|\bTuesday|\bgroceries|\bwashing/i, "stack"],
  // Something short and shaped like a poem.
  [/\bstill\b|\balways\b|\bnever\b|\bforever\b|\bthe whole\b/i, "column"],
];
// Every shape the chapter's own words ask for, best first. A chapter is rarely
// about one thing: "the first silence" is a silence and a first, and if the
// chapter before it was already set quiet it should fall to its second reading
// rather than all the way back to the mechanical walk.
function formsWanted(chapter) {
  if (!chapter) return [];
  let words = `${chapter.title} ${chapter.lines.join(" ")}`;
  let out = [];
  for (let [pattern, form] of FORM_FOR_WORDS) if (pattern.test(words) && !out.includes(form)) out.push(form);
  return out;
}
function formWanted(chapter) {
  return formsWanted(chapter)[0] ?? null;
}

// Some forms want a particular camera. The rest take whatever comes next.
function wantsShot(form) {
  switch (form) {
    case "apart":
      return 4; // rise, so the gap between the lines opens
    case "close":
    case "flare":
      return 0; // push in
    case "subtitle":
      return 1; // pull back
    case "wide":
      return 2; // drift
    case "watermark":
      return 5; // fall away
    default:
      return null;
  }
}

var CHAPTER_WALK = buildChapterForms();
var CHAPTER_FORM_BY_N = CHAPTER_WALK.forms;
var CHAPTER_SHOT_BY_N = CHAPTER_WALK.shots;

function formFor(n) {
  return CHAPTER_FORM_BY_N[n] ?? "plain";
}
function shotFor(n) {
  return CHAPTER_SHOT_BY_N[n] ?? null;
}

function lightFor(e) {
  let t = PARTS[chapterAt(e)?.part ?? 0],
    n = t?.lights ?? [];
  return n.length === 0
    ? "window"
    : n[((Math.floor((e - (t?.from ?? 1)) / 5) % n.length) + n.length) % n.length];
}
function chapterMarks(e) {
  let t = [];
  return (
    e.forEach((e, n) => {
      if (e.type === "chapter" || e.type === "scene") {
        let r = chapterAt(e.n);
        r &&
          t.push({
            n: r.n,
            title: r.title,
            part: r.part,
            at: n,
            scene: r.scene,
          });
      }
    }),
    t
  );
}
function partMarks(e) {
  let t = [];
  return (
    e.forEach((e, n) => {
      e.type === "part" &&
        t.push({
          part: e.part,
          at: n,
        });
    }),
    t
  );
}
function lastChapterBefore(e, t) {
  for (let n = Math.min(t, e.length - 1); n >= 0; n--) {
    let t = e[n];
    if (t.type === "chapter" || t.type === "scene") return t.n;
  }
  return 0;
}
