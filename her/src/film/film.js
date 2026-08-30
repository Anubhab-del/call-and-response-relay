function useCountUp(e, t) {
  let [n, r] = (0, React.useState)(isStill() ? e : 0),
    i = (0, React.useRef)(0);
  return (
    (0, React.useEffect)(() => {
      if (isStill()) {
        r(e);
        return;
      }
      let n = performance.now(),
        a = (o) => {
          let s = Math.min(1, (o - n) / t),
            c = 1 - (1 - s) ** 3;
          (r(Math.round(e * c)), s < 1 && (i.current = requestAnimationFrame(a)));
        };
      return ((i.current = requestAnimationFrame(a)), () => cancelAnimationFrame(i.current));
    }, [e, t]),
    n
  );
}

function Film({
  startAt: e = 0,
  onWeather: t,
  onStorm: n,
  onEnterHouse: r,
  seenBefore: i,
  furthest: a,
}) {
  let o = (0, React.useMemo)(() => buildReel(), []),
    s = (0, React.useMemo)(() => chapterMarks(o), [o]),
    c = (0, React.useMemo)(() => new Map(s.map((e) => [e.n, e.at])), [s]),
    [l, u] = (0, React.useState)(() => Math.min(Math.max(0, e), o.length - 1)),
    [d, f] = (0, React.useState)(!1),
    p = (0, React.useRef)(!1),
    m = (0, React.useRef)({
      x: 0,
      y: 0,
      t: 0,
    }),
    h = o[l],
    g = weatherFor(h),
    _ = isHeldBeat(h),
    v = stormPulseFor(h, l),
    b = lastChapterBefore(o, l);
  ((0, React.useEffect)(() => {
    (t(g), n(_, v));
  }, [g, _, v, t, n]),
    (0, React.useEffect)(() => {
      (score.setCue(cueFor(h)), h.type === `nameFlash` && score.whisperName());
    }, [h]),
    (0, React.useEffect)(() => {
      update((e) => {
        ((e.reelAt = l),
          l > e.reelFurthest && (e.reelFurthest = l),
          l >= o.length - 1 && (e.watched = !0));
      });
    }, [l, o.length]));
  let x = (0, React.useCallback)(
      (e) => {
        p.current ||
          ((p.current = !0),
          u(Math.max(0, Math.min(o.length - 1, e))),
          window.setTimeout(() => {
            p.current = !1;
          }, 200));
      },
      [o.length],
    ),
    S = (0, React.useCallback)(() => x(l + 1), [x, l]),
    C = (0, React.useCallback)(() => x(l - 1), [x, l]);
  ((0, React.useEffect)(() => {
    if (!showsHud(h) || d) return;
    let e = window.setTimeout(() => u((e) => Math.min(o.length - 1, e + 1)), beatDuration(h));
    return () => window.clearTimeout(e);
  }, [h, l, o.length, d]),
    (0, React.useEffect)(
      () => (
        document.documentElement.classList.toggle(`reading-contents`, d),
        () => document.documentElement.classList.remove(`reading-contents`)
      ),
      [d],
    ),
    (0, React.useEffect)(() => {
      let e = () => {};
      return (
        requestWakeLock().then((t) => {
          e = t;
        }),
        () => e()
      );
    }, []),
    (0, React.useEffect)(() => {
      let e = (e) => {
        if (e.key === `Escape`) {
          f(!1);
          return;
        }
        if (e.key === `c` || e.key === `C`) {
          f((e) => !e);
          return;
        }
        if (!d) {
          if (e.key === `ArrowLeft`) {
            (e.preventDefault(), C());
            return;
          }
          (e.key === ` ` || e.key === `Enter` || e.key === `ArrowRight`) &&
            (e.preventDefault(), h.type === `doorway` ? r() : S());
        }
      };
      return (window.addEventListener(`keydown`, e), () => window.removeEventListener(`keydown`, e));
    }, [S, C, h.type, r, d]));
  let w = (l + 1) / o.length;
  return (0, jsx.jsxs)(`div`, {
    className: `film`,
    onPointerDown: (e) => {
      m.current = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
      };
    },
    onPointerUp: (e) => {
      if (e.target.closest(`.hud, .contents, button, a, input`)) return;
      let t = e.clientX - m.current.x,
        n = e.clientY - m.current.y;
      if (Math.hypot(t, n) > 18 || performance.now() - m.current.t > 700 || h.type === `doorway`)
        return;
      tapTick();
      let r = e.currentTarget.getBoundingClientRect();
      e.clientX - r.left < r.width * 0.14 ? C() : S();
    },
    children: [
      (0, jsx.jsxs)(AnimatePresence, {
        mode: `sync`,
        children: [
          h.type === `projector` ? (0, jsx.jsx)(ProjectorBeat, {}, beatKey(h, l)) : null,
          h.type === `title` ? (0, jsx.jsx)(TitleBeat, {}, beatKey(h, l)) : null,
          h.type === `overture` ? (0, jsx.jsx)(OvertureBeat, {}, beatKey(h, l)) : null,
          h.type === `threshold` ? (0, jsx.jsx)(ThresholdBeat, {}, beatKey(h, l)) : null,
          h.type === `part`
            ? (0, jsx.jsx)(
                PartBeat,
                {
                  part: h.part,
                },
                beatKey(h, l),
              )
            : null,
          h.type === `chapter`
            ? (0, jsx.jsx)(
                ChapterBeat,
                {
                  n: h.n,
                },
                beatKey(h, l),
              )
            : null,
          h.type === `scene` && h.scene === `distance`
            ? (0, jsx.jsx)(DistanceScene, {}, beatKey(h, l))
            : null,
          h.type === `scene` && h.scene === `sleep`
            ? (0, jsx.jsx)(SleepScene, {}, beatKey(h, l))
            : null,
          h.type === `scene` && h.scene === `twohours`
            ? (0, jsx.jsx)(TwoHoursScene, {}, beatKey(h, l))
            : null,
          h.type === `scene` && h.scene === `dance`
            ? (0, jsx.jsx)(DanceScene, {}, beatKey(h, l))
            : null,
          h.type === `scene` && h.scene === `hold` ? (0, jsx.jsx)(HoldScene, {}, beatKey(h, l)) : null,
          h.type === `care` ? (0, jsx.jsx)(CareBeat, {}, beatKey(h, l)) : null,
          h.type === `vow` ? (0, jsx.jsx)(VowBeat, {}, beatKey(h, l)) : null,
          h.type === `credits` ? (0, jsx.jsx)(CreditsBeat, {}, beatKey(h, l)) : null,
          h.type === `after` ? (0, jsx.jsx)(AfterBeat, {}, beatKey(h, l)) : null,
          h.type === `codaStill` ? (0, jsx.jsx)(CodaStillBeat, {}, beatKey(h, l)) : null,
          h.type === `codaLine` ? (0, jsx.jsx)(CodaLineBeat, {}, beatKey(h, l)) : null,
          h.type === `last` ? (0, jsx.jsx)(LastBeat, {}, beatKey(h, l)) : null,
          h.type === `nameFlash` ? (0, jsx.jsx)(NameFlashBeat, {}, beatKey(h, l)) : null,
          h.type === `doorway`
            ? (0, jsx.jsx)(
                DoorwayBeat,
                {
                  onEnter: r,
                },
                beatKey(h, l),
              )
            : null,
        ],
      }),
      (0, jsx.jsx)(Transit, {
        transit: transitFor(h),
        at: l,
      }),
      (0, jsx.jsx)(`div`, {
        className: `ribbon`,
        "aria-hidden": `true`,
        children: (0, jsx.jsx)(`span`, {
          className: `ribbon-fill`,
          style: {
            transform: `scaleX(${w})`,
          },
        }),
      }),
      b > 0 && !d
        ? (0, jsx.jsxs)(`p`, {
            className: `where`,
            "aria-live": `off`,
            children: [
              roman(b),
              ` `,
              (0, jsx.jsxs)(`span`, {
                children: [`/ `, roman(CHAPTER_COUNT)],
              }),
            ],
          })
        : null,
      i || l > 2
        ? (0, jsx.jsxs)(`div`, {
            className: `film-tools`,
            children: [
              (0, jsx.jsx)(`button`, {
                type: `button`,
                className: `ghost`,
                onClick: () => f((e) => !e),
                "aria-expanded": d,
                children: `contents`,
              }),
              (0, jsx.jsx)(`button`, {
                type: `button`,
                className: `ghost`,
                onClick: r,
                children: `the house`,
              }),
            ],
          })
        : null,
      (0, jsx.jsx)(AnimatePresence, {
        children: d
          ? (0, jsx.jsx)(Contents, {
              index: l,
              furthest: a,
              positions: c,
              onGo: (e) => {
                (x(e), f(!1));
              },
              onClose: () => f(!1),
            })
          : null,
      }),
    ],
  });
}
