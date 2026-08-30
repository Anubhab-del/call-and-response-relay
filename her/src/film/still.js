function Still({ src: e, variant: t, seconds: n = 4 }) {
  let r = [`jpg`, `jpeg`, `png`, `webp`, `avif`, `svg`]
    .map((e) => `/stills/${t}.${e}`)
    .find((e) => hasStill(e));
  return !e && r
    ? (0, jsx.jsx)(`div`, {
        className: `still-frame`,
        children: (0, jsx.jsx)(motion.img, {
          src: stillUrl(r),
          alt: ``,
          ...breatheIn(n),
        }),
      })
    : e && hasStill(e)
      ? (0, jsx.jsx)(`div`, {
          className: `still-frame`,
          children: (0, jsx.jsx)(motion.img, {
            src: stillUrl(e),
            alt: ``,
            ...breatheIn(n),
          }),
        })
      : (0, jsx.jsx)(`div`, {
          className: `still-frame`,
          children: (0, jsx.jsx)(motion.div, {
            className: `still-drawn`,
            ...breatheIn(n),
            children: (0, jsx.jsx)(StillArt, {
              variant: t,
            }),
          }),
        });
}

function StillArt({ variant: e }) {
  return (0, jsx.jsxs)(`svg`, {
    viewBox: `0 0 1000 1000`,
    preserveAspectRatio: `xMidYMid slice`,
    "aria-hidden": `true`,
    className: `drawn`,
    children: [
      (0, jsx.jsxs)(`defs`, {
        children: [
          (0, jsx.jsxs)(`radialGradient`, {
            id: `ground`,
            cx: `50%`,
            cy: `42%`,
            r: `72%`,
            children: [
              (0, jsx.jsx)(`stop`, {
                offset: `0%`,
                stopColor: `#0c111a`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `58%`,
                stopColor: `#070a11`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `100%`,
                stopColor: `#03050a`,
              }),
            ],
          }),
          (0, jsx.jsxs)(`radialGradient`, {
            id: `warm`,
            cx: `50%`,
            cy: `50%`,
            r: `50%`,
            children: [
              (0, jsx.jsx)(`stop`, {
                offset: `0%`,
                stopColor: `#f6e2ba`,
                stopOpacity: `0.5`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `34%`,
                stopColor: `#d8ac70`,
                stopOpacity: `0.19`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `100%`,
                stopColor: `#c9a26a`,
                stopOpacity: `0`,
              }),
            ],
          }),
          (0, jsx.jsxs)(`radialGradient`, {
            id: `bloom`,
            cx: `50%`,
            cy: `50%`,
            r: `50%`,
            children: [
              (0, jsx.jsx)(`stop`, {
                offset: `0%`,
                stopColor: `#ffeecb`,
                stopOpacity: `0.42`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `55%`,
                stopColor: `#f0cf94`,
                stopOpacity: `0.1`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `100%`,
                stopColor: `#f0cf94`,
                stopOpacity: `0`,
              }),
            ],
          }),
          (0, jsx.jsxs)(`radialGradient`, {
            id: `cool`,
            cx: `50%`,
            cy: `28%`,
            r: `62%`,
            children: [
              (0, jsx.jsx)(`stop`, {
                offset: `0%`,
                stopColor: `#a8c4e6`,
                stopOpacity: `0.12`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `100%`,
                stopColor: `#a8c4e6`,
                stopOpacity: `0`,
              }),
            ],
          }),
          (0, jsx.jsxs)(`linearGradient`, {
            id: `spill`,
            x1: `0`,
            y1: `0`,
            x2: `0`,
            y2: `1`,
            children: [
              (0, jsx.jsx)(`stop`, {
                offset: `0%`,
                stopColor: `#f0dcb8`,
                stopOpacity: `0.3`,
              }),
              (0, jsx.jsx)(`stop`, {
                offset: `100%`,
                stopColor: `#f0dcb8`,
                stopOpacity: `0.02`,
              }),
            ],
          }),
          (0, jsx.jsx)(`filter`, {
            id: `soft`,
            x: `-60%`,
            y: `-60%`,
            width: `220%`,
            height: `220%`,
            children: (0, jsx.jsx)(`feGaussianBlur`, {
              stdDeviation: `42`,
            }),
          }),
          (0, jsx.jsx)(`filter`, {
            id: `softer`,
            x: `-50%`,
            y: `-50%`,
            width: `200%`,
            height: `200%`,
            children: (0, jsx.jsx)(`feGaussianBlur`, {
              stdDeviation: `14`,
            }),
          }),
        ],
      }),
      (0, jsx.jsx)(`rect`, {
        width: `1000`,
        height: `1000`,
        fill: `url(#ground)`,
      }),
      e === `window`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `440`,
                rx: `360`,
                ry: `320`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `392`,
                y: `330`,
                width: `216`,
                height: `230`,
                fill: `#080b10`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `400`,
                y: `338`,
                width: `93`,
                height: `100`,
                fill: `#ffeec6`,
                opacity: `0.74`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `507`,
                y: `338`,
                width: `93`,
                height: `100`,
                fill: `#ffeec6`,
                opacity: `0.62`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `400`,
                y: `452`,
                width: `93`,
                height: `100`,
                fill: `#ffe6b6`,
                opacity: `0.46`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `507`,
                y: `452`,
                width: `93`,
                height: `100`,
                fill: `#ffe6b6`,
                opacity: `0.4`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `494`,
                y: `330`,
                width: `9`,
                height: `230`,
                fill: `#06080d`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `392`,
                y: `438`,
                width: `216`,
                height: `9`,
                fill: `#06080d`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `384`,
                y: `322`,
                width: `232`,
                height: `246`,
                fill: `none`,
                stroke: `#0c1119`,
                strokeWidth: `7`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `440`,
                rx: `250`,
                ry: `230`,
                fill: `url(#bloom)`,
                filter: `url(#softer)`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `716`,
                rx: `250`,
                ry: `40`,
                fill: `#f0d9ae`,
                opacity: `0.07`,
                filter: `url(#soft)`,
              }),
            ],
          })
        : null,
      e === `table`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `520`,
                rx: `340`,
                ry: `230`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `540`,
                rx: `190`,
                ry: `120`,
                fill: `url(#bloom)`,
                filter: `url(#soft)`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `620`,
                width: `1000`,
                height: `380`,
                fill: `#050810`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `180`,
                y: `606`,
                width: `640`,
                height: `14`,
                rx: `4`,
                fill: `#12161f`,
              }),
              (0, jsx.jsxs)(`g`, {
                opacity: `0.6`,
                children: [
                  (0, jsx.jsx)(`ellipse`, {
                    cx: `412`,
                    cy: `602`,
                    rx: `30`,
                    ry: `10`,
                    fill: `#c9b48e`,
                    opacity: `0.4`,
                  }),
                  (0, jsx.jsx)(`rect`, {
                    x: `386`,
                    y: `568`,
                    width: `52`,
                    height: `36`,
                    rx: `7`,
                    fill: `#161b25`,
                  }),
                  (0, jsx.jsx)(`ellipse`, {
                    cx: `588`,
                    cy: `602`,
                    rx: `30`,
                    ry: `10`,
                    fill: `#c9b48e`,
                    opacity: `0.32`,
                  }),
                  (0, jsx.jsx)(`rect`, {
                    x: `562`,
                    y: `572`,
                    width: `52`,
                    height: `32`,
                    rx: `7`,
                    fill: `#161b25`,
                  }),
                ],
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `300`,
                width: `1000`,
                height: `10`,
                fill: `#e8cf9e`,
                opacity: `0.05`,
                filter: `url(#softer)`,
              }),
            ],
          })
        : null,
      e === `doorway`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#04060b`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `500`,
                rx: `290`,
                ry: `420`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M436 176 L566 176 L604 900 L400 900 Z`,
                fill: `url(#spill)`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `420`,
                rx: `120`,
                ry: `260`,
                fill: `url(#bloom)`,
                filter: `url(#soft)`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `428`,
                y: `170`,
                width: `10`,
                height: `736`,
                fill: `#080b11`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `562`,
                y: `170`,
                width: `10`,
                height: `736`,
                fill: `#080b11`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `424`,
                y: `164`,
                width: `152`,
                height: `12`,
                fill: `#080b11`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `900`,
                rx: `250`,
                ry: `40`,
                fill: `#f0dcb8`,
                opacity: `0.06`,
                filter: `url(#soft)`,
              }),
            ],
          })
        : null,
      e === `horizon`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `url(#cool)`,
                opacity: `0.7`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `620`,
                width: `1000`,
                height: `380`,
                fill: `#04060a`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `616`,
                width: `1000`,
                height: `4`,
                fill: `#8fa8c6`,
                opacity: `0.16`,
              }),
              (0, jsx.jsxs)(`g`, {
                transform: `translate(628 546)`,
                children: [
                  (0, jsx.jsx)(`ellipse`, {
                    cx: `46`,
                    cy: `52`,
                    rx: `150`,
                    ry: `86`,
                    fill: `url(#warm)`,
                  }),
                  (0, jsx.jsx)(`path`, {
                    d: `M0 40 L46 0 L92 40 Z`,
                    fill: `#080c12`,
                  }),
                  (0, jsx.jsx)(`rect`, {
                    x: `9`,
                    y: `40`,
                    width: `74`,
                    height: `46`,
                    fill: `#080c12`,
                  }),
                  (0, jsx.jsx)(`rect`, {
                    x: `34`,
                    y: `56`,
                    width: `22`,
                    height: `20`,
                    fill: `#ffe9c0`,
                    opacity: `0.85`,
                  }),
                  (0, jsx.jsx)(`ellipse`, {
                    cx: `45`,
                    cy: `66`,
                    rx: `52`,
                    ry: `42`,
                    fill: `url(#bloom)`,
                    filter: `url(#softer)`,
                  }),
                ],
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `300`,
                cy: `360`,
                rx: `420`,
                ry: `150`,
                fill: `#9db8db`,
                opacity: `0.045`,
                filter: `url(#soft)`,
              }),
            ],
          })
        : null,
      e === `lamp`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `470`,
                rx: `330`,
                ry: `300`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M444 470 L500 350 L556 470 Z`,
                fill: `#141a24`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `440`,
                y: `466`,
                width: `120`,
                height: `14`,
                rx: `6`,
                fill: `#10151d`,
              }),
              (0, jsx.jsx)(`circle`, {
                cx: `500`,
                cy: `452`,
                r: `15`,
                fill: `#fff1d2`,
                opacity: `0.9`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `470`,
                rx: `200`,
                ry: `180`,
                fill: `url(#bloom)`,
                filter: `url(#soft)`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `490`,
                y: `480`,
                width: `20`,
                height: `150`,
                fill: `#12171f`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `440`,
                y: `628`,
                width: `120`,
                height: `12`,
                rx: `5`,
                fill: `#151b24`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `660`,
                rx: `230`,
                ry: `34`,
                fill: `#f0d9ae`,
                opacity: `0.06`,
                filter: `url(#soft)`,
              }),
            ],
          })
        : null,
      e === `bed`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#04060b`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `300`,
                rx: `420`,
                ry: `240`,
                fill: `url(#warm)`,
                opacity: `0.5`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `270`,
                rx: `250`,
                ry: `150`,
                fill: `url(#bloom)`,
                filter: `url(#soft)`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M418 690 L582 690 L560 760 L440 760 Z`,
                fill: `#0a0e15`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `444`,
                y: `606`,
                width: `112`,
                height: `86`,
                rx: `9`,
                fill: `#0d1219`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `452`,
                y: `614`,
                width: `96`,
                height: `70`,
                rx: `5`,
                fill: `#dfeaf8`,
                opacity: `0.72`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M452 614 L548 614 L640 300 L360 300 Z`,
                fill: `#dfeaf8`,
                opacity: `0.055`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `760`,
                width: `1000`,
                height: `240`,
                fill: `#04060b`,
              }),
            ],
          })
        : null,
      e === `rain`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#04060a`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M470 210 L530 210 L700 900 L300 900 Z`,
                fill: `url(#spill)`,
                opacity: `0.5`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `230`,
                rx: `170`,
                ry: `120`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `492`,
                y: `96`,
                width: `7`,
                height: `120`,
                fill: `#0b0f16`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M456 196 Q500 168 544 196 L536 216 L464 216 Z`,
                fill: `#0e131b`,
              }),
              (0, jsx.jsx)(`circle`, {
                cx: `500`,
                cy: `212`,
                r: `13`,
                fill: `#ffeec6`,
                opacity: `0.9`,
              }),
              (0, jsx.jsx)(`g`, {
                stroke: `#dce9f8`,
                strokeWidth: `1.6`,
                opacity: `0.3`,
                strokeLinecap: `round`,
                children: Array.from(
                  {
                    length: 22,
                  },
                  (e, t) => {
                    let n = 300 + ((t * 137) % 400),
                      r = 300 + ((t * 251) % 520);
                    return (0, jsx.jsx)(
                      `line`,
                      {
                        x1: n,
                        y1: r,
                        x2: n + 5,
                        y2: r + 46,
                      },
                      t,
                    );
                  },
                ),
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `900`,
                rx: `260`,
                ry: `42`,
                fill: `#f0dcb8`,
                opacity: `0.08`,
                filter: `url(#soft)`,
              }),
            ],
          })
        : null,
      e === `platform`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#05070c`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `700`,
                cy: `430`,
                rx: `260`,
                ry: `180`,
                fill: `url(#warm)`,
                opacity: `0.8`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `596`,
                width: `1000`,
                height: `8`,
                fill: `#8fa8c6`,
                opacity: `0.13`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `604`,
                width: `1000`,
                height: `396`,
                fill: `#04060a`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M0 700 L1000 640`,
                stroke: `#8fa8c6`,
                strokeWidth: `1.4`,
                opacity: `0.16`,
                fill: `none`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M0 790 L1000 700`,
                stroke: `#8fa8c6`,
                strokeWidth: `1.4`,
                opacity: `0.11`,
                fill: `none`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `694`,
                y: `290`,
                width: `6`,
                height: `150`,
                fill: `#0b0f16`,
              }),
              (0, jsx.jsx)(`circle`, {
                cx: `697`,
                cy: `440`,
                r: `11`,
                fill: `#ffe9c0`,
                opacity: `0.82`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `697`,
                cy: `452`,
                rx: `80`,
                ry: `60`,
                fill: `url(#bloom)`,
                filter: `url(#softer)`,
              }),
            ],
          })
        : null,
      e === `stairs`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#04060a`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M300 0 L700 0 L820 1000 L180 1000 Z`,
                fill: `url(#spill)`,
                opacity: `0.42`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `90`,
                rx: `300`,
                ry: `150`,
                fill: `url(#bloom)`,
                filter: `url(#soft)`,
              }),
              [0, 1, 2, 3, 4, 5].map((e) =>
                (0, jsx.jsx)(
                  `rect`,
                  {
                    x: 300 - e * 22,
                    y: 430 + e * 96,
                    width: 400 + e * 44,
                    height: `11`,
                    fill: `#0b1017`,
                    opacity: 0.9 - e * 0.08,
                  },
                  e,
                ),
              ),
            ],
          })
        : null,
      e === `road`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#04060a`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `0`,
                width: `1000`,
                height: `520`,
                fill: `url(#cool)`,
                opacity: `0.5`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `516`,
                width: `1000`,
                height: `6`,
                fill: `#8fa8c6`,
                opacity: `0.12`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `430`,
                cy: `500`,
                rx: `80`,
                ry: `26`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `560`,
                cy: `500`,
                rx: `80`,
                ry: `26`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`circle`, {
                cx: `430`,
                cy: `500`,
                r: `12`,
                fill: `#fff3da`,
                opacity: `0.85`,
              }),
              (0, jsx.jsx)(`circle`, {
                cx: `560`,
                cy: `500`,
                r: `12`,
                fill: `#fff3da`,
                opacity: `0.85`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M430 512 L340 1000 L520 1000 Z`,
                fill: `#ffeec6`,
                opacity: `0.07`,
              }),
              (0, jsx.jsx)(`path`, {
                d: `M560 512 L640 1000 L470 1000 Z`,
                fill: `#ffeec6`,
                opacity: `0.06`,
              }),
              [0, 1, 2, 3].map((e) =>
                (0, jsx.jsx)(
                  `rect`,
                  {
                    x: 492,
                    y: 600 + e * 118,
                    width: `12`,
                    height: 44 + e * 14,
                    fill: `#cfe0f2`,
                    opacity: `0.14`,
                  },
                  e,
                ),
              ),
            ],
          })
        : null,
      e === `sea`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#05070c`,
              }),
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `560`,
                fill: `url(#cool)`,
                opacity: `0.85`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `540`,
                rx: `420`,
                ry: `120`,
                fill: `url(#warm)`,
                opacity: `0.55`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `556`,
                width: `1000`,
                height: `4`,
                fill: `#b9cfe8`,
                opacity: `0.2`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `0`,
                y: `560`,
                width: `1000`,
                height: `440`,
                fill: `#05080e`,
              }),
              Array.from(
                {
                  length: 16,
                },
                (e, t) =>
                  (0, jsx.jsx)(
                    `rect`,
                    {
                      x: 470 - t * 5,
                      y: 578 + t * 26,
                      width: 60 + t * 11,
                      height: `3`,
                      rx: `1.5`,
                      fill: `#f0dcb8`,
                      opacity: 0.2 - t * 0.011,
                    },
                    t,
                  ),
              ),
            ],
          })
        : null,
      e === `bulb`
        ? (0, jsx.jsxs)(`g`, {
            children: [
              (0, jsx.jsx)(`rect`, {
                width: `1000`,
                height: `1000`,
                fill: `#04060a`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `440`,
                rx: `360`,
                ry: `330`,
                fill: `url(#warm)`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `497`,
                y: `0`,
                width: `5`,
                height: `360`,
                fill: `#0b0f16`,
              }),
              (0, jsx.jsx)(`rect`, {
                x: `484`,
                y: `356`,
                width: `32`,
                height: `34`,
                rx: `4`,
                fill: `#161c26`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `424`,
                rx: `40`,
                ry: `48`,
                fill: `#fff2d6`,
                opacity: `0.92`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `424`,
                rx: `150`,
                ry: `160`,
                fill: `url(#bloom)`,
                filter: `url(#soft)`,
              }),
              (0, jsx.jsx)(`ellipse`, {
                cx: `500`,
                cy: `880`,
                rx: `300`,
                ry: `46`,
                fill: `#f0d9ae`,
                opacity: `0.05`,
                filter: `url(#soft)`,
              }),
            ],
          })
        : null,
      (0, jsx.jsx)(`rect`, {
        width: `1000`,
        height: `1000`,
        fill: `url(#cool)`,
        opacity: `0.28`,
      }),
    ],
  });
}
