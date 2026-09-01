// A vow is a row she can also just push. Rightward is he kept this — the
// direction of a thing going in the ledger. Leftward takes it back out, in
// case she was only being kind. Nothing here is undoable, and nothing here
// counts anything: it is a record, not a score.
function Vow({ vow: vow, index: index, kept: kept, onMark: onMark, children: children }) {
  let [pushed, setPushed] = (0, React.useState)(0);
  (0, React.useEffect)(() => {
    if (!pushed) return;
    let id = window.setTimeout(() => setPushed(0), 620);
    return () => window.clearTimeout(id);
  }, [pushed]);
  let swipe = useSwipe({
    min: 54,
    onRight: () => {
      if (kept) return;
      (setPushed(1), onMark(vow.id, true));
    },
    onLeft: () => {
      if (!kept) return;
      (setPushed(-1), onMark(vow.id, false));
    },
  });
  return (0, jsx.jsxs)(motion.li, {
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
      delay: Math.min(0.4, index * 0.04),
      ease: [0.16, 1, 0.3, 1],
    },
    "data-kept": kept ? "true" : void 0,
    "data-pushed": pushed > 0 ? "in" : pushed < 0 ? "out" : void 0,
    "data-swipe": "own",
    ...swipe,
    children: children,
  });
}
// The head of a vow. A tap opens the small print — but only a tap that stayed
// where it was put, so pushing the row does not also unfold it.
function VowHead({ vow: vow, open: open, onToggle: onToggle }) {
  let press = usePress({ onTap: onToggle });
  return (0, jsx.jsxs)("button", {
    type: "button",
    className: "vow-head",
    "aria-expanded": open,
    ...press.handlers,
    children: [
      (0, jsx.jsx)("span", {
        className: "vow-text",
        children: vow.text,
      }),
      (0, jsx.jsxs)("span", {
        className: "vow-date",
        // A vow made on this exact date is being made tonight, which is the
        // one night she can mark it as it happens.
        children: isOnDate(vow.made, false) ? ["made tonight"] : ["made ", formatCivil(vow.made)],
      }),
    ],
  });
}
function PromisesRoom() {
  let e = useStore(),
    [t, n] = (0, React.useState)(null);
  let mark = (id, to) => {
    (to ? tapOnce() : tapTick(),
      update((state) => {
        to ? (state.kept[id] = Date.now()) : delete state.kept[id];
      }));
  };
  return (0, jsx.jsxs)("div", {
    className: "promises",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children:
          "Not wishes, and not things I hope to be. Twelve things I am on the hook for, in writing, where you can find them. You are the one who says when one has been kept — I do not get to mark my own homework.",
      }),
      (0, jsx.jsx)(motion.p, {
        className: "fine",
        ...fadeIn(0.1, 0.6),
        children:
          "Open one to read the small print. Or push the whole row to the right, if I have done what I said I would.",
      }),

      (0, jsx.jsx)("ul", {
        className: "vow-list",
        children: PROMISES.map((r, i) => {
          let a = e.kept[r.id],
            o = t === r.id;
          return (0, jsx.jsxs)(
            Vow,
            {
              vow: r,
              index: i,
              kept: a,
              onMark: mark,
              children: [
                (0, jsx.jsx)(VowHead, {
                  vow: r,
                  open: o,
                  onToggle: () => {
                    (tapTick(), n(o ? null : r.id));
                  },
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
                          onClick: () => mark(r.id, !a),
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
    // Sorted by how far off it is, ascending — which was right in 2026, when
    // everything here was still ahead. By 2029 the wedding and her first class
    // are behind us, and an ascending sort put the oldest of them at the top:
    // the room opened on the thing furthest in the past.
    //
    // What is coming, soonest first. Then what has been, most recent first.
    n = MILESTONES.map((e) => {
      let t = nextOccurrence(e.on, !!e.annual),
        n = daysBetween(civilToday(), t);
      return {
        ...e,
        on: t,
        away: n,
        isNow: isOnDate(e.on, !!e.annual),
      };
    }).sort((e, t) => {
      let ahead = e.away >= 0,
        theirs = t.away >= 0;
      if (ahead !== theirs) return ahead ? -1 : 1;
      return ahead ? e.away - t.away : t.away - e.away;
    }),
    r = nextAnniversary(e),
    i = ANNIVERSARIES.filter((t) => t.at <= e);
  return (0, jsx.jsxs)("div", {
    className: "her-days",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children: "Every date that belongs to us, and how far off it is tonight. The house always knows which day today is, even when neither of us does.",
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
var DISTANCE_ARC = "M40 88 C 110 20, 210 20, 280 44";
function DistanceRoom() {
  let e = CANON.kilometres,
    t = daysTogether(),
    n = Math.round(e / 30),
    // It used to say the train: twenty-three hours, described as "nothing,
    // which is the maddening part". Twenty-three hours is not nothing, and the
    // line was arguing with its own number. The flight is the honest one — and
    // it is exactly as long as every hour we have ever spent in one room.
    // 640 km/h is the honest block speed for a sector this length once taxi,
    // climb and descent are in it — not the cruise number.
    r = Math.round((e / 640) * 10) / 10,
    i = Math.round((e / Math.max(1, t)) * 10) / 10;
  // She can put a finger on his city and drag it to hers. The number counts
  // down under her hand. It is the only honest way to show a distance: not as
  // a fact on a card, but as something that closes because she closed it.
  let arc = (0, React.useRef)(null);
  let [along, setAlong] = (0, React.useState)(0);
  let [crossed, setCrossed] = (0, React.useState)(false);
  let dragging = (0, React.useRef)(false);
  let at = (0, React.useMemo)(() => {
    let path = arc.current;
    if (!path?.getTotalLength) return { x: 40, y: 88 };
    let p = path.getPointAtLength(path.getTotalLength() * along);
    return { x: p.x, y: p.y };
  }, [along]);
  let left = Math.max(0, Math.round(e * (1 - along)));
  // The number arrives rather than appearing. It is the one figure in the
  // house that is worth watching land.
  let counted = useCountUp(e, 1700);
  let move = (ev) => {
    let box = ev.currentTarget.getBoundingClientRect();
    if (!box.width) return;
    // The arc runs from x=40 to x=280 in a 320-wide viewBox.
    let x = ((ev.clientX - box.left) / box.width) * 320;
    let f = Math.min(1, Math.max(0, (x - 40) / 240));
    (setAlong(f), tapWeighted(f * 0.5));
    if (f > 0.985 && !crossed) (setCrossed(true), tapKept());
  };
  return (0, jsx.jsxs)("div", {
    className: "distance-room",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children: "Everyone told us the arithmetic, at length, as though we might not have done it. We were never confused about the arithmetic.",
      }),
      (0, jsx.jsxs)(motion.div, {
        className: "km",
        "data-closing": along > 0.01 ? "true" : void 0,
        ...riseIn(0.15),
        children: [
          (0, jsx.jsx)("span", {
            className: "km-number",
            children: formatNumber(along > 0.01 ? left : counted),
          }),
          (0, jsx.jsx)("span", {
            className: "km-unit",
            children: along > 0.01 ? (left === 0 ? "kilometres left" : "kilometres to go") : "kilometres",
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.svg, {
        className: "map",
        viewBox: "0 0 320 120",
        "aria-hidden": "true",
        ...fadeIn(0.3, 0.8),
        onPointerDown: (ev) => {
          ((dragging.current = true), ev.currentTarget.setPointerCapture?.(ev.pointerId), move(ev));
        },
        onPointerMove: (ev) => {
          if (dragging.current) move(ev);
        },
        onPointerUp: () => {
          dragging.current = false;
        },
        onPointerCancel: () => {
          dragging.current = false;
        },
        "data-swipe": "own",
        "data-held": along > 0.01 ? "true" : void 0,
        children: [
          (0, jsx.jsx)(motion.path, {
            ref: arc,
            d: DISTANCE_ARC,
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
          along > 0.01
            ? (0, jsx.jsx)("path", {
                className: "map-crossed",
                d: DISTANCE_ARC,
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "1.4",
                pathLength: "1",
                strokeDasharray: "1",
                strokeDashoffset: 1 - along,
              })
            : null,
          along > 0.01
            ? (0, jsx.jsx)("circle", {
                className: "map-thumb",
                cx: at.x,
                cy: at.y,
                r: "3.4",
                fill: "currentColor",
              })
            : null,
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
                children: "hours in the air, which is nothing, which is the maddening part",
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
        className: "map-drag-hint",
        ...fadeIn(0.9, 0.8),
        children: crossed
          ? "There. That is all it ever was — a thing a hand can cross in a second and a half."
          : along > 0.01
            ? "Keep going."
            : `Put a finger on ${CANON.hisCity} and drag it to me.`,
      }),
      (0, jsx.jsx)(motion.p, {
        className: "distance-rhyme",
        ...fadeIn(1, 0.8),
        children:
          "Two hours to fly it. Two hours is also every minute we have ever spent in one room. I have never once got that arithmetic to sit still.",
      }),
      (0, jsx.jsx)(motion.p, {
        className: "scene-under",
        ...fadeIn(1.25, 0.8),
        children: "It is a number. It is not an argument.",
      }),
    ],
  });
}
