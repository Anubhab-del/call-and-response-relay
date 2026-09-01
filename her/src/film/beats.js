// The camera.
//
// Every beat is on a slow move — a push, a pull, a drift — that runs longer
// than the beat itself, so the cut always lands mid-gesture and nothing is
// ever a photograph of some words. Twenty seconds to travel six percent: too
// slow to watch, too alive to call still.
var SHOTS = [
  { from: { scale: 1.0, x: "0%", y: "0.6%" }, to: { scale: 1.075, x: "0%", y: "-0.6%" } }, // push in
  { from: { scale: 1.08, x: "0%", y: "-0.5%" }, to: { scale: 1.005, x: "0%", y: "0.5%" } }, // pull back
  { from: { scale: 1.05, x: "1.6%", y: "0%" }, to: { scale: 1.02, x: "-1.6%", y: "0%" } }, // drift left
  { from: { scale: 1.05, x: "-1.6%", y: "0%" }, to: { scale: 1.02, x: "1.6%", y: "0%" } }, // drift right
  { from: { scale: 1.02, x: "0%", y: "1.4%" }, to: { scale: 1.06, x: "0%", y: "-0.4%" } }, // rise
  { from: { scale: 1.06, x: "-0.9%", y: "-0.8%" }, to: { scale: 1.015, x: "0.9%", y: "0.8%" } }, // fall away
];
// reel.js walks the cameras at load, before this file exists, so it carries
// its own count. If a camera is ever added here and not there, the walk would
// silently stop using it.
if (SHOTS.length !== SHOT_COUNT) throw new Error("camera count");
var shotTurn = 0;

function nextShot() {
  // Walk the list rather than picking at random, so two pushes never land
  // back to back, and nudge the step so the cycle does not become a pattern.
  shotTurn += 1 + (Math.random() < 0.35 ? 1 : 0);
  return SHOTS[shotTurn % SHOTS.length];
}

