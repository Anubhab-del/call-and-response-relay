function PromisesRoom() {
  let e = useStore(),
    [t, n] = (0, React.useState)(null);
  return (0, jsx.jsxs)("div", {
    className: "promises",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children:
          "Not wishes. Things I am on the hook for. You decide when one has been kept — I do not get to mark my own homework.",
      }),

      (0, jsx.jsx)("ul", {
        className: "vow-list",
        children: PROMISES.map((r, i) => {
          let a = e.kept[r.id],
            o = t === r.id;
          return (0, jsx.jsxs)(
            motion.li,
            {
              initial: {
                opacity: 0,
                y: 10,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              transition: {
                duration: 0.45,
                delay: Math.min(0.4, i * 0.04),
                ease: [0.16, 1, 0.3, 1],
              },
              "data-kept": a ? "true" : void 0,
              children: [
                (0, jsx.jsxs)("button", {
                  type: "button",
                  className: "vow-head",
                  onClick: () => {
                    (tapTick(), n(o ? null : r.id));
                  },
                  "aria-expanded": o,
                  children: [
                    (0, jsx.jsx)("span", {
                      className: "vow-text",
                      children: r.text,
                    }),
                    (0, jsx.jsxs)("span", {
                      className: "vow-date",
                      children: ["made ", formatCivil(r.made)],
                    }),
                  ],
                }),
                o
                  ? (0, jsx.jsxs)(motion.div, {
                      className: "vow-body",
                      initial: {
                        opacity: 0,
                        height: 0,
                      },
                      animate: {
                        opacity: 1,
                        height: "auto",
                      },
                      transition: {
                        duration: 0.3,
                      },
                      children: [
                        r.detail
                          ? (0, jsx.jsx)("p", {
                              children: r.detail,
                            })
                          : null,
                        (0, jsx.jsx)("button", {
                          type: "button",
                          className: a ? "ghost" : "solid",
                          onClick: () => {
                            (tapOnce(),
                              update((e) => {
                                e.kept[r.id] ? delete e.kept[r.id] : (e.kept[r.id] = Date.now());
                              }));
                          },
                          children: a ? "not yet, actually" : "he kept this",
                        }),
                        a
                          ? (0, jsx.jsxs)("p", {
                              className: "vow-kept",
                              children: ["you said so on ", formatStamp(a)],
                            })
                          : null,
                      ],
                    })
                  : null,
              ],
            },
            r.id,
          );
        }),
      }),
    ],
  });
}
function DaysRoom() {
  useMinuteTick();
  let e = daysTogether(),
    t = timeLeftToday(),
    n = MILESTONES.map((e) => {
      let t = nextOccurrence(e.on, !!e.annual),
        n = daysBetween(civilToday(), t);
      return {
        ...e,
        on: t,
        away: n,
        isNow: isOnDate(e.on, !!e.annual),
      };
    }).sort((e, t) => e.away - t.away),
    r = ANNIVERSARIES.find((t) => t.at > e),
    i = ANNIVERSARIES.filter((t) => t.at <= e);
  return (0, jsx.jsxs)("div", {
    className: "her-days",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children: "The days that are ours. The house knows which one today is.",
      }),
      (0, jsx.jsx)("ul", {
        className: "day-list",
        children: n.map((e, n) =>
          (0, jsx.jsxs)(
            motion.li,
            {
              "data-now": e.isNow ? "true" : void 0,
              initial: {
                opacity: 0,
                y: 10,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              transition: {
                duration: 0.45,
                delay: Math.min(0.4, n * 0.06),
                ease: [0.16, 1, 0.3, 1],
              },
              children: [
                (0, jsx.jsxs)("div", {
                  className: "day-head",
                  children: [
                    (0, jsx.jsx)("span", {
                      className: "day-name",
                      children: e.label,
                    }),
                    (0, jsx.jsx)("span", {
                      className: "day-when",
                      children: e.isNow
                        ? `today · ${t.hours}h ${t.minutes}m left of it`
                        : e.away < 0
                          ? `${formatNumber(-e.away)} days ago`
                          : `in ${formatNumber(e.away)} ${e.away === 1 ? "day" : "days"}`,
                    }),
                  ],
                }),
                (0, jsx.jsx)("p", {
                  className: "day-note",
                  children: e.note,
                }),
                (0, jsx.jsx)("p", {
                  className: "day-date",
                  children: formatParts(e.on),
                }),
              ],
            },
            e.id,
          ),
        ),
      }),
      (0, jsx.jsxs)(motion.div, {
        className: "milestones",
        ...fadeIn(0.5, 0.7),
        children: [
          (0, jsx.jsx)("p", {
            className: "milestones-title",
            children: "Counting",
          }),
          (0, jsx.jsxs)("p", {
            className: "milestones-now",
            children: [formatNumber(e), " days, as of tonight"],
          }),
          r
            ? (0, jsx.jsxs)("p", {
                className: "milestones-next",
                children: [r.label, " in ", formatNumber(r.at - e), " days"],
              })
            : null,
          (0, jsx.jsx)("ul", {
            children: i.map((e) =>
              (0, jsx.jsxs)(
                "li",
                {
                  children: [
                    (0, jsx.jsx)("span", {
                      children: e.label,
                    }),
                    (0, jsx.jsx)("em", {
                      children: e.line,
                    }),
                  ],
                },
                e.at,
              ),
            ),
          }),
        ],
      }),
    ],
  });
}
function DistanceRoom() {
  let e = CANON.kilometres,
    t = daysTogether(),
    n = Math.round(e / 30),
    r = Math.round((e / 55) * 10) / 10,
    i = Math.round((e / Math.max(1, t)) * 10) / 10;
  return (0, jsx.jsxs)("div", {
    className: "distance-room",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children: "Everyone told us the arithmetic. We were not confused about the arithmetic.",
      }),
      (0, jsx.jsxs)(motion.div, {
        className: "km",
        ...riseIn(0.15),
        children: [
          (0, jsx.jsx)("span", {
            className: "km-number",
            children: formatNumber(e),
          }),
          (0, jsx.jsx)("span", {
            className: "km-unit",
            children: "kilometres",
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.svg, {
        className: "map",
        viewBox: "0 0 320 120",
        "aria-hidden": "true",
        ...fadeIn(0.3, 0.8),
        children: [
          (0, jsx.jsx)(motion.path, {
            d: "M40 88 C 110 20, 210 20, 280 44",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1",
            strokeDasharray: "4 7",
            opacity: "0.45",
            initial: {
              pathLength: +!!isStill(),
            },
            animate: {
              pathLength: 1,
            },
            transition: {
              duration: 2.6,
              ease: "easeInOut",
            },
          }),
          (0, jsx.jsx)("circle", {
            cx: "40",
            cy: "88",
            r: "4.5",
            fill: "currentColor",
            opacity: "0.9",
          }),
          (0, jsx.jsx)("circle", {
            cx: "280",
            cy: "44",
            r: "4.5",
            fill: "currentColor",
            opacity: "0.9",
          }),
          (0, jsx.jsx)("text", {
            x: "40",
            y: "108",
            className: "map-label",
            textAnchor: "middle",
            children: CANON.hisCity,
          }),
          (0, jsx.jsx)("text", {
            x: "280",
            y: "30",
            className: "map-label",
            textAnchor: "middle",
            children: CANON.herCity,
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.ul, {
        className: "facts",
        ...fadeIn(0.7, 0.8),
        children: [
          (0, jsx.jsxs)("li", {
            children: [
              (0, jsx.jsx)("span", {
                children: formatNumber(n),
              }),
              (0, jsx.jsx)("em", {
                children: "days to walk it, at a steady thirty a day",
              }),
            ],
          }),
          (0, jsx.jsxs)("li", {
            children: [
              (0, jsx.jsx)("span", {
                children: r,
              }),
              (0, jsx.jsx)("em", {
                children: "hours on a train, which is nothing, which is the maddening part",
              }),
            ],
          }),
          (0, jsx.jsxs)("li", {
            children: [
              (0, jsx.jsx)("span", {
                children: i,
              }),
              (0, jsx.jsx)("em", {
                children: "kilometres crossed per day so far, by voice",
              }),
            ],
          }),
          (0, jsx.jsxs)("li", {
            children: [
              (0, jsx.jsx)("span", {
                children: "2",
              }),
              (0, jsx.jsxs)("em", {
                children: ["hours in the same room, on ", MET_LABEL],
              }),
            ],
          }),
        ],
      }),
      (0, jsx.jsx)(motion.p, {
        className: "scene-under",
        ...fadeIn(1.1, 0.8),
        children: "It is a number. It is not an argument.",
      }),
    ],
  });
}
