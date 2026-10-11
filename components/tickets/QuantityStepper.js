"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { SPRING } from "@/lib/motion";

/** − n + for tickets. The number rolls in the direction it moved. */
export function QuantityStepper({ value, onChange, min = 1, max = 10, label = "Tickets" }) {
  const reduce = useReducedMotion();
  const btn = "flex h-11 w-11 items-center justify-center rounded-full bg-soft text-ink transition-[background-color,transform] duration-200 hover:bg-line active:scale-95 disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span id="qty-label" className="text-[15px] font-bold text-ink">{label}</span>
        <span className="text-[13px] text-ink-3">Up to {max} per booking</span>
      </div>
      <div role="group" aria-labelledby="qty-label" className="flex items-center gap-2">
        <button type="button" className={btn} aria-label="One fewer" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          <Minus className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden="true" />
        </button>
        <span className="relative flex h-11 w-9 items-center justify-center overflow-hidden" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false} custom={value}>
            <motion.span
              key={value}
              className="tabular text-xl font-extrabold"
              initial={reduce ? { opacity: 0 } : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0 }}
              transition={reduce ? { duration: 0.1 } : SPRING.ui}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <button type="button" className={btn} aria-label="One more" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
