"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Marquee — a seamless ticker. Pauses on hover and on focus within, so anything in it can
 * still be read and reached; under reduced motion it becomes a plain wrapped row.
 *
 * The track is rendered twice and translated by exactly -50%, which is what makes the loop
 * seamless without measuring anything.
 */
export default function Marquee({ children, speed = 34, className = "", fade = true }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-3 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      style={
        fade
          ? {
              maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)",
              WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)",
            }
          : undefined
      }
    >
      <div
        className="flex w-max items-center gap-8 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        style={{ animation: `bits-marquee ${speed}s linear infinite` }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">{children}</div>
      </div>
      <style jsx global>{`
        @keyframes bits-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
