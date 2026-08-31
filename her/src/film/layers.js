function Lightning({ weather: weather, close = false, pulse = 0, calm = false }) {
  let i = (0, React.useRef)(null),
    a = (0, React.useRef)(weather),
    o = (0, React.useRef)(close),
    s = (0, React.useRef)(pulse),
    c = (0, React.useRef)(calm);
  return (
    (a.current = weather),
    (o.current = close),
    (s.current = pulse),
    (c.current = calm),
    (0, React.useEffect)(() => {
      let e = i.current;
      if (!e) return;
      let t = e.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });
      if (!t) return;
      let n = e.closest(".letterbox, .house-frame"),
        r = isLean(),
        l = 0,
        u = 0,
        d = 0,
        f = performance.now() + 280,
        p = false,
        m = s.current,
        h = 0,
        g = document.hidden,
        _ = [],
        v = () => {
          let n = e.parentElement;
          if (!n) return;
          ((l = n.clientWidth), (u = n.clientHeight));
          let i = cappedPixelRatio(r ? 1.25 : 1.75);
          ((e.width = Math.max(1, Math.floor(l * i))),
            (e.height = Math.max(1, Math.floor(u * i))),
            (e.style.width = `${l}px`),
            (e.style.height = `${u}px`),
            t.setTransform(i, 0, 0, i, 0, 0));
        };
      v();
      let y = new ResizeObserver(v);
      if ((e.parentElement && y.observe(e.parentElement), isStill()))
        return (
          n?.style.setProperty("--flash", "0.06"),
          () => {
            (y.disconnect(), n?.style.setProperty("--flash", "0"));
          }
        );
      let b = (e, t = false) => {
          let n = c.current ? 0.45 : 1,
            i = strikeIntensity(a.current, o.current || t) * n;
          for (
            _.push({
              bolts: makeBolt(l, u, !r && Math.random() > 0.32, r),
              power: i,
              born: e,
              life: 110 + i * 160,
            }),
              !r &&
                i > 0.55 &&
                Math.random() > 0.42 &&
                _.push({
                  bolts: makeBolt(l, u, false, false),
                  power: i * 0.48,
                  born: e + 48 + Math.random() * 70,
                  life: 80 + i * 40,
                });
            _.length > (r ? 2 : 5);
          )
            _.shift();
          // Light arrives first. The sound takes its time getting here, which
          // is the whole difference between a storm and a strobe.
          let far = strikeDistance(o.current);
          (score.thunder(i * (1 - far * 0.72), far),
            i > 0.82 && far < 0.3 && !c.current && tapWeighted(i * (1 - far)));
        },
        x = (e, n, r, i) => {
          (t.beginPath(),
            (t.strokeStyle = n),
            (t.lineWidth = r),
            (t.shadowColor = i ? n : "transparent"),
            (t.shadowBlur = i),
            (t.lineJoin = "round"),
            (t.lineCap = "round"));
          for (let n = 0; n < e.length; n++) {
            let r = e[n];
            n === 0 ? t.moveTo(r.x, r.y) : t.lineTo(r.x, r.y);
          }
          t.stroke();
        },
        S = () => {
          g = document.hidden;
        };
      document.addEventListener("visibilitychange", S);
      let C = (e) => {
        if (((d = requestAnimationFrame(C)), g || (r && e - h < 32))) return;
        ((h = e),
          s.current !== m &&
            ((m = s.current),
            m > 0 && (b(e, true), (f = e + strikeDelay(a.current, o.current) * (r ? 1.25 : 1)))),
          e >= f &&
            (b(e),
            (f = e + strikeDelay(a.current, o.current) * (r ? 1.25 : 1) * (c.current ? 1.9 : 1))),
          t.clearRect(0, 0, l, u));
        let i = 0;
        for (let t = _.length - 1; t >= 0; t--) {
          let n = _[t],
            a = e - n.born;
          if (a < 0) continue;
          if (a > n.life) {
            _.splice(t, 1);
            continue;
          }
          let o = 1 - a / n.life,
            s = r ? 1 : 0.72 + Math.sin(e * 0.08 + t) * 0.28,
            c = n.power * o * o * s;
          i = Math.max(i, c);
          for (let e of n.bolts)
            (r || x(e, `rgba(196, 206, 255, ${Math.min(1, c * 0.22)})`, 14 * n.power, 28),
              x(
                e,
                `rgba(226, 226, 255, ${Math.min(1, c * 0.55)})`,
                (r ? 3.2 : 4.2) * n.power,
                r ? 0 : 12,
              ),
              x(e, `rgba(255, 250, 244, ${Math.min(1, c)})`, 1.15 + n.power * 0.9, 0));
        }
        if (!r && i > 0.03) {
          let e = t.createLinearGradient(0, 0, 0, u * 0.55);
          (e.addColorStop(0, `rgba(255, 226, 186, ${i * 0.2})`),
            e.addColorStop(1, "rgba(255, 226, 186, 0)"),
            (t.fillStyle = e),
            t.fillRect(0, 0, l, u));
        }
        (n?.style.setProperty("--flash", i.toFixed(3)),
          o.current && !p && ((p = true), b(e, true)),
          o.current || (p = false));
      };
      return (
        (d = requestAnimationFrame(C)),
        () => {
          (cancelAnimationFrame(d),
            y.disconnect(),
            document.removeEventListener("visibilitychange", S),
            n?.style.setProperty("--flash", "0"));
        }
      );
    }, []),
    (0, jsx.jsx)("canvas", {
      ref: i,
      className: "lightning",
      "aria-hidden": "true",
    })
  );
}
function RainGlass({ weather: weather, calm = false }) {
  let n = (0, React.useRef)(null),
    r = (0, React.useRef)(weather),
    i = (0, React.useRef)(calm);
  ((r.current = weather),
    (i.current = calm),
    (0, React.useEffect)(() => {
      let e = n.current;
      if (!e) return;
      let t = e.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });
      if (!t) return;
      let a = isLean(),
        o = 0,
        s = 0,
        c = 0,
        l = performance.now(),
        u = document.hidden,
        d = [],
        f = [],
        p = () => {
          let n = e.parentElement;
          if (!n) return;
          ((o = n.clientWidth), (s = n.clientHeight));
          let c = cappedPixelRatio(a ? 1 : 1.5);
          ((e.width = Math.max(1, Math.floor(o * c))),
            (e.height = Math.max(1, Math.floor(s * c))),
            (e.style.width = `${o}px`),
            (e.style.height = `${s}px`),
            t.setTransform(c, 0, 0, c, 0, 0));
          let l = rainOpacityFor(r.current) * (i.current ? 0.6 : 1);
          d.length = 0;
          let u = a ? 0.55 : 1,
            f = Math.min(a ? 22 : 52, Math.floor((14 + 26 * l) * (o / 900) * u));
          for (let e = 0; e < f; e++)
            d.push({
              x: Math.random() * o,
              y: Math.random() * s * 0.7,
              len: 18 + Math.random() * 70 * l,
              thick: 0.6 + Math.random() * 1.1,
              alpha: 0.08 + Math.random() * 0.18 * l,
              vy: 18 + Math.random() * 46 * l,
            });
        };
      p();
      let m = new ResizeObserver(p);
      if ((e.parentElement && m.observe(e.parentElement), isStill())) return () => m.disconnect();
      let h = () => {
        u = document.hidden;
      };
      document.addEventListener("visibilitychange", h);
      let g = (e) => {
        if (((c = requestAnimationFrame(g)), u || (a && e - l < 33))) return;
        let n = Math.min(0.05, (e - l) / 1e3);
        l = e;
        let p = rainOpacityFor(r.current) * (i.current ? 0.6 : 1);
        (t.clearRect(0, 0, o, s), (t.lineCap = "round"));
        for (let e of d)
          ((e.y += e.vy * n * 0.12),
            e.y > s + 20 && ((e.x = Math.random() * o), (e.y = -e.len)),
            (t.strokeStyle = "rgba(246, 226, 196, 1)"),
            (t.globalAlpha = e.alpha),
            (t.lineWidth = e.thick),
            t.beginPath(),
            t.moveTo(e.x, e.y),
            t.lineTo(e.x + 0.8, e.y + e.len),
            t.stroke());
        !a &&
          Math.random() < 0.03 * p &&
          f.length < 7 &&
          f.push({
            x: Math.random() * o,
            y: -8,
            r: 1.2 + Math.random() * 2,
            vy: 60 + Math.random() * 100,
            alpha: 0.2 + Math.random() * 0.24,
            wob: Math.random() * 6,
          });
        for (let r = f.length - 1; r >= 0; r--) {
          let i = f[r],
            a = i.y;
          ((i.y += i.vy * n),
            (i.x += Math.sin(e * 0.004 + i.wob) * 6 * n),
            (t.globalAlpha = i.alpha * 0.35),
            (t.strokeStyle = "rgba(250, 232, 204, 1)"),
            (t.lineWidth = i.r * 0.7),
            t.beginPath(),
            t.moveTo(i.x, a - i.r * 6),
            t.lineTo(i.x, i.y),
            t.stroke(),
            (t.globalAlpha = i.alpha),
            (t.fillStyle = "rgba(252, 238, 214, 1)"),
            t.beginPath(),
            t.ellipse(i.x, i.y, i.r * 0.55, i.r * 1.15, 0, 0, Math.PI * 2),
            t.fill(),
            i.y > s + 10 && f.splice(r, 1));
        }
        t.globalAlpha = 1;
      };
      return (
        (c = requestAnimationFrame(g)),
        () => {
          (cancelAnimationFrame(c),
            m.disconnect(),
            document.removeEventListener("visibilitychange", h));
        }
      );
    }, []));
  let a = rainOpacityFor(weather);
  return (0, jsx.jsx)("canvas", {
    ref: n,
    className: "rain-glass",
    "data-heavy": a > 0.8 ? "true" : "false",
    "aria-hidden": "true",
  });
}
function Grain() {
  let e = (0, React.useRef)(null);
  return (
    (0, React.useEffect)(() => {
      let t = e.current;
      if (!t) return;
      let n = t.getContext("2d", {
        alpha: true,
      });
      if (!n) return;
      let r = isLean() ? 48 : 72;
      ((t.width = r), (t.height = r));
      let i = () => {
        let e = n.createImageData(r, r),
          t = e.data;
        for (let e = 0; e < t.length; e += 4) {
          let n = 140 + Math.random() * 80;
          ((t[e] = n), (t[e + 1] = n), (t[e + 2] = n), (t[e + 3] = 255));
        }
        n.putImageData(e, 0, 0);
      };
      if ((i(), isStill() || isLean())) return;
      let a = 0;
      return (
        window.clearInterval(a),
        (a = window.setInterval(() => {
          document.hidden || i();
        }, 280)),
        () => window.clearInterval(a)
      );
    }, []),
    (0, jsx.jsx)("canvas", {
      ref: e,
      className: "grain",
      "aria-hidden": "true",
    })
  );
}
function Dust() {
  let e = (0, React.useRef)(null);
  return (
    (0, React.useEffect)(() => {
      if (isStill() || isLean()) return;
      let t = e.current;
      if (!t) return;
      let n = t.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });
      if (!n) return;
      let r = 0,
        i = 0,
        a = 0,
        o = performance.now(),
        // Dust in the beam: fine, bright, quick.
        s = Array.from(
          {
            length: 34,
          },
          () => ({
            x: Math.random(),
            y: Math.random(),
            r: 0.4 + Math.random() * 1.3,
            vx: (Math.random() - 0.5) * 0.008,
            vy: -0.004 - Math.random() * 0.01,
            a: 0.05 + Math.random() * 0.16,
            ph: Math.random() * Math.PI * 2,
          }),
        ),
        // Bokeh: whatever light is behind all this, thrown wide open and out
        // of focus. Big, slow, almost not there — the warmth you see past
        // someone's shoulder rather than anything you are meant to look at.
        d = Array.from(
          {
            length: 7,
          },
          () => ({
            x: Math.random(),
            y: Math.random(),
            r: 16 + Math.random() * 34,
            vx: (Math.random() - 0.5) * 0.004,
            vy: -0.0016 - Math.random() * 0.0034,
            a: 0.024 + Math.random() * 0.042,
            ph: Math.random() * Math.PI * 2,
            warm: Math.random() < 0.66,
          }),
        ),
        c = () => {
          let e = t.parentElement;
          if (!e) return;
          ((r = e.clientWidth), (i = e.clientHeight));
          let a = cappedPixelRatio(1.25);
          ((t.width = Math.max(1, Math.floor(r * a))),
            (t.height = Math.max(1, Math.floor(i * a))),
            (t.style.width = `${r}px`),
            (t.style.height = `${i}px`),
            n.setTransform(a, 0, 0, a, 0, 0));
        };
      c();
      let l = new ResizeObserver(c);
      t.parentElement && l.observe(t.parentElement);
      let u = (e) => {
        if (((a = requestAnimationFrame(u)), document.hidden)) return;
        let t = Math.min(0.05, (e - o) / 1e3);
        ((o = e), n.clearRect(0, 0, r, i));
        for (let a of d) {
          ((a.x += a.vx * t),
            (a.y += a.vy * t),
            a.y < -0.3 && ((a.y = 1.3), (a.x = Math.random())),
            a.x < -0.3 && (a.x = 1.3),
            a.x > 1.3 && (a.x = -0.3));
          let o = 0.72 + Math.sin(e * 0.00042 + a.ph) * 0.28,
            c = a.x * r,
            l = a.y * i,
            u = n.createRadialGradient(c, l, 0, c, l, a.r);
          // A real out-of-focus point has a soft centre and a brighter rim.
          let f = a.warm ? "255, 216, 168" : "255, 194, 176";
          (u.addColorStop(0, `rgba(${f}, ${a.a * o * 0.66})`),
            u.addColorStop(0.6, `rgba(${f}, ${a.a * o * 0.44})`),
            u.addColorStop(0.88, `rgba(${f}, ${a.a * o * 0.6})`),
            u.addColorStop(0.97, `rgba(${f}, ${a.a * o * 0.18})`),
            u.addColorStop(1, `rgba(${f}, 0)`),
            (n.fillStyle = u),
            n.beginPath(),
            n.arc(c, l, a.r, 0, Math.PI * 2),
            n.fill());
        }
        for (let a of s) {
          ((a.x += a.vx * t),
            (a.y += a.vy * t),
            a.y < -0.05 && ((a.y = 1.05), (a.x = Math.random())),
            a.x < -0.05 && (a.x = 1.05),
            a.x > 1.05 && (a.x = -0.05));
          let o = 0.6 + Math.sin(e * 0.0012 + a.ph) * 0.4;
          ((n.globalAlpha = a.a * o),
            (n.fillStyle = "rgba(250, 226, 198, 1)"),
            n.beginPath(),
            n.arc(a.x * r, a.y * i, a.r, 0, Math.PI * 2),
            n.fill());
        }
        n.globalAlpha = 1;
      };
      return (
        (a = requestAnimationFrame(u)),
        () => {
          (cancelAnimationFrame(a), l.disconnect());
        }
      );
    }, []),
    (0, jsx.jsx)("canvas", {
      ref: e,
      className: "dust",
      "aria-hidden": "true",
    })
  );
}
function Lamp({ warm = 1 }) {
  return (0, jsx.jsxs)("div", {
    className: "lamp",
    "aria-hidden": "true",
    style: {
      "--warm": warm,
    },
    children: [
      (0, jsx.jsx)("span", {
        className: "lamp-glow",
      }),
      (0, jsx.jsx)("span", {
        className: "lamp-core",
      }),
    ],
  });
}
