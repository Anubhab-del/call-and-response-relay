function LettersRoom({ onOpenReply: onOpenReply, openId: openId, onOpened: onOpened }) {
  let t = useStore(),
    [n, r] = (0, React.useState)(null),
    [i, a] = (0, React.useState)(null),
    o = (0, React.useMemo)(() => [...LETTERS].sort((e, t) => (e.weight ?? 50) - (t.weight ?? 50)), []),
    s = (e) => {
      if (e.kind === "once" && !t.opened[e.id]) {
        a(e);
        return;
      }
      c(e);
    },
    c = (e) => {
      (tapKept(),
        score.setCue("letter"),
        update((t) => {
          (t.opened[e.id] || (t.opened[e.id] = Date.now()), e.kind === "once" && (t.spentOnce = true));
        }),
        a(null),
        r(e));
    },
    l = o.filter((e) => t.opened[e.id]).length;
  // The house can send her straight to one — the small-hours line does.
  (0, React.useEffect)(() => {
    if (!openId) return;
    let letter = o.find((x) => x.id === openId);
    onOpened?.();
    if (!letter || letter.kind === "once" || !isUnsealed(letter.on)) return;
    c(letter);
  }, [openId]);
  return (0, jsx.jsxs)("div", {
    className: "letters",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children:
          "Some of these open when you need them. Some will not open until a day arrives — not for you, and not for me either.",
      }),
      (0, jsx.jsxs)(motion.p, {
        className: "room-count",
        ...fadeIn(0.15, 0.6),
        children: [l, " of ", o.length, " opened"],
      }),
      (0, jsx.jsx)("ul", {
        className: "shelf",
        children: o.map((e, n) => {
          let r = isUnsealed(e.on),
            i = !!t.opened[e.id],
            a = e.kind === "once" && t.spentOnce && !i,
            o = daysUntil(e.on),
            c = (e.kind === "sealed" && !r) || a;
          return (0, jsx.jsx)(
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
                delay: Math.min(0.5, n * 0.035),
                ease: [0.16, 1, 0.3, 1],
              },
              children: (0, jsx.jsxs)("button", {
                type: "button",
                className: "envelope",
                "data-locked": c ? "true" : void 0,
                "data-opened": i ? "true" : void 0,
                "data-once": e.kind === "once" ? "true" : void 0,
                onClick: () => {
                  (tapTick(), !c && s(e));
                },
                "aria-disabled": c,
                children: [
                  (0, jsx.jsx)("span", {
                    className: "envelope-flap",
                    "aria-hidden": "true",
                  }),
                  (0, jsx.jsx)("span", {
                    className: "envelope-open",
                    children: e.open,
                  }),
                  (0, jsx.jsx)("span", {
                    className: "envelope-state",
                    children:
                      c && e.kind === "sealed"
                        ? nearness(o)
                          ? `sealed · ${nearness(o)}`
                          : "sealed"
                        : a
                          ? "spent"
                          : e.kind === "once"
                            ? i
                              ? "once, spent"
                              : "once, ever"
                            : i
                              ? "read · open it again"
                              : "unread",
                  }),
                  e.kind === "sealed" && !r
                    ? (0, jsx.jsx)("span", {
                        className: "envelope-date",
                        children:
                          e.on && e.on.length === 5
                            ? formatParts(nextOccurrence(e.on, true))
                            : formatCivil(e.on ?? ""),
                      })
                    : null,
                ],
              }),
            },
            e.id,
          );
        }),
      }),
      (0, jsx.jsx)(AnimatePresence, {
        children: i
          ? (0, jsx.jsx)(motion.div, {
              className: "scrim",
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 1,
              },
              exit: {
                opacity: 0,
              },
              onClick: () => a(null),
              children: (0, jsx.jsxs)(motion.div, {
                className: "confirm",
                onClick: (e) => e.stopPropagation(),
                initial: {
                  opacity: 0,
                  y: 18,
                },
                animate: {
                  opacity: 1,
                  y: 0,
                },
                exit: {
                  opacity: 0,
                  y: 18,
                },
                children: [
                  (0, jsx.jsx)("p", {
                    className: "confirm-title",
                    children: "This one opens once.",
                  }),
                  (0, jsx.jsx)("p", {
                    className: "confirm-body",
                    children:
                      "After this it stays open for you to read again, but it will never be unread. There is no way to put it back. You do not have to do it today.",
                  }),
                  (0, jsx.jsxs)("div", {
                    className: "confirm-row",
                    children: [
                      (0, jsx.jsx)("button", {
                        type: "button",
                        className: "ghost",
                        onClick: () => a(null),
                        children: "not yet",
                      }),
                      (0, jsx.jsx)("button", {
                        type: "button",
                        className: "solid",
                        onClick: () => c(i),
                        children: "break the seal",
                      }),
                    ],
                  }),
                ],
              }),
            })
          : null,
      }),
      (0, jsx.jsx)(AnimatePresence, {
        children: n
          ? (0, jsx.jsx)(Reading, {
              letter: n,
              openedAt: t.opened[n.id],
              onClose: () => r(null),
              onReply: () => {
                let t = n;
                (r(null), onOpenReply(t.id, t.open));
              },
            })
          : null,
      }),
    ],
  });
}
function Reading({ letter: letter, openedAt: openedAt, onClose: onClose, onReply: onReply }) {
  let paragraphs = letter.body.split("\n\n");
  // The paragraphs arrive one after another, then his name. The tools wait
  // until after that — a letter should not end in a button. Capped, because a
  // pause she cannot get out of is not a pause.
  let signAt = 0.5 + paragraphs.length * 0.18;
  let toolsAt = Math.min(signAt + 1.4, 2.6);
  (0, React.useEffect)(() => {
    let onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (0, jsx.jsx)(motion.div, {
    className: "reading",
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
    transition: {
      duration: 0.4,
    },
    role: "dialog",
    "aria-label": letter.open,
    children: (0, jsx.jsxs)("div", {
      className: "reading-inner",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "reading-open",
          ...fadeIn(0.1, 0.6),
          children: letter.open,
        }),
        paragraphs.map((e, t) =>
            (0, jsx.jsx)(
              motion.p,
              {
                className: "reading-para",
                ...fadeIn(0.3 + t * 0.18, 0.7),
                children: e,
              },
              t,
            ),
          ),
        (0, jsx.jsxs)(motion.p, {
          className: "reading-sign",
          ...riseIn(signAt),
          children: ["— ", CANON.you],
        }),
        openedAt
          ? (0, jsx.jsxs)(motion.p, {
              className: "reading-meta",
              ...fadeIn(Math.min(signAt + 0.9, 2.1), 1),
              children: ["first opened ", new Date(openedAt).toLocaleDateString()],
            })
          : null,
        (0, jsx.jsxs)(motion.div, {
          className: "reading-tools",
          ...fadeIn(toolsAt, 1.1),
          children: [
            (0, jsx.jsx)("button", {
              type: "button",
              className: "ghost",
              onClick: onReply,
              children: "answer this",
            }),
            (0, jsx.jsx)("button", {
              type: "button",
              className: "solid",
              onClick: onClose,
              children: "close it",
            }),
          ],
        }),
      ],
    }),
  });
}
