"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * CountUp — a number that arrives at its value once, when it first comes into view.
 *
 * The caller supplies the formatter, so the decimal, the separator and the currency stay the
 * caller's business and never drift from how the same figure is printed elsewhere. Under
 * reduced motion it renders the final value immediately: the point is the number, not the run.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1400,
  format = (n) => Math.round(n).toLocaleString(),
  className = "",
  startOnView = true,
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [value, setValue] = useState(reduce || !startOnView ? to : from);
  const ran = useRef(false);

  useEffect(() => {
    if (reduce) { setValue(to); return; }
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (ran.current) return;
      ran.current = true;
      const t0 = performance.now();
      let raf;
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        // ease-out quint: fast off the mark, then it settles on the figure
        const eased = 1 - Math.pow(1 - t, 5);
        setValue(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };

    if (!startOnView) return run();

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, from, duration, reduce, startOnView]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(value)}
    </span>
  );
}
