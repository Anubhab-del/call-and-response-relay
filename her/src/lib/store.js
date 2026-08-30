var STORE_KEY = `her.v1`;

var SCHEMA = 1;

var EMPTY_STATE = {
  schema: SCHEMA,
  greeted: !1,
  entered: !1,
  watched: !1,
  reelAt: 0,
  reelFurthest: 0,
  opened: {},
  spentOnce: !1,
  kept: {},
  collected: {},
  pulls: {},
  replies: [],
  words: {},
  visits: [],
  sound: !0,
  motion: `full`,
  inbox: [],
  nameWritten: !1,
  firstOpen: 0,
  lastOpen: 0,
};

var storageBroken = !1;

function probeStorage() {
  try {
    let e = `__her_probe__`;
    return (localStorage.setItem(e, `1`), localStorage.removeItem(e), !0);
  } catch {
    return !1;
  }
}

var storageWorks = typeof window < `u` && probeStorage();

storageWorks || (storageBroken = !0);

function normaliseState(e) {
  if (!e || typeof e != `object`)
    return {
      ...EMPTY_STATE,
    };
  let t = e;
  return {
    ...EMPTY_STATE,
    ...t,
    schema: SCHEMA,
    opened: {
      ...(t.opened ?? {}),
    },
    kept: {
      ...(t.kept ?? {}),
    },
    collected: {
      ...(t.collected ?? {}),
    },
    pulls: {
      ...(t.pulls ?? {}),
    },
    words: {
      ...(t.words ?? {}),
    },
    replies: Array.isArray(t.replies) ? t.replies.filter(isNote) : [],
    inbox: Array.isArray(t.inbox) ? t.inbox.filter(isNote) : [],
    visits: Array.isArray(t.visits) ? t.visits.filter((e) => typeof e == `number`) : [],
  };
}

function isNote(e) {
  return !!e && typeof e.text == `string` && typeof e.id == `string`;
}

var current = readState();

function readState() {
  if (!storageWorks)
    return {
      ...EMPTY_STATE,
    };
  try {
    let e = localStorage.getItem(STORE_KEY);
    return e
      ? normaliseState(JSON.parse(e))
      : {
          ...EMPTY_STATE,
        };
  } catch {
    try {
      let e = localStorage.getItem(STORE_KEY);
      (e && localStorage.setItem(`${STORE_KEY}.broken.${Date.now()}`, e),
        localStorage.removeItem(STORE_KEY));
    } catch {}
    return {
      ...EMPTY_STATE,
    };
  }
}

var listeners = new Set();

function subscribe(e) {
  return (
    listeners.add(e),
    () => {
      listeners.delete(e);
    }
  );
}

function snapshot() {
  return current;
}

var raf =
  typeof requestAnimationFrame == `function`
    ? (e) => requestAnimationFrame(e)
    : (e) => setTimeout(e, 16);

var cancelRaf =
  typeof cancelAnimationFrame == `function` ? (e) => cancelAnimationFrame(e) : (e) => clearTimeout(e);

var flushHandle = 0;

function persist() {
  if (storageWorks)
    try {
      (localStorage.setItem(STORE_KEY, JSON.stringify(current)), (storageBroken = !1));
    } catch {
      try {
        let e = {
          ...current,
          collected: {},
          visits: current.visits.slice(-90),
        };
        (localStorage.setItem(STORE_KEY, JSON.stringify(e)), (current = e), (storageBroken = !1));
      } catch {
        storageBroken = !0;
      }
    }
}

function update(e) {
  (e(current),
    (current = {
      ...current,
      opened: {
        ...current.opened,
      },
      kept: {
        ...current.kept,
      },
      collected: {
        ...current.collected,
      },
      pulls: {
        ...current.pulls,
      },
      words: {
        ...current.words,
      },
      replies: [...current.replies],
      inbox: [...current.inbox],
      visits: [...current.visits],
    }));
  for (let e of listeners) e(current);
  flushHandle ||= raf(() => {
    ((flushHandle = 0), persist());
  });
}

function flushNow() {
  (flushHandle && cancelRaf(flushHandle), (flushHandle = 0), persist());
}

typeof window < `u` &&
  (window.addEventListener(`pagehide`, flushNow),
  window.addEventListener(`beforeunload`, flushNow),
  document.addEventListener(`visibilitychange`, () => {
    document.hidden && flushNow();
  }),
  window.addEventListener(`storage`, (e) => {
    if (!(e.key !== STORE_KEY || !e.newValue))
      try {
        current = normaliseState(JSON.parse(e.newValue));
        for (let e of listeners) e(current);
      } catch {}
  }));

function exportState() {
  return JSON.stringify(
    {
      her: STORE_KEY,
      at: Date.now(),
      store: current,
    },
    null,
    2,
  );
}

function importState(e) {
  try {
    let t = JSON.parse(e),
      n = normaliseState(t.store ?? t),
      r = 0;
    return (
      update((e) => {
        let t = new Set(e.replies.map((e) => e.id));
        for (let i of n.replies) t.has(i.id) || (e.replies.push(i), (r += 1));
        ((e.opened = {
          ...n.opened,
          ...e.opened,
        }),
          (e.kept = {
            ...n.kept,
            ...e.kept,
          }),
          (e.words = {
            ...n.words,
            ...e.words,
          }),
          (e.collected = {
            ...n.collected,
            ...e.collected,
          }),
          (e.spentOnce = e.spentOnce || n.spentOnce),
          (e.watched = e.watched || n.watched));
      }),
      {
        ok: !0,
        added: r,
      }
    );
  } catch {
    return {
      ok: !1,
      added: 0,
      reason: `That file is not from here.`,
    };
  }
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
