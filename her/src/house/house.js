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
    [openLetter, setOpenLetter] = (0, React.useState)(null);
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
  let o = (e) => {
    (tapTick(),
      r(e),
      window.scrollTo?.({
        top: 0,
      }));
  };
  return (0, jsx.jsxs)("div", {
    className: "house",
    "data-night": isNightHours() ? "true" : void 0,
    "data-room": n,
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
              n === "everything" ? (0, jsx.jsx)(EverythingRoom, {}) : null,
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
        children: PARTS.map((n) => {
          let r = o.find((e) => e.part === n.index)?.at ?? 0,
            i = a.filter((e) => e.part === n.index && e.at <= t.reelFurthest).length,
            s = n.to - n.from + 1;
          return (0, jsx.jsx)(
            "li",
            {
              children: (0, jsx.jsxs)("button", {
                type: "button",
                onClick: () => onWatch(r),
                children: [
                  (0, jsx.jsx)("span", {
                    className: "part-list-years",
                    children: n.years,
                  }),
                  (0, jsx.jsx)("span", {
                    className: "part-list-title",
                    children: n.title,
                  }),
                  (0, jsx.jsx)("span", {
                    className: "part-list-count",
                    children: i === 0 ? `${s} chapters` : i >= s ? `all ${s} read` : `${i} of ${s}`,
                  }),
                ],
              }),
            },
            n.index,
          );
        }),
      }),
      (0, jsx.jsxs)("p", {
        className: "fine centre-text",
        children: [
          "Once it is playing, ",
          (0, jsx.jsx)("em", {
            children: "contents",
          }),
          " at the bottom opens the whole thread and takes you to any chapter.",
        ],
      }),
    ],
  });
}
