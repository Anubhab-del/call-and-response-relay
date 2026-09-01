// The Same Hour, on screen.
//
// Nothing here advances on a tap. Every line is placed by the clock, so this
// component is really just a very slow watch that knows what to say.

function useSameHour() {
  let [, tick] = (0, React.useState)(0);
  (0, React.useEffect)(() => {
    let id = window.setInterval(() => tick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, []);
  return sameHourAt();
}

function sameHourYear(when = new Date()) {
  return String(when.getFullYear());
}

function sameHourRecord(state, when = new Date()) {
  return state.sameHour?.[sameHourYear(when)] ?? null;
}

// ── the sequence ─────────────────────────────────────────────────────────
function SameHour({ startedAt: startedAt, together: together, onLeave: onLeave, onDone: onDone }) {
  let store = useStore();
  let [, tick] = (0, React.useState)(0);
  let [answer, setAnswer] = (0, React.useState)("");
  let [kept, setKept] = (0, React.useState)(false);
  let days = daysTogether();
  let count = useCountUp(days, 4200);

  (0, React.useEffect)(() => {
    let id = window.setInterval(() => tick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, []);

  // Mark the year as kept the moment she is here for it, answered or not.
  (0, React.useEffect)(() => {
    let year = sameHourYear();
    update((state) => {
      let all = { ...(state.sameHour ?? {}) };
      all[year] = { ...(all[year] ?? {}), seenAt: all[year]?.seenAt ?? Date.now() };
      state.sameHour = all;
    });
  }, []);

  let elapsed = Date.now() - startedAt;
  let { index, beat } = sameHourBeatAt(elapsed);

  // The last beat closes the night by itself. She does not dismiss it.
  //
  // onDone is a fresh closure on every tick, so it must not be a dependency:
  // depending on it re-ran this effect four times a second and each run
  // cleared the timer the run before it had set, and the night never ended.
  let done = (0, React.useRef)(onDone);
  done.current = onDone;
  (0, React.useEffect)(() => {
    if (beat?.kind !== "close") return;
    let year = sameHourYear();
    update((state) => {
      let all = { ...(state.sameHour ?? {}) };
      all[year] = {
        ...(all[year] ?? {}),
        seenAt: all[year]?.seenAt ?? Date.now(),
        doneAt: all[year]?.doneAt ?? Date.now(),
      };
      state.sameHour = all;
    });
    let id = window.setTimeout(() => done.current?.(), 1800);
    return () => window.clearTimeout(id);
  }, [beat?.kind]);
  // On the night itself this is the third September, not the start of the fourth.
  let ordinal = ordinalWord(Math.max(1, yearsTogether()));

  let finish = (text) => {
    let year = sameHourYear();
    update((state) => {
      let all = { ...(state.sameHour ?? {}) };
      all[year] = {
        ...(all[year] ?? {}),
        seenAt: all[year]?.seenAt ?? Date.now(),
        doneAt: Date.now(),
        ...(text ? { answer: text, answeredAt: Date.now() } : {}),
      };
      state.sameHour = all;
    });
    (tapKept(), setKept(true));
  };

  let body = null;
  if (!beat) {
    body = (0, jsx.jsx)(motion.p, {
      className: "hour-line hour-open",
      ...fadeIn(0.2, 1.4),
      children: SAME_HOUR_BEATS[0].text,
    });
  } else if (beat.kind === "count") {
    body = (0, jsx.jsxs)("div", {
      className: "hour-count",
      children: [
        (0, jsx.jsx)(motion.span, {
          className: "hour-number",
          ...riseIn(0.1),
          children: formatNumber(count),
        }),
        (0, jsx.jsx)(motion.span, {
          className: "hour-unit",
          ...fadeIn(0.6, 1),
          children: "days",
        }),
      ],
    });
  } else if (beat.kind === "name") {
    body = (0, jsx.jsxs)("div", {
      className: "hour-name",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "hour-line hour-big",
          ...riseIn(0.1),
          children: `Happy ${ordinal} September, ${CANON.name}.`,
        }),
        (0, jsx.jsx)(motion.p, {
          className: "hour-under",
          ...fadeIn(2.2, 1.6),
          children: SAME_HOUR_NAME.under,
        }),
      ],
    });
  } else if (beat.kind === "still") {
    // Nothing. On purpose, and for a long time.
    body = null;
  } else if (beat.kind === "address") {
    // Not a line of the film. An address, spoken to her, once a year.
    //
    // The two lines that carry the whole thing — the one that breaks the
    // silence and the one that closes it — bloom out of the dark over three
    // and a half seconds. The passage between them arrives at a reading pace,
    // because a paragraph that takes four seconds to become legible is not
    // reverent, it is slow.
    body = (0, jsx.jsx)(motion.p, {
      className: beat.bloom ? "hour-address hour-address-bloom" : "hour-address",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: isStill() ? 0.3 : beat.bloom ? 3.4 : 1.5, ease: "easeOut" },
      children: beat.text,
    });
  } else if (beat.kind === "close") {
    body = null;
  } else if (beat.kind === "ask") {
    body = kept
      ? (0, jsx.jsxs)("div", {
          className: "hour-done",
          children: [
            (0, jsx.jsx)(motion.p, { className: "hour-line", ...riseIn(0.1), children: SAME_HOUR_DONE.line }),
            (0, jsx.jsx)(motion.p, { className: "hour-under", ...fadeIn(1, 1.4), children: SAME_HOUR_DONE.under }),
            (0, jsx.jsx)(motion.button, {
              type: "button",
              className: "solid",
              ...fadeIn(2.4, 1),
              onClick: onDone,
              children: SAME_HOUR_DONE.button,
            }),
          ],
        })
      : (0, jsx.jsxs)("div", {
          className: "hour-ask",
          children: [
            (0, jsx.jsx)(motion.p, { className: "hour-kicker", ...fadeIn(0, 1), children: SAME_HOUR_ASK.kicker }),
            (0, jsx.jsx)(motion.p, { className: "hour-line", ...riseIn(0.3), children: SAME_HOUR_ASK.question }),
            (0, jsx.jsx)(motion.p, { className: "hour-hint", ...fadeIn(1, 1), children: SAME_HOUR_ASK.hint }),
            (0, jsx.jsx)(motion.textarea, {
              className: "hour-field",
              ...fadeIn(1.3, 1),
              value: answer,
              rows: 5,
              placeholder: SAME_HOUR_ASK.placeholder,
              onChange: (e) => setAnswer(e.target.value),
            }),
            (0, jsx.jsxs)(motion.div, {
              className: "hour-row",
              ...fadeIn(1.7, 1),
              children: [
                (0, jsx.jsx)("button", {
                  type: "button",
                  className: "solid",
                  disabled: !answer.trim(),
                  onClick: () => finish(answer.trim()),
                  children: SAME_HOUR_ASK.keep,
                }),
                (0, jsx.jsx)("button", {
                  type: "button",
                  className: "ghost",
                  onClick: () => finish(""),
                  children: SAME_HOUR_ASK.skip,
                }),
              ],
            }),
            (0, jsx.jsx)(motion.p, { className: "hour-fine", ...fadeIn(2.1, 1), children: SAME_HOUR_ASK.after }),
          ],
        });
  } else if (beat.kind === "quiet") {
    body = null;
  } else {
    body = (0, jsx.jsx)(
      Lines,
      {
        className: beat.kind === "hold" ? "hour-line hour-big" : "hour-line",
        text: beat.text,
        delay: 0.1,
        pace: 118,
      },
      String(index),
    );
  }

  // The night has a score of its own. It had none: the whole ceremony ran on
  // the house's ambient cue, a note every twenty-seven seconds. Now the theme
  // plays under it, and when he starts speaking it drops to a fifth of itself
  // and lets the words have the room.
  (0, React.useEffect)(() => {
    score.setCue("hour");
    return () => score.setCue("house");
  }, []);
  (0, React.useEffect)(() => {
    if (beat?.kind === "still" || beat?.kind === "address") score.setCue("hour-address");
    else if (beat?.kind === "close") score.setCue("hour-over");
  }, [beat?.kind]);

  // From the moment the room turns down, there is nothing on the screen but
  // the lamp and what he has to say to her. The silence is not a gap before
  // the address — it is the first twenty seconds of it, and it was carrying
  // "he is reading this now" across the top and "step out" across the bottom
  // the whole way through.
  let alone = beat?.kind === "still" || beat?.kind === "address" || beat?.kind === "close";

  // The shell turns the room down for all of it.
  (0, React.useEffect)(() => {
    let shell = document.querySelector(".shell");
    if (shell) {
      if (alone) shell.setAttribute("data-address", "true");
      else shell.removeAttribute("data-address");
    }
    return () => document.querySelector(".shell")?.removeAttribute("data-address");
  }, [alone]);

  return (0, jsx.jsxs)(motion.div, {
    className: "hour",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 1.6 },
    children: [
      together && !alone
        ? (0, jsx.jsx)(motion.p, {
            className: "hour-together",
            ...fadeIn(1.2, 2),
            children: "he is reading this now",
          })
        : null,
      (0, jsx.jsx)(AnimatePresence, {
        mode: "wait",
        children: (0, jsx.jsx)(
          motion.div,
          {
            className: "hour-stage",
            initial: { opacity: 0, y: isStill() ? 0 : 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: isStill() ? 0 : -8 },
            transition: { duration: isStill() ? 0.2 : 1.1, ease: EASE_OUT },
            children: body,
          },
          `${index}-${kept}`,
        ),
      }),
      beat?.kind === "ask" || alone
        ? null
        : (0, jsx.jsx)("button", {
            type: "button",
            className: "hour-slip",
            onClick: onLeave,
            children: "step out",
          }),
    ],
  });
}

