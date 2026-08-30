var CANON = {
  name: "Smruti",
  you: "Anubhab",
  unlockWord: "september",
  lockKicker: "Come in",
  lockHint: "the word",
  welcome: "You found it.",
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
    "Headphones, if you have them.",
    "The lights off, if you can.",
    "It is about a quarter of an hour.",
  ],
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
  "That is all right. Try again.",
  "No. Take your time.",
  "Still no. I am not going anywhere.",
];
var LOCK_HINTS = [
  "It is a month.",
  "It is the month I stopped being careful.",
  "It is the month on the title card. Type it in small letters.",
];
