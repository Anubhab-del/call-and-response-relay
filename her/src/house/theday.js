// ── the dial ──────────────────────────────────────────────────────────────
//
// A clock of the third September, with nine o'clock at the top.
//
// That is not how clocks are built and it is the whole point: this one has a
// single hour it is for, so that hour is at the crown, the day climbs towards
// it all the way round, and at nine the hand arrives and the house takes the
// screen.
//
// Midnight sits at the upper right. Morning runs down the right side, the
// afternoon climbs the left, and the last two hours of the day fall past the
// crown on their way out.

var DIAL_R = 78;
// Where an hour sits, in degrees, with 21:00 at twelve o'clock.
function dialAngle(hour) {
  return ((hour - 21) / 24) * 360 - 90;
}
function dialPoint(hour, radius) {
  let a = (dialAngle(hour) * Math.PI) / 180;
  return { x: 100 + Math.cos(a) * radius, y: 100 + Math.sin(a) * radius };
}
// The reverse, for her thumb: which hour is she nearest to.
function hourFromPoint(dx, dy) {
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  let hour = Math.round(((deg + 90) / 360) * 24 + 21);
  return ((hour % 24) + 24) % 24;
}

// The hours she was awake for. Written once per hour, from wherever she is —
// the front door counts, so it never asks her to come in here to be counted.
// It is never shown as a number and there is nothing to fall behind on.
function markDayHour() {
  let hour = theDayHour();
  if (hour == null) return;
  let year = String(new Date().getFullYear());
  if (snapshot().theDay?.[year]?.[String(hour)]) return;
  update((state) => {
    let all = { ...(state.theDay ?? {}) };
    all[year] = { ...(all[year] ?? {}), [String(hour)]: Date.now() };
    state.theDay = all;
  });
}
function useDayPresence() {
  useMinuteTick();
  (0, React.useEffect)(() => {
    markDayHour();
  });
}

