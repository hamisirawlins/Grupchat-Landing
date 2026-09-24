"use client";

import { useReducedMotion } from "framer-motion";

/**
 * ShinyText — one slow specular sweep across a word.
 *
 * Used on a single accent, never on body copy: a sheen that appears twice on a page stops
 * reading as emphasis and starts reading as a loading state.
 */
export default function ShinyText({ children, className = "", speed = 5 }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{children}</span>;
  return (
    <>
      <span
        className={`bg-clip-text text-transparent ${className}`}
        style={{
          backgroundImage:
            "linear-gradient(110deg, currentColor 38%, rgba(255,255,255,0.92) 50%, currentColor 62%)",
          backgroundSize: "220% 100%",
          animation: `bits-sheen ${speed}s ease-in-out infinite`,
          color: "inherit",
        }}
      >
        {children}
      </span>
      <style jsx global>{`
        @keyframes bits-sheen {
          0%   { background-position: 160% 0; }
          60%  { background-position: -60% 0; }
          100% { background-position: -60% 0; }
        }
      `}</style>
    </>
  );
}