// ── the Septembers she has kept ──────────────────────────────────────────
//
// The question was never part of the ceremony. It waits here afterwards, and
// underneath it, every year she has answered, oldest at the bottom.
function SameHourLedger() {
  let store = useStore();
  let thisYear = String(new Date().getFullYear());
  let entry = store.sameHour?.[thisYear];
  let asking = !!entry?.doneAt && !entry?.answer;
  let [answer, setAnswer] = (0, React.useState)("");
  let years = Object.entries(store.sameHour ?? {})
    .filter(([, e]) => e?.answer)
    .sort((a, b) => Number(b[0]) - Number(a[0]));

  let keep = () => {
    let text = answer.trim();
    if (!text) return;
    update((state) => {
      let all = { ...(state.sameHour ?? {}) };
      all[thisYear] = { ...(all[thisYear] ?? {}), answer: text, answeredAt: Date.now() };
      state.sameHour = all;
    });
    (tapKept(), setAnswer(""));
  };

  if (!asking && years.length === 0) return null;
  return (0, jsx.jsxs)("div", {
    className: "septembers-room",
    children: [
      asking
        ? (0, jsx.jsxs)(motion.section, {
            className: "september-ask",
            ...fadeIn(0, 0.6),
            children: [
              (0, jsx.jsx)("p", { className: "hour-kicker", children: SAME_HOUR_ASK.kicker }),
              (0, jsx.jsx)("p", { className: "september-question", children: SAME_HOUR_ASK.question }),
              (0, jsx.jsx)("p", { className: "fine", children: SAME_HOUR_ASK.hint }),
              (0, jsx.jsx)("textarea", {
                className: "hour-field",
                value: answer,
                rows: 5,
                placeholder: SAME_HOUR_ASK.placeholder,
                onChange: (e) => setAnswer(e.target.value),
              }),
              (0, jsx.jsx)("div", {
                className: "row",
                children: (0, jsx.jsx)("button", {
                  type: "button",
                  className: "solid",
                  disabled: !answer.trim(),
                  onClick: keep,
                  children: SAME_HOUR_ASK.keep,
                }),
              }),
              (0, jsx.jsx)("p", { className: "fine", children: SAME_HOUR_ASK.after }),
            ],
          })
        : null,
      years.length ? SameHourYears(years) : null,
    ],
  });
}

function SameHourYears(years) {
  return (0, jsx.jsxs)("section", {
    className: "septembers",
    children: [
      (0, jsx.jsx)("h3", { children: SAME_HOUR_LEDGER.title }),
      (0, jsx.jsx)("p", { className: "fine", children: SAME_HOUR_ASK.question }),
      (0, jsx.jsx)("ul", {
        children: years.map(([year, entry]) =>
          (0, jsx.jsxs)(
            "li",
            {
              children: [
                (0, jsx.jsx)("span", { className: "september-year", children: year }),
                (0, jsx.jsx)("p", { children: entry.answer }),
              ],
            },
            year,
          ),
        ),
      }),
    ],
  });
}
