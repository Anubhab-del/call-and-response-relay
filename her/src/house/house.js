// ── each room its own place ──────────────────────────────────────────────
//
// Eight rooms that all arrived the same way, on the same fourteen pixels of
// rise, over the same ground. That is not a house — it is one page with the
// words swapped out. Each room now has its own light (in the stylesheet, keyed
// off data-room) and its own way of opening, and the two agree: the shelf of
// letters pulls out like a drawer, the picture comes up out of black the way a
// booth does, the distance widens, her own page rises to meet her.
var ROOM_DOORS = {
  letters: { from: { y: 22 }, to: { y: -10 } },
  say: { from: { y: 16, scale: 0.994 }, to: { y: -6 } },
  everything: { from: { y: -12 }, to: { y: 10 } },
  promises: { from: { y: 12 }, to: { y: -8 } },
  days: { from: { y: 18 }, to: { y: -8 } },
  distance: { from: { scale: 1.018 }, to: { scale: 0.996 } },
  reel: { from: { scale: 1.03, y: 6 }, to: { scale: 0.99 } },
  // The day arrives the way a day does: from underneath, slowly.
  theday: { from: { y: 26, scale: 0.985 }, to: { y: -10 } },
  settings: { from: { y: 10 }, to: { y: -6 } },
  inbox: { from: { y: 14 }, to: { y: -8 } },
  landing: { from: { y: 14 }, to: { y: -8 } },
};
function roomEntrance(room) {
  if (isStill())
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: T_FAST },
      exit: { opacity: 0, transition: T_FAST },
    };
  let door = ROOM_DOORS[room] ?? ROOM_DOORS.landing;
  return {
    initial: { opacity: 0, y: 0, scale: 1, ...door.from },
    animate: { opacity: 1, y: 0, scale: 1, transition: T_ROOM_IN },
    exit: { opacity: 0, y: 0, scale: 1, ...door.to, transition: T_ROOM_OUT },
  };
}
var ROOM_TITLES = {
  landing: "",
  letters: "Letters",
  everything: "Everything",
  promises: "Promises",
  days: "Your days",
  distance: "The distance",
  say: "Say something",
  reel: "The picture",
  theday: "The third September",
  settings: "The fuse box",
  inbox: "What arrived",
};
function House({ onWatch: onWatch, onBeginHour: onBeginHour, steppedOut: steppedOut }) {
  let t = useStore(),
    [n, r] = (0, React.useState)("landing"),
    [i, a] = (0, React.useState)(null),
    [openLetter, setOpenLetter] = (0, React.useState)(null),
    [keys, setKeys] = (0, React.useState)(false),
    frame = (0, React.useRef)(null);
  ((0, React.useEffect)(() => {
    score.setCue(n === "letters" ? "letter" : "house");
  }, [n]),
    (0, React.useEffect)(() => {
      let e = () => r("landing");
      if (n !== "landing")
        return (
          window.history.pushState(
            {
              room: n,
            },
            "",
          ),
          window.addEventListener("popstate", e),
          () => window.removeEventListener("popstate", e)
        );
    }, [n]));
  // Where she was in each room, for as long as the house is open. The shelf of
  // letters is twenty-four deep and the days are longer than a screen: coming
  // back to a room she was half-way down and being put at the top again is the
  // house forgetting something she did not.
  //
  // It is deliberately not saved to disk. Tomorrow she should get the top of
  // the room, the way you get the top of the stairs.
  let seat = (0, React.useRef)({});
  let o = (0, React.useCallback)((e) => {
    tapTick();
    let main = frame.current?.querySelector(".house-main");
    if (main) seat.current[roomNow.current] = main.scrollTop;
    (r(e), window.scrollTo?.({ top: 0 }));
  }, []);
  let roomNow = (0, React.useRef)(n);
  roomNow.current = n;
  // Back is back, from anywhere: escape, the arrow before the first room, or
  // a thumb dragged in from the left edge the way a phone expects.
  let back = (0, React.useCallback)(() => {
    if (roomNow.current === "landing") return;
    o("landing");
  }, [o]);
  useHouseKeys({
    room: n,
    onGo: o,
    onBack: back,
    onKeys: (0, React.useCallback)(() => setKeys((v) => !v), []),
    enabled: !keys,
  });
  useThumbLight(frame);
  // The rooms cross-fade, so when the state changes the room she is leaving is
  // still on screen: anything done to "the main element" at that moment is done
  // to the wrong one. Both the seat and the focus are set on the new room as it
  // mounts instead, which is the only moment either is true.
  //
  // Held in a callback keyed on the room so React does not re-run it on every
  // render — that would put her back at the top each time she scrolled.
  let landed = (0, React.useRef)(false);
  let mainRef = (0, React.useCallback)(
    (el) => {
      if (!el) return;
      el.scrollTop = seat.current[n] ?? 0;
      // Not on the first paint: arriving at the front door should not put a
      // focus ring on anything she did not touch.
      if (landed.current) el.focus?.({ preventScroll: true });
      landed.current = true;
    },
    [n],
  );
  let edge = useSwipe({
    fromEdge: true,
    onRight: () => {
      if (n !== "landing") back();
    },
  });
  return (0, jsx.jsxs)("div", {
    className: "house",
    ref: frame,
    "data-night": isNightHours() ? "true" : void 0,
    "data-room": n,
    ...edge,
    children: [
      (0, jsx.jsxs)("header", {
        className: "house-bar",
        children: [
          n === "landing"
            ? (0, jsx.jsx)("span", {
                className: "house-mark",
                children: CANON.title,
              })
            : (0, jsx.jsxs)("button", {
                type: "button",
                className: "ghost back",
                onClick: () => o("landing"),
                children: ["← ", ROOM_TITLES[n]],
              }),
          (0, jsx.jsxs)("div", {
            className: "house-bar-tools",
            children: [
              n === "landing" && t.inbox.length > 0
                ? (0, jsx.jsxs)("button", {
                    type: "button",
                    className: "ghost tiny",
                    onClick: () => o("inbox"),
                    children: ["arrived · ", t.inbox.length],
                  })
                : null,
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost tiny",
                onClick: () =>
                  update((e) => {
                    e.sound = !e.sound;
                  }),
                "aria-label": t.sound ? "Turn the sound off" : "Turn the sound on",
                children: t.sound ? "sound" : "quiet",
              }),
              n === "landing"
                ? (0, jsx.jsx)("button", {
                    type: "button",
                    className: "ghost tiny",
                    onClick: () => o("settings"),
                    children: "fuse box",
                  })
                : null,
            ],
          }),
        ],
      }),
      (0, jsx.jsx)(AnimatePresence, {
        mode: "wait",
        children: (0, jsx.jsxs)(
          motion.main,
          {
            className: "house-main",
            ref: mainRef,
            tabIndex: -1,
            "aria-label": n === "landing" ? CANON.title : ROOM_TITLES[n],
            ...roomEntrance(n),
            children: [
              n === "landing"
                ? (0, jsx.jsx)(Landing, {
                    onGo: o,
                    onBeginHour: onBeginHour,
                    steppedOut: steppedOut,
                    onOpenLetter: (id) => {
                      (setOpenLetter(id), o("letters"));
                    },
                    onAnswer: (thing) => {
                      (a({
                        id: `thing-${thing.index}`,
                        open: thing.text,
                      }),
                        o("say"));
                    },
                  })
                : null,
              n === "letters"
                ? (0, jsx.jsx)(LettersRoom, {
                    openId: openLetter,
                    onOpened: () => setOpenLetter(null),
                    onOpenReply: (e, t) => {
                      (a({
                        id: e,
                        open: t,
                      }),
                        o("say"));
                    },
                  })
                : null,
              n === "theday" ? (0, jsx.jsx)(TheDayRoom, {}) : null,
              n === "everything"
                ? (0, jsx.jsx)(EverythingRoom, {
                    onAnswer: (thing) => {
                      (a({
                        id: `thing-${thing.index}`,
                        open: thing.text,
                      }),
                        o("say"));
                    },
                  })
                : null,
              n === "promises" ? (0, jsx.jsx)(PromisesRoom, {}) : null,
              n === "days" ? (0, jsx.jsx)(DaysRoom, {}) : null,
              n === "distance" ? (0, jsx.jsx)(DistanceRoom, {}) : null,
              n === "say"
                ? (0, jsx.jsx)(SayRoom, {
                    answering: i,
                    onClearAnswering: () => a(null),
                  })
                : null,
              n === "settings" ? (0, jsx.jsx)(SettingsRoom, {}) : null,
              n === "days" ? (0, jsx.jsx)(SameHourLedger, {}) : null,
              n === "inbox" ? (0, jsx.jsx)(InboxRoom, {}) : null,
              n === "reel"
                ? (0, jsx.jsx)(ReelRoom, {
                    onWatch: onWatch,
                  })
                : null,
            ],
          },
          n,
        ),
      }),
      n === "landing"
        ? (0, jsx.jsx)("footer", {
            className: "house-foot",
            children: (0, jsx.jsxs)("p", {
              children: [ROOMS.length, " rooms. The lamp is on. — ", CANON.you],
            }),
          })
        : null,
      (0, jsx.jsx)(AnimatePresence, {
        children: keys ? (0, jsx.jsx)(KeyCard, { onClose: () => setKeys(false) }) : null,
      }),
    ],
  });
}
function ReelRoom({ onWatch: onWatch }) {
  let t = useStore(),
    n = buildReel(),
    r = Math.min(t.reelFurthest, n.length - 1),
    i = lastChapterBefore(n, r),
    a = chapterMarks(n),
    o = partMarks(n);
  return (0, jsx.jsxs)("div", {
    className: "reel-room",
    children: [
      (0, jsx.jsx)("p", {
        className: "room-lede",
        children:
          "A hundred chapters, in four parts — the first three years of us, as close as I could get it. A little over half an hour if you sit all the way through, and it keeps your place if you cannot.",
      }),
      i > 1
        ? (0, jsx.jsxs)("button", {
            type: "button",
            className: "solid wide-button",
            onClick: () => onWatch(r),
            children: ["carry on from Chapter ", roman(i)],
          })
        : null,
      (0, jsx.jsx)("button", {
        type: "button",
        className: i > 1 ? "ghost wide-button" : "solid wide-button",
        onClick: () => onWatch(0),
        children: i > 1 ? "start again from the beginning" : "watch it from the start",
      }),
      (0, jsx.jsx)("ul", {
        className: "part-list",
        children: PARTS.map((part) =>
          (0, jsx.jsx)(
            PartCard,
            {
              part: part,
              at: o.find((e) => e.part === part.index)?.at ?? 0,
              read: a.filter((e) => e.part === part.index && e.at <= t.reelFurthest).length,
              onWatch: onWatch,
            },
            part.index,
          ),
        ),
      }),
      (0, jsx.jsxs)("p", {
        className: "fine centre-text",
        children: [
          "Hold a part to see what is in it. Once it is playing, ",
          (0, jsx.jsx)("em", {
            children: "contents",
          }),
          " at the bottom opens the whole thread and takes you to any chapter.",
        ],
      }),
    ],
  });
}
// A part of the picture. Tapped, it plays from there. Held, it opens and
// shows the chapters inside it, so she can decide from the doorway instead of
// having to walk in and find out.
function PartCard({ part: part, at: at, read: read, onWatch: onWatch }) {
  let count = part.to - part.from + 1;
  let [open, setOpen] = (0, React.useState)(false);
  let hold = usePress({
    onHold: () => setOpen((v) => !v),
    onTap: () => onWatch(at),
  });
  let inside = (0, React.useMemo)(
    () => CHAPTERS.filter((c) => c.n >= part.from && c.n <= part.to),
    [part.from, part.to],
  );
  return (0, jsx.jsxs)("li", {
    "data-open": open ? "true" : void 0,
    children: [
      (0, jsx.jsxs)("button", {
        type: "button",
        "data-holding": hold.holding ? "true" : void 0,
        ...hold.handlers,
        children: [
          (0, jsx.jsx)("span", {
            className: "part-list-years",
            children: part.years,
          }),
          (0, jsx.jsx)("span", {
            className: "part-list-title",
            children: part.title,
          }),
          (0, jsx.jsx)("span", {
            className: "part-list-count",
            children: read === 0 ? `${count} chapters` : read >= count ? `all ${count} read` : `${read} of ${count}`,
          }),
        ],
      }),
      (0, jsx.jsx)(AnimatePresence, {
        children: open
          ? (0, jsx.jsx)(motion.ol, {
              className: "part-inside",
              initial: { opacity: 0, height: isStill() ? "auto" : 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: isStill() ? "auto" : 0 },
              transition: { duration: isStill() ? 0.15 : 0.46, ease: EASE_OUT },
              children: inside.map((c) =>
                (0, jsx.jsxs)(
                  "li",
                  {
                    children: [
                      (0, jsx.jsx)("span", {
                        className: "part-inside-n",
                        children: roman(c.n),
                      }),
                      (0, jsx.jsx)("span", {
                        className: "part-inside-line",
                        children: c.title,
                      }),
                    ],
                  },
                  c.n,
                ),
              ),
            })
          : null,
      }),
    ],
  });
}
