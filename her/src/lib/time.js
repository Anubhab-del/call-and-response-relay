var DAY_MS = 864e5;
function parseCivil(e) {
  let t = e.split("-").map((e) => Number.parseInt(e, 10));
  return t.length === 2
    ? {
        y: 0,
        m: t[0],
        d: t[1],
      }
    : {
        y: t[0],
        m: t[1],
        d: t[2],
      };
}
function dayNumber({ y: y, m: m, d: d }) {
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}
function civilToday(e = new Date()) {
  return {
    y: e.getFullYear(),
    m: e.getMonth() + 1,
    d: e.getDate(),
  };
}
function todayNumber(e = new Date()) {
  return dayNumber(civilToday(e));
}
function daysBetween(e, t) {
  return dayNumber(t) - dayNumber(e);
}
var START = parseCivil(DATES.start);
parseCivil(DATES.met);
function daysTogether(e = new Date()) {
  return Math.max(0, daysBetween(START, civilToday(e)));
}
function yearsTogether(e = new Date()) {
  let t = daysTogether(e),
    n = 0;
  for (; n < 200 && daysToAnniversary(n + 1) <= t; ) n += 1;
  return n;
}
function septemberOrdinal(e = new Date()) {
  return yearsTogether(e) + 1;
}
function nextSeptember(e = new Date()) {
  let t = civilToday(e),
    n = {
      y: t.y,
      m: START.m,
      d: START.d,
    };
  return dayNumber(n) >= dayNumber(t)
    ? n
    : {
        y: t.y + 1,
        m: START.m,
        d: START.d,
      };
}
function daysToNextSeptember(e = new Date()) {
  return daysBetween(civilToday(e), nextSeptember(e));
}
function isSeptemberSecond(e = new Date()) {
  let t = civilToday(e);
  return t.m === START.m && t.d === START.d;
}
function nextOccurrence(e, t, n = new Date()) {
  let r = parseCivil(e);
  if (!t) return r;
  let i = civilToday(n),
    a = {
      y: i.y,
      m: r.m,
      d: r.d,
    };
  if (
    (r.m === 2 && r.d === 29 && !isLeapYear(i.y) && ((a.m = 3), (a.d = 1)),
    dayNumber(a) >= dayNumber(i))
  )
    return a;
  let o = {
    y: i.y + 1,
    m: r.m,
    d: r.d,
  };
  return (r.m === 2 && r.d === 29 && !isLeapYear(i.y + 1) && ((o.m = 3), (o.d = 1)), o);
}
function isLeapYear(e) {
  return (e % 4 == 0 && e % 100 != 0) || e % 400 == 0;
}
function isOnDate(e, t, n = new Date()) {
  let r = parseCivil(e),
    i = civilToday(n);
  return t ? r.m === i.m && r.d === i.d : r.y === i.y && r.m === i.m && r.d === i.d;
}
function isUnsealed(e, t = new Date()) {
  if (!e) return true;
  let n = parseCivil(e);
  return n.y === 0 ? isOnDate(e, true, t) : todayNumber(t) >= dayNumber(n);
}
function daysUntil(e, t = new Date()) {
  if (!e) return 0;
  let n = parseCivil(e);
  return n.y === 0
    ? daysBetween(civilToday(t), nextOccurrence(e, true, t))
    : Math.max(0, dayNumber(n) - todayNumber(t));
}
var MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function formatCivil(e) {
  let { y: t, m: n, d: r } = parseCivil(e),
    i = MONTHS[n - 1] ?? "";
  return t ? `${i} ${r}, ${t}` : `${i} ${r}`;
}
function formatParts({ y: y, m: m, d: d }) {
  return `${MONTHS[m - 1]} ${d}${y ? `, ${y}` : ""}`;
}
function formatNumber(e) {
  return e.toLocaleString("en-IN");
}
function timeLeftToday(e = new Date()) {
  let t = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1).getTime() - e.getTime();
  return {
    hours: Math.floor(t / 36e5),
    minutes: Math.floor((t % 36e5) / 6e4),
  };
}
function hourBand(e = new Date()) {
  let t = e.getHours();
  return t < 4
    ? "latenight"
    : t < 7
      ? "early"
      : t < 12
        ? "morning"
        : t < 17
          ? "afternoon"
          : t < 22
            ? "evening"
            : "night";
}
function isNightHours(e = new Date()) {
  let t = e.getHours();
  return t >= 22 || t < 6;
}
var START_LABEL = formatCivil(DATES.start);
var MET_LABEL = formatCivil(DATES.met);
function yearProgress(e = new Date()) {
  if (isSeptemberSecond(e)) return 1;
  let t = daysTogether(e),
    n = yearsTogether(e),
    r = daysToAnniversary(n),
    i = daysToAnniversary(n + 1);
  return i <= r ? 1 : Math.max(0, Math.min(1, (t - r) / (i - r)));
}
function daysToAnniversary(e) {
  return daysBetween(START, {
    y: START.y + e,
    m: START.m,
    d: START.d,
  });
}

// How far off a sealed day is, in words rather than in a number.
// A letter that will not open for seven years should not wear a counter.
function nearness(days) {
  if (days <= 0) return "";
  if (days === 1) return "tomorrow";
  if (days <= 6) return "this week";
  return "";
}

