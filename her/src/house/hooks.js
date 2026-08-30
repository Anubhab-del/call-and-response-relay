function useStore() {
  let [e, t] = (0, React.useState)(snapshot);
  return ((0, React.useEffect)(() => subscribe(t), []), e);
}

function useMinuteTick() {
  let [e, t] = (0, React.useState)(0);
  return (
    (0, React.useEffect)(() => {
      let e = window.setInterval(() => t((e) => e + 1), 6e4),
        n = () => {
          document.hidden || t((e) => e + 1);
        };
      return (
        document.addEventListener(`visibilitychange`, n),
        () => {
          (window.clearInterval(e), document.removeEventListener(`visibilitychange`, n));
        }
      );
    }, []),
    e
  );
}

function DayRing({ fill: e, size: t = 132 }) {
  let n = (0, React.useRef)(null);
  return (
    (0, React.useEffect)(() => {
      let t = n.current;
      if (!t) return;
      let r = 2 * Math.PI * 46;
      if (((t.style.strokeDasharray = `${r}`), isStill())) {
        t.style.strokeDashoffset = `${r * (1 - e)}`;
        return;
      }
      t.style.strokeDashoffset = `${r}`;
      let i = performance.now(),
        a = 0,
        o = (n) => {
          let s = Math.min(1, (n - i) / 1600),
            c = 1 - (1 - s) ** 3;
          ((t.style.strokeDashoffset = `${r * (1 - e * c)}`), s < 1 && (a = requestAnimationFrame(o)));
        };
      return ((a = requestAnimationFrame(o)), () => cancelAnimationFrame(a));
    }, [e]),
    (0, jsx.jsxs)(`svg`, {
      className: `days-ring`,
      viewBox: `0 0 100 100`,
      width: t,
      height: t,
      "aria-hidden": `true`,
      children: [
        (0, jsx.jsx)(`circle`, {
          cx: `50`,
          cy: `50`,
          r: `46`,
          className: `days-track`,
        }),
        (0, jsx.jsx)(`circle`, {
          ref: n,
          cx: `50`,
          cy: `50`,
          r: `46`,
          className: `days-fill`,
        }),
      ],
    })
  );
}
