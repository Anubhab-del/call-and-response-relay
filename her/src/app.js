function App() {
  let e = useStore(),
    [t, n] = (0, React.useState)(() => {
      let e = snapshot();
      return e.greeted
        ? CANON.unlockWord.trim() && !e.entered
          ? "lock"
          : e.watched
            ? "house"
            : "film"
        : "invitation";
    }),
    [r, i] = (0, React.useState)("void"),
    [cut, setCut] = (0, React.useState)(false),
    [a, o] = (0, React.useState)({
      close: false,
      pulse: 0,
    }),
    // "It keeps your place either way" is a promise the overture makes out
    // loud, so a cold return to an unfinished picture starts where she left it.
    [s, c] = (0, React.useState)(() => {
      let saved = snapshot();
      return saved.watched ? 0 : Math.max(0, saved.reelAt ?? 0);
    }),
    [l, u] = (0, React.useState)(false),
    [d, f] = (0, React.useState)(() => !isHandheld() && window.innerWidth / window.innerHeight > 0.95),
    [p] = (0, React.useState)(() => supportsFullscreen()),
    m = (0, React.useRef)(false);
  // The motion preference has to settle before anything asks what it is.
  ((0, React.useEffect)(() => {
    (setMotionPreference(e.motion), applyMotionClasses());
  }, [e.motion]),
    (0, React.useEffect)(() => trackFrameHeight(), []),
    // Parallax stops the moment she asks for less of it, not on the next visit.
    (0, React.useEffect)(() => startTilt(), [e.motion]),
    (0, React.useEffect)(() => dropServiceWorker(), []),
    (0, React.useEffect)(() => watchInstallPrompt(), []),
    (0, React.useEffect)(() => {
      score.setMuted(!e.sound);
    }, [e.sound]),
    (0, React.useEffect)(() => {
      update((state) => {
        let now = Date.now();
        // A phone the house has never met, that plainly cannot take the whole
        // storm, starts on lean — written down, so the fuse box shows it.
        if (!state.firstOpen && state.motion === EMPTY_STATE.motion && shouldStartLean())
          state.motion = "lean";
        ((state.firstOpen ||= now), (state.lastOpen = now));
        // Filed under her date, not the framework's.
        let today = todayNumber();
        state.visits.includes(today) ||
          (state.visits = [...state.visits.slice(-364), today]);
      });
    }, []),
    (0, React.useEffect)(() => {
      let e = () => {
        m.current ||
          ((m.current = true),
          armHaptics(),
          score.unlock().then(() => score.setMuted(!snapshot().sound)));
      };
      return (
        window.addEventListener("pointerdown", e, {
          passive: true,
        }),
        window.addEventListener("keydown", e),
        () => {
          (window.removeEventListener("pointerdown", e), window.removeEventListener("keydown", e));
        }
      );
    }, []),
    (0, React.useEffect)(() => {
      let e = () => f(!isHandheld() && window.innerWidth / window.innerHeight > 0.95);
      return (
        window.addEventListener("resize", e),
        window.addEventListener("orientationchange", e),
        () => {
          (window.removeEventListener("resize", e), window.removeEventListener("orientationchange", e));
        }
      );
    }, []),
    (0, React.useEffect)(() => {
      if (t === "house") return;
      let e = (e) => {
        e.target?.closest("input, textarea, button, .chapter-sheet") || e.preventDefault();
      };
      return (
        document.addEventListener("touchmove", e, {
          passive: false,
        }),
        () => document.removeEventListener("touchmove", e)
      );
    }, [t]),
    (0, React.useEffect)(() => {
      document.documentElement.classList.toggle("in-house", t === "house");
    }, [t]),
    (0, React.useEffect)(() => {
      let e = (e) => {
        t !== "lock" &&
          (e.target?.closest("input, textarea") ||
            ((e.key === "m" || e.key === "M") &&
              update((e) => {
                e.sound = !e.sound;
              }),
            (e.key === "f" || e.key === "F") &&
              p &&
              (document.fullscreenElement
                ? document.exitFullscreen().catch(() => {})
                : document.documentElement.requestFullscreen().catch(() => {}))));
      };
      return (window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e));
    }, [p, t]));
  let h = (0, React.useCallback)((e, underCurtain = false) => {
      (i(e), setCut(underCurtain));
    }, []),
    g = (0, React.useCallback)(
      (e, t) =>
        o({
          close: e,
          pulse: t,
        }),
      [],
    ),
    _ = () => {
      (update((e) => {
        e.entered = true;
      }),
        score.unlock(),
        u(true),
        window.setTimeout(() => {
          (u(false), n(snapshot().watched ? "house" : "film"));
        }, 1700));
    },
    v = () => {
      (update((e) => {
        e.watched = true;
      }),
        n("house"),
        i("ember"),
        setCut(false),
        // The storm belongs to the picture. It does not follow her indoors.
        o({
          close: false,
          pulse: 0,
        }));
    },
    b = (e = 0) => {
      (c(e), setCut(true), n("film"));
    },
    x = new Date().getHours(),
    S = 0.62 + 0.38 * Math.cos(((x - 22 + 24) % 24) * (Math.PI / 12)),
    C = isNightHours() ? "silence" : "ember",
    w = t === "house" ? C : r,
    ee = isSeptemberSecond();
  return (0, jsx.jsx)("div", {
    className: "shell",
    "data-mode": t,
    "data-anniversary": ee ? "true" : void 0,
    children: (0, jsx.jsxs)("div", {
      className: "room",
      "data-weather": w,
      children: [
        (0, jsx.jsx)("div", {
          className: "room-wall",
          "aria-hidden": "true",
        }),
        (0, jsx.jsx)("div", {
          className: "room-floor",
          "aria-hidden": "true",
        }),
        d && t !== "house"
          ? (0, jsx.jsx)("div", {
              className: "bars",
            })
          : null,
        (0, jsx.jsxs)("div", {
          className: t === "house" ? "house-frame" : "letterbox",
          "data-weather": w,
          "data-cut": t === "film" && cut ? "true" : void 0,
          "data-storm": a.close ? "close" : void 0,
          children: [
            (0, jsx.jsx)(
              Lightning,
              {
                weather: w,
                close: a.close,
                pulse: a.pulse,
                calm: t === "house",
              },
              e.motion,
            ),
            (0, jsx.jsx)(Grain, {}, e.motion),
            (0, jsx.jsx)("div", {
              className: "light-leak",
              "aria-hidden": "true",
              children: (0, jsx.jsx)("span", {}),
            }),
            (0, jsx.jsx)("div", {
              className: "vignette",
              "aria-hidden": "true",
            }),
            (0, jsx.jsx)("div", {
              className: "glass-film",
              "aria-hidden": "true",
            }),
            (0, jsx.jsx)(
              RainGlass,
              {
                weather: w,
                calm: t === "house",
              },
              e.motion,
            ),
            (0, jsx.jsx)(Dust, {}, e.motion),
            t === "house"
              ? (0, jsx.jsx)(Lamp, {
                  warm: S,
                })
              : null,
            t === "house" && e.nameWritten
              ? (0, jsx.jsx)("p", {
                  className: "name-ghost",
                  "aria-hidden": "true",
                  children: CANON.name,
                })
              : null,
            t === "film"
              ? (0, jsx.jsxs)("div", {
                  className: "hud",
                  children: [
                    (0, jsx.jsx)("button", {
                      type: "button",
                      onClick: () =>
                        update((e) => {
                          e.sound = !e.sound;
                        }),
                      "aria-label": e.sound ? "Turn the sound off" : "Turn the sound on",
                      children: e.sound ? "sound" : "quiet",
                    }),
                    p
                      ? (0, jsx.jsx)("button", {
                          type: "button",
                          onClick: () => {
                            document.fullscreenElement
                              ? document.exitFullscreen().catch(() => {})
                              : document.documentElement.requestFullscreen().catch(() => {});
                          },
                          "aria-label": "Fill the screen",
                          children: "full",
                        })
                      : null,
                  ],
                })
              : null,
            (0, jsx.jsxs)(AnimatePresence, {
              mode: "wait",
              children: [
                t === "invitation"
                  ? (0, jsx.jsx)(
                      Invitation,
                      {
                        onReady: () => {
                          ((m.current = true),
                            armHaptics(),
                            score.unlock().then(() => score.setMuted(!snapshot().sound)),
                            update((e) => {
                              e.greeted = true;
                            }),
                            n(
                              CANON.unlockWord.trim() && !snapshot().entered
                                ? "lock"
                                : snapshot().watched
                                  ? "house"
                                  : "film",
                            ));
                        },
                      },
                      "invitation",
                    )
                  : null,
                t === "lock" && !l
                  ? (0, jsx.jsx)(
                      Lock,
                      {
                        onUnlock: _,
                      },
                      "lock",
                    )
                  : null,
                l
                  ? (0, jsx.jsx)(
                      motion.div,
                      {
                        className: "beat",
                        initial: {
                          opacity: 0,
                        },
                        animate: {
                          opacity: 1,
                        },
                        exit: {
                          opacity: 0,
                        },
                        children: (0, jsx.jsx)("p", {
                          className: "welcome",
                          children: CANON.welcome,
                        }),
                      },
                      "welcome",
                    )
                  : null,
                t === "film"
                  ? (0, jsx.jsx)(
                      Film,
                      {
                        startAt: s,
                        onWeather: h,
                        onStorm: g,
                        onEnterHouse: v,
                        seenBefore: e.watched,
                        furthest: e.reelFurthest,
                      },
                      "film",
                    )
                  : null,
                t === "house"
                  ? (0, jsx.jsx)(
                      House,
                      {
                        onWatch: b,
                      },
                      "house",
                    )
                  : null,
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
var Fuse = class extends React.Component {
  state = {
    failed: false,
  };
  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }
  componentDidCatch(e, t) {
    console.error("[HER]", e, t.componentStack);
    try {
      flushNow();
    } catch {}
  }
  render() {
    return this.state.failed
      ? (0, jsx.jsxs)("div", {
          className: "broke",
          children: [
            (0, jsx.jsx)("p", {
              className: "broke-title",
              children: "Something in here broke.",
            }),
            (0, jsx.jsx)("p", {
              className: "broke-body",
              children:
                "Not you. Everything you have written is still saved on this phone — it was written down before this happened. Close it and open it again and it will be here.",
            }),
            (0, jsx.jsx)("button", {
              type: "button",
              className: "solid",
              onClick: () => window.location.reload(),
              children: "open it again",
            }),
            (0, jsx.jsxs)("p", {
              className: "broke-sign",
              children: ["— ", CANON.you],
            }),
          ],
        })
      : this.props.children;
  }
};
(0, ReactDOM.createRoot)(document.getElementById("root")).render(
  (0, jsx.jsx)(React.StrictMode, {
    children: (0, jsx.jsx)(Fuse, {
      children: (0, jsx.jsx)(App, {}),
    }),
  }),
);
