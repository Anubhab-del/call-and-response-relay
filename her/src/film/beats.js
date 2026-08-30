function Beat({ children: children, full = false }) {
  return (0, jsx.jsx)(motion.div, {
    className: full ? "beat full" : "beat",
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
    transition: transition(),
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
  return (0, jsx.jsx)(Beat, {
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
function PartBeat({ part: part }) {
  let t = PARTS[part];
  return t
    ? (0, jsx.jsx)(Beat, {
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
function ChapterBeat({ n: e }) {
  let t = CHAPTERS[e - 1];
  if (!t) return null;
  let n = isFullBleed(e);
  return (0, jsx.jsxs)(Beat, {
    full: n,
    children: [
      n
        ? (0, jsx.jsx)(Still, {
            variant: lightFor(e),
            seconds: 6,
          })
        : null,
      (0, jsx.jsxs)("div", {
        className: n ? "chapter over-light" : "chapter",
        children: [
          (0, jsx.jsx)(motion.p, {
            className: "chapter-number",
            ...fadeIn(0, 0.55),
            children: roman(e),
          }),
          (0, jsx.jsx)(motion.p, {
            className: "chapter-title",
            ...fadeIn(0.22, 0.65),
            children: t.title,
          }),
          (0, jsx.jsx)("div", {
            className: "chapter-lines",
            children: t.lines.map((e, n) =>
              (0, jsx.jsx)(
                Lines,
                {
                  className: "chapter-line",
                  text: e,
                  delay: 0.75 + t.lines.slice(0, n).reduce((e, t) => e + readSeconds(t) * 0.72, 0),
                },
                e,
              ),
            ),
          }),
        ],
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
  return (0, jsx.jsx)(Beat, {
    children: (0, jsx.jsxs)("div", {
      className: "centre",
      children: [
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
