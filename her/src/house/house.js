var ROOM_TITLES = {
  landing: "",
  letters: "Letters",
  everything: "Everything",
  promises: "Promises",
  days: "Your days",
  distance: "The distance",
  say: "Say something",
  reel: "The picture",
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
  let o = (0, React.useCallback)((e) => {
    (tapTick(),
      r(e),
      // The room scrolls, not the window — a room she has already read part of
      // should not open half-way down.
      frame.current?.querySelector(".house-main")?.scrollTo?.({ top: 0 }),
      window.scrollTo?.({
        top: 0,
      }));
  }, []);
  // Back is back, from anywhere: escape, the arrow before the first room, or
  // a thumb dragged in from the left edge the way a phone expects.
  let back = (0, React.useCallback)(() => {
    if (n === "landing") return;
    (tapTick(), r("landing"));
  }, [n]);
  useHouseKeys({
    room: n,
    onGo: o,
    onBack: back,
    onKeys: (0, React.useCallback)(() => setKeys((v) => !v), []),
    enabled: !keys,
  });
  useThumbLight(frame);
  // A room she asked for should also be the room her keyboard is in. Skipped
  // on the first paint, so arriving at the front door does not put a focus
  // ring on anything she did not touch.
  let landed = (0, React.useRef)(false);
  (0, React.useEffect)(() => {
    if (!landed.current) {
      landed.current = true;
      return;
    }
    frame.current?.querySelector(".house-main")?.focus?.({ preventScroll: true });
  }, [n]);
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
            tabIndex: -1,
            "aria-label": n === "landing" ? CANON.title : ROOM_TITLES[n],
            initial: {
              opacity: 0,
              y: isStill() ? 0 : 14,
            },
            animate: {
              opacity: 1,
              y: 0,
              transition: isStill() ? T_FAST : T_ROOM_IN,
            },
            exit: {
              opacity: 0,
              y: isStill() ? 0 : -8,
              transition: isStill() ? T_FAST : T_ROOM_OUT,
            },
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
          "A hundred chapters, in four parts — three years of us, as close as I could get it. About half an hour if you sit all the way through, and it keeps your place if you cannot.",
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
