var EASE_FILM = [0.16, 1, 0.3, 1];

var PACE = 105;

var PACE_CAP = 1250;

function paceFor(e, t) {
  return Math.min(t, Math.max(38, PACE_CAP / Math.max(1, e)));
}

function Lines({ text: e, delay: t = 0, className: n, pace: r = PACE }) {
  if (isStill())
    return (0, jsx.jsx)(motion.p, {
      className: n,
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
      },
      transition: {
        duration: 0.24,
        delay: t * 0.4,
      },
      children: e,
    });
  let i = e.split(` `),
    a = paceFor(i.length, r),
    o = !isLean();
  return (0, jsx.jsx)(`p`, {
    className: n,
    children: i.map((e, n) =>
      (0, jsx.jsxs)(
        motion.span,
        {
          className: `word`,
          initial: {
            opacity: 0,
            y: 6,
            filter: o ? `blur(5px)` : `none`,
          },
          animate: {
            opacity: 1,
            y: 0,
            filter: `blur(0px)`,
          },
          transition: {
            duration: 0.62,
            delay: t + (n * a) / 1e3,
            ease: EASE_FILM,
          },
          children: [e, n < i.length - 1 ? ` ` : ``],
        },
        `${e}-${n}`,
      ),
    ),
  });
}

function Heading({ text: e, delay: t = 0, className: n, pace: r = 58 }) {
  return isStill() || isLean()
    ? (0, jsx.jsx)(motion.h2, {
        className: n,
        initial: {
          opacity: 0,
          y: 8,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
        transition: {
          duration: 0.7,
          delay: t,
          ease: EASE_FILM,
        },
        children: e,
      })
    : (0, jsx.jsx)(`h2`, {
        className: n,
        children: e.split(``).map((e, n) =>
          (0, jsx.jsx)(
            motion.span,
            {
              className: `glyph`,
              initial: {
                opacity: 0,
                filter: `blur(7px)`,
              },
              animate: {
                opacity: 1,
                filter: `blur(0px)`,
              },
              transition: {
                duration: 0.5,
                delay: t + (n * r) / 1e3,
                ease: EASE_FILM,
              },
              children: e === ` ` ? `\xA0` : e,
            },
            n,
          ),
        ),
      });
}

function readSeconds(e, t = PACE) {
  if (isStill()) return 0.24;
  let n = e.split(` `).length;
  return (n * paceFor(n, t)) / 1e3 + 0.62;
}

var NAME_HOLD = 1500;

var LAST_HOLD = 1600;

var CODA_HOLD = 1400;

function NameCanvas({ text: e, onDone: t }) {
  let n = (0, React.useRef)(null);
  return (
    (0, React.useEffect)(() => {
      let r = n.current;
      if (!r) return;
      let i = r.getContext(`2d`, {
        alpha: !0,
      });
      if (!i || isStill()) return;
      let a = 0,
        o = !1,
        s = 0,
        c = 0,
        l = isLean();
      return (
        (async () => {
          try {
            await document.fonts?.ready;
          } catch {}
          if (o) return;
          let n = r.parentElement;
          if (!n) return;
          ((s = n.clientWidth), (c = n.clientHeight));
          let u = cappedPixelRatio(isLean() ? 1.25 : 1.75);
          ((r.width = Math.max(1, Math.floor(s * u))),
            (r.height = Math.max(1, Math.floor(c * u))),
            (r.style.width = `${s}px`),
            (r.style.height = `${c}px`),
            i.setTransform(u, 0, 0, u, 0, 0));
          let d = document.createElement(`canvas`);
          ((d.width = Math.max(1, Math.floor(s))), (d.height = Math.max(1, Math.floor(c))));
          let f = d.getContext(`2d`, {
            willReadFrequently: !0,
          });
          if (!f) return;
          let p = Math.min(s * 0.9, c * 0.42);
          ((f.font = `italic ${Math.max(44, Math.round(p / Math.max(2.3, e.length * 0.46)))}px "Cormorant Garamond", Georgia, serif`),
            (f.textAlign = `center`),
            (f.textBaseline = `middle`),
            (f.fillStyle = `#fff`),
            f.fillText(e, s / 2, c / 2));
          let m = f.getImageData(0, 0, d.width, d.height).data,
            h = [];
          for (let e = 0; e < d.height; e += 3)
            for (let t = 0; t < d.width; t += 3)
              m[(e * d.width + t) * 4 + 3] > 130 &&
                h.push({
                  x: t,
                  y: e,
                });
          if (h.length === 0) return;
          let g = l ? 520 : 1e3,
            _ = [],
            v = Math.max(1, h.length / g);
          for (let e = 0; e < h.length; e += v) _.push(h[Math.floor(e)]);
          let y = _.map((e) => ({
              x: e.x + (Math.random() - 0.5) * s * 0.5,
              y: -20 - Math.random() * c * 0.8,
              tx: e.x,
              ty: e.y,
              fx: (Math.random() - 0.5) * s * 0.3,
              vy: 90 + Math.random() * 150,
              r: (l ? 1.25 : 1) + Math.random() * 1.5,
              a: 0.55 + Math.random() * 0.45,
              wob: Math.random() * Math.PI * 2,
            })),
            b = performance.now(),
            x = !1,
            S = (e) => {
              if (((a = requestAnimationFrame(S)), document.hidden)) return;
              let n = e - b;
              i.clearRect(0, 0, s, c);
              for (let t of y) {
                let r = t.x,
                  a = t.y,
                  o = 0;
                if (n < NAME_HOLD) {
                  let e = n / NAME_HOLD,
                    i = 1 - (1 - e) ** 3;
                  ((r = t.x + (t.tx - t.x) * i),
                    (a = t.y + (t.ty - t.y) * i),
                    (o = t.a * Math.min(1, e * 2.2)));
                } else if (n < 3100) {
                  let i = (n - NAME_HOLD) / LAST_HOLD;
                  ((r = t.tx + Math.sin(e * 0.0016 + t.wob) * 0.7),
                    (a = t.ty + Math.cos(e * 0.0013 + t.wob) * 0.7),
                    (o = t.a * (1 - 0.12 * Math.sin(i * Math.PI))));
                } else {
                  let e = Math.min(1, (n - NAME_HOLD - LAST_HOLD) / CODA_HOLD);
                  ((r = t.tx + t.fx * e * e),
                    (a = t.ty + t.vy * e * e * 2.4),
                    (o = t.a * (1 - e) ** 1.5));
                }
                o <= 0.01 ||
                  (l ||
                    ((i.globalAlpha = Math.min(1, o * 0.22)),
                    (i.fillStyle = `rgba(186, 214, 255, 1)`),
                    i.beginPath(),
                    i.ellipse(r, a, t.r * 1.9, t.r * 2.3, 0, 0, Math.PI * 2),
                    i.fill()),
                  (i.globalAlpha = Math.min(1, o)),
                  (i.fillStyle = `rgba(240, 249, 255, 1)`),
                  i.beginPath(),
                  i.ellipse(r, a, t.r * 0.66, t.r * 1.2, 0, 0, Math.PI * 2),
                  i.fill());
              }
              if (n > NAME_HOLD * 0.6 && n < 3400) {
                let e = Math.min(1, (n - NAME_HOLD * 0.6) / 600) * (n > 3100 ? 0.3 : 1),
                  t = i.createRadialGradient(s / 2, c / 2, 0, s / 2, c / 2, Math.max(s, c) * 0.34);
                (t.addColorStop(0, `rgba(190, 218, 255, ${0.1 * e})`),
                  t.addColorStop(1, `rgba(190, 218, 255, 0)`),
                  (i.globalAlpha = 1),
                  (i.fillStyle = t),
                  i.fillRect(0, 0, s, c));
              }
              ((i.globalAlpha = 1), !x && n > 4500 && ((x = !0), t?.()));
            };
          a = requestAnimationFrame(S);
        })(),
        () => {
          ((o = !0), cancelAnimationFrame(a));
        }
      );
    }, [e, t]),
    (0, jsx.jsx)(`canvas`, {
      ref: n,
      className: `rain-name`,
      "aria-hidden": `true`,
    })
  );
}
