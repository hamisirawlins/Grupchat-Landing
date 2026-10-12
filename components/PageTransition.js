"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * A soft fade between pages. Only between pages: the first page a visitor lands on is shown as
 * the server sent it, with no fade waiting on JavaScript, so a slow phone sees the words on the
 * first paint (D-047). Every later navigation fades in as before.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const landed = useRef(false);
  useEffect(() => {
    landed.current = true;
  }, []);

  const initial = reduceMotion || !landed.current ? false : { opacity: 0, y: 8 };
  const animate = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut" };

  return (
    <motion.div
      key={pathname}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
