"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const initial = reduceMotion ? false : { opacity: 0, y: 8 };
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
