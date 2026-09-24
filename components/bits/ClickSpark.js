"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * ClickSpark — a short burst of lines from the point of click.
 *
 * Reserved for the one action on a screen that commits to something. Put it on every button
 * and it stops meaning "that worked" and starts meaning "this page has an effect".
 */
export default function ClickSpark({
  children,
  color = "#7c3aed",
  count = 8,
  radius = 22,
  className = "",
}) {
  const host = useRef(null);
  const reduce = useReducedMotion();

  const fire = (e) => {
    const el = host.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const s = document.createElement("span");
      s.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:2px;height:8px;
        background:${color};border-radius:2px;pointer-events:none;opacity:.9;
        transform:translate(-50%,-50%) rotate(${a}rad) translateY(0)`;
      el.appendChild(s);
      s.animate(
        [
          { transform: `translate(-50%,-50%) rotate(${a}rad) translateY(0)`, opacity: 0.9 },
          { transform: `translate(-50%,-50%) rotate(${a}rad) translateY(-${radius}px)`, opacity: 0 },
        ],
        { duration: 420, easing: "cubic-bezier(0.32,0.72,0,1)" }
      ).onfinish = () => s.remove();
    }
  };

  return (
    <span ref={host} onPointerDown={fire} className={`relative inline-block ${className}`}>
      {children}
    </span>
  );
}
