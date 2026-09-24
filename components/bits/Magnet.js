"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Magnet — the element leans toward the pointer inside a radius, then springs back.
 *
 * On a single primary call to action. The pull is small on purpose: enough to feel that the
 * button noticed you, not enough to make it a target you have to chase.
 */
export default function Magnet({ children, strength = 0.28, radius = 110, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [d, setD] = useState({ x: 0, y: 0 });

  const move = (e) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.hypot(dx, dy) > radius + Math.max(r.width, r.height) / 2) return setD({ x: 0, y: 0 });
    setD({ x: dx * strength, y: dy * strength });
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => setD({ x: 0, y: 0 })}
      animate={d}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.6 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}
