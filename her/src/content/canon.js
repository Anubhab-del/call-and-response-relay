var CANON = {
  name: "Smruti",
  you: "Anubhab",
  unlockWord: "september",
  lockKicker: "Come in",
  lockHint: "the word",
  welcome: "There you are.",
  title: "HER",
  kilometres: 1287,
  hisCity: "Bengaluru",
  herCity: "Odisha",
};
var DATES = {
  start: "2023-09-02",
  met: "2026-05-03",
  herBirthday: "2000-06-13",
  wedding: "2027-12-01",
};
var INVITATION_COPY = {
  kicker: "Before you start",
  lines: [
    "Headphones, if you have them. I made it quiet on purpose.",
    "The lights off, if you can. It looks better in the dark, and so do most true things.",
  ],
  // The third line has a number in it that has to still be true in ten years,
  // so it is worked out when she reads it rather than written down here.
  time: (years) =>
    `Thirty-six minutes, read at the speed I wrote it. I have had ${years <= 1 ? "a year" : `${numberWord(years)} years`}. You can give me half an hour and a bit.`,
  button: "I am ready",
};
// What the house says first. One per hour band, picked by the day so the same
// day always says the same thing and a week does not say it twice.
var GREETINGS = {
  latenight: [
    "You are up late.",
    "Still awake.",
    "It is very late where you are.",
    "It is tomorrow already.",
    "Nothing gets decided well at this hour.",
  ],
  early: [
    "You are up early.",
    "Morning, before it is morning.",
    "Before the house is up.",
    "You are ahead of the day.",
  ],
  morning: ["Good morning.", "There you are.", "Morning.", "You are up, then.", "First thing."],
  afternoon: [
    "Afternoon.",
    "The middle of your day.",
    "Hello.",
    "The long stretch.",
    "Somewhere in the middle of it.",
  ],
  evening: [
    "Good evening.",
    "You made it through.",
    "Evening.",
    "That is the day done.",
    "You are home, I hope.",
  ],
  night: [
    "Goodnight, nearly.",
    "The lamp is on.",
    "Come sit.",
    "Put it down soon.",
    "Nearly the end of it.",
  ],
};

// After the third September the house stops saying hello and says the thing
// that happened instead. It is the only greeting it ever earned.
var EARNED_GREETING = "We were both here at nine.";

// On the days the house already knows about, it does not open with the weather.
// Keyed by milestone id; `any` is used when the hour has nothing of its own.
var DAY_GREETINGS = {
  september: {
    latenight: ["This is roughly the hour it started."],
    any: ["The second of September.", "It came round again."],
  },
  "may-third": {
    any: ["The third of May.", "It is the third."],
  },
  birthday: {
    early: ["Happy birthday. You are up early."],
    latenight: ["Happy birthday. Go to sleep."],
    any: ["Happy birthday."],
  },
  wedding: {
    any: ["Today, then.", "It is today."],
  },
};
var LOCK_MISSES = [
  "That is all right. Try it again, love.",
  "No. Take as long as you like. I have nowhere else to be.",
  "Still no. I am not going anywhere, and neither is the door.",
];
var LOCK_HINTS = [
  "It is a month.",
  "It is the month I stopped being careful with you.",
  "It is the month on the title card. All in small letters.",
];
