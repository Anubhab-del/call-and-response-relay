// ── The Same Hour ─────────────────────────────────────────────────────────
//
// Every second of September, at nine at night — the hour they chose in the
// first week and never moved — this runs.
//
// It is driven by the clock, not by her thumb. Every line has a time in
// seconds from 21:00:00, so two copies of this file, in two cities, with the
// wifi off and no server between them, show the same word at the same second.
// That is the whole idea: the one thing a thousand kilometres cannot take is
// the fact that it is nine o'clock for both of them.
//
// It cannot be skipped and it cannot be replayed. When it is over it seals
// until the next second of September.

var SAME_HOUR = {
  hour: 21,
  minute: 0,
  // How long before nine the house starts to know.
  approachMinutes: 15,
  // She can still be let in late, but not indefinitely. After this the night
  // is over and it seals.
  windowMinutes: 150,
};

var SAME_HOUR_EVE = {
  kicker: "Tomorrow",
  line: "Nine o'clock tomorrow night. Be somewhere you can sit down.",
  under: "It starts on your phone and on mine at the same second, and it does not wait.",
};

var SAME_HOUR_COMING = {
  kicker: "Tonight",
  line: "Nine o'clock. Come back then — I will be reading it with you.",
};

var SAME_HOUR_APPROACH = {
  kicker: "Nearly",
  line: "Sit down. Put it somewhere you can see it.",
  under: "At nine this starts on your phone and on mine at the same second.",
};

var SAME_HOUR_LATE = {
  kicker: "You are a little late",
  line: "That is all right. I have started without you and I will start again.",
  under: "It will not be the same second this time. It will still be the same night.",
  button: "Begin",
};

// Seconds from 21:00:00. Nothing here is timed to a tap.
var SAME_HOUR_BEATS = [
  { at: 0, kind: "open", text: "It is nine o'clock." },
  { at: 13, kind: "line", text: "The second of September." },
  {
    at: 27,
    kind: "hold",
    text: "Wherever you are sitting right now, I am looking at this too.",
  },
  {
    at: 48,
    kind: "line",
    text: "Not a call. Not a message. No signal between us at all.",
  },
  {
    at: 68,
    kind: "line",
    text: "The same words, at the same second, in two cities, on two phones that have never met.",
  },
  {
    at: 95,
    kind: "quiet",
    text: "",
  },
  {
    at: 108,
    kind: "line",
    text: "We chose this hour in the first week, without discussing it much, and then never moved it once.",
  },
  {
    at: 134,
    kind: "line",
    text: "Three years ago tonight neither of us was being careful.",
  },
  {
    at: 154,
    kind: "line",
    text: "You were a voice. I was a man being extremely sensible about a voice.",
  },
  { at: 176, kind: "line", text: "By four in the morning I had given that up entirely." },
  { at: 198, kind: "count" },
  { at: 226, kind: "line", text: "Nine at night, that many times." },
  {
    at: 244,
    kind: "line",
    text: "Some of them were bad. A few of them I would not want back. Not one of them would I give up.",
  },
  { at: 272, kind: "quiet", text: "" },
  {
    at: 284,
    kind: "line",
    text: "The first September we did not make a fuss. I counted privately and told you nothing.",
  },
  { at: 308, kind: "hold", text: "I am telling you now. I have counted every single one." },
  {
    at: 332,
    kind: "line",
    text: "There is a December coming when there will be no distance to cross at nine o'clock.",
  },
  {
    at: 356,
    kind: "line",
    text: "Just a room, and you in it, and me being unbearable about the heating.",
  },
  { at: 380, kind: "quiet", text: "" },
  {
    at: 392,
    kind: "hold",
    text: "But tonight there is this. One minute that is the same minute. It is the one thing the distance was never able to take.",
  },
  { at: 424, kind: "name" },
  { at: 452, kind: "ask" },
];

var SAME_HOUR_NAME = {
  line: "Happy third September, Smruti.",
  under: "I love you. I have, from about four in the morning on the second night.",
};

var SAME_HOUR_ASK = {
  kicker: "One question, once a year",
  question: "What was this year, in your words?",
  hint: "One line or a page. Whatever it was.",
  placeholder: "This year was…",
  keep: "Keep it",
  kept: "Kept.",
  after:
    "It stays on your phone. Every September this house will show you all of the years at once.",
  skip: "Not tonight",
};

var SAME_HOUR_DONE = {
  line: "That is the hour.",
  under: "It seals now, until the second of September next year. Goodnight, love.",
  button: "Stay in the house",
};

var SAME_HOUR_LEDGER = {
  title: "The Septembers",
  empty: "The first one. There will be more of these.",
};
