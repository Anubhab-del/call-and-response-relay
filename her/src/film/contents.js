var CHAPTER_COUNT = CHAPTERS.length;
var THREAD_TOP = 52;
var THREAD_STEP = 78;
var THREAD_BOTTOM = 46;
var THREAD_EDGE = 15;
function Contents({
  index: index,
  furthest: furthest,
  positions: positions,
  onGo: onGo,
  onClose: onClose,
  onLeave: onLeave,
}) {
  let a = (0, React.useRef)(null),
    o = (0, React.useRef)(null),
    s = (0, React.useMemo)(() => {
      let e = [],
        t = 0;
      for (let r of PARTS) {
        (e.push({
          kind: "part",
          part: r.index,
          y: t,
        }),
          (t += THREAD_STEP));
        for (let i of CHAPTERS)
          i.part === r.index &&
            (e.push({
              kind: "chapter",
              n: i.n,
              title: i.title,
              at: positions.get(i.n) ?? 0,
              y: t + THREAD_TOP / 2,
              scene: i.scene,
            }),
            (t += THREAD_TOP));
      }
      return {
        rows: e,
        height: t + 92,
      };
    }, [positions]),
    c = (0, React.useMemo)(() => {
      let e = s.rows.filter((e) => e.kind === "chapter");
      if (e.length === 0)
        return {
          d: "",
          x: () => THREAD_BOTTOM / 2,
        };
      let t = (e) =>
          THREAD_BOTTOM / 2 +
          Math.sin(e * 0.42) * THREAD_EDGE +
          Math.sin(e * 0.11) * (THREAD_EDGE * 0.5),
        n = `M ${t(e[0].n).toFixed(2)} 0`;
      for (let r of e) n += ` L ${t(r.n).toFixed(2)} ${r.y.toFixed(1)}`;
      return (
        (n += ` L ${t(e[e.length - 1].n).toFixed(2)} ${s.height}`),
        {
          d: n,
          x: t,
        }
      );
    }, [s]);
  (0, React.useEffect)(() => {
    let e = o.current,
      t = a.current;
    !e || !t || (t.scrollTop = Math.max(0, e.offsetTop - t.clientHeight * 0.42));
  }, []);
  let l = Math.max(index, furthest);
  // The thread draws itself when the sheet opens. She has come this far along
  // it; the line should run to where she is rather than be waiting there.
  let reached = Math.min(1, threadProgress(s.rows, l));
  let [lit, setLit] = (0, React.useState)(() => (isStill() ? reached : 0));
  (0, React.useEffect)(() => {
    if (isStill()) {
      setLit(reached);
      return;
    }
    let frame = requestAnimationFrame(() => setLit(reached));
    return () => cancelAnimationFrame(frame);
  }, [reached]);
  return (0, jsx.jsxs)(motion.div, {
    className: "contents",
    initial: {
      opacity: 0,
      y: 26,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 26,
    },
    transition: {
      duration: 0.34,
      ease: [0.16, 1, 0.3, 1],
    },
    role: "dialog",
    "aria-label": "Contents",
    children: [
      (0, jsx.jsxs)("div", {
        className: "contents-bar",
        children: [
          (0, jsx.jsx)("p", {
            className: "contents-title",
            children: "One hundred chapters",
          }),
          (0, jsx.jsx)("button", {
            type: "button",
            className: "ghost tiny",
            onClick: onClose,
            children: "close",
          }),
        ],
      }),
      (0, jsx.jsx)("div", {
        className: "contents-scroll",
        ref: a,
        children: (0, jsx.jsxs)("div", {
          className: "contents-inner",
          style: {
            height: s.height,
          },
          children: [
            (0, jsx.jsxs)("svg", {
              className: "thread",
              width: THREAD_BOTTOM,
              height: s.height,
              viewBox: `0 0 ${THREAD_BOTTOM} ${s.height}`,
              preserveAspectRatio: "none",
              "aria-hidden": "true",
              children: [
                (0, jsx.jsx)("path", {
                  d: c.d,
                  className: "thread-line",
                }),
                (0, jsx.jsx)("path", {
                  d: c.d,
                  className: "thread-lit",
                  style: {
                    strokeDasharray: s.height * 2,
                    strokeDashoffset: s.height * 2 - s.height * 2 * lit,
                  },
                }),
              ],
            }),
            s.rows.map((t) =>
              t.kind === "part"
                ? (0, jsx.jsxs)(
                    "div",
                    {
                      className: "contents-part",
                      style: {
                        top: t.y,
                      },
                      children: [
                        (0, jsx.jsx)("span", {
                          className: "contents-part-years",
                          children: PARTS[t.part].years,
                        }),
                        (0, jsx.jsx)("span", {
                          className: "contents-part-title",
                          children: PARTS[t.part].title,
                        }),
                      ],
                    },
                    `p${t.part}`,
                  )
                : (0, jsx.jsxs)(
                    "button",
                    {
                      ref: t.at === index ? o : void 0,
                      type: "button",
                      className: "contents-row",
                      "data-here": t.at === index ? "true" : void 0,
                      "data-reached": t.at <= l ? "true" : void 0,
                      "data-scene": t.scene ? "true" : void 0,
                      style: {
                        top: t.y - THREAD_TOP / 2,
                        height: THREAD_TOP,
                      },
                      onClick: () => {
                        (tapTick(), onGo(t.at));
                      },
                      children: [
                        (0, jsx.jsx)("span", {
                          className: "contents-node",
                          style: {
                            left: c.x(t.n) - 4,
                          },
                          "aria-hidden": "true",
                        }),
                        (0, jsx.jsx)("span", {
                          className: "contents-n",
                          children: roman(t.n),
                        }),
                        (0, jsx.jsx)("span", {
                          className: "contents-label",
                          children: t.title,
                        }),
                      ],
                    },
                    t.n,
                  ),
            ),
            // Past the last chapter, the door. Buried on purpose: she should
            // have to go looking, and then find it without being told twice.
            onLeave
              ? (0, jsx.jsx)("button", {
                  type: "button",
                  className: "contents-leave",
                  style: {
                    top: s.height - 4,
                  },
                  onClick: onLeave,
                  children: "The picture keeps your place. The house is through here.",
                })
              : null,
          ],
        }),
      }),
    ],
  });
}
function threadProgress(e, t) {
  let n = e.filter((e) => e.kind === "chapter");
  if (n.length === 0) return 0;
  let r = 0;
  return (
    n.forEach((e, n) => {
      e.at <= t && (r = n + 1);
    }),
    r / n.length
  );
}
