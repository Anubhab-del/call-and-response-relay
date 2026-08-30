var EASE_STD = [0.4, 0, 0.2, 1];
var EASE_OUT = [0.16, 1, 0.3, 1];
var T_SLOW = {
  duration: 0.38,
  ease: EASE_STD,
};
var T_MED = {
  duration: 0.26,
  ease: EASE_STD,
};
var T_FAST = {
  duration: 0.16,
  ease: EASE_STD,
};
function transition() {
  return isStill() ? T_FAST : isLean() ? T_MED : T_SLOW;
}
function riseIn(e = 0) {
  return isStill()
    ? {
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
        },
        transition: {
          duration: 0.2,
          delay: e * 0.4,
        },
      }
    : {
        initial: {
          opacity: 0,
          y: 10,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
        transition: {
          duration: 0.8,
          delay: e,
          ease: EASE_OUT,
        },
      };
}
function fadeIn(e = 0, t = 0.7) {
  return {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    transition: {
      duration: isStill() ? 0.2 : t,
      delay: isStill() ? e * 0.4 : e,
    },
  };
}
function breatheIn(e = 4) {
  return isStill()
    ? {
        initial: {
          scale: 1,
        },
        animate: {
          scale: 1,
        },
        transition: {
          duration: 0,
        },
      }
    : {
        initial: {
          scale: 1.045,
        },
        animate: {
          scale: 1,
        },
        transition: {
          duration: e,
          ease: "linear",
        },
      };
}
function Invitation({ onReady: onReady }) {
  return (0, jsx.jsx)(motion.div, {
    className: "beat",
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
    transition: {
      duration: 1.2,
    },
    children: (0, jsx.jsxs)("div", {
      className: "centre invitation",
      children: [
        (0, jsx.jsx)(motion.p, {
          className: "kicker",
          ...fadeIn(0.5, 0.9),
          children: INVITATION_COPY.kicker,
        }),
        (0, jsx.jsx)("div", {
          className: "stack",
          children: INVITATION_COPY.lines.map((e, t) =>
            (0, jsx.jsx)(
              motion.p,
              {
                className: "invite-line",
                ...fadeIn(1 + t * 0.8, 0.9),
                children: e,
              },
              e,
            ),
          ),
        }),
        (0, jsx.jsx)(motion.button, {
          type: "button",
          className: "door-button",
          onClick: onReady,
          ...riseIn(3.5),
          children: INVITATION_COPY.button,
        }),
        (0, jsx.jsxs)(motion.p, {
          className: "invite-sign",
          ...fadeIn(4.4, 1),
          children: ["— ", CANON.you],
        }),
      ],
    }),
  });
}
