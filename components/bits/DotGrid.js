"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * DotGrid — a blueprint field of dots that brightens and swells under the pointer.
 *
 * Drawn on a canvas rather than as a thousand DOM nodes, and it only repaints while the
 * pointer is over it: a background that runs a RAF loop forever costs battery on a page whose
 * whole job is to be read.
 *
 * Under reduced motion it paints once, flat. Under no pointer (touch) it also paints once —
 * there is nothing to follow, so there is nothing to animate.
 */
export default function DotGrid({
  gap = 26,
  dot = 1.6,
  color = "0,0,0",
  baseAlpha = 0.07,
  glowColor = "124,58,237", // purple-600
  radius = 170,
  className = "",
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pointer = { x: -9999, y: -9999, on: false };
    let raf = null;
    let w = 0, h = 0, dpr = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      for (let y = gap; y < h; y += gap) {
        for (let x = gap; x < w; x += gap) {
          let r = dot, a = baseAlpha, c = color;
          if (pointer.on && !reduce) {
            const d = Math.hypot(x - pointer.x, y - pointer.y);
            if (d < radius) {
              const t = 1 - d / radius;          // 0 at the edge, 1 at the pointer
              const e = t * t;                    // tightens the falloff so the halo has an edge
              r = dot + e * 2.1;
              a = baseAlpha + e * 0.55;
              c = glowColor;
            }
          }
          ctx.beginPath();
          ctx.fillStyle = `rgba(${c},${a})`;
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // repaint only while the pointer is moving over the field
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; paint(); });
    };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.on = true;
      schedule();
    };
    const leave = () => { pointer.on = false; schedule(); };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (!reduce) {
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerleave", leave, { passive: true });
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [gap, dot, color, baseAlpha, glowColor, radius, reduce]);

  return <canvas ref={ref} aria-hidden="true" className={`h-full w-full ${className}`} />;
}
