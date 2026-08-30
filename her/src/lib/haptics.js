var hapticsArmed = !1;

function armHaptics() {
  hapticsArmed = !0;
}

function buzz(e) {
  if (hapticsArmed && !(typeof navigator > `u` || typeof navigator.vibrate != `function`))
    try {
      navigator.vibrate(e);
    } catch {}
}

var tapTick = () => buzz(8);

var tapKept = () => buzz([14, 40, 22]);

var tapOnce = () => buzz([10, 30, 10, 30, 24]);

var tapWeighted = (e) => buzz(Math.round(12 + e * 26));
