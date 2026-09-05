"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { initials } from "@/lib/format";

const TAG_TONES = {
  neutral: "bg-gray-100 text-gray-600",
  accent: "bg-purple-50 text-purple-700",
  success: "bg-green-50 text-green-700",
  critical: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-700",
};

export function Tag({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TAG_TONES[tone] ?? TAG_TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export function Avatar({ name = "", src, size = 36, className = "" }) {
  const style = { width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 font-semibold text-gray-700 ${className}`}
      style={style}
      aria-hidden={name ? undefined : "true"}
      title={name || undefined}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(name) || "•"}
    </span>
  );
}

export function ProgressBar({ value = 0, className = "" }) {
  const reduce = useReducedMotion();
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-purple-600"
        initial={{ width: reduce ? `${pct}%` : 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
      />
    </div>
  );
}

export function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={label} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                state === "current" ? "w-6 bg-purple-600" : state === "done" ? "w-1.5 bg-purple-600" : "w-1.5 bg-gray-200"
              }`}
            />
            <span className="sr-only">{label}</span>
          </li>
        );
      })}
      <li className="ml-2 text-xs text-gray-400" aria-hidden="true">
        {steps[current]}
      </li>
    </ol>
  );
}

export function EmptyState({ title, text, action, secondary }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/[0.12] px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {text && <p className="mt-1 text-sm text-gray-500">{text}</p>}
      {(action || secondary) && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}

/** Hairline placeholder block for loading states. */
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} aria-hidden="true" />;
}

/** Primary action: sticky at the bottom on phones, inline from 640px up. */
export function StickyAction({ children }) {
  return (
    <>
      <div className="h-24 sm:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.08] bg-white/90 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:z-auto sm:flex-1 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </>
  );
}

export function TextLink({ href, children, className = "" }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700 ${className}`}
    >
      {children}
    </Link>
  );
}
