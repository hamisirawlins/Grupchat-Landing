"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { SPRING } from "@/lib/motion";

/**
 * Where you are in a flow. Desktop: a vertical list beside the form, finished
 * steps linkable. Phones: one line ("Step 2 of 4 · Documents") over a bar of
 * segments that fill as you go.
 */
export function VerticalStepper({ steps, current, label = "Steps" }) {
  return (
    <ol aria-label={label} className="flex flex-col">
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        const circle = done ? (
          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action text-white">
            <Check aria-hidden="true" className="h-[15px] w-[15px]" strokeWidth={3} />
          </span>
        ) : (
          <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] ${now ? "font-extrabold text-action-strong shadow-[inset_0_0_0_2px_var(--color-action)]" : "font-bold text-ink-3 shadow-[inset_0_0_0_2px_rgb(0_0_0/0.18)]"}`}>
            {i + 1}
          </span>
        );
        const text = <span className={`text-[15px] ${now ? "font-extrabold text-action-strong" : done ? "font-semibold text-ink" : "font-semibold text-ink-2"}`}>{s.label}</span>;
        const row = done && s.href ? (
          <Link href={s.href} className="flex items-center gap-3 rounded-lg hover:underline hover:underline-offset-4">{circle}{text}</Link>
        ) : (
          <span className="flex items-center gap-3">{circle}{text}</span>
        );
        return (
          <li key={s.label} aria-current={now ? "step" : undefined} className={`relative ${i < steps.length - 1 ? "pb-6" : ""}`}>
            {row}
            {i < steps.length - 1 && <span aria-hidden="true" className={`absolute left-[13px] top-[30px] h-6 w-0.5 ${done ? "bg-action" : "bg-line-strong"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export function CompactStepper({ steps, current }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col gap-2" aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]?.label}`}>
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold text-ink-2">Step {current + 1} of {steps.length}</span>
        <span className="font-bold text-action-strong">{steps[current]?.label}</span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.label} className="h-1 overflow-hidden rounded-full bg-soft">
            <motion.span
              className="block h-full rounded-full bg-action"
              initial={false}
              animate={{ width: i <= current ? "100%" : "0%" }}
              transition={reduce ? { duration: 0 } : SPRING.soft}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
