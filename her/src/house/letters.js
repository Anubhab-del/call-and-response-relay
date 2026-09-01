// An envelope on the shelf. A tap opens it. A hold — anywhere on it — tells
// her what it is without opening it: the first line if it is hers to read, the
// day it comes if it is not. A hold never breaks a seal and never spends a
// once, so there is nothing on this shelf she can lose by being curious.
function Envelope({ letter: letter, index: index, opened: opened, spent: spent, onOpen: onOpen }) {
  let sealed = letter.kind === "sealed" && !isUnsealed(letter.on);
  let shut = sealed || spent;
  let away = daysUntil(letter.on);
  let [look, setLook] = (0, React.useState)(false);
  let peek = shut
    ? sealed
      ? `Not yet — it opens on ${
          letter.on && letter.on.length === 5
            ? formatParts(nextOccurrence(letter.on, true))
            : formatCivil(letter.on ?? "")
        }, and I cannot bring it forward from here either.`
      : "This one has already been spent. It cannot come back."
    : letter.kind === "once" && !opened
      ? "It opens once, and it is long. Sit down for it."
      : firstLine(letter.body);
  let hold = usePress({
    onHold: () => setLook(true),
    onTap: () => {
      (tapTick(), !shut && onOpen(letter));
    },
  });
  (0, React.useEffect)(() => {
    if (!look) return;
    let id = window.setTimeout(() => setLook(false), 5200);
    return () => window.clearTimeout(id);
  }, [look]);
  return (0, jsx.jsx)(motion.li, {
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
      delay: Math.min(0.5, index * 0.035),
      ease: [0.16, 1, 0.3, 1],
    },
    children: (0, jsx.jsxs)("button", {
      type: "button",
      className: "envelope",
      "data-locked": shut ? "true" : void 0,
      "data-opened": opened ? "true" : void 0,
      "data-once": letter.kind === "once" ? "true" : void 0,
      "data-holding": hold.holding ? "true" : void 0,
      "data-look": look ? "true" : void 0,
      ...hold.handlers,
      "aria-disabled": shut,
      children: [
        (0, jsx.jsx)("span", {
          className: "envelope-flap",
          "aria-hidden": "true",
        }),
        (0, jsx.jsx)("span", {
          className: "envelope-open",
          children: letter.open,
        }),
        (0, jsx.jsx)("span", {
          className: "envelope-state",
          children:
            shut && sealed
              ? nearness(away)
                ? `sealed · ${nearness(away)}`
                : "sealed"
              : spent
                ? "spent"
                : letter.kind === "once"
                  ? opened
                    ? "once, spent"
                    : "once, ever"
                  : opened
                    ? "read · open it again"
                    : "unread",
        }),
        sealed
          ? (0, jsx.jsx)("span", {
              className: "envelope-date",
              children:
                letter.on && letter.on.length === 5
                  ? formatParts(nextOccurrence(letter.on, true))
                  : formatCivil(letter.on ?? ""),
            })
          : null,
        (0, jsx.jsx)(AnimatePresence, {
          children: look
            ? (0, jsx.jsx)(motion.span, {
                className: "envelope-peek",
                initial: { opacity: 0, height: isStill() ? "auto" : 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, height: isStill() ? "auto" : 0 },
                transition: { duration: isStill() ? 0.15 : 0.42, ease: EASE_OUT },
                children: peek,
              })
            : null,
        }),
      ],
    }),
  });
}
// The opening of a letter, cut where it stops being an opening.
function firstLine(body) {
  let first = body.split("\n\n")[0] ?? "";
  let stop = first.search(/[.?!]\s/);
  let line = stop > 0 ? first.slice(0, stop + 1) : first;
  return line.length > 132 ? `${line.slice(0, 129).trimEnd()}…` : line;
}
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
    // Not how many she has opened — that is a progress bar on a shelf of
    // letters. How many are still shut, which is a number that only ever goes
    // down, and one day reads: none of them are sealed any more.
    // A letter marked afterHour is not on the shelf at all until she has
    // stood in the same hour that year. It is not sealed — it is not here.
    hourKept = (letter) =>
      !letter.afterHour ||
      Object.values(t.sameHour ?? {}).some((year) => year?.doneAt),
    shelf = o.filter(hourKept),
    sealedLeft = shelf.filter((e) => e.kind === "sealed" && !isUnsealed(e.on)).length;
  let [walk, setWalk] = (0, React.useState)(0);
  // Walking the shelf never spends anything: it steps between letters she has
  // already been given, and a once she has not broken is not one of them.
  let open = shelf.filter(
    (e) => isUnsealed(e.on) && (e.kind !== "once" || !!t.opened[e.id]),
  );
  let onWalk = (dir) => {
    if (!n || open.length < 2) return;
    let at = open.findIndex((x) => x.id === n.id);
    if (at < 0) return;
    let next = open[(at + dir + open.length) % open.length];
    (tapTick(), setWalk(dir), c(next));
  };
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
          "Some of these open the moment you need them. Some will not open until a particular day arrives — not for you, and not for me either, and I cannot cheat them open from here.",
      }),
      (0, jsx.jsxs)(motion.p, {
        className: "room-fact",
        ...fadeIn(0.15, 0.6),
        children: [
          "There are ",
          numberWord(shelf.length),
          ". ",
          sealedLeft > 0
            ? `${numberWord(sealedLeft)} of them ${sealedLeft === 1 ? "is" : "are"} still sealed.`
            : "None of them are sealed any more.",
          " Hold one to hear how it starts — holding never opens anything.",
        ],
      }),
      (0, jsx.jsx)("ul", {
        className: "shelf",
        children: shelf.map((letter, index) =>
          (0, jsx.jsx)(
            Envelope,
            {
              letter: letter,
              index: index,
              opened: t.opened[letter.id],
              spent: letter.kind === "once" && t.spentOnce && !t.opened[letter.id],
              onOpen: s,
            },
            letter.id,
          ),
        ),
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
                      "After tonight it stays open for you to read as often as you like, but it will never be unread again, and there is no way of putting it back. You do not have to do it today. It will keep.",
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
              onClose: () => (setWalk(0), r(null)),
              onWalk: onWalk,
              walk: walk,
              onReply: () => {
                let t = n;
                (r(null), onOpenReply(t.id, t.open));
              },
            },
            n.id)
          : null,
      }),
    ],
  });
}
function Reading({
  letter: letter,
  openedAt: openedAt,
  onClose: onClose,
  onReply: onReply,
  onWalk: onWalk,
  walk: walk,
}) {
  let paragraphs = letter.body.split("\n\n");
  // The paragraphs arrive one after another, then his name. The tools wait
  // until after that — a letter should not end in a button. Capped, because a
  // pause she cannot get out of is not a pause.
  let signAt = 0.5 + paragraphs.length * 0.18;
  let toolsAt = Math.min(signAt + 1.4, 2.6);
  // The keys and the hand agree: escape or a swipe down puts it back on the
  // shelf, the arrows or a sideways swipe move to the letter next to it.
  (0, React.useEffect)(() => {
    let onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") (e.stopPropagation(), onClose());
      else if (e.key === "ArrowRight") (e.stopPropagation(), onWalk?.(1));
      else if (e.key === "ArrowLeft") (e.stopPropagation(), onWalk?.(-1));
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, onWalk]);
  let swipe = useSwipe({
    onDown: onClose,
    onLeft: () => onWalk?.(1),
    onRight: () => onWalk?.(-1),
  });
  let sheet = (0, React.useRef)(null);
  useThumbLight(sheet);
  // Opening a letter moves her keyboard into it, and closing it puts her back
  // on the envelope she came from — never at the top of the shelf.
  (0, React.useEffect)(() => {
    let came = document.activeElement;
    sheet.current?.focus?.({ preventScroll: true });
    return () => came?.focus?.({ preventScroll: true });
  }, []);
  // Coming from the right means she went forward; the page enters from that
  // side and leaves to the other, so the shelf keeps its direction.
  let from = walk > 0 ? 1 : walk < 0 ? -1 : 0;
  return (0, jsx.jsx)(motion.div, {
    className: "reading",
    ref: sheet,
    initial: {
      opacity: 0,
      x: isStill() ? 0 : from * 34,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: isStill() ? 0 : from * -22,
    },
    transition: {
      duration: isStill() ? 0.18 : 0.4,
      ease: EASE_OUT,
    },
    role: "dialog",
    "aria-modal": "true",
    tabIndex: -1,
    "aria-label": letter.open,
    "data-swipe": "own",
    ...swipe,
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
              children: ["first opened ", formatStamp(openedAt)],
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
