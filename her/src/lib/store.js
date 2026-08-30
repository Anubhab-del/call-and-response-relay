var STORE_KEY = "her.v1";
var SCHEMA = 1;
var EMPTY_STATE = {
  schema: SCHEMA,
  greeted: false,
  entered: false,
  watched: false,
  reelAt: 0,
  reelFurthest: 0,
  opened: {},
  spentOnce: false,
  kept: {},
  collected: {},
  pulls: {},
  replies: [],
  words: {},
  visits: [],
  sound: true,
  motion: "full",
  inbox: [],
  nameWritten: false,
  firstOpen: 0,
  lastOpen: 0,
};
var storageBroken = false;
function probeStorage() {
  try {
    let e = "__her_probe__";
    return (localStorage.setItem(e, "1"), localStorage.removeItem(e), true);
  } catch {
    return false;
  }
}
var storageWorks = typeof window !== "undefined" && probeStorage();
storageWorks || (storageBroken = true);
function normaliseState(e) {
  if (!e || typeof e != "object")
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
    visits: Array.isArray(t.visits) ? t.visits.filter((e) => typeof e == "number") : [],
  };
}
function isNote(e) {
  return !!e && typeof e.text == "string" && typeof e.id == "string";
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
  typeof requestAnimationFrame == "function"
    ? (e) => requestAnimationFrame(e)
    : (e) => setTimeout(e, 16);
var cancelRaf =
  typeof cancelAnimationFrame == "function" ? (e) => cancelAnimationFrame(e) : (e) => clearTimeout(e);
var flushHandle = 0;
function persist() {
  if (storageWorks)
    try {
      (localStorage.setItem(STORE_KEY, JSON.stringify(current)), (storageBroken = false));
    } catch {
      try {
        let e = {
          ...current,
          collected: {},
          visits: current.visits.slice(-90),
        };
        (localStorage.setItem(STORE_KEY, JSON.stringify(e)), (current = e), (storageBroken = false));
      } catch {
        storageBroken = true;
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
typeof window !== "undefined" &&
  (window.addEventListener("pagehide", flushNow),
  window.addEventListener("beforeunload", flushNow),
  document.addEventListener("visibilitychange", () => {
    document.hidden && flushNow();
  }),
  window.addEventListener("storage", (e) => {
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
// A restore is a merge, never a replacement. Whatever this phone already knows
// stays known; whatever the copy knows is added. That is the promise the fuse
// box makes out loud ("nothing replaced"), so it has to be true of every field.
function importState(text) {
  try {
    let file = JSON.parse(text);
    let copy = normaliseState(file.store ?? file);
    let added = 0;
    update((state) => {
      // Notes and letters that arrived: merged by id, oldest kept.
      let haveReplies = new Set(state.replies.map((r) => r.id));
      for (let note of copy.replies) {
        if (!haveReplies.has(note.id)) {
          state.replies.push(note);
          added += 1;
        }
      }
      let haveInbox = new Set(state.inbox.map((n) => n.id));
      for (let note of copy.inbox) {
        if (!haveInbox.has(note.id)) {
          state.inbox.push(note);
          added += 1;
        }
      }

      // Dated marks: the earlier date is the true one.
      state.opened = earliest(copy.opened, state.opened);
      state.kept = earliest(copy.kept, state.kept);
      state.collected = earliest(copy.collected, state.collected);

      // A word written today is hers now; an old copy does not overwrite it.
      state.words = { ...copy.words, ...state.words };

      // Counts and reach: whichever went further.
      state.pulls = highest(copy.pulls, state.pulls);
      state.reelFurthest = Math.max(state.reelFurthest, copy.reelFurthest);
      state.reelAt = Math.max(state.reelAt, copy.reelAt);

      // Days she came by, from both phones.
      state.visits = [...new Set([...state.visits, ...copy.visits])].sort((a, b) => a - b).slice(-365);

      // Doors that have been through: once through, through.
      state.spentOnce = state.spentOnce || copy.spentOnce;
      state.watched = state.watched || copy.watched;
      state.greeted = state.greeted || copy.greeted;
      state.nameWritten = state.nameWritten || copy.nameWritten;
      state.firstOpen = earliestStamp(state.firstOpen, copy.firstOpen);
    });
    return { ok: true, added };
  } catch {
    return { ok: false, added: 0, reason: "That file is not from here." };
  }
}

function earliest(from, mine) {
  let out = { ...from };
  for (let [key, at] of Object.entries(mine)) {
    let theirs = out[key];
    out[key] = typeof theirs === "number" && typeof at === "number" ? Math.min(theirs, at) : at;
  }
  return out;
}

function highest(from, mine) {
  let out = { ...from };
  for (let [key, n] of Object.entries(mine)) {
    let theirs = out[key];
    out[key] = typeof theirs === "number" && typeof n === "number" ? Math.max(theirs, n) : n;
  }
  return out;
}

function earliestStamp(a, b) {
  if (!a) return b || 0;
  if (!b) return a;
  return Math.min(a, b);
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
