function transitFor(e) {
  switch (e.type) {
    case "part":
      return "black";
    case "vow":
      return "flash";
    case "title":
      return "slow";
    case "scene":
      return e.scene === "hold" ? "slow" : e.scene === "twohours" ? "flash" : "dissolve";
    case "care":
    case "last":
    case "codaStill":
      return "slow";
    case "nameFlash":
      return "black";
    case "credits":
      return "black";
    case "doorway":
      return "slow";
    default:
      return "dissolve";
  }
}
function transitSpec(e) {
  switch (e) {
    case "black":
      return {
        down: 0.55,
        hold: 0.34,
        up: 0.85,
        to: "#000",
      };
    case "flash":
      return {
        down: 0.07,
        hold: 0.03,
        up: 0.5,
        to: "#e8f1ff",
      };
    case "slow":
      return {
        down: 0.9,
        hold: 0.2,
        up: 1.2,
        to: "#000",
      };
    case "cut":
      return {
        down: 0,
        hold: 0,
        up: 0,
        to: "#000",
      };
    default:
      return {
        down: 0,
        hold: 0,
        up: 0,
        to: "#000",
      };
  }
}
function Transit({ transit: transit, at: at }) {
  let [n, r] = (0, React.useState)(null),
    i = (0, React.useRef)(at);
  if (
    ((0, React.useEffect)(() => {
      if (at !== i.current) {
        if (((i.current = at), transit === "dissolve" || transit === "cut")) {
          r(null);
          return;
        }
        r({
          key: at,
          transit: transit,
        });
      }
    }, [at, transit]),
    !n || isStill())
  )
    return null;
  let a = transitSpec(n.transit),
    o = a.down + a.hold + a.up;
  return (0, jsx.jsx)(
    motion.div,
    {
      className: "curtain",
      style: {
        background: a.to,
      },
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: [0, 1, 1, 0],
      },
      transition: {
        duration: o,
        times: [0, a.down / o, (a.down + a.hold) / o, 1],
        ease: n.transit === "flash" ? "linear" : [0.4, 0, 0.2, 1],
      },
      onAnimationComplete: () => r(null),
      "aria-hidden": "true",
    },
    n.key,
  );
}
