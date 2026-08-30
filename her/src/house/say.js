var DRAFT_KEY = "her.draft";
function SayRoom({ answering: answering, onClearAnswering: onClearAnswering }) {
  let n = useStore(),
    [r, i] = (0, React.useState)(() => {
      try {
        return localStorage.getItem(DRAFT_KEY) ?? "";
      } catch {
        return "";
      }
    }),
    [a, o] = (0, React.useState)(null),
    [s, c] = (0, React.useState)(false),
    [l, u] = (0, React.useState)(null),
    [d, f] = (0, React.useState)(""),
    [p, m] = (0, React.useState)(() => n.words[String(todayNumber())] ?? ""),
    h = (0, React.useRef)(null);
  ((0, React.useEffect)(() => {
    try {
      localStorage.setItem(DRAFT_KEY, r);
    } catch {}
  }, [r]),
    (0, React.useEffect)(() => {
      answering && h.current?.focus();
    }, [answering]));
  let g = (0, React.useMemo)(() => r.trim().split(/\s+/).filter(Boolean).length, [r]),
    _ = (0, React.useMemo)(() => [...n.replies].sort((e, t) => t.at - e.at), [n.replies]),
    v = _.filter((e) => !e.sent && !e.private),
    b = () => {
      let n = r.trim();
      if (!n) return;
      tapTick();
      let l = {
        id: newId(),
        at: Date.now(),
        text: n,
        re: answering?.id,
        prompt: a ?? void 0,
        private: s || void 0,
      };
      (update((e) => {
        e.replies.push(l);
      }),
        i(""),
        o(null),
        c(false),
        onClearAnswering(),
        f("Kept. It is on your phone and nowhere else."),
        window.setTimeout(() => f(""), 4e3));
    },
    x = async () => {
      let e = v;
      if (e.length === 0) {
        (f("Nothing new to send. Write something first."), window.setTimeout(() => f(""), 4e3));
        return;
      }
      let t = await sealNotes(e, "her");
      u(t);
    },
    S = () => {
      update((e) => {
        for (let t of e.replies) t.private || (t.sent = true);
      });
    },
    C = async () => {
      if (l)
        try {
          (await navigator.share({
            title: `for ${CANON.you}`,
            text: l.code,
          }),
            S(),
            f("Sent. He pastes it into his copy."));
        } catch {}
    },
    w = async () => {
      if (l) {
        try {
          (await navigator.clipboard.writeText(l.code),
            S(),
            f("Copied. Paste it to him however you like."));
        } catch {
          f("Could not copy. Select the text below and copy it by hand.");
        }
        window.setTimeout(() => f(""), 5e3);
      }
    },
    ee = () => {
      if (!l) return;
      let e = new Blob([l.code], {
          type: "text/plain",
        }),
        t = URL.createObjectURL(e),
        n = document.createElement("a");
      ((n.href = t),
        (n.download = `for-${CANON.you.toLowerCase()}.her.txt`),
        n.click(),
        URL.revokeObjectURL(t),
        S(),
        f("Saved. Send him the file."),
        window.setTimeout(() => f(""), 5e3));
    };
  return (0, jsx.jsxs)("div", {
    className: "say",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children:
          "This page is yours. Nothing here goes anywhere until you send it, and the private ones never go anywhere at all.",
      }),
      answering
        ? (0, jsx.jsxs)(motion.div, {
            className: "answering",
            ...riseIn(0.1),
            children: [
              (0, jsx.jsx)("span", {
                children: "answering",
              }),
              (0, jsx.jsx)("em", {
                children: answering.open,
              }),
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost tiny",
                onClick: onClearAnswering,
                children: "not that",
              }),
            ],
          })
        : null,
      a
        ? (0, jsx.jsx)(motion.p, {
            className: "prompt-live",
            ...fadeIn(0, 0.4),
            children: a,
          })
        : null,
      (0, jsx.jsxs)(motion.div, {
        className: "writer",
        ...riseIn(0.2),
        children: [
          (0, jsx.jsxs)("label", {
            className: "sr-only",
            htmlFor: "say-text",
            children: ["Write to ", CANON.you],
          }),
          (0, jsx.jsx)("textarea", {
            ref: h,
            id: "say-text",
            value: r,
            onChange: (e) => i(e.target.value),
            placeholder: answering
              ? "Answer it however you like."
              : "Anything. It does not have to be good.",
            rows: 8,
            spellCheck: true,
          }),
          (0, jsx.jsxs)("div", {
            className: "writer-foot",
            children: [
              (0, jsx.jsx)("span", {
                className: "writer-count",
                children: g === 0 ? "nothing yet" : `${g} words`,
              }),
              (0, jsx.jsxs)("label", {
                className: "writer-private",
                children: [
                  (0, jsx.jsx)("input", {
                    type: "checkbox",
                    checked: s,
                    onChange: (e) => c(e.target.checked),
                  }),
                  "keep this one to yourself",
                ],
              }),
            ],
          }),
          (0, jsx.jsxs)("div", {
            className: "writer-row",
            children: [
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost",
                onClick: () => {
                  (tapTick(), o(nextPrompt(a)));
                },
                children: "give me a question",
              }),
              (0, jsx.jsx)("button", {
                type: "button",
                className: "solid",
                onClick: b,
                disabled: !r.trim(),
                children: "keep it",
              }),
            ],
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.div, {
        className: "one-word",
        ...fadeIn(0.4, 0.7),
        children: [
          (0, jsx.jsx)("label", {
            htmlFor: "one-word",
            children: ONE_WORD_PROMPT,
          }),
          (0, jsx.jsxs)("div", {
            className: "one-word-row",
            children: [
              (0, jsx.jsx)("input", {
                id: "one-word",
                type: "text",
                value: p,
                maxLength: 40,
                placeholder: "one word",
                onChange: (e) => m(e.target.value),
                onBlur: () => {
                  let e = p.trim();
                  update((t) => {
                    e ? (t.words[String(todayNumber())] = e) : delete t.words[String(todayNumber())];
                  });
                },
                autoComplete: "off",
              }),
              (0, jsx.jsxs)("span", {
                className: "one-word-count",
                children: [Object.keys(n.words).length, " days recorded"],
              }),
            ],
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.div, {
        className: "send",
        ...fadeIn(0.55, 0.7),
        children: [
          (0, jsx.jsxs)("p", {
            className: "send-title",
            children: ["Send it to ", CANON.you],
          }),
          (0, jsx.jsx)("p", {
            className: "send-body",
            children:
              v.length === 0
                ? "Nothing waiting. Write something and it will appear here."
                : `${v.length} ${v.length === 1 ? "letter" : "letters"} waiting. This makes one message you can send any way you like — it needs signal only for the second it takes to send.`,
          }),
          (0, jsx.jsx)("button", {
            type: "button",
            className: "solid",
            onClick: () => void x(),
            disabled: v.length === 0,
            children: "seal them",
          }),
        ],
      }),
      (0, jsx.jsx)(AnimatePresence, {
        children: l
          ? (0, jsx.jsx)(motion.div, {
              className: "scrim",
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 1,
              },
              exit: {
                opacity: 0,
              },
              onClick: () => u(null),
              children: (0, jsx.jsxs)(motion.div, {
                className: "confirm wide",
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
                  (0, jsx.jsxs)("p", {
                    className: "confirm-title",
                    children: [l.count, " ", l.count === 1 ? "letter" : "letters", ", sealed"],
                  }),
                  (0, jsx.jsx)("p", {
                    className: "confirm-body",
                    children: isShortEnough(l.size)
                      ? "It will fit in one message. Send it however you normally would."
                      : "It is long. Send it as a file — some apps cut long messages in half and then it will not open.",
                  }),
                  (0, jsx.jsx)("textarea", {
                    className: "sealed-code",
                    readOnly: true,
                    value: l.code,
                    rows: 4,
                    onFocus: (e) => e.target.select(),
                  }),
                  (0, jsx.jsxs)("div", {
                    className: "confirm-row wrap",
                    children: [
                      canShare()
                        ? (0, jsx.jsx)("button", {
                            type: "button",
                            className: "solid",
                            onClick: () => void C(),
                            children: "send",
                          })
                        : null,
                      (0, jsx.jsx)("button", {
                        type: "button",
                        className: "ghost",
                        onClick: () => void w(),
                        children: "copy",
                      }),
                      (0, jsx.jsx)("button", {
                        type: "button",
                        className: "ghost",
                        onClick: ee,
                        children: "save as a file",
                      }),
                      (0, jsx.jsx)("button", {
                        type: "button",
                        className: "ghost",
                        onClick: () => u(null),
                        children: "close",
                      }),
                    ],
                  }),
                  canShareFiles()
                    ? (0, jsx.jsx)("p", {
                        className: "confirm-fine",
                        children: "Sending uses your phone's own share sheet. Nothing is uploaded.",
                      })
                    : null,
                ],
              }),
            })
          : null,
      }),
      d
        ? (0, jsx.jsx)(motion.p, {
            className: "note",
            initial: {
              opacity: 0,
            },
            animate: {
              opacity: 1,
            },
            role: "status",
            children: d,
          })
        : null,
      _.length > 0
        ? (0, jsx.jsxs)("div", {
            className: "mine",
            children: [
              (0, jsx.jsx)("p", {
                className: "mine-title",
                children: "What you have written",
              }),
              (0, jsx.jsx)("ul", {
                children: _.map((e) =>
                  (0, jsx.jsxs)(
                    "li",
                    {
                      "data-private": e.private ? "true" : void 0,
                      children: [
                        (0, jsx.jsxs)("div", {
                          className: "mine-head",
                          children: [
                            (0, jsx.jsx)("span", {
                              children: new Date(e.at).toLocaleString(),
                            }),
                            (0, jsx.jsx)("span", {
                              className: "mine-tags",
                              children: e.private ? "private" : e.sent ? "sent" : "waiting",
                            }),
                          ],
                        }),
                        e.prompt
                          ? (0, jsx.jsx)("p", {
                              className: "mine-prompt",
                              children: e.prompt,
                            })
                          : null,
                        (0, jsx.jsx)("p", {
                          className: "mine-text",
                          children: e.text,
                        }),
                        (0, jsx.jsxs)("div", {
                          className: "mine-tools",
                          children: [
                            (0, jsx.jsx)("button", {
                              type: "button",
                              className: "ghost tiny",
                              onClick: () => {
                                (i(e.text),
                                  update((t) => {
                                    t.replies = t.replies.filter((t) => t.id !== e.id);
                                  }),
                                  h.current?.focus());
                              },
                              children: "edit",
                            }),
                            (0, jsx.jsx)("button", {
                              type: "button",
                              className: "ghost tiny",
                              onClick: () => {
                                update((t) => {
                                  t.replies = t.replies.filter((t) => t.id !== e.id);
                                });
                              },
                              children: "delete",
                            }),
                          ],
                        }),
                      ],
                    },
                    e.id,
                  ),
                ),
              }),
            ],
          })
        : null,
    ],
  });
}
