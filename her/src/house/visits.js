var VISIT_DAY_MS = 864e5;
function dayIndex(e = new Date()) {
  return Math.floor(e.getTime() / VISIT_DAY_MS);
}
function visitStreak(e = new Date()) {
  let t = [...new Set(snapshot().visits)].sort((e, t) => t - e);
  if (t.length === 0) return 0;
  let n = dayIndex(e);
  if (t[0] !== n && t[0] !== n - 1) return 0;
  let r = 1;
  for (let e = 1; e < t.length && t[e] === t[e - 1] - 1; e++) r += 1;
  return r;
}
function daysSinceLastVisit(e = new Date()) {
  let t = [...new Set(snapshot().visits)].sort((e, t) => t - e),
    n = dayIndex(e),
    r = t.find((e) => e < n);
  return r === void 0 ? 0 : Math.max(0, n - r - 1);
}
function returnLine(e = new Date()) {
  let t = visitStreak(e),
    n = daysSinceLastVisit(e);
  return n >= 21
    ? "There you are. Nothing here went anywhere."
    : n >= 7
      ? "It has been a little while. The lamp was on."
      : t >= 30
        ? `${t} days running. I noticed.`
        : t >= 7
          ? `${t} nights in a row.`
          : t >= 3
            ? "Third night running."
            : "";
}
