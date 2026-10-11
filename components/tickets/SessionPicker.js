"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SPRING } from "@/lib/motion";
import { sessionParts } from "@/lib/tickets";

const FIRST = 8;

/** Dates as tiles: weekday, day, month and places left. Full dates stay visible but can't be picked. */
export function SessionPicker({ sessions = [], value, onChange, low = 4 }) {
  const reduce = useReducedMotion();
  const picked = sessions.findIndex((s) => s.key === value);
  const [all, setAll] = useState(picked >= FIRST);
  const shown = all ? sessions : sessions.slice(0, FIRST);

  return (
    <div className="flex flex-col gap-2.5">
      <div role="radiogroup" aria-label="Date" className="grid grid-cols-4 gap-2">
        {shown.map((s) => {
          const p = sessionParts(s.key);
          const on = s.key === value;
          const full = s.left <= 0;
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${p.long}${full ? ", full" : `, ${s.left} left`}`}
              disabled={full}
              onClick={() => onChange(s.key)}
              className={`relative flex min-h-[84px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-center transition-colors duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
                on ? "text-action-strong" : full ? "text-ink-3" : "text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-soft"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="session-picked"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-action-tint shadow-[inset_0_0_0_2px_var(--color-action)]"
                  transition={reduce ? { duration: 0 } : SPRING.ui}
                />
              )}
              <span className="relative text-[11px] font-semibold uppercase tracking-[0.08em]">{p.weekday}</span>
              <span className={`relative tabular text-[22px] font-extrabold leading-6 ${full ? "line-through decoration-1" : ""}`}>{p.day}</span>
              <span className="relative text-xs font-medium">{p.month}</span>
              <span className={`relative mt-0.5 text-[11px] font-semibold ${full ? "" : s.left <= low ? "text-warning" : on ? "" : "text-ink-3"}`}>
                {full ? "Full" : s.left <= low ? `${s.left} left` : "Open"}
              </span>
            </button>
          );
        })}
      </div>
      {sessions.length > FIRST && (
        <button type="button" onClick={() => setAll((v) => !v)} className="self-start rounded-lg px-1 py-1.5 text-sm font-bold text-action-strong hover:text-action">
          {all ? "Fewer dates" : `More dates (${sessions.length - FIRST})`}
        </button>
      )}
    </div>
  );
}
