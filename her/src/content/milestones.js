var MILESTONES = [
  {
    id: "september",
    on: "2023-09-02",
    annual: true,
    label: "September the second",
    note: "The night neither of us was being careful.",
    takeover: true,
  },
  {
    id: "may-third",
    on: "2026-05-03",
    annual: true,
    label: "The third of May",
    note: "Two hours. The only two so far.",
    takeover: true,
  },
  {
    id: "birthday",
    on: "2000-06-13",
    annual: true,
    label: "Your birthday",
    note: "A letter opens by itself today.",
    takeover: true,
  },
  {
    id: "wedding",
    on: "2027-12-01",
    label: "The wedding",
    note: "Paperwork on something already true.",
    takeover: true,
  },
  {
    id: "classroom",
    on: "2028-06-01",
    label: "Your first class",
    note: "I will be in the next room.",
  },
];
var ANNIVERSARIES = [
  {
    years: 1,
    label: "One year",
    line: "A year of only your voice.",
  },
  {
    years: 2,
    label: "Two years",
    line: "Two. Nothing dramatic happened. That was the achievement.",
  },
  {
    at: 1e3,
    label: "A thousand days",
    line: "A thousand days went past and neither of us made a fuss.",
  },
  {
    years: 3,
    label: "Three years",
    line: "Three Septembers. Three of them.",
  },
  {
    years: 4,
    label: "Four years",
    line: "Four. Still here. Still counting.",
  },
  {
    years: 5,
    label: "Five years",
    line: "Five years. Somebody should have written this down sooner.",
  },
  {
    at: 2e3,
    label: "Two thousand days",
    line: "Two thousand. I have stopped being surprised and started being grateful.",
  },
  {
    years: 7,
    label: "Seven years",
    line: "Seven. Long enough that people stop asking how we managed it.",
  },
  {
    years: 10,
    label: "Ten years",
    line: "Ten years. One paragraph, badly told, at a dinner party.",
  },
  {
    at: 5e3,
    label: "Five thousand days",
    line: "Five thousand. I would sign for five thousand more without reading it.",
  },
]
  .map((e) => ({
    at: e.years ? daysToAnniversary(e.years) : (e.at ?? 0),
    label: e.label,
    line: e.line,
  }))
  .sort((e, t) => e.at - t.at);
