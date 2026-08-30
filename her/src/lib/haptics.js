var hapticsArmed = false;
function armHaptics() {
  hapticsArmed = true;
}
function buzz(e) {
  if (hapticsArmed && !(typeof navigator === "undefined" || typeof navigator.vibrate != "function"))
    try {
      navigator.vibrate(e);
    } catch {}
}
var tapTick = () => buzz(8);
var tapKept = () => buzz([14, 40, 22]);
var tapOnce = () => buzz([10, 30, 10, 30, 24]);
var tapWeighted = (e) => buzz(Math.round(12 + e * 26));
