function SettingsRoom() {
  let e = useStore(),
    [t, n] = (0, React.useState)(""),
    [r, i] = (0, React.useState)(""),
    [a, o] = (0, React.useState)(false),
    s = (0, React.useRef)(null),
    c = (0, React.useRef)(null);
  (0, React.useEffect)(() => onInstallAvailable(o), []);
  let l = (e, t = 6e3) => {
      (i(e), window.setTimeout(() => i((t) => (t === e ? "" : t)), t));
    },
    u = async (e) => {
      let t = await openSeal(e);
      if (!t.ok) {
        l(t.reason);
        return;
      }
      let r = 0;
      (update((e) => {
        let n = new Set(e.inbox.map((e) => e.id));
        for (let i of t.replies) n.has(i.id) || (e.inbox.push(i), (r += 1));
      }),
        n(""),
        l(
          r === 0
            ? "That one was already here. Nothing was lost."
            : `${r} ${r === 1 ? "letter" : "letters"} opened. They are in the room called what arrived.`,
        ));
    };
  return (0, jsx.jsxs)("div", {
    className: "settings",
    children: [
      (0, jsx.jsxs)(motion.section, {
        ...fadeIn(0, 0.5),
        children: [
          (0, jsx.jsx)("h3", {
            children: "Sound",
          }),
          (0, jsx.jsx)("div", {
            className: "row",
            children: (0, jsx.jsx)("button", {
              type: "button",
              className: e.sound ? "solid" : "ghost",
              onClick: () => {
                let t = !e.sound;
                (score.setMuted(!t),
                  update((e) => {
                    e.sound = t;
                  }));
              },
              children: e.sound ? "sound is on" : "sound is off",
            }),
          }),
          (0, jsx.jsx)("p", {
            className: "fine",
            children: score.hasSong
              ? "The song he chose is in the file. It plays under everything."
              : "There is no song in this copy, so the rain and the storm are the score.",
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.section, {
        ...fadeIn(0.05, 0.5),
        children: [
          (0, jsx.jsx)("h3", {
            children: "Motion",
          }),
          (0, jsx.jsxs)("div", {
            className: "row",
            children: [
              (0, jsx.jsx)("button", {
                type: "button",
                className: e.motion === "full" ? "solid" : "ghost",
                onClick: () => {
                  (setMotionPreference("full"),
                    update((e) => {
                      e.motion = "full";
                    }));
                },
                children: "the whole storm",
              }),
              (0, jsx.jsx)("button", {
                type: "button",
                className: e.motion === "calm" ? "solid" : "ghost",
                onClick: () => {
                  (setMotionPreference("calm"),
                    update((e) => {
                      e.motion = "calm";
                    }));
                },
                children: "keep it still",
              }),
            ],
          }),
          (0, jsx.jsx)("p", {
            className: "fine",
            children: "Still is easier on an old phone and on a bad night.",
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.section, {
        ...fadeIn(0.1, 0.5),
        children: [
          (0, jsx.jsx)("h3", {
            children: "Open something you were sent",
          }),
          (0, jsx.jsx)("textarea", {
            value: t,
            onChange: (e) => n(e.target.value),
            rows: 3,
            placeholder: "paste the whole message, starting with HER1",
            spellCheck: false,
          }),
          (0, jsx.jsxs)("div", {
            className: "row",
            children: [
              (0, jsx.jsx)("button", {
                type: "button",
                className: "solid",
                onClick: () => void u(t),
                disabled: !t.trim(),
                children: "open it",
              }),
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost",
                onClick: () => s.current?.click(),
                children: "open a file instead",
              }),
            ],
          }),
          (0, jsx.jsx)("input", {
            ref: s,
            type: "file",
            accept: ".txt,.her,text/plain",
            className: "sr-only",
            onChange: async (e) => {
              let t = e.target.files?.[0];
              t && (await u(await t.text()), (e.target.value = ""));
            },
          }),
        ],
      }),
      (0, jsx.jsxs)(motion.section, {
        ...fadeIn(0.15, 0.5),
        children: [
          (0, jsx.jsx)("h3", {
            children: "Keep a copy",
          }),
          (0, jsx.jsx)("p", {
            className: "fine",
            children:
              "Everything you have written, as one file. If you change phones, open it here on the new one and nothing is lost.",
          }),
          (0, jsx.jsxs)("div", {
            className: "row",
            children: [
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost",
                onClick: () => {
                  let e = new Blob([exportState()], {
                      type: "application/json",
                    }),
                    t = URL.createObjectURL(e),
                    n = document.createElement("a");
                  ((n.href = t),
                    (n.download = `her-backup-${new Date().toISOString().slice(0, 10)}.json`),
                    n.click(),
                    URL.revokeObjectURL(t),
                    l("Saved. Keep it somewhere dull and safe."));
                },
                children: "save everything",
              }),
              (0, jsx.jsx)("button", {
                type: "button",
                className: "ghost",
                onClick: () => c.current?.click(),
                children: "put a copy back",
              }),
            ],
          }),
          (0, jsx.jsx)("input", {
            ref: c,
            type: "file",
            accept: ".json,application/json",
            className: "sr-only",
            onChange: async (e) => {
              let t = e.target.files?.[0];
              if (!t) return;
              let n = importState(await t.text());
              (l(
                n.ok ? `Back. ${n.added} added, nothing replaced.` : (n.reason ?? "That did not open."),
              ),
                (e.target.value = ""));
            },
          }),
          storageBroken
            ? (0, jsx.jsx)("p", {
                className: "warn",
                children:
                  "This phone will not let the house save anything at the moment — the storage is full or switched off. You can still read everything. Do not write anything long until it is fixed.",
              })
            : null,
        ],
      }),
      a && !isStandalone()
        ? (0, jsx.jsxs)(motion.section, {
            ...fadeIn(0.2, 0.5),
            children: [
              (0, jsx.jsx)("h3", {
                children: "Put it on your home screen",
              }),
              (0, jsx.jsx)("p", {
                className: "fine",
                children:
                  "Then it opens with its own name and no browser around it, and it works with no signal.",
              }),
              (0, jsx.jsx)("div", {
                className: "row",
                children: (0, jsx.jsxs)("button", {
                  type: "button",
                  className: "solid",
                  onClick: () =>
                    void promptInstall().then((e) => e && l("Done. It is with your apps now.")),
                  children: ["add ", CANON.title],
                }),
              }),
            ],
          })
        : null,
      (0, jsx.jsxs)(motion.section, {
        ...fadeIn(0.25, 0.5),
        children: [
          (0, jsx.jsx)("h3", {
            children: "The door",
          }),
          (0, jsx.jsx)("p", {
            className: "fine",
            children: "Ask for the word again next time. Useful if someone else picks up your phone.",
          }),
          (0, jsx.jsx)("div", {
            className: "row",
            children: (0, jsx.jsx)("button", {
              type: "button",
              className: "ghost",
              onClick: () => {
                (update((e) => {
                  e.entered = false;
                }),
                  l("Locked. It will ask next time."));
              },
              children: "lock it again",
            }),
          }),
        ],
      }),
      r
        ? (0, jsx.jsx)("p", {
            className: "note",
            role: "status",
            children: r,
          })
        : null,
    ],
  });
}
function InboxRoom() {
  let e = [...useStore().inbox].sort((e, t) => t.at - e.at);
  return (0, jsx.jsxs)("div", {
    className: "inbox",
    children: [
      (0, jsx.jsx)(motion.p, {
        className: "room-lede",
        ...fadeIn(0, 0.6),
        children:
          e.length === 0
            ? "Nothing yet. When something is sent to you, open it in the fuse box and it lands here."
            : "What was sent to you. It is kept here, on this phone, like everything else.",
      }),
      (0, jsx.jsx)("ul", {
        className: "mine",
        children: e.map((e) =>
          (0, jsx.jsxs)(
            motion.li,
            {
              initial: {
                opacity: 0,
                y: 10,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              transition: {
                duration: 0.45,
              },
              children: [
                (0, jsx.jsxs)("div", {
                  className: "mine-head",
                  children: [
                    (0, jsx.jsx)("span", {
                      children: new Date(e.at).toLocaleString(),
                    }),
                    (0, jsx.jsxs)("span", {
                      className: "mine-tags",
                      children: ["from ", CANON.name],
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
                (0, jsx.jsx)("div", {
                  className: "mine-tools",
                  children: (0, jsx.jsx)("button", {
                    type: "button",
                    className: "ghost tiny",
                    onClick: () =>
                      update((t) => {
                        t.inbox = t.inbox.filter((t) => t.id !== e.id);
                      }),
                    children: "remove",
                  }),
                }),
              ],
            },
            e.id,
          ),
        ),
      }),
    ],
  });
}
