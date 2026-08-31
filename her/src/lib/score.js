function makeImpulse(e) {
  try {
    let t = isLean(),
      n = t ? 1.5 : 2.8,
      r = e.sampleRate,
      i = Math.floor(r * n),
      a = e.createBuffer(2, i, r),
      o = Math.floor(r * 0.018);
    for (let e = 0; e < 2; e++) {
      let n = a.getChannelData(e),
        s = 0;
      for (let r = o; r < i; r++) {
        let a = (1 - (r - o) / (i - o)) ** (t ? 2.6 : 3.4),
          c = Math.random() * 2 - 1;
        ((s = s * 0.62 + c * 0.38), (n[r] = s * a * (e === 0 ? 1 : 0.94)));
      }
      for (let [t, a] of [
        [0.011, 0.5],
        [0.023, 0.36],
        [0.037, 0.24],
      ]) {
        let s = o + Math.floor(r * t) + (e === 1 ? 37 : 0);
        s < i && (n[s] += a * (Math.random() > 0.5 ? 1 : -1));
      }
    }
    let s = e.createConvolver();
    return ((s.buffer = a), (s.normalize = true), s);
  } catch {
    return null;
  }
}
function midiToHz(e) {
  return 110 * 2 ** (e / 12);
}
var KEYS = [
  {
    key: "A minor",
    root: 0,
    minor: true,
    chords: [
      [0, 3, 7],
      [-4, 0, 3],
      [3, 7, 10],
      [-2, 2, 5],
    ],
    bar: 11,
    weight: 0.66,
    colour: 0.7,
  },
  {
    key: "F major",
    root: -4,
    minor: false,
    chords: [
      [0, 4, 7],
      [7, 11, 14],
      [9, 12, 16],
      [5, 9, 12],
    ],
    bar: 13,
    weight: 0.78,
    colour: 0.52,
  },
  {
    key: "C major",
    root: 3,
    minor: false,
    chords: [
      [0, 4, 7],
      [4, 7, 11],
      [9, 12, 16],
      [5, 9, 12],
    ],
    bar: 12,
    weight: 0.84,
    colour: 0.78,
  },
  {
    key: "D major",
    root: 5,
    minor: false,
    chords: [
      [0, 4, 7],
      [7, 11, 14],
      [-3, 0, 4],
      [5, 9, 12],
    ],
    bar: 14,
    weight: 0.92,
    colour: 0.88,
  },
];
// A struck string, heard through a wall.
//
// Not a sample and not a sawtooth: a hammer click, a stack of slightly
// inharmonic partials that die at different rates the way real strings do,
// and a damper closing over the whole thing. Most of it goes to the reverb,
// which is what puts it in the next room rather than in her ear.
function strikeKey(ctx, out, hz, { level = 0.06, decay = 5.2, hammer = 1 } = {}) {
  try {
    let now = ctx.currentTime;
    let lean = isLean();

    let body = ctx.createGain();
    body.gain.value = 0;
    body.connect(out);

    // The damper: open at the strike, closed by the end of the note.
    let damper = ctx.createBiquadFilter();
    damper.type = "lowpass";
    damper.Q.value = 0.4;
    damper.frequency.setValueAtTime(Math.min(9000, hz * 7), now);
    damper.frequency.exponentialRampToValueAtTime(Math.max(220, hz * 1.7), now + decay * 0.7);
    damper.connect(body);

    // Partials. Higher ones are quieter and shorter, and sit a little sharp of
    // the harmonic series, which is the whole sound of a real string.
    let partials = lean
      ? [[1, 1, 1], [2.001, 0.3, 0.55], [3.004, 0.1, 0.32]]
      : [
          [1, 1, 1],
          [2.001, 0.32, 0.58],
          [3.005, 0.13, 0.36],
          [4.012, 0.06, 0.24],
          [5.42, 0.028, 0.15],
          [6.8, 0.012, 0.1],
        ];
    let parts = [];
    for (let [ratio, amp, life] of partials) {
      let f = hz * ratio;
      if (f > 14000) continue;
      let osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      // Two cents of drift so no two strikes are quite the same note.
      osc.detune.value = (Math.random() - 0.5) * 4;
      let g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(amp, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.4, decay * life));
      osc.connect(g);
      g.connect(damper);
      osc.start(now);
      osc.stop(now + decay + 0.4);
      parts.push([osc, g]);
    }

    // The hammer. A few milliseconds of filtered noise, felt more than heard.
    if (hammer > 0 && !lean) {
      let n = Math.floor(ctx.sampleRate * 0.02);
      let buf = ctx.createBuffer(1, n, ctx.sampleRate);
      let d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 5;
      let src = ctx.createBufferSource();
      src.buffer = buf;
      let bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = Math.min(5200, hz * 4);
      bp.Q.value = 0.8;
      let hg = ctx.createGain();
      hg.gain.value = 0.16 * hammer;
      src.connect(bp);
      bp.connect(hg);
      hg.connect(damper);
      src.start(now);
      src.onended = () => {
        try {
          (src.disconnect(), bp.disconnect(), hg.disconnect());
        } catch {}
      };
    }

    body.gain.setValueAtTime(0, now);
    body.gain.linearRampToValueAtTime(level, now + 0.004);
    body.gain.setTargetAtTime(0, now + decay * 0.55, decay * 0.3);

    window.setTimeout(
      () => {
        for (let [osc, g] of parts)
          try {
            (osc.disconnect(), g.disconnect());
          } catch {}
        try {
          (damper.disconnect(), body.disconnect());
        } catch {}
      },
      Math.ceil((decay + 1) * 1000),
    );
  } catch {}
}

