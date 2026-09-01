// ── The third September ───────────────────────────────────────────────────
//
// The second of September was a day with one event in it. Twenty-one hours of
// waiting, then eleven minutes at nine, then nothing. The fullest day of the
// year was the emptiest one, right up until the end of it.
//
// So the day counts with her instead. One door an hour, from the turn of
// midnight, each written for that hour and no other — because four in the
// morning is not a generic hour, it is the hour it happened.
//
// Nothing here is a countdown and nothing here is missable. A door that has
// opened stays open; a door she was asleep for is waiting when she wakes. The
// day is not a thing she can fall behind on.
//
// It ends where it was always going: at nine, the dial's hand reaches the top
// and the house takes the screen.

var THE_DAY_ROOM = {
  name: "The third September",
  sub: "The day, hour by hour",
  lede:
    "Today only. One opens every hour, from midnight to midnight, and none of them close again. Turn the dial with your thumb, or just read the one that is lit.",
  ahead: "Not yet.",
  aheadAt: (label) => `This one opens at ${label}.`,
  present: "You were here for this one.",
  // What the middle of the ring says above the hour she has turned to.
  now: "Now",
  earlier: "Earlier today",
  later: "Later today",
};

// Each hour of the day, in his voice, about that hour.
// `kicker` is the hour as it would be said aloud. `line` is the display line.
// `under` is the quiet second thought, when there is one.
var THE_DAY = [
  {
    kicker: "Midnight",
    line: "It is the second of September.",
    under:
      "It has been for about a minute. I have never yet slept through the turn of it and I do not intend to start tonight.",
  },
  {
    kicker: "One in the morning",
    line: "Three years ago at this hour we were four hours in and had not said anything that mattered.",
    under: "We were about to.",
  },
  {
    kicker: "Two",
    line: "This is the hour you go quiet in.",
    under:
      "It took me most of the first year to learn that the quiet does not mean you have gone. It means you are still there, deciding whether to say the thing.",
  },
  {
    kicker: "Three",
    line: "Somewhere in this hour, three years ago, I stopped pretending I was going to sleep.",
  },
  {
    kicker: "Four in the morning",
    line: "This is the hour.",
    under:
      "At four in the morning, on the night of the second of September 2023, I gave up being sensible about you. I did not tell you for months. You knew anyway, and you let me get there on my own, which is the kindest thing anybody has done for me.",
  },
  {
    kicker: "Five",
    line: "The sky over Bengaluru starts thinking about it around now.",
    under: "I remember noticing, three years ago, and being annoyed that the night was ending.",
  },
  {
    kicker: "Six",
    line: "First light, in both cities, about half an hour apart.",
    under: "Which is the closest we have ever got to the same morning.",
  },
  {
    kicker: "Seven",
    line: "You will have your phone in your hand before your feet are on the floor.",
    under: "You have done this every morning I have known you. I have never once minded.",
  },
  {
    kicker: "Eight",
    line: "The ordinary morning of it. Tea, and somewhere to be, and the fact that it is today.",
  },
  {
    kicker: "Nine in the morning",
    line: "Twelve hours.",
    under: "Nothing has to happen between now and then. It happens anyway.",
  },
  {
    kicker: "Ten",
    line: "Three years ago today I could not concentrate on anything and told everyone I was tired.",
  },
  {
    kicker: "Eleven",
    line: "I want to be clear that I have not got used to this.",
    under: "Three years, and I still check what time it is where you are before I check what time it is here.",
  },
  {
    kicker: "Noon",
    line: "Halfway. The exact middle of the third September.",
    under: "Whatever sort of day you are having — it is this one. There is not another.",
  },
  {
    kicker: "One",
    line: "Somewhere around now, three years ago, one of us said a thing the other did not have to answer.",
    under: "And answered it anyway. That is the whole mechanism. It has not changed since.",
  },
  {
    kicker: "Two",
    line: "The dull part of the afternoon.",
    under: "I like that we have a dull part. It took a year to earn one and I would not give it back.",
  },
  {
    kicker: "Three",
    line: "The hour that always feels longest. Six to go.",
  },
  {
    kicker: "Four in the afternoon",
    line: "Twelve hours since the hour that did it. Five until the hour that is ours.",
  },
  {
    kicker: "Five",
    line: "Go and collect whatever you need.",
    under: "Water. A blanket. The good pillow. Nothing after nine o'clock should require you to stand up.",
  },
  {
    kicker: "Six",
    line: "The light goes gold in both cities around now.",
    under: "I am always faintly surprised that it does it for us as well as for everybody else.",
  },
  {
    kicker: "Seven",
    line: "Two hours.",
    under: "Tell whoever needs telling that you are busy at nine.",
  },
  {
    kicker: "Eight",
    line: "One hour.",
    under: "Put it on charge. Put the lights off. Sit somewhere you would not mind staying a while.",
  },
  {
    kicker: "Nine",
    line: "It is now.",
    under: "Wherever you are sitting, I am looking at this too.",
  },
  {
    kicker: "Ten",
    line: "Well.",
    under: "That was the third September. I have nothing left to be clever with.",
  },
  {
    kicker: "Eleven",
    line: "The last hour of it.",
    under:
      "In an hour it is the third of September, which is the day I actually gave in. So by my reckoning you have another twenty-four hours of me being like this, and then I will stop. Probably.",
  },
];

// How the hour is said when the house has to name a door that has not opened.
var THE_DAY_LABELS = [
  "midnight",
  "one in the morning",
  "two in the morning",
  "three in the morning",
  "four in the morning",
  "five in the morning",
  "six",
  "seven",
  "eight",
  "nine in the morning",
  "ten",
  "eleven",
  "noon",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten at night",
  "eleven at night",
];
