"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * SpotlightCard — a soft light follows the pointer across the surface.
 *
 * On cards that are the live part of a page. A surface that answers the pointer tells you it
 * is interactive before you click it, which is cheaper than saying so in words.
 */
export default function SpotlightCard({
  children,
  className = "",
  tint = "139, 92, 246", // purple-500, as an rgb triplet so it can carry an alpha
  radius = 320,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const move = (e) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
    el.style.setProperty("--on", "1");
  };
  const leave = () => ref.current?.style.setProperty("--on", "0");

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`group relative overflow-hidden ${className}`}
      style={{ "--on": 0 }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: "var(--on)",
          background: `radial-gradient(${radius}px circle at var(--x) var(--y), rgba(${tint},0.10), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