var BASE_GAIN = 0.5;
var PAD_LEVELS = [0.26, 0.19, 0.13];
var score = new (class {
  ctx = null;
  master = null;
  duck = null;
  dry = null;
  wet = null;
  punch = null;
  verb = null;
  rainGain = null;
  rainSrc = null;
  song = null;
  songReady = false;
  whisper = null;
  whisperSpent = false;
  cue = "";
  started = false;
  muted = false;
  volume = 1;
  async unlock() {
    try {
      if (this.ctx) {
        this.ctx.state === "suspended" && (await this.ctx.resume());
        return;
      }
      let e = window.AudioContext ?? window.webkitAudioContext;
      if (!e) return;
      let t = new e(),
        n = t.createGain(),
        r = t.createGain(),
        i = t.createGain(),
        a = t.createGain(),
        o = t.createGain();
      if (
        // The first sound of the evening arrives; it does not switch on.
        // Silent at the moment of the tap, up to level over a slow count.
        ((n.gain.value = 0),
        (r.gain.value = 1),
        (i.gain.value = 0.82),
        (a.gain.value = 0.34),
        (o.gain.value = 1),
        i.connect(r),
        r.connect(n),
        o.connect(n),
        n.connect(t.destination),
        isStill())
      )
        ((a.gain.value = 0), a.connect(r));
      else {
        let e = makeImpulse(t);
        e ? (a.connect(e), e.connect(r), (this.verb = e)) : a.connect(r);
      }
      ((this.ctx = t),
        (this.master = n),
        (this.duck = r),
        (this.dry = i),
        (this.wet = a),
        (this.punch = o),
        (this.started = true),
        n.gain.setValueAtTime(0, t.currentTime),
        this.muted ||
          n.gain.linearRampToValueAtTime(BASE_GAIN * this.volume, t.currentTime + 2.4),
        this.ensureRain(0.026),
        await this.loadSong());
    } catch {}
  }
  get isOn() {
    return this.started && !this.muted;
  }
  get hasSong() {
    return this.songReady;
  }
  send(e) {
    (this.dry && e.connect(this.dry), this.wet && e.connect(this.wet));
  }
  bus() {
    if (!this.ctx || !this.dry || !this.wet) return null;
    let e = this.ctx.createGain();
    return ((e.gain.value = 1), this.send(e), e);
  }
  setMuted(e) {
    ((this.muted = e),
      this.applyGain(),
      this.song && (this.song.muted = e),
      this.whisper && (this.whisper.muted = e));
  }
  setVolume(e) {
    ((this.volume = Math.max(0, Math.min(1, e))),
      this.applyGain(),
      this.song && (this.song.volume = 0.34 * this.volume));
  }
  applyGain() {
    let e = this.ctx,
      t = this.master;
    !e ||
      !t ||
      (t.gain.cancelScheduledValues(e.currentTime),
      t.gain.setTargetAtTime(this.muted ? 0 : BASE_GAIN * this.volume * (this.hushed ? 0.42 : 1), e.currentTime, 0.2));
  }
  // ── the score ────────────────────────────────────────────────────────────
  //
  // Near silence, and a note every so often. The rain is the bed; this is one
  // hand on a piano in another room, not playing anything in particular.
  //
  // Nothing sustains. Nothing repeats on a loop she can learn. Two notes at
  // most, now and then, and long gaps she can forget the music inside.

  keyIndex = null;
  keyTimer = 0;
  keyGap = 12000;
  keyLevel = 1;
  keyLast = -1;

  setKey(index) {
    if (!this.ctx || this.keyIndex === index) return;
    this.keyIndex = index;
    this.runKeys(2600 + Math.random() * 2200);
  }

  stopKeys() {
    (window.clearTimeout(this.keyTimer), (this.keyIndex = null), (this.keyTimer = 0));
  }

  // Where in the key the next note comes from. A wide, open voicing —
  // roots, fifths, sixths, ninths — nothing that resolves and closes a door.
  keyNotes() {
    let key = KEYS[this.keyIndex ?? 0] ?? KEYS[0];
    let degrees = key.minor ? [0, 3, 7, 10, 14, 15, 19] : [0, 4, 7, 9, 12, 16, 19];
    let out = [];
    for (let octave of [12, 24, 36]) for (let d of degrees) out.push(key.root + d + octave);
    return out.filter((n) => n >= 10 && n <= 48);
  }

  // The piano sits further back than anything else: less of it dry, all of it
  // into the reverb. That is what puts it through a wall instead of in her ear.
  keyBus() {
    if (!this.ctx || !this.dry || !this.wet) return null;
    let near = this.ctx.createGain();
    near.gain.value = 0.42;
    near.connect(this.dry);
    let room = this.ctx.createGain();
    room.gain.value = 1.15;
    room.connect(this.wet);
    let bus = this.ctx.createGain();
    (bus.connect(near), bus.connect(room));
    return bus;
  }

  strike(note, { level = 1, hammer = 1 } = {}) {
    let ctx = this.ctx;
    if (!ctx || this.muted) return;
    let bus = this.keyBus();
    if (!bus) return;
    let hz = midiToHz(note);
    // High notes are quieter and shorter; low ones ring. As a piano does.
    let high = Math.max(0, Math.min(1, (note - 12) / 34));
    strikeKey(ctx, bus, hz, {
      level: (0.115 - high * 0.045) * level * this.keyLevel,
      decay: 7.4 - high * 3.1,
      hammer,
    });
    window.setTimeout(() => {
      try {
        bus.disconnect();
      } catch {}
    }, 9000);
  }

  runKeys(first) {
    window.clearTimeout(this.keyTimer);
    let play = () => {
      if (!this.ctx || this.keyIndex === null) return;
      let notes = this.keyNotes();
      if (notes.length) {
        // Step somewhere near the last note rather than leaping about.
        let from = notes.indexOf(this.keyLast);
        let i =
          from < 0
            ? Math.floor(notes.length * (0.3 + Math.random() * 0.45))
            : Math.max(0, Math.min(notes.length - 1, from + Math.round((Math.random() - 0.5) * 5)));
        let note = notes[i];
        this.keyLast = note;
        this.strike(note);

        // Now and then, a second finger. Never a chord, never a phrase.
        if (Math.random() < 0.34) {
          let below = notes.filter((n) => n < note - 4 && n > note - 15);
          let other = below.length
            ? below[Math.floor(Math.random() * below.length)]
            : note + (Math.random() < 0.5 ? 7 : 12);
          window.setTimeout(
            () => this.strike(other, { level: 0.72, hammer: 0.7 }),
            110 + Math.random() * 260,
          );
        }
      }
      // Long, uneven gaps. Regularity is what made the old one wallpaper.
      let gap = this.keyGap * (0.7 + Math.random() * 0.75);
      this.keyTimer = window.setTimeout(play, gap);
    };
    this.keyTimer = window.setTimeout(play, first ?? this.keyGap);
  }

  // A single note, deliberately, when a beat wants one.
  sound(offset = 0, level = 1) {
    let key = KEYS[this.keyIndex ?? 0] ?? KEYS[0];
    this.strike(key.root + 24 + offset, { level });
  }

  // While she is holding a beat, everything drops back. Not muted — lowered,
  // the way you lower your voice for somebody who is thinking.
  hushed = false;
  hush(on) {
    if (this.hushed === on || !this.ctx || !this.master) return;
    this.hushed = on;
    let target = this.muted ? 0 : BASE_GAIN * this.volume * (on ? 0.42 : 1);
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.45);
  }

  // Each beat sets three things: which key the hand is in, how long it waits
  // between notes, and how hard the rain is. Nothing else. The gaps are long
  // — ten to twenty-five seconds — because the quiet is the point.
  async setCue(cue) {
    if (cue === this.cue) return;
    this.cue = cue;
    if (!this.ctx) return;

    if (cue.startsWith("/")) {
      let url = scoreUrl(cue);
      if (url) {
        (await this.playNamed(url), this.setRain(0.03));
        return;
      }
    }

    let part = cue.startsWith("part-") ? Number.parseInt(cue.slice(5), 10) : null;
    if (part !== null && Number.isFinite(part)) {
      ((this.keyGap = 13000), (this.keyLevel = 1), this.setKey(part), this.setRain(0.026 + part * 0.004));
      return;
    }

    switch (cue) {
      case "silent":
        (this.stopKeys(), this.setRain(0.012));
        return;
      case "projector":
        (this.projectorWake(), this.setRain(0.034));
        return;
      case "title":
        // One note under the title card, then nothing for a long while.
        ((this.keyGap = 16000), (this.keyLevel = 0.9), this.setKey(0), this.setRain(0.024));
        return;
      case "distance":
        ((this.keyGap = 15000), (this.keyLevel = 0.7), this.setRain(0.05));
        return;
      case "twohours":
        ((this.keyGap = 9000), (this.keyLevel = 1.05), this.setRain(0.014));
        return;
      case "sleep":
        ((this.keyGap = 21000), (this.keyLevel = 0.5), this.setRain(0.056));
        return;
      case "dance":
        ((this.keyGap = 8000), (this.keyLevel = 0.95), this.setRain(0.022));
        return;
      case "hold":
        // The hold is a held breath. Nothing plays over it.
        (this.stopKeys(), this.setRain(0.042));
        return;
      case "care":
        ((this.keyGap = 14000), (this.keyLevel = 0.85), this.setRain(0.026));
        return;
      case "vow":
        ((this.keyGap = 11000), (this.keyLevel = 1), this.setKey(3), this.setRain(0.048));
        (this.startHeart(), this.sound(0, 0.9));
        window.setTimeout(() => this.sound(7, 0.75), 1500);
        window.setTimeout(() => this.sound(12, 0.6), 3400);
        return;
      case "credits":
        ((this.keyGap = 12000), (this.keyLevel = 0.9), this.setRain(0.024));
        return;
      case "coda":
        ((this.keyGap = 17000), (this.keyLevel = 0.6), this.setRain(0.04));
        return;
      case "house":
        // Indoors it is barely there at all — a note every half minute or so.
        ((this.keyGap = 27000), (this.keyLevel = 0.42), this.setKey(2), this.setRain(0.032));
        this.stopHeart();
        return;
      case "letter":
        // While she is reading, silence. A note over a letter is an intrusion.
        (this.stopKeys(), this.setRain(0.018));
        return;
      default:
        ((this.keyGap = 15000), (this.keyLevel = 0.8), this.setRain(0.03));
    }
  }

  async loadSong() {
    if (this.song) return;
    let e = firstAvailable(VOW_SOURCES);
    if (e)
      try {
        let t = new Audio(e);
        ((t.loop = true),
          (t.preload = "auto"),
          (t.volume = 0),
          (t.muted = this.muted),
          (this.song = t),
          (this.songReady = true));
      } catch {
        this.songReady = false;
      }
  }
  async playSong(e) {
    let t = this.song;
    if (t)
      try {
        (t.paused && (await t.play()), this.fadeAudio(t, e * this.volume, 1800));
      } catch {}
  }
  async playNamed(e) {
    try {
      let t = new Audio(e);
      ((t.loop = true),
        (t.volume = 0.3 * this.volume),
        (t.muted = this.muted),
        await t.play(),
        this.stopSongOnly(),
        (this.song = t),
        (this.songReady = true));
    } catch {}
  }
  fadeAudio(e, t, n) {
    let r = e.volume,
      i = performance.now(),
      a = (o) => {
        let s = Math.min(1, (o - i) / n);
        ((e.volume = Math.max(0, Math.min(1, r + (t - r) * s))),
          s < 1 ? requestAnimationFrame(a) : t === 0 && e.pause());
      };
    requestAnimationFrame(a);
  }
  duckFor(e, t) {
    let n = this.ctx,
      r = this.duck;
    if (!n || !r) return;
    let i = n.currentTime;
    (r.gain.cancelScheduledValues(i),
      r.gain.setValueAtTime(r.gain.value, i),
      r.gain.linearRampToValueAtTime(1 - t, i + 0.06),
      r.gain.setTargetAtTime(1, i + 0.06, e * 0.5));
  }
  ensureRain(e) {
    let t = this.ctx;
    if (!(!t || this.rainSrc || !this.dry))
      try {
        let n = t.createBuffer(2, t.sampleRate * 4, t.sampleRate);
        for (let e = 0; e < 2; e++) {
          let t = n.getChannelData(e),
            r = 0;
          for (let e = 0; e < t.length; e++) {
            let n = Math.random() * 2 - 1;
            ((r = r * 0.82 + n * 0.18), (t[e] = n * 0.72 + r * 0.4));
          }
        }
        let r = t.createBufferSource();
        ((r.buffer = n), (r.loop = true));
        let i = t.createBiquadFilter();
        ((i.type = "highpass"), (i.frequency.value = 520));
        let a = t.createBiquadFilter();
        ((a.type = "bandpass"), (a.frequency.value = 2400), (a.Q.value = 0.55));
        let o = t.createDelay(0.2);
        o.delayTime.value = 0.062;
        let s = t.createGain();
        s.gain.value = 0.45;
        let c = t.createGain(),
          l = t.createGain();
        ((l.gain.value = 0),
          r.connect(i),
          i.connect(a),
          a.connect(c),
          a.connect(o),
          o.connect(s),
          s.connect(c),
          c.connect(l),
          l.connect(this.dry),
          r.start(),
          (this.rainSrc = r),
          (this.rainGain = l),
          this.setRain(e));
      } catch {}
  }
  setRain(e) {
    let t = this.ctx,
      n = this.rainGain;
    if (!t || !n) {
      this.ensureRain(e);
      return;
    }
    (n.gain.cancelScheduledValues(t.currentTime), n.gain.setTargetAtTime(e, t.currentTime, 1.6));
  }
  // `far` is 0 overhead and 1 on the edge of the sky. It buys the sound a
  // travel time of up to four and a half seconds, takes the top off it, and
  // leaves a rumble where there would have been a crack.
  thunder(e, far = 0) {
    if (far > 0.02) {
      window.setTimeout(() => this.rumble(e, far), 140 + far * 4400);
      return;
    }
    this.rumble(e, far);
  }
  rumble(e, far = 0) {
    let t = this.ctx;
    if (!(!t || !this.punch || this.muted))
      try {
        let n = t.currentTime,
          r = isLean(),
          // Close is a crack; far is a roll that goes on for seconds.
          i = (r ? 0.4 : 0.7) + far * (r ? 1.1 : 2.6) + e * 0.5,
          a = t.createBuffer(1, Math.floor(t.sampleRate * i), t.sampleRate),
          o = a.getChannelData(0),
          s = 0;
        for (let t = 0; t < o.length; t++) {
          let n = t / o.length,
            r = (1 - n) ** 1.6 * (n < 0.04 ? n / 0.04 : 1),
            i = Math.random() * 2 - 1;
          ((s = s * 0.92 + i * 0.08), (o[t] = (i * 0.35 + s * 1.4) * r * (0.35 + e * 0.55)));
        }
        let c = t.createBufferSource();
        c.buffer = a;
        let l = t.createBiquadFilter();
        ((l.type = "lowpass"), (l.frequency.value = (180 + e * 1500) * (1 - far * 0.78)));
        let u = t.createGain();
        ((u.gain.value = 0),
          c.connect(l),
          l.connect(u),
          u.connect(this.punch),
          this.wet && u.connect(this.wet));
        let d = 0.04 + (1 - e) * 0.35;
        if (
          (u.gain.setValueAtTime(0, n),
          u.gain.linearRampToValueAtTime((0.34 + e * 0.72) * (1 - far * 0.6), n + d),
          u.gain.exponentialRampToValueAtTime(0.001, n + d + i),
          c.start(n + d),
          c.stop(n + d + i + 0.05),
          (c.onended = () => {
            try {
              (c.disconnect(), l.disconnect(), u.disconnect());
            } catch {}
          }),
          e > 0.5 && far < 0.4 && this.duckFor(i + d, 0.3 * e),
          r)
        )
          return;
        let f = t.createOscillator();
        ((f.type = "sine"), (f.frequency.value = 36 + e * 28));
        let p = t.createGain();
        ((p.gain.value = 0),
          f.connect(p),
          p.connect(this.punch),
          p.gain.setValueAtTime(0, n),
          p.gain.linearRampToValueAtTime((0.16 + e * 0.3) * (1 - far * 0.35), n + d),
          p.gain.exponentialRampToValueAtTime(0.001, n + d + i * 2.2),
          f.start(n + d),
          f.stop(n + d + i * 2.3),
          (f.onended = () => {
            try {
              (f.disconnect(), p.disconnect());
            } catch {}
          }));
      } catch {}
  }
  projectorWake() {
    let e = this.ctx;
    if (!(!e || !this.dry))
      try {
        let t = e.createBuffer(1, e.sampleRate * 1.1, e.sampleRate),
          n = t.getChannelData(0);
        for (let e = 0; e < n.length; e++) {
          let t = e / n.length,
            r = Math.sin(Math.PI * Math.min(1, t * 2.2)) * (1 - t) ** 2;
          n[e] = (Math.random() * 2 - 1) * r * 0.22;
        }
        let r = e.createBufferSource(),
          i = e.createBiquadFilter();
        ((i.type = "lowpass"),
          (i.frequency.value = 680),
          (r.buffer = t),
          r.connect(i),
          i.connect(this.dry),
          r.start(),
          (r.onended = () => {
            try {
              (r.disconnect(), i.disconnect());
            } catch {}
          }));
      } catch {}
  }
  heart = null;
  startHeart() {
    let e = this.ctx;
    if (!(!e || !this.dry || isLean() || this.heart))
      try {
        let t = e.createOscillator();
        ((t.type = "sine"), (t.frequency.value = 44));
        let n = e.createGain();
        ((n.gain.value = 0), t.connect(n), n.connect(this.dry), t.start());
        let r = () => {
          if (!this.ctx) return;
          let e = this.ctx.currentTime;
          (n.gain.cancelScheduledValues(e),
            n.gain.setValueAtTime(1e-4, e),
            n.gain.exponentialRampToValueAtTime(0.26, e + 0.05),
            n.gain.exponentialRampToValueAtTime(1e-4, e + 0.34),
            n.gain.exponentialRampToValueAtTime(0.15, e + 0.42),
            n.gain.exponentialRampToValueAtTime(1e-4, e + 0.78));
        };
        (r(),
          (this.heart = {
            osc: t,
            gain: n,
            timer: window.setInterval(r, 1180),
          }));
      } catch {
        this.heart = null;
      }
  }
  stopHeart() {
    let e = this.heart;
    if (((this.heart = null), e)) {
      window.clearInterval(e.timer);
      try {
        (e.gain.gain.setTargetAtTime(0, this.ctx?.currentTime ?? 0, 0.3),
          window.setTimeout(() => {
            try {
              (e.osc.stop(), e.osc.disconnect(), e.gain.disconnect());
            } catch {}
          }, 900));
      } catch {}
    }
  }
  whisperName() {
    if (this.whisperSpent) return;
    this.whisperSpent = true;
    let e = firstAvailable(NAME_SOURCES);
    if (e)
      try {
        let t = new Audio(e);
        ((t.volume = 0.62 * this.volume),
          (t.muted = this.muted),
          (this.whisper = t),
          t.play().catch(() => {}),
          t.addEventListener("ended", () => {
            this.whisper = null;
          }),
          this.duckFor(2.4, 0.5));
      } catch {}
  }
  stopSongOnly() {
    if (this.song) {
      try {
        (this.song.pause(), (this.song.src = ""));
      } catch {}
      this.song = null;
    }
  }
  suspend() {
    try {
      (this.ctx?.suspend(), this.song && !this.song.paused && this.song.pause());
    } catch {}
  }
  resume() {
    try {
      (this.ctx?.resume(),
        this.song &&
          this.song.paused &&
          !this.muted &&
          this.cue !== "silent" &&
          this.song.play().catch(() => {}));
    } catch {}
  }
  dispose() {
    (this.stopKeys(), this.stopHeart(), this.stopSongOnly());
    try {
      this.rainSrc?.stop();
    } catch {}
    ((this.rainSrc = null), (this.rainGain = null));
    try {
      this.ctx?.close();
    } catch {}
    ((this.ctx = null),
      (this.master = null),
      (this.duck = null),
      (this.dry = null),
      (this.wet = null),
      (this.punch = null));
    try {
      this.verb?.disconnect();
    } catch {}
    ((this.verb = null), (this.started = false));
  }
})();
typeof document !== "undefined" &&
  (document.addEventListener("visibilitychange", () => {
    document.hidden ? score.suspend() : score.resume();
  }),
  window.addEventListener("her:cue", (e) => {
    score.setCue(String(e.detail));
  }),
  window.addEventListener("her:thunder", (e) => {
    score.thunder(Number(e.detail) || 0.6);
  }));
