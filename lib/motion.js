"use client";

import { useReducedMotion } from "framer-motion";

// Apple's standard ease-out — settles rather than springs.
export const EASE = [0.32, 0.72, 0, 1];

export const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/**
 * The scheme's springs (KB 25 §Motion, D-045), shared with the films so the app
 * and the motion graphics move alike. stiffness · damping → overshoot · settle:
 *   soft     120 · 22   none   0.62 s   things arriving
 *   ui       260 · 28   0.4%   0.30 s   toggles, tabs, pressed states
 *   heavy     90 · 20   none   0.79 s   sheets, large surfaces
 *   playful  260 · 14   22%    0.68 s   one moment of delight: a ticket issued, a plan funded
 */
export const SPRING = {
  soft: { type: "spring", stiffness: 120, damping: 22 },
  ui: { type: "spring", stiffness: 260, damping: 28 },
  heavy: { type: "spring", stiffness: 90, damping: 20 },
  playful: { type: "spring", stiffness: 260, damping: 14 },
};

/** A press that answers the finger: 2% smaller while held. */
export const PRESS = { whileTap: { scale: 0.98 }, transition: SPRING.ui };

/**
 * Fade-and-rise for one block of a staggered reveal; a plain fade when the
 * user prefers reduced motion.
 */
export function useRevealVariants() {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      };
}

/**
 * Steps of a flow slide in the direction of travel: forward comes from the
 * right, back from the left. Reduced motion keeps a short fade.
 */
export function useStepVariants() {
  const reduce = useReducedMotion();
  if (reduce) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }
  return {
    enter: (dir = 1) => ({ opacity: 0, x: 28 * dir }),
    center: { opacity: 1, x: 0, transition: { ...SPRING.soft, opacity: { duration: 0.3, ease: EASE } } },
    exit: (dir = 1) => ({ opacity: 0, x: -20 * dir, transition: { duration: 0.18, ease: EASE } }),
  };
}

/** List items that come and go: they grow in and fold away instead of jumping. */
export function useListItemVariants() {
  const reduce = useReducedMotion();
  return reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1, transition: SPRING.soft },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18, ease: EASE } },
      };
}
