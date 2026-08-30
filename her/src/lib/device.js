var motionPref = null;
function setMotionPreference(e) {
  ((motionPref = e), applyMotionClasses());
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
  return typeof window === "undefined"
    ? false
    : motionPref === "calm"
      ? true
      : motionPref === "full"
        ? isHandheld() && isLowCoreDevice()
        : prefersReducedMotion()
          ? true
          : isHandheld() || prefersSaveData() || isLowCoreDevice();
}
function isStill() {
  return motionPref === "calm" || prefersReducedMotion();
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
function trackFrameHeight() {
  let e = () => {
    let e = window.visualViewport,
      t = Math.round(e?.height ?? window.innerHeight),
      n = Math.round(e?.width ?? window.innerWidth),
      r = document.documentElement;
    (r.style.setProperty("--frame-h", `${t}px`),
      r.style.setProperty("--frame-w", `${n}px`),
      applyMotionClasses());
  };
  return (
    e(),
    window.visualViewport?.addEventListener("resize", e),
    window.visualViewport?.addEventListener("scroll", e),
    window.addEventListener("orientationchange", e),
    window.addEventListener("resize", e),
    () => {
      (window.visualViewport?.removeEventListener("resize", e),
        window.visualViewport?.removeEventListener("scroll", e),
        window.removeEventListener("orientationchange", e),
        window.removeEventListener("resize", e));
    }
  );
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
  if (typeof window === "undefined" || isStill()) return () => {};
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