function TheDayRoom() {
  let store = useStore();
  useDayPresence();
  let now = theDayHour() ?? 0;
  let [at, setAt] = (0, React.useState)(now);
  // The selection is read out of a ref rather than out of the last render.
  //
  // Both handlers below used a functional updater with a haptic inside it,
  // which StrictMode double-invokes: one press of the arrow moved the dial two
  // hours and buzzed twice. A ref is immune to it, and a side effect does not
  // belong in an updater in the first place.
  let atNow = (0, React.useRef)(at);
  atNow.current = at;
  let turnTo = (hour) => {
    if (hour === atNow.current) return;
    ((atNow.current = hour), tapTick(), setAt(hour));
  };
  let [turning, setTurning] = (0, React.useState)(false);
  let dial = (0, React.useRef)(null);
  let year = String(new Date().getFullYear());
  let stood = store.theDay?.[year] ?? {};
  let open = theDayOpen(at);
  let door = THE_DAY[at];

  // The hand, moving. Re-read every fifteen seconds so it is never a picture
  // of where the day was when she walked in.
  let [, tick] = (0, React.useState)(0);
  (0, React.useEffect)(() => {
    let id = window.setInterval(() => tick((n) => n + 1), 15000);
    return () => window.clearInterval(id);
  }, []);
  let through = theDayProgress();

  // Her thumb on the ring. Not a scrub bar — a thing that turns.
  let held = (0, React.useRef)(false);
  let pick = (e) => {
    let el = dial.current;
    if (!el) return;
    let box = el.getBoundingClientRect();
    let hour = hourFromPoint(
      e.clientX - (box.left + box.width / 2),
      e.clientY - (box.top + box.height / 2),
    );
    turnTo(hour);
  };

  // The arrows belong to the dial while she is standing at it, so they do not
  // walk her out of the room mid-turn.
  (0, React.useEffect)(() => {
    let onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      (e.stopPropagation(), e.preventDefault());
      turnTo((atNow.current + (e.key === "ArrowRight" ? 1 : 23)) % 24);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (0, jsx.jsxs)("div", {
    className: "the-day",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children: THE_DAY_ROOM.lede,
      }),
      (0, jsx.jsxs)(motion.div, {
        className: "dial-wrap",
        "data-turning": turning ? "true" : void 0,
        ...riseIn(0.12),
        children: [
          (0, jsx.jsxs)("svg", {
            ref: dial,
            className: "dial",
            viewBox: "0 0 200 200",
            role: "group",
            "aria-label": "The hours of the third September",
            onPointerDown: (e) => {
              ((held.current = true),
                setTurning(true),
                e.currentTarget.setPointerCapture?.(e.pointerId),
                pick(e));
            },
            onPointerMove: (e) => held.current && pick(e),
            onPointerUp: () => ((held.current = false), setTurning(false)),
            onPointerCancel: () => ((held.current = false), setTurning(false)),
            children: [
              (0, jsx.jsx)("circle", {
                className: "dial-ring",
                cx: "100",
                cy: "100",
                r: String(DIAL_R),
              }),
              // The hand: where the day actually is, right now.
              (0, jsx.jsx)("line", {
                className: "dial-hand",
                x1: "100",
                y1: "100",
                x2: String(dialPoint(through * 24, DIAL_R - 12).x),
                y2: String(dialPoint(through * 24, DIAL_R - 12).y),
              }),
              THE_DAY.map((_, hour) => {
                let past = theDayOpen(hour);
                let inner = dialPoint(hour, DIAL_R - (hour === 21 ? 11 : 6));
                let outer = dialPoint(hour, DIAL_R + (hour === 21 ? 7 : 4));
                let here = dialPoint(hour, DIAL_R + 12);
                return (0, jsx.jsxs)(
                  "g",
                  {
                    className: "dial-mark",
                    "data-open": past ? "true" : void 0,
                    "data-here": hour === at ? "true" : void 0,
                    "data-now": hour === now ? "true" : void 0,
                    "data-crown": hour === 21 ? "true" : void 0,
                    children: [
                      (0, jsx.jsx)("line", {
                        x1: String(inner.x),
                        y1: String(inner.y),
                        x2: String(outer.x),
                        y2: String(outer.y),
                      }),
                      // A warm point on an hour she was awake for. No number
                      // anywhere, and nothing counts it.
                      stood[String(hour)]
                        ? (0, jsx.jsx)("circle", {
                            className: "dial-stood",
                            cx: String(here.x),
                            cy: String(here.y),
                            r: "1.7",
                          })
                        : null,
                    ],
                  },
                  hour,
                );
              }),
            ],
          }),
          (0, jsx.jsx)(AnimatePresence, {
            mode: "wait",
            children: (0, jsx.jsxs)(
              motion.div,
              {
                className: "dial-face",
                initial: { opacity: 0, y: isStill() ? 0 : 6 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: isStill() ? 0 : -6 },
                transition: { duration: isStill() ? 0.15 : 0.42, ease: EASE_OUT },
                children: [
                  (0, jsx.jsx)("p", {
                    className: "dial-kicker",
                    // Where in the day she is standing — not the hour's name
                    // again, which the line below is already saying.
                    children:
                      at === now
                        ? THE_DAY_ROOM.now
                        : open
                          ? THE_DAY_ROOM.earlier
                          : THE_DAY_ROOM.later,
                  }),
                  (0, jsx.jsx)("p", {
                    className: "dial-hour",
                    children: door.kicker,
                  }),
                ],
              },
              at,
            ),
          }),
        ],
      }),
      (0, jsx.jsx)(AnimatePresence, {
        mode: "wait",
        children: (0, jsx.jsxs)(
          motion.div,
          {
            className: "door",
            "data-shut": open ? void 0 : "true",
            initial: { opacity: 0, y: isStill() ? 0 : 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: isStill() ? 0 : -8 },
            transition: { duration: isStill() ? 0.18 : 0.5, ease: EASE_OUT },
            children: [
              open
                ? (0, jsx.jsx)("p", { className: "door-line", children: door.line })
                : (0, jsx.jsx)("p", { className: "door-line", children: THE_DAY_ROOM.ahead }),
              open && door.under
                ? (0, jsx.jsx)("p", { className: "door-under", children: door.under })
                : null,
              open
                ? stood[String(at)]
                  ? (0, jsx.jsx)("p", { className: "door-stood", children: THE_DAY_ROOM.present })
                  : null
                : (0, jsx.jsx)("p", {
                    className: "door-under",
                    children: THE_DAY_ROOM.aheadAt(THE_DAY_LABELS[at]),
                  }),
            ],
          },
          `${at}-${open}`,
        ),
      }),
    ],
  });
}
