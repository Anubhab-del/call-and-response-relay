// Which days she came by.
//
// A visit is filed under her civil date, not under UTC. At two in the morning
// in Odisha it is still the previous day in UTC, so a UTC index would file one
// long night as two days and one long day as one — and then tell her she had a
// streak she had not earned.
function dayIndex(when = new Date()) {
  return todayNumber(when);
}

function visitStreak(when = new Date()) {
  let days = [...new Set(snapshot().visits)].sort((a, b) => b - a);
  if (days.length === 0) return 0;
  let today = dayIndex(when);
  if (days[0] !== today && days[0] !== today - 1) return 0;
  let run = 1;
  for (let i = 1; i < days.length && days[i] === days[i - 1] - 1; i++) run += 1;
  return run;
}

function daysSinceLastVisit(when = new Date()) {
  let days = [...new Set(snapshot().visits)].sort((a, b) => b - a);
  let today = dayIndex(when);
  let previous = days.find((d) => d < today);
  return previous === undefined ? 0 : Math.max(0, today - previous - 1);
}

// The month she first opened the door, once there is enough behind her for
// that to mean anything.
function comingSince(when = new Date()) {
  let days = [...new Set(snapshot().visits)].sort((a, b) => a - b);
  if (days.length < 12) return null;
  let span = dayIndex(when) - days[0];
  if (span < 60) return null;
  let first = new Date(days[0] * DAY_MS);
  return MONTHS[first.getUTCMonth()];
}

// What the house says when she comes in. It notices; it does not keep score.
// No numbers here — a count turns coming home into a thing you can be behind on.
function returnLine(when = new Date()) {
  let run = visitStreak(when);
  let away = daysSinceLastVisit(when);

  if (away >= 21) return "There you are. Nothing here went anywhere.";
  if (away >= 7) return "It has been a little while. The lamp was on.";
  if (run >= 30) return "This has turned into somewhere you come.";
  if (run >= 7) return "You have been in and out of here all week.";
  if (run >= 3) return isNightHours(when) ? "Again tonight." : "Back again.";

  let since = comingSince(when);
  if (since && daySeed() > 0.72) return `You have been coming here since ${since}.`;
  return "";
}
