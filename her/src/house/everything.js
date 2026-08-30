function EverythingRoom() {
  let e = useStore(),
    t = todayNumber(),
    n = shardForDay(),
    r = e.pulls[String(t)] ?? 0,
    [i, a] = (0, React.useState)([]),
    [o, s] = (0, React.useState)(""),
    c = Object.keys(e.collected).length,
    l = Math.max(0, 3 - r),
    u = (0, React.useMemo)(() => {
      let e = o.trim().toLowerCase();
      return e.length < 2
        ? []
        : EVERYTHING.map((e, t) => ({
            text: e,
            index: t,
          }))
            .filter((t) => t.text.toLowerCase().includes(e))
            .slice(0, 40);
    }, [o]),
    d = (e) => {
      update((t) => {
        t.collected[String(e)] || (t.collected[String(e)] = Date.now());
      });
    };
  (0, React.useEffect)(() => {
    d(n.index);
  }, [n.index]);
  let f = () => {
    if (l <= 0) return;
    tapTick();
    let e = extraShard(t, r + i.length);
    (a((t) => [...t, e]),
      d(e.index),
      update((e) => {
        e.pulls[String(t)] = (e.pulls[String(t)] ?? 0) + 1;
      }));
  };
  return (0, jsx.jsxs)("div", {
    className: "everything",
    children: [
      (0, jsx.jsxs)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children: [
          "One a day. The same one on your phone as on mine. There are ",
          EVERYTHING.length,
          " of them, which is a year and a bit.",
        ],
      }),
      (0, jsx.jsxs)(motion.blockquote, {
        className: "thing today",
        ...riseIn(0.15),
        children: [
          (0, jsx.jsx)("p", {
            children: n.text,
          }),
          (0, jsx.jsx)("cite", {
            children: "today",
          }),
        ],
      }),
      i.map((e, t) =>
        (0, jsx.jsx)(
          motion.blockquote,
          {
            className: "thing",
            initial: {
              opacity: 0,
              y: 12,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            },
            children: (0, jsx.jsx)("p", {
              children: e.text,
            }),
          },
          `${e.index}-${t}`,
        ),
      ),
      (0, jsx.jsxs)(motion.div, {
        className: "jar",
        ...fadeIn(0.4, 0.7),
        children: [
          (0, jsx.jsx)("div", {
            className: "jar-bar",
            "aria-hidden": "true",
            children: (0, jsx.jsx)("span", {
              style: {
                transform: `scaleX(${Math.min(1, c / EVERYTHING.length)})`,
              },
            }),
          }),
          (0, jsx.jsxs)("p", {
            className: "jar-text",
            children: [c, " of ", EVERYTHING.length, " found"],
          }),
        ],
      }),
      (0, jsx.jsx)("div", {
        className: "pull-row",
        children: (0, jsx.jsx)("button", {
          type: "button",
          className: "solid",
          onClick: f,
          disabled: l <= 0,
          children: l > 0 ? `one more (${l} left today)` : "that is all for today",
        }),
      }),
      (0, jsx.jsxs)("div", {
        className: "search",
        children: [
          (0, jsx.jsx)("label", {
            htmlFor: "everything-search",
            children: "Look for something",
          }),
          (0, jsx.jsx)("input", {
            id: "everything-search",
            type: "search",
            value: o,
            placeholder: "a word you remember",
            onChange: (e) => s(e.target.value),
            autoComplete: "off",
          }),
          o.trim().length >= 2
            ? (0, jsx.jsx)("p", {
                className: "search-count",
                children: u.length === 0 ? "nothing with that word" : `${u.length} found`,
              })
            : null,
          (0, jsx.jsx)("ul", {
            className: "search-results",
            children: u.map((e) =>
              (0, jsx.jsx)(
                "li",
                {
                  children: e.text,
                },
                e.index,
              ),
            ),
          }),
        ],
      }),
    ],
  });
}
