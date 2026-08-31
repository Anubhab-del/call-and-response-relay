// The greeting knows the hour, and on the days the house keeps, it knows the
// date instead. Seeded by day and hour, so it holds still while she reads it
// and is something else tomorrow.
function greetingFor(when = new Date()) {
  let seed = hash32(todayNumber(when) * 24 + when.getHours());
  let band = hourBand(when);

  // Once she has been here at nine on a second of September, the house has
  // something truer to open with than the time of day, and it never goes back.
  let stood = Object.values(snapshot().sameHour ?? {}).some((year) => year?.doneAt);


  let today = MILESTONES.find((m) => m.takeover && isOnDate(m.on, !!m.annual, when));
  // The days the house keeps still speak for themselves. Every other day, if
  // she has stood in the same hour, it opens with that instead of the clock.
  if (stood && !today) return EARNED_GREETING;
  let forDay = today && DAY_GREETINGS[today.id];
  if (forDay) {
    let lines = forDay[band] ?? forDay.any;
    if (lines?.length) return lines[seed % lines.length];
  }

  let lines = GREETINGS[band];
  return lines[seed % lines.length];
}
function lockMiss(e) {
  return LOCK_MISSES[Math.min(e, LOCK_MISSES.length - 1)];
}
function normaliseWord(e) {
  return e.trim().toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}
function Lock({ onUnlock: onUnlock }) {
  let [t, n] = (0, React.useState)(""),
    [r, i] = (0, React.useState)(0),
    [a, o] = (0, React.useState)(""),
    s = (0, React.useRef)(null);
  (0, React.useEffect)(() => {
    let e = window.visualViewport;
    if (!e) return;
    let t = () => {
      let t = Math.max(0, window.innerHeight - e.height - e.offsetTop);
      s.current?.style.setProperty("transform", t > 48 ? `translateY(${-t * 0.3}px)` : "");
    };
    return (
      t(),
      e.addEventListener("resize", t),
      e.addEventListener("scroll", t),
      () => {
        (e.removeEventListener("resize", t), e.removeEventListener("scroll", t));
      }
    );
  }, []);
  let c = (n) => {
      (n.preventDefault(), tapTick());
      let a = normaliseWord(t);
      if (a === normaliseWord(CANON.unlockWord) || a === normaliseWord(CANON.name)) {
        onUnlock();
        return;
      }
      let s = r + 1;
      (i(s), o(lockMiss(s - 1)));
    },
    l = r >= 3 ? LOCK_HINTS[Math.min(r - 3, LOCK_HINTS.length - 1)] : "";
  return (0, jsx.jsx)(motion.div, {
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
    transition: {
      duration: 0.4,
    },
    children: (0, jsx.jsxs)("form", {
      ref: s,
      className: "lock-form",
      onSubmit: c,
      children: [
        (0, jsx.jsx)("p", {
          className: "lock-kicker",
          children: CANON.lockKicker,
        }),
        (0, jsx.jsx)("input", {
          autoFocus: true,
          autoComplete: "off",
          autoCapitalize: "off",
          autoCorrect: "off",
          spellCheck: false,
          enterKeyHint: "go",
          inputMode: "text",
          name: "key",
          placeholder: CANON.lockHint,
          value: t,
          onChange: (e) => {
            (n(e.target.value), o(""));
          },
          "aria-label": "The word",
          "aria-describedby": "lock-message",
        }),
        (0, jsx.jsx)("button", {
          className: "lock-go",
          type: "submit",
          children: "Open",
        }),
        (0, jsx.jsx)("p", {
          className: "lock-error",
          id: "lock-message",
          role: "status",
          children: a,
        }),
        l
          ? (0, jsx.jsx)("p", {
              className: "lock-hint",
              children: l,
            })
          : null,
      ],
    }),
  });
}
