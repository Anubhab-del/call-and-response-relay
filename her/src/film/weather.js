function seedFromToday() {
  let e = todayNumber() * 2654435761 + 2654435769;
  return (
    (e = Math.imul(e ^ (e >>> 16), 569420461)),
    (e = Math.imul(e ^ (e >>> 15), 1935289751)),
    ((e ^ (e >>> 15)) >>> 0) / 4294967295
  );
}
var daySeedCache = -1;
function daySeed() {
  return (daySeedCache < 0 && (daySeedCache = seedFromToday()), daySeedCache);
}
function dayWarmth() {
  return 0.82 + daySeed() * 0.4;
}
function dayDrift() {
  return (daySeed() - 0.5) * 0.16;
}
function dayTilt() {
  return (daySeed() - 0.5) * 0.5;
}
// How long until the next flash.
//
// A storm in a film is punctuation, not weather reporting. It used to fire
// every two to five seconds, and every seven-tenths of a second when it was
// close, which is not a storm — it is a strobe with a soundtrack. Now the sky
// mostly holds still and the room waits for it.
function strikeDelay(weather, close, when = new Date()) {
  let scale = (isNightHours(when) ? 0.86 : 1) * dayWarmth();
  if (close) return (4800 + Math.random() * 6400) * scale;
  switch (weather) {
    case "silence":
      return (14000 + Math.random() * 16000) * scale;
    case "hers":
      return (9000 + Math.random() * 11000) * scale;
    case "dusk":
    case "reply":
      return (10000 + Math.random() * 12000) * scale;
    case "ember":
      return (13000 + Math.random() * 15000) * scale;
    case "void":
      return (16000 + Math.random() * 18000) * scale;
    default:
      return (11000 + Math.random() * 13000) * scale;
  }
}

// How far away it was, 0 overhead and 1 on the far edge of the sky. A close
// storm is nearer; the rest is mostly weather happening to somebody else.
function strikeDistance(close) {
  return close ? 0.08 + Math.random() * 0.34 : 0.34 + Math.random() * 0.62;
}

function strikeIntensity(e, t) {
  let n = dayDrift();
  return ((e) => Math.max(0.1, Math.min(1, e)))(
    t
      ? 0.78 + Math.random() * 0.22 + n
      : e === "silence"
        ? 0.5 + Math.random() * 0.38 + n
        : e === "void"
          ? 0.16 + Math.random() * 0.28 + n
          : e === "ember"
            ? 0.22 + Math.random() * 0.3 + n
            : 0.28 + Math.random() * 0.42 + n,
  );
}
function makeBolt(e, t, n = false, r = false) {
  if (Math.random() < (r ? 0.28 : 0.18)) return makeSheet(e, t, r);
  let i = e * (0.12 + Math.random() * 0.76),
    a = (Math.random() - 0.5 + dayTilt()) * e * 0.42,
    o = t * (0.62 + Math.random() * 0.38),
    s = r ? 4 : 6,
    c = subdivide(
      [
        {
          x: i,
          y: -12,
        },
        {
          x: i + a,
          y: o,
        },
      ],
      s,
      t * (r ? 0.09 : 0.12),
    ),
    l = [c];
  if (n && !r && c.length > 10) {
    let n = 1 + +(Math.random() > 0.55);
    for (let r = 0; r < n; r++) {
      let n = c[Math.floor(c.length * (0.22 + Math.random() * 0.42))];
      n &&
        l.push(
          subdivide(
            [
              n,
              {
                x: n.x + (Math.random() - 0.5) * e * 0.48,
                y: n.y + t * (0.18 + Math.random() * 0.38),
              },
            ],
            4,
            t * 0.07,
          ),
        );
    }
  }
  return l;
}
function makeSheet(e, t, n = false) {
  let r = t * (0.08 + Math.random() * 0.22),
    i = e * (0.05 + Math.random() * 0.2),
    a = e * (0.7 + Math.random() * 0.25);
  return [
    subdivide(
      [
        {
          x: i,
          y: r,
        },
        {
          x: a,
          y: r + (Math.random() - 0.5) * t * 0.08,
        },
      ],
      n ? 3 : 5,
      t * 0.05,
    ),
  ];
}
function subdivide(e, t, n) {
  let r = e;
  for (let e = 0; e < t; e++) {
    let t = [],
      i = n / (e + 1);
    for (let e = 0; e < r.length - 1; e++) {
      let n = r[e],
        a = r[e + 1];
      (t.push(n),
        t.push({
          x: (n.x + a.x) / 2 + (Math.random() - 0.5) * i,
          y: (n.y + a.y) / 2 + (Math.random() - 0.5) * i * 0.28,
        }));
    }
    let a = r[r.length - 1];
    (a && t.push(a), (r = t));
  }
  return r;
}
function rainOpacityFor(e) {
  return e === "hers" || e === "silence"
    ? 1
    : e === "reply"
      ? 0.78
      : e === "dusk"
        ? 0.55
        : e === "ember"
          ? 0.4
          : e === "void"
            ? 0.22
            : 0.34;
}
