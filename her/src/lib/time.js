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
