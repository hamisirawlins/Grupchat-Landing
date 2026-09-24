"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * SplitText — the line assembles a word at a time instead of arriving whole.
 *
 * Split by word, not by character: a headline of characters reads as an effect, a headline of
 * words reads as someone saying it. The whole string stays in the accessible tree as one label
 * so a screen reader is never handed loose letters.
 */
export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.045,
  duration = 0.7,
  highlight,
  highlightClassName = "",
}) {
  const reduce = useReducedMotion();
  const words = String(text).split(" ");

  if (reduce) {
    return (
      <Tag className={className}>
        {words.map((w, i) => (
          <span key={i} className={highlight?.includes(w) ? highlightClassName : undefined}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className={`inline-block ${highlight?.includes(w) ? highlightClassName : ""}`}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration, ease: EASE, delay: delay + i * stagger }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
