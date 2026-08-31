var ROOMS = [
  {
    id: "letters",
    name: "Letters",
    sub: "Some of them are sealed until a day arrives",
  },
  {
    id: "say",
    name: "Say something",
    sub: "A page that belongs to you alone",
  },
  {
    id: "everything",
    name: "Everything",
    sub: "One small true thing, every day",
  },
  {
    id: "promises",
    name: "Promises",
    sub: "Twelve things I am on the hook for",
  },
  {
    id: "days",
    name: "Your days",
    sub: "Every date that is ours",
  },
  {
    id: "distance",
    name: "The distance",
    sub: "It was only ever a number",
  },
  {
    id: "reel",
    name: "The picture",
    sub: "Watch it again, or just one part of it",
  },
  {
    id: "settings",
    name: "The fuse box",
    sub: "Sound, motion, keeping a copy",
  },
];
function Landing({ onGo: onGo, onOpenLetter: onOpenLetter }) {
  useMinuteTick();
  let t = useStore(),
    n = daysTogether(),
    r = shardForDay(),
    i = daysToNextSeptember(),
    a = isSeptemberSecond(),
    o = MILESTONES.find((e) => e.takeover && isOnDate(e.on, !!e.annual)),
    s = ANNIVERSARIES.find((e) => e.at === n),
    c = t.inbox.length,
    // At two in the morning there is a letter for exactly this, and it should
    // not be four taps away. Only in the small hours, and not again for a few
    // hours after she has read it.
    sleepless =
      isSmallHours() &&
      Date.now() - (t.opened["cannot-sleep"] ?? 0) > 6 * 60 * 60 * 1000;
  return (0, jsx.jsxs)("div", {
    className: "landing",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "greeting",
        ...fadeIn(0.05, 0.7),
        children: greetingFor(),
      }),
      returnLine()
        ? (0, jsx.jsx)(motion.p, {
            className: "streak",
            ...fadeIn(0.25, 0.7),
            children: returnLine(),
          })
        : null,
      sleepless
        ? (0, jsx.jsx)(motion.button, {
            type: "button",
            className: "small-hours",
            onClick: () => onOpenLetter("cannot-sleep"),
            ...fadeIn(0.35, 0.9),
            children: "There is a letter for this hour.",
          })
        : null,
      (0, jsx.jsxs)(motion.div, {
        className: "day-count",
        ...riseIn(0.2),
        children: [
          (0, jsx.jsx)(DayRing, {
            fill: yearProgress(),
          }),
          (0, jsx.jsxs)("div", {
            className: "day-count-text",
            children: [
              (0, jsx.jsx)("span", {
                className: "day-number",
                children: formatNumber(n),
              }),
              (0, jsx.jsx)("span", {
                className: "day-label",
                children: "days",
              }),
            ],
          }),
        ],
      }),
      o
        ? (0, jsx.jsxs)(motion.div, {
            className: "takeover",
            ...riseIn(0.4),
            children: [
              (0, jsx.jsx)("p", {
                className: "takeover-label",
                children: o.label,
              }),
              (0, jsx.jsx)("p", {
                className: "takeover-note",
                children: o.note,
              }),
            ],
          })
        : (0, jsx.jsx)(motion.p, {
            className: "until",
            ...fadeIn(0.45, 0.7),
            children: i === 0 ? "Today." : `${i} ${i === 1 ? "day" : "days"} to the next September`,
          }),
      s
        ? (0, jsx.jsxs)(motion.div, {
            className: "milestone",
            ...riseIn(0.55),
            children: [
              (0, jsx.jsx)("p", {
                className: "milestone-label",
                children: s.label,
              }),
              (0, jsx.jsx)("p", {
                className: "milestone-line",
                children: s.line,
              }),
            ],
          })
        : null,
      (0, jsx.jsxs)(motion.blockquote, {
        className: "tonight",
        ...riseIn(0.65),
        children: [
          (0, jsx.jsx)("p", {
            children: r.text,
          }),
          (0, jsx.jsxs)("cite", {
            children: [
              a ? "September the second" : `Year ${septemberOrdinal()}`,
              " · for ",
              CANON.name,
            ],
          }),
        ],
      }),
      (0, jsx.jsx)(motion.nav, {
        className: "rooms",
        ...fadeIn(0.9, 0.8),
        "aria-label": "Rooms",
        children: ROOMS.map((t, n) =>
          (0, jsx.jsxs)(
            motion.button,
            {
              type: "button",
              className: "room-card",
              onClick: () => onGo(t.id),
              initial: {
                opacity: 0,
                y: 12,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              transition: {
                duration: 0.5,
                delay: 0.95 + n * 0.06,
                ease: [0.16, 1, 0.3, 1],
              },
              children: [
                (0, jsx.jsx)("span", {
                  className: "room-name",
                  children: t.name,
                }),
                (0, jsx.jsx)("span", {
                  className: "room-sub",
                  children: t.sub,
                }),
                t.id === "inbox" && c > 0
                  ? (0, jsx.jsx)("span", {
                      className: "room-badge",
                      children: c,
                    })
                  : null,
              ],
            },
            t.id,
          ),
        ),
      }),
    ],
  });
}
