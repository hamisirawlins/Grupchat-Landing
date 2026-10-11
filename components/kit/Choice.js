"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { SPRING } from "@/lib/motion";

/**
 * Choosing things: chips (one or many), radio cards (one of a few, with a line
 * each), a switch, and the three-way review control (pass · needs fix · fail).
 * All of them are 40–44px tall so a thumb finds them.
 */

export function Chips({ label, options, value, onChange, multiple = true, className = "" }) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (v) => {
    if (!multiple) return onChange(v);
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    onChange([...next]);
  };
  return (
    <div role="group" aria-label={label} className={twMerge("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const on = selected.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={`h-10 rounded-full px-4 text-sm transition-[background-color,color,box-shadow] duration-200 ease-gc active:scale-[0.97] ${
              on
                ? "bg-action-tint font-bold text-action-strong shadow-[inset_0_0_0_2px_var(--color-action)]"
                : "bg-white font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-soft"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function RadioCards({ label, options, value, onChange, className = "" }) {
  return (
    <div role="radiogroup" aria-label={label} className={twMerge("grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex items-start gap-3 rounded-[14px] px-4 py-3.5 text-left transition-[background-color,box-shadow] duration-200 ease-gc active:scale-[0.99] ${
              on ? "bg-action-tint shadow-[inset_0_0_0_2px_var(--color-action)]" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-soft"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${on ? "bg-action" : "shadow-[inset_0_0_0_2px_rgb(0_0_0/0.25)]"}`}
            >
              {on && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold leading-5 text-ink">{o.label}</span>
              {o.sub && <span className="text-[13px] leading-[18px] text-ink-2">{o.sub}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ label, description, checked, onChange, disabled = false, compact = false }) {
  const reduce = useReducedMotion();
  const id = useId();
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={compact ? label : undefined}
      aria-labelledby={compact ? undefined : `${id}-l`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative h-11 w-14 shrink-0 disabled:opacity-50"
    >
      <span className={`absolute left-1 top-2 h-7 w-12 rounded-full transition-colors duration-200 ease-gc ${checked ? "bg-action" : "bg-gray-300"}`} />
      <motion.span
        className="absolute top-2.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
        initial={false}
        animate={{ left: checked ? 26 : 6 }}
        transition={reduce ? { duration: 0 } : SPRING.ui}
      />
    </button>
  );
  if (compact) return control;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col gap-0.5">
        <span id={`${id}-l`} className="text-[15px] font-semibold leading-5 text-ink">{label}</span>
        {description && <span className="text-[13px] leading-[18px] text-ink-3">{description}</span>}
      </span>
      <span className="-mr-1">{control}</span>
    </div>
  );
}

const REVIEW = [
  { value: "pass", label: "Pass", on: "bg-success-tint text-success shadow-[inset_0_0_0_1px_var(--color-success)]" },
  { value: "fix", label: "Needs fix", on: "bg-warning-tint text-warning shadow-[inset_0_0_0_1px_var(--color-warning)]" },
  { value: "fail", label: "Fail", on: "bg-critical-tint text-critical shadow-[inset_0_0_0_1px_var(--color-critical)]" },
];

/** An admin's verdict on one check. */
export function ReviewToggle({ label, value, onChange, disabled = false }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 gap-0.5 rounded-xl bg-soft p-0.5">
      {REVIEW.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`h-10 whitespace-nowrap rounded-[10px] px-3 text-[13px] transition-[background-color,color,box-shadow] duration-200 ease-gc disabled:opacity-60 ${
              on ? `${o.on} font-bold` : "font-semibold text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Mon–Sun as round toggles; `value` holds ISO weekdays (1 = Monday). */
export function WeekdayPicker({ value = [], onChange, label = "Days" }) {
  const days = [
    ["M", "Monday"], ["T", "Tuesday"], ["W", "Wednesday"], ["T", "Thursday"], ["F", "Friday"], ["S", "Saturday"], ["S", "Sunday"],
  ];
  const set = new Set(value);
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {days.map(([short, full], i) => {
        const d = i + 1;
        const on = set.has(d);
        return (
          <button
            key={full}
            type="button"
            aria-pressed={on}
            aria-label={full}
            onClick={() => {
              const next = new Set(set);
              on ? next.delete(d) : next.add(d);
              onChange([...next].sort());
            }}
            className={`h-11 w-11 rounded-full text-sm transition-[background-color,color,box-shadow] duration-200 ease-gc active:scale-95 ${
              on ? "bg-action font-extrabold text-white" : "bg-white font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-soft"
            }`}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
