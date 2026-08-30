function LettersRoom({ onOpenReply: e }) {
  let t = useStore(),
    [n, r] = (0, React.useState)(null),
    [i, a] = (0, React.useState)(null),
    o = (0, React.useMemo)(() => [...LETTERS].sort((e, t) => (e.weight ?? 50) - (t.weight ?? 50)), []),
    s = (e) => {
      if (e.kind === `once` && !t.opened[e.id]) {
        a(e);
        return;
      }
      c(e);
    },
    c = (e) => {
      (tapKept(),
        score.setCue(`letter`),
        update((t) => {
          (t.opened[e.id] || (t.opened[e.id] = Date.now()), e.kind === `once` && (t.spentOnce = !0));
        }),
        a(null),
        r(e));
    },
    l = o.filter((e) => t.opened[e.id]).length;
  return (0, jsx.jsxs)(`div`, {
    className: `letters`,
    children: [
      (0, jsx.jsx)(motion.p, {
        className: `room-lede`,
        ...fadeIn(0, 0.6),
        children: `Some of these open when you need them. Some will not open until a day arrives — not for you, and not for me either.`,
      }),
      (0, jsx.jsxs)(motion.p, {
        className: `room-count`,
        ...fadeIn(0.15, 0.6),
        children: [l, ` of `, o.length, ` opened`],
      }),
      (0, jsx.jsx)(`ul`, {
        className: `shelf`,
        children: o.map((e, n) => {
          let r = isUnsealed(e.on),
            i = !!t.opened[e.id],
            a = e.kind === `once` && t.spentOnce && !i,
            o = daysUntil(e.on),
            c = (e.kind === `sealed` && !r) || a;
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
              children: (0, jsx.jsxs)(`button`, {
                type: `button`,
                className: `envelope`,
                "data-locked": c ? `true` : void 0,
                "data-opened": i ? `true` : void 0,
                "data-once": e.kind === `once` ? `true` : void 0,
                onClick: () => {
                  (tapTick(), !c && s(e));
                },
                "aria-disabled": c,
                children: [
                  (0, jsx.jsx)(`span`, {
                    className: `envelope-flap`,
                    "aria-hidden": `true`,
                  }),
                  (0, jsx.jsx)(`span`, {
                    className: `envelope-open`,
                    children: e.open,
                  }),
                  (0, jsx.jsx)(`span`, {
                    className: `envelope-state`,
                    children:
                      c && e.kind === `sealed`
                        ? `sealed · ${o} ${o === 1 ? `day` : `days`}`
                        : a
                          ? `spent`
                          : i
                            ? `read · open it again`
                            : e.kind === `once`
                              ? `once, ever`
                              : `unread`,
                  }),
                  e.kind === `sealed` && !r
                    ? (0, jsx.jsx)(`span`, {
                        className: `envelope-date`,
                        children:
                          e.on && e.on.length === 5
                            ? formatParts(nextOccurrence(e.on, !0))
                            : formatCivil(e.on ?? ``),
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
              className: `scrim`,
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
                className: `confirm`,
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
                  (0, jsx.jsx)(`p`, {
                    className: `confirm-title`,
                    children: `This one opens once.`,
                  }),
                  (0, jsx.jsx)(`p`, {
                    className: `confirm-body`,
                    children: `After this it stays open for you to read again, but it will never be unread. There is no way to put it back. You do not have to do it today.`,
                  }),
                  (0, jsx.jsxs)(`div`, {
                    className: `confirm-row`,
                    children: [
                      (0, jsx.jsx)(`button`, {
                        type: `button`,
                        className: `ghost`,
                        onClick: () => a(null),
                        children: `not yet`,
                      }),
                      (0, jsx.jsx)(`button`, {
                        type: `button`,
                        className: `solid`,
                        onClick: () => c(i),
                        children: `break the seal`,
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
                (r(null), e(t.id, t.open));
              },
            })
          : null,
      }),
    ],
  });
}

function Reading({ letter: e, openedAt: t, onClose: n, onReply: r }) {
  return (0, jsx.jsx)(motion.div, {
    className: `reading`,
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
    role: `dialog`,
    "aria-label": e.open,
    children: (0, jsx.jsxs)(`div`, {
      className: `reading-inner`,
      children: [
        (0, jsx.jsx)(motion.p, {
          className: `reading-open`,
          ...fadeIn(0.1, 0.6),
          children: e.open,
        }),
        e.body
          .split(
            `

`,
          )
          .map((e, t) =>
            (0, jsx.jsx)(
              motion.p,
              {
                className: `reading-para`,
                ...fadeIn(0.3 + t * 0.18, 0.7),
                children: e,
              },
              t,
            ),
          ),
        (0, jsx.jsxs)(motion.p, {
          className: `reading-sign`,
          ...riseIn(
            0.5 +
              e.body.split(`

`).length *
                0.18,
          ),
          children: [`— `, CANON.you],
        }),
        t
          ? (0, jsx.jsxs)(`p`, {
              className: `reading-meta`,
              children: [`first opened `, new Date(t).toLocaleDateString()],
            })
          : null,
        (0, jsx.jsxs)(`div`, {
          className: `reading-tools`,
          children: [
            (0, jsx.jsx)(`button`, {
              type: `button`,
              className: `ghost`,
              onClick: r,
              children: `answer this`,
            }),
            (0, jsx.jsx)(`button`, {
              type: `button`,
              className: `solid`,
              onClick: n,
              children: `close it`,
            }),
          ],
        }),
      ],
    }),
  });
}
