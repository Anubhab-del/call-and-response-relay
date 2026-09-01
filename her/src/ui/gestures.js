// ── her hand, in the house ────────────────────────────────────────────────
//
// The picture has had gestures for a while: hold to stay, drag to turn, swipe
// up for the contents. The house had none of it — every room was tap-only,
// which meant the two halves of the same file did not answer the same hand.
//
// This is the shared layer. Nothing here is a scroll hijack: a gesture only
// counts if it is decisive, mostly on one axis, quick enough to be meant, and
// did not start on something that scrolls or takes text.

var SWIPE_MIN = 62;
var SWIPE_SLOP = 1.5;
var SWIPE_MAX_MS = 900;
var HOLD_MS = 420;
// Going back is an edge swipe, the way a phone does it, so it can never be
// mistaken for a swipe made inside a room.
var EDGE_PX = 46;

function fromControl(target) {
  return !!target?.closest?.("input, textarea, select, .contents, .no-swipe");
}

// A swipe, in whichever directions the caller asks for. `fromEdge` narrows it
// to gestures that begin at the left edge of the screen.
function useSwipe({ onRight, onLeft, onUp, onDown, fromEdge, min = SWIPE_MIN, guard } = {}) {
  let start = (0, React.useRef)(null);
  return {
    onPointerDown: (e) => {
      if (fromControl(e.target)) return;
      // The edge swipe yields to anything that handles its own: a vow row
      // reaches the left margin, and going back should never be a side effect
      // of marking one kept.
      if (fromEdge && (e.clientX > EDGE_PX || e.target?.closest?.("[data-swipe]"))) return;
      start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    },
    onPointerUp: (e) => {
      let from = start.current;
      start.current = null;
      if (!from) return;
      if (guard && guard(e) === false) return;
      if (performance.now() - from.t > SWIPE_MAX_MS) return;
      let dx = e.clientX - from.x;
      let dy = e.clientY - from.y;
      if (Math.abs(dx) > Math.abs(dy) * SWIPE_SLOP && Math.abs(dx) > min) {
        (dx > 0 ? onRight : onLeft)?.(e);
        return;
      }
      if (Math.abs(dy) > Math.abs(dx) * SWIPE_SLOP && Math.abs(dy) > min) {
        (dy > 0 ? onDown : onUp)?.(e);
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

// One primitive for everything the house can be touched with.
//
// A tap only counts if her thumb stayed put — brushing a card on the way past
// while scrolling must never open it. A hold counts once she has meant it for
// long enough, and then the tap that follows is swallowed, because she already
// got her answer.
function usePress({ onTap, onHold, ms = HOLD_MS } = {}) {
  let [holding, setHolding] = (0, React.useState)(false);
  let timer = (0, React.useRef)(0);
  let from = (0, React.useRef)(null);
  let fired = (0, React.useRef)(false);
  let moved = (0, React.useRef)(false);
  let hold = (0, React.useRef)(onHold);
  let tap = (0, React.useRef)(onTap);
  ((hold.current = onHold), (tap.current = onTap));
  let stop = (0, React.useCallback)(() => {
    (window.clearTimeout(timer.current), (timer.current = 0), setHolding(false));
  }, []);
  (0, React.useEffect)(() => () => window.clearTimeout(timer.current), []);
  return {
    holding: holding,
    fired: fired,
    handlers: {
      onPointerDown: (e) => {
        if (fromControl(e.target)) return;
        ((fired.current = false), (moved.current = false), (from.current = { x: e.clientX, y: e.clientY }));
        window.clearTimeout(timer.current);
        if (!hold.current) return;
        setHolding(true);
        timer.current = window.setTimeout(
          () => {
            ((fired.current = true), setHolding(false), tapKept(), hold.current?.(e));
          },
          isStill() ? Math.round(ms * 0.7) : ms,
        );
      },
      onPointerMove: (e) => {
        let f = from.current;
        if (!f) return;
        if (Math.hypot(e.clientX - f.x, e.clientY - f.y) > 9) ((moved.current = true), stop());
      },
      onPointerUp: stop,
      onPointerLeave: stop,
      onPointerCancel: () => {
        ((moved.current = true), stop());
      },
      onClick: (e) => {
        // A hold already answered her; a thumb that travelled was on its way
        // somewhere else.
        if (fired.current) {
          fired.current = false;
          return;
        }
        if (moved.current) return;
        tap.current?.(e);
      },
      onContextMenu: (e) => {
        if (hold.current) e.preventDefault();
      },
    },
  };
}

// Everything in the house answers the same keys. Rooms are 1 to 8 in the
// order they are on the landing, escape is always back, and the arrows walk
// the shelf of rooms without her having to go home first.
function useHouseKeys({ room, onGo, onBack, onKeys, enabled = true }) {
  (0, React.useEffect)(() => {
    if (!enabled) return;
    let onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target?.closest?.("input, textarea")) return;
      if (e.key === "Escape") {
        (e.preventDefault(), onBack?.());
        return;
      }
      if (e.key === "?" || e.key === "/") {
        (e.preventDefault(), onKeys?.());
        return;
      }
      let digit = Number.parseInt(e.key, 10);
      if (Number.isFinite(digit) && digit >= 1 && digit <= ROOMS.length) {
        (e.preventDefault(), onGo?.(ROOMS[digit - 1].id));
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      let at = ROOMS.findIndex((r) => r.id === room);
      if (at < 0) {
        if (e.key === "ArrowRight") (e.preventDefault(), onGo?.(ROOMS[0].id));
        return;
      }
      e.preventDefault();
      let next = at + (e.key === "ArrowRight" ? 1 : -1);
      if (next < 0) onBack?.();
      else if (next < ROOMS.length) onGo?.(ROOMS[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [room, onGo, onBack, onKeys, enabled]);
}

// Wherever her thumb is in the house, a little more light — the same as the
// picture does, so the two halves feel like one place.
function useThumbLight(ref) {
  (0, React.useEffect)(() => {
    let el = ref.current;
    if (!el || isStill()) return;
    let queued = 0;
    let at = { x: 0, y: 0 };
    let write = () => {
      queued = 0;
      let box = el.getBoundingClientRect();
      if (!box.width) return;
      el.style.setProperty("--touch-x", `${((at.x - box.left) / box.width) * 100}%`);
      el.style.setProperty("--touch-y", `${((at.y - box.top) / box.height) * 100}%`);
    };
    let move = (e) => {
      at = { x: e.clientX, y: e.clientY };
      if (!queued) queued = requestAnimationFrame(write);
    };
    (el.addEventListener("pointermove", move, { passive: true }),
      el.addEventListener("pointerdown", move, { passive: true }));
    return () => {
      if (queued) cancelAnimationFrame(queued);
      (el.removeEventListener("pointermove", move), el.removeEventListener("pointerdown", move));
    };
  }, [ref]);
}

// Nobody is going to read a manual for a love letter. This is the one place
// the keys are written down, and it only appears if she asks for it.
var KEY_CARD = [
  ["1 – 8", "the rooms, in the order they are on the front"],
  ["← →", "the room before, the room after"],
  ["esc", "back to the front door"],
  ["swipe from the left", "the same as back"],
  ["hold", "wherever something can be held, it can"],
  ["?", "this"],
];
function KeyCard({ onClose: onClose }) {
  (0, React.useEffect)(() => {
    let onKey = (e) => {
      if (e.key === "Escape" || e.key === "?" || e.key === "/") (e.preventDefault(), onClose());
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  return (0, jsx.jsx)(motion.div, {
    className: "scrim",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    onClick: onClose,
    children: (0, jsx.jsxs)(motion.div, {
      className: "confirm key-card",
      onClick: (e) => e.stopPropagation(),
      initial: { opacity: 0, y: isStill() ? 0 : 18 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: isStill() ? 0 : 18 },
      children: [
        (0, jsx.jsx)("p", { className: "confirm-title", children: "If you like keys" }),
        (0, jsx.jsx)("dl", {
          className: "key-card-list",
          children: KEY_CARD.map(([key, what]) =>
            (0, jsx.jsxs)(
              jsx.Fragment,
              {
                children: [
                  (0, jsx.jsx)("dt", { children: key }),
                  (0, jsx.jsx)("dd", { children: what }),
                ],
              },
              key,
            ),
          ),
        }),
        (0, jsx.jsx)("p", {
          className: "confirm-body",
          children: "You never have to use any of it. Everything here can still be reached with a thumb.",
        }),
        (0, jsx.jsx)("div", {
          className: "confirm-row",
          children: (0, jsx.jsx)("button", {
            type: "button",
            className: "solid",
            onClick: onClose,
            children: "close it",
          }),
        }),
      ],
    }),
  });
}
