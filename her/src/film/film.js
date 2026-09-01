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
  startAt = 0,
  onWeather: onWeather,
  onStorm: onStorm,
  onEnterHouse: onEnterHouse,
  seenBefore: seenBefore,
  furthest: furthest,
}) {
  let o = (0, React.useMemo)(() => buildReel(), []),
    s = (0, React.useMemo)(() => chapterMarks(o), [o]),
    acts = (0, React.useMemo)(() => partMarks(o), [o]),
    c = (0, React.useMemo)(() => new Map(s.map((e) => [e.n, e.at])), [s]),
    [l, u] = (0, React.useState)(() => Math.min(Math.max(0, startAt), o.length - 1)),
    [d, f] = (0, React.useState)(false),
    p = (0, React.useRef)(false),
    [holding, setHolding] = (0, React.useState)(false),
    gesture = (0, React.useRef)({
      x: 0,
      y: 0,
      t: 0,
      live: false,
      moved: false,
      dragging: false,
      holding: false,
      holdTimer: 0,
    }),
    h = o[l],
    g = weatherFor(h),
    _ = isHeldBeat(h),
    v = stormPulseFor(h, l),
    b = lastChapterBefore(o, l),
    // A weather change under a curtain is a cut and should land instantly.
    // Everything else is a dissolve, and the room should change colour slowly
    // enough that she does not catch it happening.
    ee = transitFor(h) !== "dissolve";
  ((0, React.useEffect)(() => {
    (onWeather(g, ee), onStorm(_, v));
  }, [g, ee, _, v, onWeather, onStorm]),
    (0, React.useEffect)(() => {
      (score.setCue(cueFor(h)), h.type === "nameFlash" && score.whisperName());
    }, [h]),
    // Holding quiets the room a little, the way you lower your voice. The
    // score drops, and the flag goes on the document so the weather can ease
    // off too — the layers are siblings of the frame, not children of it.
    (0, React.useEffect)(() => {
      score.hush(holding);
      document.documentElement.classList.toggle("is-holding", holding);
      return () => document.documentElement.classList.remove("is-holding");
    }, [holding]),
    (0, React.useEffect)(() => {
      update((e) => {
        ((e.reelAt = l),
          l > e.reelFurthest && (e.reelFurthest = l),
          l >= o.length - 1 && (e.watched = true));
      });
    }, [l, o.length]));
  let x = (0, React.useCallback)(
      (e) => {
        p.current ||
          ((p.current = true),
          u(Math.max(0, Math.min(o.length - 1, e))),
          // Long enough to swallow a double-fire, short enough that a
          // deliberate second tap is never eaten.
          window.setTimeout(() => {
            p.current = false;
          }, 90));
      },
      [o.length],
    ),
    S = (0, React.useCallback)(() => x(l + 1), [x, l]),
    C = (0, React.useCallback)(() => x(l - 1), [x, l]);
  ((0, React.useEffect)(() => {
    // Contents open, or her thumb down: the picture waits.
    if (!showsHud(h) || d || holding) return;
    let e = window.setTimeout(() => u((e) => Math.min(o.length - 1, e + 1)), beatDuration(h));
    return () => window.clearTimeout(e);
  }, [h, l, o.length, d, holding]),
    (0, React.useEffect)(
      () => (
        document.documentElement.classList.toggle("reading-contents", d),
        () => document.documentElement.classList.remove("reading-contents")
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
        if (e.key === "Escape") {
          f(false);
          return;
        }
        if (e.key === "c" || e.key === "C") {
          f((e) => !e);
          return;
        }
        if (!d) {
          if (e.key === "ArrowLeft") {
            (e.preventDefault(), C());
            return;
          }
          (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") &&
            (e.preventDefault(), h.type === "doorway" ? onEnterHouse() : S());
        }
      };
      return (window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e));
    }, [S, C, h.type, onEnterHouse, d]));
  let w = (l + 1) / o.length;

  // ── her hand ─────────────────────────────────────────────────────────────
  //
  // A tap turns the page. Holding stops it turning — the picture waits with
  // her for as long as she keeps her thumb down. Dragging sideways pulls the
  // next chapter into view and lets her change her mind halfway. Swiping up
  // opens the contents; swiping down leaves for the house. And wherever her
  // thumb is, there is a little more light.
  let frame = (0, React.useRef)(null);

  let setVars = (x, y, drag) => {
    let el = frame.current;
    if (!el) return;
    if (x != null) {
      let box = el.getBoundingClientRect();
      el.style.setProperty("--touch-x", `${((x - box.left) / box.width) * 100}%`);
      el.style.setProperty("--touch-y", `${((y - box.top) / box.height) * 100}%`);
    }
    if (drag !== undefined) el.style.setProperty("--drag-x", `${drag}px`);
  };

  // A page she has committed to is carried the rest of the way rather than
  // snapping back under her finger: the frame keeps going in her direction,
  // the new one is placed just off the other edge, and then it settles. All of
  // it on the compositor, none of it if she has asked for stillness.
  let throwing = (0, React.useRef)(0);
  let throwPage = (0, React.useCallback)((dir) => {
    let el = frame.current;
    if (!el || isStill()) return;
    window.clearTimeout(throwing.current);
    setVars(null, null, dir * 132);
    throwing.current = window.setTimeout(() => {
      el.dataset.throw = "on";
      setVars(null, null, dir * -46);
      void el.offsetWidth;
      delete el.dataset.throw;
      setVars(null, null, 0);
    }, 120);
  }, []);
  (0, React.useEffect)(() => () => window.clearTimeout(throwing.current), []);

  let endHold = (0, React.useCallback)(() => {
    window.clearTimeout(gesture.current.holdTimer);
    gesture.current.holdTimer = 0;
    if (gesture.current.holding) {
      gesture.current.holding = false;
      setHolding(false);
    }
  }, []);

  let onDown = (e) => {
    if (e.target.closest(".hud, .contents, .film-tools, button, a, input")) return;
    gesture.current = {
      ...gesture.current,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      live: true,
      moved: false,
      dragging: false,
    };
    setVars(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    // Held long enough to mean it: the picture stops turning.
    gesture.current.holdTimer = window.setTimeout(() => {
      if (!gesture.current.live || gesture.current.moved) return;
      gesture.current.holding = true;
      setHolding(true);
      tapTick();
    }, 420);
  };

  let onMove = (e) => {
    if (!gesture.current.live) return;
    let dx = e.clientX - gesture.current.x;
    let dy = e.clientY - gesture.current.y;
    setVars(e.clientX, e.clientY);
    if (!gesture.current.moved && Math.hypot(dx, dy) > 10) {
      gesture.current.moved = true;
      endHold();
    }
    if (gesture.current.moved && Math.abs(dx) > Math.abs(dy) * 1.4) {
      gesture.current.dragging = true;
      // Rubber band, so the frame follows her but never runs away with her.
      setVars(null, null, Math.sign(dx) * Math.min(96, Math.abs(dx) * 0.42));
    }
  };

  let onUp = (e) => {
    if (!gesture.current.live) return;
    let held = gesture.current.holding;
    let dx = e.clientX - gesture.current.x;
    let dy = e.clientY - gesture.current.y;
    let ms = performance.now() - gesture.current.t;
    gesture.current.live = false;
    endHold();
    setVars(null, null, 0);
    if (held) return; // she was staying here. Do not take her anywhere.

    let far = Math.hypot(dx, dy);
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 64) {
      tapTick();
      if (dy < 0) f(true);
      else if (seenBefore || l > 2) onEnterHouse();
      return;
    }
    if (gesture.current.dragging) {
      if (Math.abs(dx) > 52) {
        (tapTick(), throwPage(Math.sign(dx)), dx < 0 ? S() : C());
      }
      return;
    }
    if (far > 18 || ms > 700 || h.type === "doorway") return;
    tapTick();
    let box = e.currentTarget.getBoundingClientRect();
    e.clientX - box.left < box.width * 0.14 ? C() : S();
  };

  return (0, jsx.jsxs)("div", {
    className: "film",
    ref: frame,
    "data-holding": holding ? "true" : void 0,
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: () => {
      gesture.current.live = false;
      endHold();
      setVars(null, null, 0);
    },
    children: [
      (0, jsx.jsxs)(AnimatePresence, {
        mode: "sync",
        children: [
          h.type === "projector" ? (0, jsx.jsx)(ProjectorBeat, {}, beatKey(h, l)) : null,
          h.type === "title" ? (0, jsx.jsx)(TitleBeat, {}, beatKey(h, l)) : null,
          h.type === "overture" ? (0, jsx.jsx)(OvertureBeat, {}, beatKey(h, l)) : null,
          h.type === "threshold" ? (0, jsx.jsx)(ThresholdBeat, {}, beatKey(h, l)) : null,
          h.type === "part"
            ? (0, jsx.jsx)(
                PartBeat,
                {
                  part: h.part,
                },
                beatKey(h, l),
              )
            : null,
          h.type === "chapter"
            ? (0, jsx.jsx)(
                ChapterBeat,
                {
                  n: h.n,
                },
                beatKey(h, l),
              )
            : null,
          h.type === "scene" && h.scene === "distance"
            ? (0, jsx.jsx)(DistanceScene, {}, beatKey(h, l))
            : null,
          h.type === "scene" && h.scene === "sleep"
            ? (0, jsx.jsx)(SleepScene, {}, beatKey(h, l))
            : null,
          h.type === "scene" && h.scene === "twohours"
            ? (0, jsx.jsx)(TwoHoursScene, {}, beatKey(h, l))
            : null,
          h.type === "scene" && h.scene === "dance"
            ? (0, jsx.jsx)(DanceScene, {}, beatKey(h, l))
            : null,
          h.type === "scene" && h.scene === "hold" ? (0, jsx.jsx)(HoldScene, {}, beatKey(h, l)) : null,
          h.type === "care" ? (0, jsx.jsx)(CareBeat, {}, beatKey(h, l)) : null,
          h.type === "vow" ? (0, jsx.jsx)(VowBeat, {}, beatKey(h, l)) : null,
          h.type === "credits" ? (0, jsx.jsx)(CreditsBeat, {}, beatKey(h, l)) : null,
          h.type === "after" ? (0, jsx.jsx)(AfterBeat, {}, beatKey(h, l)) : null,
          h.type === "codaStill" ? (0, jsx.jsx)(CodaStillBeat, {}, beatKey(h, l)) : null,
          h.type === "codaLine" ? (0, jsx.jsx)(CodaLineBeat, {}, beatKey(h, l)) : null,
          h.type === "last" ? (0, jsx.jsx)(LastBeat, {}, beatKey(h, l)) : null,
          h.type === "nameFlash" ? (0, jsx.jsx)(NameFlashBeat, {}, beatKey(h, l)) : null,
          h.type === "doorway"
            ? (0, jsx.jsx)(
                DoorwayBeat,
                {
                  onEnter: onEnterHouse,
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
      (0, jsx.jsxs)("div", {
        className: "ribbon",
        "aria-hidden": "true",
        children: [
          // Four notches, where the acts change. A plain bar told her how far
          // through she was; this tells her what shape the thing is.
          acts.map((mark) =>
            (0, jsx.jsx)(
              "i",
              {
                className: "ribbon-notch",
                "data-past": l >= mark.at ? "true" : void 0,
                style: {
                  left: `${(mark.at / o.length) * 100}%`,
                },
              },
              mark.part,
            ),
          ),
          (0, jsx.jsx)("span", {
            className: "ribbon-fill",
            style: {
              transform: `scaleX(${w})`,
            },
          }),
        ],
      }),
      b > 0 && !d
        ? (0, jsx.jsxs)("p", {
            className: "where",
            "aria-live": "off",
            children: [
              // The numeral used to swap. Now it turns over, the way a counter
              // on a projector does: the one she was on lifts away and the new
              // one settles into its place.
              (0, jsx.jsx)("span", {
                className: "where-tick",
                children: (0, jsx.jsx)(AnimatePresence, {
                  initial: false,
                  children: (0, jsx.jsx)(
                    motion.span,
                    {
                      className: "where-n",
                      initial: isStill() ? { opacity: 0 } : { opacity: 0, y: -7 },
                      animate: { opacity: 1, y: 0 },
                      exit: isStill() ? { opacity: 0 } : { opacity: 0, y: 7 },
                      transition: { duration: isStill() ? 0.18 : 0.34, ease: EASE_OUT },
                      children: roman(b),
                    },
                    b,
                  ),
                }),
              }),
              " ",
              (0, jsx.jsxs)("span", {
                children: ["/ ", roman(CHAPTER_COUNT)],
              }),
            ],
          })
        : null,
      seenBefore || l > 2
        ? (0, jsx.jsxs)("div", {
            className: "film-tools",
            children: [
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost",
                onClick: () => f((e) => !e),
                "aria-expanded": d,
                children: "contents",
              }),
              // The first time through, the doorway at the end is how the
              // picture becomes the house. No side door on the frame — there
              // is one at the foot of the contents, for anyone who needs it.
              seenBefore
                ? (0, jsx.jsx)("button", {
                    type: "button",
                    className: "ghost",
                    onClick: onEnterHouse,
                    children: "the house",
                  })
                : null,
            ],
          })
        : null,
      (0, jsx.jsx)(AnimatePresence, {
        children: d
          ? (0, jsx.jsx)(Contents, {
              index: l,
              furthest: furthest,
              positions: c,
              onLeave: onEnterHouse,
              onGo: (e) => {
                (x(e), f(false));
              },
              onClose: () => f(false),
            })
          : null,
      }),
    ],
  });
}
