"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

const CONTACT = "info@grupchat.net";

/** Discover's empty state: three experience-card silhouettes taking shape, and the partner invitation. */
export function PartnersEmpty() {
  const reduce = useReducedMotion();
  const cards = [
    { x: 0, y: 26, rot: -6, delay: 0 },
    { x: 22, y: 12, rot: 3, delay: 0.1 },
    { x: 44, y: 0, rot: 8, delay: 0.2 },
  ];
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/[0.12] px-6 py-14 text-center">
      <svg viewBox="0 0 200 120" className="h-28 w-48 overflow-visible" aria-hidden="true">
        {cards.map((c, i) => (
          <motion.g
            key={i}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 + c.delay }}
            style={{ transformOrigin: "100px 60px" }}
          >
            <g transform={`translate(${c.x} ${c.y}) rotate(${c.rot} 78 46)`}>
              <rect x="20" y="10" width="116" height="80" rx="12" fill="white" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeDasharray={i === 2 ? "0" : "4 4"} />
              <rect x="30" y="20" width="96" height="36" rx="8" fill={i === 2 ? "#f3e8ff" : "#f5f5f4"} />
              <rect x="30" y="64" width="58" height="6" rx="3" fill="rgba(0,0,0,0.10)" />
              <rect x="30" y="76" width="36" height="5" rx="2.5" fill="rgba(0,0,0,0.06)" />
            </g>
          </motion.g>
        ))}
        <motion.circle
          cx="164" cy="30" r="5" fill="#9333ea"
          animate={reduce ? undefined : { scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "164px 30px" }}
        />
      </svg>
      <p className="mt-6 text-[17px] font-semibold tracking-tight">Curated experiences are on the way</p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">We're working with partners to create them.</p>
      <p className="mt-6 text-sm text-gray-500">
        Want to work with us?{" "}
        <a href={`mailto:${CONTACT}?subject=Partnering%20on%20a%20curated%20experience`} className="font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700">
          {CONTACT}
        </a>
      </p>
    </div>
  );
}
