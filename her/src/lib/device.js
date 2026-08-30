// Three modes, and what each one means:
//   full   the whole storm — rain, dust, lightning, the lamp breathing, tilt
//   lean   the weather stays, the extras go — no tilt, fewer particles,
//          shorter transitions. For an old phone and a slow night.
//   still  nothing moves that does not have to. Also what the system asks for
//          when prefers-reduced-motion is set, whatever is chosen here.
// null means: work it out from the device.
var motionPref = null;

function setMotionPreference(pref) {
  // "calm" is what the two-mode version called still. Old saves still say it.
  motionPref = pref === "calm" ? "still" : pref;
  applyMotionClasses();
}
function prefersReducedMotion() {
  return typeof window === "undefined"
    ? false
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function prefersSaveData() {
  return typeof navigator === "undefined" ? false : !!navigator.connection?.saveData;
}
function isLowCoreDevice() {
  if (typeof navigator === "undefined") return false;
  let e = navigator.hardwareConcurrency;
  return typeof e == "number" && e > 0 && e <= 4;
}
function isHandheld() {
  return typeof window === "undefined"
    ? false
    : window.matchMedia("(pointer: coarse)").matches ||
        Math.min(window.innerWidth, window.innerHeight) < 560;
}
function isSmallPhone() {
  return typeof window === "undefined" ? false : Math.min(window.innerWidth, window.innerHeight) <= 380;
}
function isLean() {
  if (typeof window === "undefined") return false;
  if (motionPref === "still" || motionPref === "lean") return true;
  if (prefersReducedMotion()) return true;
  // "The whole storm" means the whole storm. If the phone cannot take it the
  // house says so once, on the first visit, by choosing lean out loud — see
  // shouldStartLean. It does not quietly override a button she pressed.
  if (motionPref === "full") return false;
  return isHandheld() || prefersSaveData() || isLowCoreDevice();
}

// What the house would pick for her on a phone it has never met.
function shouldStartLean() {
  if (typeof window === "undefined") return false;
  return prefersSaveData() || (isHandheld() && isLowCoreDevice());
}

function isStill() {
  return motionPref === "still" || prefersReducedMotion();
}
function cappedPixelRatio(e) {
  return typeof window === "undefined" ? 1 : Math.max(1, Math.min(e, window.devicePixelRatio || 1));
}
function supportsFullscreen() {
  return typeof document === "undefined" || /iP(hone|ad|od)/.test(navigator.userAgent)
    ? false
    : typeof document.documentElement.requestFullscreen == "function";
}
function canShare() {
  return typeof navigator !== "undefined" && typeof navigator.share == "function";
}
function canShareFiles() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare == "function" &&
    typeof navigator.share == "function"
  );
}
function applyMotionClasses() {
  if (typeof document === "undefined") return;
  let e = document.documentElement;
  (e.classList.toggle("is-phone", isHandheld()),
    e.classList.toggle("is-small", isSmallPhone()),
    e.classList.toggle("is-lean", isLean()),
    e.classList.toggle("is-still", isStill()));
}
// The frame is the visual viewport, not the layout viewport: on a phone the
// keyboard and the address bar both eat into it, and the house has to sit in
// what is actually left.
//
// It is written on a frame, and only when the rounded value has really moved.
// visualViewport fires "scroll" on every rubber-band, and rewriting a custom
// property on each one made the letterbox shiver during a beat.
function trackFrameHeight() {
  let root = document.documentElement;
  let lastH = 0;
  let lastW = 0;
  let queued = 0;

  let write = () => {
    queued = 0;
    let view = window.visualViewport;
    let h = Math.round(view?.height ?? window.innerHeight);
    let w = Math.round(view?.width ?? window.innerWidth);
    if (h === lastH && w === lastW) return;
    if (h !== lastH) {
      lastH = h;
      root.style.setProperty("--frame-h", `${h}px`);
    }
    if (w !== lastW) {
      lastW = w;
      root.style.setProperty("--frame-w", `${w}px`);
      // Only a real change of shape can change whether this is a phone.
      applyMotionClasses();
    }
  };

  let schedule = () => {
    if (queued) return;
    queued = requestAnimationFrame(write);
  };

  write();
  applyMotionClasses();
  window.visualViewport?.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("scroll", schedule);
  window.addEventListener("orientationchange", schedule);
  window.addEventListener("resize", schedule);
  return () => {
    if (queued) cancelAnimationFrame(queued);
    window.visualViewport?.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("scroll", schedule);
    window.removeEventListener("orientationchange", schedule);
    window.removeEventListener("resize", schedule);
  };
}

async function requestWakeLock() {
  let e = navigator;
  if (!e.wakeLock) return () => {};
  let t = null;
  try {
    t = await e.wakeLock.request("screen");
  } catch {
    return () => {};
  }
  let n = async () => {
    if (document.visibilityState === "visible")
      try {
        t = await e.wakeLock.request("screen");
      } catch {}
  };
  return (
    document.addEventListener("visibilitychange", n),
    () => {
      (document.removeEventListener("visibilitychange", n), t?.release().catch(() => {}));
    }
  );
}
var TILT_LIMIT = 9;
function startTilt() {
  // Parallax is the first thing to go when she asks for less.
  if (typeof window === "undefined" || isLean()) return () => {};
  let e = document.documentElement,
    t = 0,
    n = 0,
    r = 0,
    i = 0,
    a = 0,
    o = () => {
      ((t += (r - t) * 0.06),
        (n += (i - n) * 0.06),
        e.style.setProperty("--par-x", t.toFixed(2)),
        e.style.setProperty("--par-y", n.toFixed(2)),
        (a = requestAnimationFrame(o)));
    };
  a = requestAnimationFrame(o);
  let s = (e) => {
      ((r = ((e.clientX / window.innerWidth) * 2 - 1) * TILT_LIMIT),
        (i = ((e.clientY / window.innerHeight) * 2 - 1) * TILT_LIMIT * 0.6));
    },
    c = (e) => {
      e.gamma !== null &&
        e.beta !== null &&
        ((r = Math.max(-1, Math.min(1, e.gamma / 34)) * TILT_LIMIT),
        (i = Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * TILT_LIMIT * 0.6));
    };
  return (
    window.addEventListener("pointermove", s, {
      passive: true,
    }),
    window.addEventListener("deviceorientation", c),
    () => {
      (cancelAnimationFrame(a),
        window.removeEventListener("pointermove", s),
        window.removeEventListener("deviceorientation", c),
        e.style.setProperty("--par-x", "0"),
        e.style.setProperty("--par-y", "0"));
    }
  );
}
