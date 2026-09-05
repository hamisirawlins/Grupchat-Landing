"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

// Charts start after the card they sit in has revealed.
const START = 0.6;

/** Animates a number from 0 to `target`; returns the in-flight value. */
export function useCountUp(target, { duration = 1.2, delay = START } = {}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setValue(target);
      return undefined;
    }
    const controls = animate(0, target, { duration, delay, ease: EASE, onUpdate: setValue });
    return () => controls.stop();
  }, [target, reduce, duration, delay]);

  return value;
}

/** Progress ring, 0–1. */
export function Ring({ value, size = 64, stroke = 6 }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const end = c * (1 - Math.min(Math.max(value, 0), 1));
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-black/[0.06]"
      />
      <motion.circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        className="text-purple-600"
        strokeDasharray={c}
        initial={{ strokeDashoffset: reduce ? end : c }}
        animate={{ strokeDashoffset: end }}
        transition={{ duration: 1.2, ease: EASE, delay: START }}
      />
    </svg>
  );
}

/** Column chart; the last column is the current period. */
export function Bars({ values, height = 56 }) {
  const reduce = useReducedMotion();
  const max = Math.max(...values, 1);
  const last = values.length - 1;

  return (
    <div className="flex items-end gap-1" style={{ height }} aria-hidden="true">
      {values.map((v, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-[3px] ${i === last ? "bg-purple-600" : "bg-purple-200"}`}
          style={{ height: `${Math.max((v / max) * 100, 6)}%`, originY: 1 }}
          initial={{ scaleY: reduce ? 1 : 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: START + i * 0.04 }}
        />
      ))}
    </div>
  );
}

/** Line that draws itself, with a dot on the latest point. Measures its
 *  container so the geometry is 1:1 at any width. */
export function Sparkline({ values, height = 56 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const W = width;
  const H = height;
  const PAD = 4;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - PAD - ((v - min) / span) * (H - PAD * 2),
  ]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [ex, ey] = pts[pts.length - 1];

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {width > 0 && (
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block text-purple-600"
          aria-hidden="true"
        >
          <motion.path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: START }}
          />
          <motion.circle
            cx={ex}
            cy={ey}
            r={3}
            fill="currentColor"
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: START + 1.1 }}
          />
        </svg>
      )}
    </div>
  );
}

export function StatCard({ label, value, sub, aside, children }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 truncate text-xs text-gray-400">{sub}</p>}
        </div>
        {aside}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
