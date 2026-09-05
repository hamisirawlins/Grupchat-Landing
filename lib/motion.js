"use client";

import { useReducedMotion } from "framer-motion";

// Apple's standard ease-out — settles rather than springs.
export const EASE = [0.32, 0.72, 0, 1];

export const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

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