// Not "late". The hours where being awake is not a choice she made.
function isSmallHours(when = new Date()) {
  let h = when.getHours();
  return h >= 0 && h < 5;
}

// One way to write a date in this house: the same as the vows and the seals.
function formatStamp(at) {
  let d = new Date(at);
  return formatParts({ y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });
}

// ── the same hour ─────────────────────────────────────────────────────────
//
// Nine o'clock on the second of September, worked out from the clock alone.
// No server, no signal, no handshake: two phones in two cities agree because
// they both know what time it is, which is the only thing about this that
// distance was never able to reach.

function sameHourStart(when = new Date()) {
  return new Date(
    when.getFullYear(),
    when.getMonth(),
    when.getDate(),
    SAME_HOUR.hour,
    SAME_HOUR.minute,
    0,
    0,
  ).getTime();
}

function sameHourRunMs() {
  let last = SAME_HOUR_BEATS[SAME_HOUR_BEATS.length - 1];
  return (last.at + 30) * 1000;
}

// phase:
//   null       not the second of September
//   "coming"   it is the day, but not yet near
//   "approach" the last quarter of an hour before nine
//   "live"     it is running, and it is running on his phone too
//   "late"     she missed the start but the night is not over
//   "over"     the night is done
// The night before. She cannot be sent a notification — nothing here can
// reach her — so the only way she learns to be somewhere at nine tomorrow is
// if the house tells her today.
function isSameHourEve(when = new Date()) {
  let tomorrow = new Date(when.getFullYear(), when.getMonth(), when.getDate() + 1);
  return isSeptemberSecond(tomorrow);
}

function sameHourAt(when = new Date()) {
  if (!isSeptemberSecond(when)) return null;
  let start = sameHourStart(when);
  let now = when.getTime();
  let toStart = start - now;
  if (toStart > SAME_HOUR.approachMinutes * 60000)
    return { phase: "coming", start: start, toStart: toStart };
  if (toStart > 0) return { phase: "approach", start: start, toStart: toStart };
  let elapsed = now - start;
  if (elapsed <= sameHourRunMs())
    return { phase: "live", start: start, elapsed: elapsed, together: true };
  if (elapsed <= SAME_HOUR.windowMinutes * 60000)
    return { phase: "late", start: start, elapsed: elapsed, together: false };
  return { phase: "over", start: start };
}

// Which beat is on screen at a given moment, and how far into it she is.
function sameHourBeatAt(elapsedMs) {
  let seconds = elapsedMs / 1000;
  let index = -1;
  for (let i = 0; i < SAME_HOUR_BEATS.length; i++) {
    if (SAME_HOUR_BEATS[i].at <= seconds) index = i;
    else break;
  }
  if (index < 0) return { index: -1, beat: null, into: 0 };
  return { index: index, beat: SAME_HOUR_BEATS[index], into: seconds - SAME_HOUR_BEATS[index].at };
}

// Written as a word, because "the 3rd September" is not how anyone says it.
var ORDINAL_WORDS = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
];

function ordinalWord(n) {
  if (ORDINAL_WORDS[n]) return ORDINAL_WORDS[n];
  // Past the twelfth the words get clumsy, so it goes back to figures — but
  // properly. The fallback used to read "21th September", which is the sort of
  // thing that only ever shows up years after anybody is watching.
  let tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
// Small counts belong in words. "There are 24. 5 of them are sealed" reads as
// twenty-four point five before it reads as two sentences, and a shelf of
// letters is not a place for digits anyway.
var CARDINAL_WORDS = [
  "none", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one",
  "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six",
  "twenty-seven", "twenty-eight", "twenty-nine", "thirty",
];
function numberWord(n) {
  return CARDINAL_WORDS[n] ?? formatNumber(n);
}
// A count that starts a sentence has to look like it starts a sentence.
function upperFirst(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

// ── the third September, hour by hour ────────────────────────────────────
//
// One door an hour, and the day's own light. All of it worked out from the
// clock, like everything else here: no server knows it is her anniversary.

// Which hour of the day it is, but only on the day. Null every other day of
// the year, which is what keeps this out of the other three hundred and
// sixty-four.
function theDayHour(when = new Date()) {
  return isSeptemberSecond(when) ? when.getHours() : null;
}

// A door is open once its hour has begun, and never closes again that day.
function theDayOpen(hour, when = new Date()) {
  let now = theDayHour(when);
  return now != null && hour <= now;
}

// How far through the day it is, for the hand on the dial.
function theDayProgress(when = new Date()) {
  return (when.getHours() * 3600 + when.getMinutes() * 60 + when.getSeconds()) / 86400;
}

// The light of the hour. The house only runs the sun on the second — every
// other day it keeps its own weather, because a room that changes colour all
// day is a novelty and a room that does it once a year is a memory.
function dayLight(when = new Date()) {
  if (!isSeptemberSecond(when)) return null;
  let h = when.getHours();
  if (h < 4) return "deepnight";
  if (h < 6) return "smallhours";
  if (h < 8) return "dawn";
  if (h < 11) return "morning";
  if (h < 15) return "noon";
  if (h < 17) return "afternoon";
  if (h < 19) return "gold";
  if (h < 21) return "dusk";
  return "night";
}
