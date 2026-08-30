var PROMPTS = [
  "What did you eat today. The real answer.",
  "What was the best four minutes of today.",
  "What annoyed you. Be specific. Names.",
  "What did you almost tell me and then decide was not worth it.",
  "What are you looking forward to that you have not mentioned.",
  "What do you want that you have not let yourself want out loud.",
  "What would you do with a free week and no obligations.",
  "What is one thing you would change about how we do this.",
  "What did you think of me, honestly, in the first month.",
  "What are you afraid I will get tired of.",
  "What do you need more of that you have not asked for.",
  "Tell me about today, including the boring middle part.",
  "What do you want the house to be like.",
  "Say the unfair version, where you are completely right.",
  "What is something you are proud of that nobody noticed.",
];
// Some questions only make sense at a particular hour. These are added to the
// list above when the clock is right, so what the house asks at two in the
// morning is not what it asks over lunch.
var PROMPTS_BY_HOUR = {
  latenight: [
    "What is keeping you up. The real one.",
    "What will be smaller in the morning than it is now.",
  ],
  early: ["What has you up this early.", "What is the first thing you have to do."],
  morning: [
    "What is the one thing today you are not looking forward to.",
    "What would make today a good one. Small counts.",
  ],
  afternoon: ["What has today been so far.", "What is left to get through."],
  evening: ["What is the one thing from today worth keeping.", "What did you not get to. It is fine."],
  night: ["What was today, in a sentence.", "What do you want done by this time tomorrow."],
};

var ONE_WORD_PROMPT = "One word for today. That is a complete answer.";

// Give her a different question from the one already on the page. The hour's
// own questions are in the pool, so the list is live rather than a worksheet.
function nextPrompt(current, when = new Date()) {
  let pool = [...PROMPTS, ...(PROMPTS_BY_HOUR[hourBand(when)] ?? [])];
  let choices = pool.filter((q) => q !== current);
  if (choices.length === 0) choices = pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
