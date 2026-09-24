"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * AnimatedContent — a block rises into place the first time it is scrolled to, and never again.
 *
 * `IntersectionObserver` rather than a scroll listener, and it disconnects after firing: a page
 * that re-animates on every scroll past is a page nobody can read twice.
 */
export default function AnimatedContent({
  children,
  distance = 18,
  direction = "up",
  duration = 0.65,
  delay = 0,
  threshold = 0.15,
  className = "",
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce) return setShown(true);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); io.disconnect(); }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, threshold]);

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "down" || direction === "right" ? -1 : 1;
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, [axis]: distance * sign };
  const show = reduce ? { opacity: 1 } : { opacity: 1, [axis]: 0 };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={shown ? show : hidden}
      transition={{ duration: reduce ? 0.3 : duration, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
