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
function scaleFor(e) {
  return e.minor ? [0, 7, 8, 3, 2] : [0, 7, 9, 4, 2];
}
function octaveFor(e) {
  return Math.max(2, Math.min(5, e + 2));
}
function voicesFor(e, t, n = -5, r = 19) {
  return t.map((t, i) => {
    let a = e[i],
      o = (e) => e >= n && e <= r,
      s = [];
    for (let e = -48; e <= 48; e += 12) o(t + e) && s.push(t + e);
    if (s.length === 0) return Math.max(n, Math.min(r, t));
    if (a === void 0) return s[Math.min(i, s.length - 1)];
    let c = s[0],
      l = Math.abs(c - a);
    for (let e of s) {
      let t = Math.abs(e - a);
      t < l && ((l = t), (c = e));
    }
    return c;
  });
}
function makePad(e, t, n, { level: r = 0.1, colour: i = 0.6, attack: a = 2.4, detune: o = 5 } = {}) {
  let s = isLean(),
    c = e.createGain();
  ((c.gain.value = 0), c.connect(t));
  let l = e.createBiquadFilter();
  ((l.type = "lowpass"), (l.frequency.value = n * 2), (l.Q.value = 0.6), l.connect(c));
  let u = [],
    d = s
      ? [
          ["triangle", 1, 1],
          ["sine", 2, 0.22],
        ]
      : [
          ["triangle", 1, 1],
          ["sine", 2, 0.26],
          ["sine", 3, 0.13],
          ["sine", 4.01, 0.055],
        ];
  for (let [t, r, i] of d) {
    let a = e.createOscillator();
    ((a.type = t), (a.frequency.value = n * r), (a.detune.value = (Math.random() - 0.5) * o));
    let s = e.createGain();
    ((s.gain.value = i),
      a.connect(s),
      s.connect(l),
      a.start(),
      u.push({
        osc: a,
        gain: s,
        ratio: r,
      }));
  }
  let f = null,
    p = null;
  if (!s) {
    ((f = e.createOscillator()),
      (f.frequency.value = 4.4 + Math.random() * 1.1),
      (p = e.createGain()),
      (p.gain.value = n * 0.0022),
      f.connect(p));
    for (let e of u) p.connect(e.osc.frequency);
    f.start();
  }
  let m = e.currentTime;
  (c.gain.setValueAtTime(1e-4, m),
    c.gain.setTargetAtTime(r, m, a / 3),
    l.frequency.setValueAtTime(n * 1.2, m),
    l.frequency.setTargetAtTime(n * (1.8 + i * 5), m, a / 2));
  let h = false;
  return {
    level(t, n = 2) {
      let r = e.currentTime;
      (c.gain.cancelScheduledValues(r), c.gain.setTargetAtTime(Math.max(1e-4, t), r, n / 3));
    },
    glide(t, n) {
      let r = e.currentTime;
      for (let e of u)
        (e.osc.frequency.cancelScheduledValues(r),
          e.osc.frequency.setTargetAtTime(t * e.ratio, r, n / 3));
      (l.frequency.setTargetAtTime(t * (1.8 + i * 5), r, n / 2),
        p && p.gain.setTargetAtTime(t * 0.0022, r, n / 2));
    },
    release(t = 2.2) {
      if (h) return;
      h = true;
      let n = e.currentTime;
      (c.gain.cancelScheduledValues(n),
        c.gain.setTargetAtTime(0, n, t / 3),
        window.setTimeout(
          () => {
            for (let e of u)
              try {
                (e.osc.stop(), e.osc.disconnect(), e.gain.disconnect());
              } catch {}
            try {
              (f?.stop(), f?.disconnect(), p?.disconnect(), l.disconnect(), c.disconnect());
            } catch {}
          },
          Math.ceil(t * 1e3) + 900,
        ));
    },
  };
}
function playNoise(e, t, n, r = 0.05) {
  try {
    let i = e.currentTime,
      a = e.createGain();
    ((a.gain.value = 0), a.connect(t));
    let o = e.createOscillator();
    ((o.type = "sine"), (o.frequency.value = n));
    let s = e.createGain();
    ((s.gain.value = 1), o.connect(s), s.connect(a));
    let c = e.createOscillator();
    ((c.type = "sine"), (c.frequency.value = n * 3));
    let l = e.createGain();
    ((l.gain.value = 0),
      c.connect(l),
      l.connect(a),
      a.gain.setValueAtTime(1e-4, i),
      a.gain.exponentialRampToValueAtTime(r, i + 0.035),
      a.gain.exponentialRampToValueAtTime(1e-4, i + 4.4),
      l.gain.setValueAtTime(0.22, i),
      l.gain.exponentialRampToValueAtTime(1e-4, i + 0.6),
      o.start(i),
      c.start(i),
      o.stop(i + 4.6),
      c.stop(i + 0.8),
      (o.onended = () => {
        try {
          (o.disconnect(), c.disconnect(), s.disconnect(), l.disconnect(), a.disconnect());
        } catch {}
      }));
  } catch {}
}
function playTone(e, t, n, r = 0.1) {
  try {
    let i = e.currentTime,
      a = e.createOscillator();
    ((a.type = "sine"), (a.frequency.value = n));
    let o = e.createGain();
    ((o.gain.value = 0),
      a.connect(o),
      o.connect(t),
      o.gain.setValueAtTime(1e-4, i),
      o.gain.exponentialRampToValueAtTime(r, i + 1.6),
      o.gain.exponentialRampToValueAtTime(1e-4, i + 6),
      a.start(i),
      a.stop(i + 6.2),
      (a.onended = () => {
        try {
          (a.disconnect(), o.disconnect());
        } catch {}
      }));
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
  movement = null;
  voices = [];
  chord = 0;
  held = [];
  chordTimer = 0;
  padLevel = 1;
  themeTimer = 0;
  themeStep = 0;
  themeNotes = 2;
  themeGap = 9e3;
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
        ((n.gain.value = this.muted ? 0 : BASE_GAIN * this.volume),
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
      t.gain.setTargetAtTime(this.muted ? 0 : BASE_GAIN * this.volume, e.currentTime, 0.2));
  }
  startMovement(e) {
    let t = this.ctx;
    if (!t || isStill() || this.movement === e) return;
    let n = this.movement;
    (this.stopMovement(n === null ? 0.8 : 3.2), (this.movement = e));
    let r = KEYS[e];
    if (!r) return;
    this.chord = 0;
    let i = voicesFor(
      [],
      r.chords[0].map((e) => r.root + e),
    );
    ((this.held = i),
      (this.voices = i.map((e, n) => {
        let i = this.bus();
        return i
          ? makePad(t, i, midiToHz(e + (n === 0 ? 0 : 12)), {
              level: (PAD_LEVELS[n] ?? 0.1) * r.weight * this.padLevel,
              colour: r.colour,
              attack: 3.6,
            })
          : {
              glide: () => {},
              level: () => {},
              release: () => {},
            };
      })));
    let a = this.bus();
    (a && playTone(t, a, midiToHz(r.root - 12), 0.2 * r.weight),
      this.runChords(r),
      (this.themeNotes = octaveFor(e)),
      this.runTheme(r));
  }
  runChords(e) {
    window.clearTimeout(this.chordTimer);
    let t = () => {
      if (!this.ctx || this.movement === null) return;
      this.chord = (this.chord + 1) % e.chords.length;
      let n = e.chords[this.chord].map((t) => e.root + t),
        r = voicesFor(this.held, n);
      ((this.held = r),
        r.forEach((t, n) => {
          this.voices[n]?.glide(midiToHz(t + (n === 0 ? 0 : 12)), e.bar * 0.45);
        }),
        (this.chordTimer = window.setTimeout(t, e.bar * 1e3)));
    };
    this.chordTimer = window.setTimeout(t, e.bar * 1e3);
  }
  runTheme(e) {
    window.clearTimeout(this.themeTimer);
    let t = scaleFor(e),
      n = () => {
        if (!this.ctx || this.movement === null) return;
        let r = this.themeStep % Math.max(1, this.themeNotes),
          i = e.root + t[r] + 24,
          a = this.bus();
        (a && playNoise(this.ctx, a, midiToHz(i), 0.17 * Math.max(0.25, this.padLevel)),
          (this.themeStep += 1));
        let o = r === this.themeNotes - 1;
        this.themeTimer = window.setTimeout(n, o ? this.themeGap * 2 : this.themeGap);
      };
    this.themeTimer = window.setTimeout(n, 3200);
  }
  declareTheme(e, t = 0.24) {
    if (!this.ctx) return;
    let n = KEYS[e] ?? KEYS[KEYS.length - 1];
    scaleFor(n).forEach((e, r) => {
      window.setTimeout(() => {
        if (!this.ctx) return;
        let r = this.bus();
        r && playNoise(this.ctx, r, midiToHz(n.root + e + 24), t);
        let i = this.bus();
        i && playNoise(this.ctx, i, midiToHz(n.root + e + 12), t * 0.5);
      }, r * 1500);
    });
  }
  stopMovement(e = 2.6) {
    (window.clearTimeout(this.chordTimer), window.clearTimeout(this.themeTimer));
    for (let t of this.voices) t.release(e);
    ((this.voices = []), (this.movement = null));
  }
  setPadLevel(e) {
    this.padLevel = e;
    let t = this.movement === null ? null : KEYS[this.movement];
    t && this.voices.forEach((n, r) => n.level((PAD_LEVELS[r] ?? 0.1) * t.weight * e, 2.4));
  }
  async setCue(e) {
    if (e === this.cue || ((this.cue = e), !this.ctx)) return;
    if (e.startsWith("/")) {
      let t = scoreUrl(e);
      if (t) {
        (await this.playNamed(t), this.setRain(0.03));
        return;
      }
    }
    let t = e.startsWith("part-") ? Number.parseInt(e.slice(5), 10) : null;
    if (t !== null && Number.isFinite(t)) {
      ((this.themeGap = 9e3),
        this.setPadLevel(1),
        this.startMovement(t),
        this.setRain(0.026 + t * 0.004),
        await this.playSong(0.24));
      return;
    }
    switch (e) {
      case "silent":
        (this.stopMovement(1.6), this.setRain(0.012), await this.playSong(0));
        return;
      case "projector":
        (this.projectorWake(), this.setRain(0.034));
        return;
      case "title":
        (this.startMovement(0), this.setPadLevel(0.85), this.setRain(0.024), await this.playSong(0.34));
        return;
      case "distance":
        (this.setPadLevel(0.6), this.setRain(0.05), (this.themeGap = 6e3));
        return;
      case "twohours":
        (this.setPadLevel(1.15), this.setRain(0.014), (this.themeGap = 5200));
        return;
      case "sleep":
        (this.setPadLevel(0.42), this.setRain(0.056), (this.themeGap = 14e3));
        return;
      case "dance":
        (this.setPadLevel(0.95), this.setRain(0.022), (this.themeGap = 4200));
        return;
      case "hold":
        (this.setPadLevel(0.1), this.setRain(0.042), (this.themeGap = 3e4), await this.playSong(0.05));
        return;
      case "care":
        (this.setPadLevel(0.9), this.setRain(0.026), await this.playSong(0.3));
        return;
      case "vow":
        (this.startMovement(3),
          this.setPadLevel(1.25),
          (this.themeNotes = 5),
          this.setRain(0.048),
          this.startHeart(),
          this.declareTheme(3, 0.26),
          await this.playSong(0.4));
        return;
      case "credits":
        (this.setPadLevel(1),
          (this.themeNotes = 5),
          (this.themeGap = 7e3),
          this.setRain(0.024),
          this.declareTheme(this.movement ?? 3, 0.2),
          await this.playSong(0.36));
        return;
      case "coda":
        (this.setPadLevel(0.5), this.setRain(0.04), (this.themeGap = 11e3), await this.playSong(0.2));
        return;
      case "house":
        (this.startMovement(2),
          this.setPadLevel(0.42),
          (this.themeGap = 22e3),
          this.setRain(0.032),
          this.stopHeart(),
          await this.playSong(0.1));
        return;
      case "letter":
        (this.setPadLevel(0.3), (this.themeGap = 26e3), this.setRain(0.02), await this.playSong(0.07));
        return;
      default:
        (this.setPadLevel(0.8), this.setRain(0.03), await this.playSong(0.2));
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
  thunder(e) {
    let t = this.ctx;
    if (!(!t || !this.punch || this.muted))
      try {
        let n = t.currentTime,
          r = isLean(),
          i = r ? 0.12 + e * 0.3 : 0.18 + e * 0.6,
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
        ((l.type = "lowpass"), (l.frequency.value = 220 + e * 1400));
        let u = t.createGain();
        ((u.gain.value = 0),
          c.connect(l),
          l.connect(u),
          u.connect(this.punch),
          this.wet && u.connect(this.wet));
        let d = 0.04 + (1 - e) * 0.35;
        if (
          (u.gain.setValueAtTime(0, n),
          u.gain.linearRampToValueAtTime(0.9 + e * 1.1, n + d),
          u.gain.exponentialRampToValueAtTime(0.001, n + d + i),
          c.start(n + d),
          c.stop(n + d + i + 0.05),
          (c.onended = () => {
            try {
              (c.disconnect(), l.disconnect(), u.disconnect());
            } catch {}
          }),
          e > 0.4 && this.duckFor(i + d, 0.34 * e),
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
          p.gain.linearRampToValueAtTime(0.3 + e * 0.4, n + d),
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
    (this.stopMovement(0.2), this.stopHeart(), this.stopSongOnly());
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