function Beat({ children: children, full = false, hold = false, shot: wanted = null }) {
  // A form can ask for the camera that suits it; everything else takes the
  // next one on the walk.
  let [shot] = (0, React.useState)(() => (wanted == null ? nextShot() : SHOTS[wanted % SHOTS.length]));
  let fade = transition();
  // A cross-dissolve, not a crossfade: the new frame comes up quickly and the
  // old one lingers under it. She sees an answer to her thumb in a quarter of
  // a second, and the cut still has breath on the way out.
  let base = fade.duration ?? 0.38;
  let arrive = { duration: base * 0.62, ease: EASE_OUT };
  let leave = { duration: base * 1.15, ease: EASE_STD };
  if (isStill())
    return (0, jsx.jsx)(motion.div, {
      className: full ? "beat full" : "beat",
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: arrive },
      exit: { opacity: 0, transition: leave },
      children: children,
    });
  return (0, jsx.jsx)(motion.div, {
    className: full ? "beat full" : "beat",
    initial: { opacity: 0, ...shot.from },
    animate: {
      opacity: 1,
      ...shot.to,
      transition: {
        opacity: arrive,
        default: { duration: hold ? 34 : 21, ease: "linear" },
      },
    },
    exit: {
      opacity: 0,
      transition: leave,
    },
    children: children,
  });
}
function ProjectorBeat() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsx)(motion.div, {
      className: "flicker",
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: [0, 0.16, 0, 0.08, 0],
      },
      transition: {
        duration: 1.4,
        times: [0, 0.12, 0.22, 0.45, 1],
        delay: 0.15,
      },
    }),
  });
}
function TitleBeat() {
  let e = daysTogether();
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
        (0, jsx.jsx)(motion.h1, {
          className: "title-word",
          ...fadeIn(0.06, 0.9),
          children: CANON.title,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "title-her",
          ...fadeIn(0.6),
          children: CANON.name,
        }),
        (0, jsx.jsxs)(motion.p, {
          className: "title-meta",
          ...fadeIn(1.15, 0.6),
          children: [START_LABEL, " — running time ", formatNumber(e), " days"],
        }),
      ],
    }),
  });
}
function ThresholdBeat() {
  return (0, jsx.jsx)(Beat, {
    children: null,
  });
}
function HoldScene() {
  // Nothing on screen. Five seconds of the room, and the camera still moving
  // so it reads as a held breath rather than a stall.
  return (0, jsx.jsx)(Beat, {
    hold: true,
    children: null,
  });
}
function OvertureBeat() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "kicker",
          ...fadeIn(0, 0.7),
          children: OVERTURE_COPY.kicker,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-under",
          ...fadeIn(0.6, 0.9),
          children: OVERTURE_COPY.line,
        }),
      ],
    }),
  });
}
// Each act arrives on its own move, and keeps it: the first pushes in, the
// second drifts, the third rises, the last pulls back and lets go. Four cards
// that used to take whatever camera happened to be next on the walk.
var ACT_CAMERA = [0, 3, 4, 1];
function PartBeat({ part: part }) {
  let t = PARTS[part];
  return t
    ? (0, jsx.jsx)(Beat, {
        shot: ACT_CAMERA[part % ACT_CAMERA.length],
        children: (0, jsx.jsxs)("div", {
          className: "centre part-card",
          children: [
            (0, jsx.jsx)(motion.p, {
              className: "part-mark",
              ...fadeIn(0, 0.6),
              children: roman(part + 1),
            }),
            (0, jsx.jsx)(motion.span, {
              className: "part-rule",
              ...fadeIn(0.3, 0.8),
            }),
            (0, jsx.jsx)(motion.p, {
              className: "act-years",
              ...fadeIn(0.45, 0.7),
              children: t.years,
            }),
            (0, jsx.jsx)(motion.p, {
              className: "act-title",
              ...fadeIn(0.8, 0.7),
              children: t.title,
            }),
            (0, jsx.jsxs)(motion.p, {
              className: "part-range",
              ...fadeIn(1.3, 0.6),
              children: ["Chapters ", roman(t.from), " — ", roman(t.to)],
            }),
          ],
        }),
      })
    : null;
}
function ChapterBeat({ n: n }) {
  let chapter = CHAPTERS[n - 1];
  if (!chapter) return null;
  let over = isFullBleed(n);
  let form = formFor(n);
  let lines = chapter.lines;

  // Where each line lands, in seconds, reading the one before it first.
  let at = (i, from = 0.75) =>
    from + lines.slice(0, i).reduce((sum, line) => sum + readSeconds(line) * 0.72, 0);

  let numberEl = (0, jsx.jsx)(motion.p, {
    className: "chapter-number",
    ...fadeIn(0, 0.55),
    children: roman(n),
  });
  let titleEl = (0, jsx.jsx)(motion.p, {
    className: "chapter-title",
    ...fadeIn(0.22, 0.65),
    children: chapter.title,
  });
  let lineEls = (from = 0.75, className = "chapter-line") =>
    lines.map((line, i) =>
      (0, jsx.jsx)(Lines, { className: className, text: line, delay: at(i, from) }, line),
    );

  let body;
  switch (form) {
    case "lead":
      body = [
        titleEl,
        (0, jsx.jsx)("div", {
          className: "chapter-lines",
          children: [
            (0, jsx.jsx)(Lines, { className: "chapter-line lead-line", text: lines[0], delay: 0.7 }, lines[0]),
            ...lines.slice(1).map((line, i) =>
              (0, jsx.jsx)(Lines, { className: "chapter-line after-line", text: line, delay: at(i + 1, 0.7) }, line),
            ),
          ],
        }),
      ];
      break;

    case "stack":
      body = [numberEl, titleEl, (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls() })];
      break;

    case "rule":
      body = [
        numberEl,
        titleEl,
        (0, jsx.jsx)(motion.span, {
          className: "chapter-rule",
          "aria-hidden": "true",
          initial: { scaleX: 0 },
          animate: { scaleX: 1 },
          transition: { duration: isStill() ? 0.2 : 1.6, delay: 0.5, ease: EASE_OUT },
        }),
        (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls(0.95) }),
      ];
      break;

    case "watermark":
      body = [
        (0, jsx.jsx)(motion.span, {
          className: "chapter-ghost",
          "aria-hidden": "true",
          ...fadeIn(0.1, 2.4),
          children: chapter.title,
        }),
        numberEl,
        (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls(0.5) }),
      ];
      break;

    case "subtitle":
      body = [numberEl, (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls(0.4) })];
      break;

    case "drop": {
      let [first, ...rest] = lines[0].split(" ");
      body = [
        titleEl,
        (0, jsx.jsxs)("div", {
          className: "chapter-lines",
          children: [
            (0, jsx.jsxs)(motion.p, {
              className: "chapter-line",
              ...fadeIn(0.7, 0.9),
              children: [
                (0, jsx.jsx)("span", { className: "chapter-drop", children: first }),
                " " + rest.join(" "),
              ],
            }),
            ...lines.slice(1).map((line, i) =>
              (0, jsx.jsx)(Lines, { className: "chapter-line", text: line, delay: at(i + 1, 0.7) }, line),
            ),
          ],
        }),
      ];
      break;
    }

    case "apart":
      body = [
        (0, jsx.jsx)("div", {
          className: "chapter-apart-top",
          children: (0, jsx.jsx)(Lines, { className: "chapter-line", text: lines[0], delay: 0.6 }),
        }),
        numberEl,
        (0, jsx.jsx)("div", {
          className: "chapter-apart-foot",
          children: lines
            .slice(1)
            .map((line, i) =>
              (0, jsx.jsx)(Lines, { className: "chapter-line", text: line, delay: at(i + 1, 0.6) }, line),
            ),
        }),
      ];
      break;

    case "breath":
      body = [
        numberEl,
        titleEl,
        (0, jsx.jsx)("div", {
          className: "chapter-lines",
          children: [
            (0, jsx.jsx)(Lines, { className: "chapter-line", text: lines[0], delay: 0.7 }, lines[0]),
            // The pause is the point. Everything after it waits.
            ...lines.slice(1).map((line, i) =>
              (0, jsx.jsx)(Lines, { className: "chapter-line", text: line, delay: at(i + 1, 2.1) }, line),
            ),
          ],
        }),
      ];
      break;

    case "flare":
      body = [
        isStill()
          ? null
          : (0, jsx.jsx)(motion.div, {
              className: "chapter-flare",
              "aria-hidden": "true",
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: [0, 0.44, 0.3], scale: [0.8, 1.08, 1] },
              transition: { duration: 5.2, times: [0, 0.4, 1], ease: "easeInOut", delay: 0.5 },
            }),
        titleEl,
        (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls(0.8) }),
      ];
      break;

    case "corner":
      body = [
        (0, jsx.jsxs)(motion.p, {
          className: "chapter-corner",
          ...fadeIn(0.1, 0.7),
          children: [roman(n), (0, jsx.jsx)("span", { children: chapter.title })],
        }),
        (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls(0.6) }),
      ];
      break;

    case "twoup":
      body = [
        (0, jsx.jsxs)("div", {
          className: "chapter-row",
          children: [
            titleEl,
            (0, jsx.jsx)(Lines, { className: "chapter-line", text: lines[0], delay: 0.6 }, lines[0]),
          ],
        }),
        (0, jsx.jsx)("div", {
          className: "chapter-lines",
          children: lines
            .slice(1)
            .map((line, i) =>
              (0, jsx.jsx)(Lines, { className: "chapter-line", text: line, delay: at(i + 1, 0.6) }, line),
            ),
        }),
      ];
      break;

    case "quiet":
      body = [(0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls(0.5) })];
      break;

    default:
      body = [numberEl, titleEl, (0, jsx.jsx)("div", { className: "chapter-lines", children: lineEls() })];
  }

  return (0, jsx.jsxs)(Beat, {
    full: over,
    shot: shotFor(n),
    children: [
      over ? (0, jsx.jsx)(Still, { variant: lightFor(n), seconds: 6 }) : null,
      (0, jsx.jsx)("div", {
        className: over ? "chapter over-light" : "chapter",
        "data-form": form,
        children: body,
      }),
    ],
  });
}
function DistanceScene() {
  let e = CANON.kilometres,
    t = useCountUp(e, 2200);
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre distance",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "kicker",
          ...fadeIn(0, 0.6),
          children: DISTANCE_COPY.kicker,
        }),
        (0, jsx.jsxs)("svg", {
          className: "distance-line",
          viewBox: "0 0 600 60",
          "aria-hidden": "true",
          children: [
            (0, jsx.jsx)(motion.line, {
              x1: "30",
              y1: "30",
              x2: "570",
              y2: "30",
              stroke: "currentColor",
              strokeWidth: "1",
              strokeDasharray: "3 6",
              opacity: "0.4",
              initial: {
                pathLength: +!!isStill(),
              },
              animate: {
                pathLength: 1,
              },
              transition: {
                duration: 2.2,
                ease: "easeInOut",
              },
            }),
            (0, jsx.jsx)("circle", {
              cx: "30",
              cy: "30",
              r: "4",
              fill: "currentColor",
              opacity: "0.85",
            }),
            (0, jsx.jsx)(motion.circle, {
              cx: "570",
              cy: "30",
              r: "4",
              fill: "currentColor",
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 0.85,
              },
              transition: {
                delay: 2,
                duration: 0.5,
              },
            }),
          ],
        }),
        (0, jsx.jsxs)("div", {
          className: "distance-ends",
          children: [
            (0, jsx.jsx)("span", {
              children: CANON.hisCity,
            }),
            (0, jsx.jsxs)("span", {
              className: "distance-km",
              children: [formatNumber(t), " km"],
            }),
            (0, jsx.jsx)("span", {
              children: CANON.herCity,
            }),
          ],
        }),
        (0, jsx.jsx)(Lines, {
          className: "scene-line",
          text: DISTANCE_COPY.line,
          delay: 1.5,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-under",
          ...fadeIn(2.6, 0.7),
          children: DISTANCE_COPY.after,
        }),
      ],
    }),
  });
}
function TwoHoursScene() {
  let e = useCountUp(7200, 2600);
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "kicker",
          ...fadeIn(0, 0.6),
          children: TWO_HOURS_COPY.kicker,
        }),
        (0, jsx.jsxs)(motion.p, {
          className: "big-count",
          ...fadeIn(0.3, 0.6),
          children: [
            formatNumber(e),
            (0, jsx.jsx)("span", {
              className: "big-count-unit",
              children: "seconds",
            }),
          ],
        }),
        (0, jsx.jsx)(Lines, {
          className: "scene-line",
          text: TWO_HOURS_COPY.line,
          delay: 2.2,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-under",
          ...fadeIn(3, 0.7),
          children: TWO_HOURS_COPY.after,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-closing",
          ...fadeIn(4.2, 0.9),
          children: TWO_HOURS_COPY.closing,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-date",
          ...fadeIn(5, 0.6),
          children: MET_LABEL,
        }),
      ],
    }),
  });
}
function SleepScene() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "kicker",
          ...fadeIn(0, 0.6),
          children: SLEEP_COPY.kicker,
        }),
        (0, jsx.jsx)("div", {
          className: "stack",
          children: SLEEP_COPY.lines.map((e, t) =>
            (0, jsx.jsx)(
              Lines,
              {
                className: "scene-line small",
                text: e,
                delay: 0.5 + t * 1.35,
              },
              e,
            ),
          ),
        }),
        (0, jsx.jsx)(motion.div, {
          className: "ceiling-light",
          "aria-hidden": "true",
          initial: {
            opacity: 0,
          },
          animate: {
            opacity: isStill() ? 0.18 : [0, 0.22, 0.06, 0.2, 0.05],
          },
          transition: {
            duration: 5,
            times: [0, 0.2, 0.4, 0.65, 1],
          },
        }),
      ],
    }),
  });
}
function DanceScene() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "kicker",
          ...fadeIn(0, 0.6),
          children: DANCE_COPY.kicker,
        }),
        (0, jsx.jsxs)("svg", {
          className: "dance-figure",
          viewBox: "0 0 200 200",
          "aria-hidden": "true",
          children: [
            [0, 1, 2, 3].map((e) =>
              (0, jsx.jsx)(
                motion.circle,
                {
                  cx: "100",
                  cy: "100",
                  r: 30 + e * 22,
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "0.6",
                  opacity: 0.28 - e * 0.05,
                  initial: {
                    scale: isStill() ? 1 : 0.86,
                    opacity: 0,
                  },
                  animate: {
                    scale: 1,
                    opacity: 0.28 - e * 0.05,
                  },
                  transition: {
                    duration: 2.4,
                    delay: 0.3 + e * 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  style: {
                    transformOrigin: "100px 100px",
                  },
                },
                e,
              ),
            ),
            (0, jsx.jsx)(motion.circle, {
              cx: "100",
              cy: "100",
              r: "5",
              fill: "currentColor",
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 0.9,
              },
              transition: {
                duration: 1,
                delay: 0.2,
              },
            }),
          ],
        }),
        (0, jsx.jsx)("div", {
          className: "stack",
          children: DANCE_COPY.lines.map((e, t) =>
            (0, jsx.jsx)(
              Lines,
              {
                className: "scene-line small",
                text: e,
                delay: 1.4 + t * 1.6,
              },
              e,
            ),
          ),
        }),
      ],
    }),
  });
}
function CareBeat() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsx)(motion.p, {
      className: "care-line",
      ...fadeIn(0.2, 0.7),
      children: CARE_COPY.line,
    }),
  });
}
function VowBeat() {
  // The only sentence in here that is a report rather than a promise, with
  // light coming up behind it and beating once while she reads.
  return (0, jsx.jsx)(Beat, {
    hold: true,
    children: (0, jsx.jsxs)("div", {
      className: "centre vow",
      children: [
        isStill()
          ? null
          : (0, jsx.jsx)(motion.div, {
              className: "vow-bloom",
              "aria-hidden": "true",
              initial: {
                opacity: 0,
                scale: 0.72,
              },
              animate: {
                opacity: [0, 0.5, 0.34, 0.62, 0.4],
                scale: [0.72, 1.04, 1, 1.1, 1.02],
              },
              transition: {
                duration: 6.4,
                times: [0, 0.28, 0.46, 0.62, 1],
                ease: "easeInOut",
                delay: 0.3,
              },
            }),
        (0, jsx.jsx)(Heading, {
          className: "vow-line",
          text: VOW_COPY.line,
          delay: 0.5,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-under",
          ...fadeIn(1.6, 0.8),
          children: VOW_COPY.under,
        }),
      ],
    }),
  });
}
function CreditsBeat() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "credits",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "credits-role",
          ...fadeIn(0, 0.6),
          children: CREDITS_COPY.hers,
        }),
        (0, jsx.jsx)(motion.h2, {
          ...fadeIn(0.25, 0.8),
          children: CANON.name,
        }),
        CANON.you
          ? (0, jsx.jsxs)(jsx.Fragment, {
              children: [
                (0, jsx.jsx)(motion.p, {
                  className: "credits-role",
                  ...fadeIn(1.2, 0.6),
                  children: CREDITS_COPY.yours,
                }),
                (0, jsx.jsx)(motion.p, {
                  className: "credits-him",
                  ...fadeIn(1.45, 0.7),
                  children: CANON.you,
                }),
              ],
            })
          : null,
      ],
    }),
  });
}
function AfterBeat() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "after-date",
          ...fadeIn(0, 0.6),
          children: AFTER_COPY.date,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "vow-line",
          ...fadeIn(0.4, 0.8),
          children: AFTER_COPY.line,
        }),
      ],
    }),
  });
}
function CodaStillBeat() {
  return (0, jsx.jsx)(Beat, {
    full: true,
    children: (0, jsx.jsx)(Still, {
      src: CODA_COPY.still,
      variant: "lamp",
      seconds: 3.4,
    }),
  });
}
function CodaLineBeat() {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsx)(motion.p, {
      className: "care-line",
      ...fadeIn(0.18, 0.7),
      children: CODA_COPY.line,
    }),
  });
}
function LastBeat() {
  let e = CODA_COPY.last.split(`
`);
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsx)("div", {
      className: "centre",
      children: e.map((e, t) =>
        (0, jsx.jsx)(
          Lines,
          {
            className: "last-line",
            text: e,
            delay: 0.5 + t * 2.1,
          },
          e,
        ),
      ),
    }),
  });
}
function NameFlashBeat() {
  return (
    (0, React.useEffect)(() => {
      update((e) => {
        e.nameWritten = true;
      });
    }, []),
    isStill()
      ? (0, jsx.jsx)(Beat, {
          children: (0, jsx.jsx)(motion.p, {
            className: "name-flash",
            ...fadeIn(0.2, 0.9),
            children: CANON.name,
          }),
        })
      : (0, jsx.jsxs)(Beat, {
          children: [
            (0, jsx.jsx)(NameCanvas, {
              text: CANON.name,
            }),
            (0, jsx.jsx)("p", {
              className: "sr-only",
              children: CANON.name,
            }),
          ],
        })
  );
}
function DoorwayBeat({ onEnter: onEnter }) {
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre doorway",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "scene-line",
          ...fadeIn(0.2, 0.8),
          children: DOORWAY_COPY.line,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "scene-under",
          ...fadeIn(1, 0.8),
          children: DOORWAY_COPY.under,
        }),
        (0, jsx.jsx)(motion.button, {
          type: "button",
          className: "door-button",
          onClick: onEnter,
          ...riseIn(1.9),
          children: DOORWAY_COPY.button,
        }),
        (0, jsx.jsxs)(motion.p, {
          className: "doorway-year",
          ...fadeIn(2.6, 0.6),
          children: ["Year ", septemberOrdinal()],
        }),
      ],
    }),
  });
}
