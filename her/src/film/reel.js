function buildReel() {
  let e = [
    {
      type: `projector`,
    },
    {
      type: `title`,
    },
    {
      type: `overture`,
    },
    {
      type: `threshold`,
    },
  ];
  return (
    PARTS.forEach((t) => {
      e.push({
        type: `part`,
        part: t.index,
      });
      for (let n of CHAPTERS)
        n.part === t.index &&
          e.push(
            n.scene
              ? {
                  type: `scene`,
                  n: n.n,
                  scene: n.scene,
                }
              : {
                  type: `chapter`,
                  n: n.n,
                },
          );
    }),
    e.push(
      {
        type: `care`,
      },
      {
        type: `vow`,
      },
      {
        type: `credits`,
      },
      {
        type: `after`,
      },
      {
        type: `codaStill`,
      },
      {
        type: `codaLine`,
      },
      {
        type: `last`,
      },
      {
        type: `nameFlash`,
      },
      {
        type: `doorway`,
      },
    ),
    e
  );
}

function beatKey(e, t) {
  return e.type === `chapter` || e.type === `scene`
    ? `ch-${e.n}`
    : e.type === `part`
      ? `part-${e.part}`
      : `${e.type}-${t}`;
}

function chapterAt(e) {
  return CHAPTERS[e - 1];
}

function weatherFor(e) {
  switch (e.type) {
    case `part`:
      return PARTS[e.part]?.weather ?? `void`;
    case `chapter`:
      return PARTS[chapterAt(e.n)?.part ?? 0]?.weather ?? `void`;
    case `scene`:
      return e.scene === `twohours`
        ? `still`
        : e.scene === `dance`
          ? `hers`
          : e.scene === `distance`
            ? `dusk`
            : (e.scene, `silence`);
    case `threshold`:
      return `silence`;
    case `title`:
    case `overture`:
    case `credits`:
      return `tungsten`;
    case `care`:
    case `vow`:
      return `reply`;
    case `after`:
    case `codaStill`:
    case `codaLine`:
    case `last`:
      return `still`;
    case `nameFlash`:
      return `hers`;
    case `doorway`:
      return `ember`;
    default:
      return `void`;
  }
}

function cueFor(e) {
  switch (e.type) {
    case `projector`:
      return `projector`;
    case `title`:
    case `overture`:
    case `threshold`:
      return `title`;
    case `part`:
      return `/score/part-${e.part + 1}.mp3`;
    case `chapter`:
      return `part-${chapterAt(e.n)?.part ?? 0}`;
    case `scene`:
      return e.scene;
    case `care`:
      return `care`;
    case `vow`:
      return `vow`;
    case `credits`:
    case `after`:
      return `credits`;
    case `codaStill`:
    case `codaLine`:
    case `last`:
    case `nameFlash`:
      return `coda`;
    case `doorway`:
      return `house`;
    default:
      return `silent`;
  }
}

function beatDuration(e) {
  switch (e.type) {
    case `projector`:
      return 1800;
    case `title`:
      return 4600;
    case `overture`:
      return 3400;
    case `threshold`:
      return 1700;
    case `part`:
      return 3600;
    case `chapter`: {
      let t = chapterAt(e.n);
      if (!t) return 3600;
      let n = t.lines.join(` `).split(/\s+/).length;
      return Math.round(Math.min(9e3, Math.max(3e3, 1500 + (n / 2.6) * 1e3)));
    }
    case `scene`:
      return e.scene === `twohours`
        ? 6400
        : e.scene === `distance`
          ? 5400
          : e.scene === `sleep`
            ? 5e3
            : e.scene === `dance`
              ? 4800
              : e.scene === `hold`
                ? HOLD_COPY.ms
                : 4200;
    case `care`:
      return 3800;
    case `vow`:
      return 4600;
    case `credits`:
      return 4400;
    case `after`:
      return 5200;
    case `codaStill`:
      return 3600;
    case `codaLine`:
      return 3200;
    case `last`:
      return 6e3;
    case `nameFlash`:
      return 5200;
    default:
      return 0;
  }
}

function isHeldBeat(e) {
  return e.type === `vow` || e.type === `care`;
}

function stormPulseFor(e, t) {
  return e.type === `vow` || e.type === `part` || (e.type === `scene` && e.scene === `twohours`)
    ? t + 1
    : 0;
}

function showsHud(e) {
  return e.type !== `doorway`;
}

function isFullBleed(e) {
  let t = chapterAt(e);
  if (!t) return !1;
  let n = PARTS[t.part];
  return n ? (e - n.from) % 5 == 0 : !1;
}

function lightFor(e) {
  let t = PARTS[chapterAt(e)?.part ?? 0],
    n = t?.lights ?? [];
  return n.length === 0
    ? `window`
    : n[((Math.floor((e - (t?.from ?? 1)) / 5) % n.length) + n.length) % n.length];
}

function chapterMarks(e) {
  let t = [];
  return (
    e.forEach((e, n) => {
      if (e.type === `chapter` || e.type === `scene`) {
        let r = chapterAt(e.n);
        r &&
          t.push({
            n: r.n,
            title: r.title,
            part: r.part,
            at: n,
            scene: r.scene,
          });
      }
    }),
    t
  );
}

function partMarks(e) {
  let t = [];
  return (
    e.forEach((e, n) => {
      e.type === `part` &&
        t.push({
          part: e.part,
          at: n,
        });
    }),
    t
  );
}

function lastChapterBefore(e, t) {
  for (let n = Math.min(t, e.length - 1); n >= 0; n--) {
    let t = e[n];
    if (t.type === `chapter` || t.type === `scene`) return t.n;
  }
  return 0;
}
