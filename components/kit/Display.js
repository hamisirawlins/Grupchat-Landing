"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { Check, ChevronLeft } from "lucide-react";
import { EASE, SPRING } from "@/lib/motion";
import { initials } from "@/lib/format";

/** Status words, each with its tint and a dot. Caps, 11px, tracked: read at a glance. */
const STATUS = {
  live: ["Live", "bg-success-tint text-success", "bg-success"],
  paid: ["Paid", "bg-success-tint text-success", "bg-success"],
  approved: ["Approved", "bg-success-tint text-success", "bg-success"],
  ready: ["Ready to approve", "bg-success-tint text-success", "bg-success"],
  review: ["In review", "bg-action-tint text-action-strong", "bg-action"],
  submitted: ["Submitted", "bg-action-tint text-action-strong", "bg-action"],
  "in-review": ["In review", "bg-action-tint text-action-strong", "bg-action"],
  pending: ["Pending", "bg-action-tint text-action-strong", "bg-action"],
  recheck: ["Re-check", "bg-action-tint text-action-strong", "bg-action"],
  draft: ["Draft", "bg-soft text-ink-2", "bg-ink-3"],
  paused: ["Paused", "bg-soft text-ink-2", "bg-ink-3"],
  waiting: ["Waiting for market", "bg-soft text-ink-2", "bg-ink-3"],
  "changes-requested": ["Changes requested", "bg-warning-tint text-warning", "bg-warning"],
  fix: ["Needs a fix", "bg-warning-tint text-warning", "bg-warning"],
  declined: ["Declined", "bg-critical-tint text-critical", "bg-critical"],
  failed: ["Not paid", "bg-critical-tint text-critical", "bg-critical"],
};

export function StatusTag({ status, children, className = "" }) {
  const [text, tone, dot] = STATUS[status] ?? [status, "bg-soft text-ink-2", "bg-ink-3"];
  return (
    <span className={twMerge(`inline-flex h-6 shrink-0 items-center gap-1.5 self-start rounded-tag px-2 text-[11px] font-bold uppercase tracking-[0.06em] ${tone}`, className)}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children ?? text}
    </span>
  );
}

export function Kicker({ children, className = "" }) {
  return <span className={twMerge("text-xs font-semibold uppercase leading-4 tracking-[0.14em] text-ink-3", className)}>{children}</span>;
}

/** Page title: heavy and tight, with an optional line under it. */
export function PageTitle({ children, sub, tag, className = "" }) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      {tag}
      <h1 className="text-[32px] font-black leading-[38px] tracking-[-0.03em] text-ink sm:text-4xl sm:leading-[42px]">{children}</h1>
      {sub && <p className="text-[15px] leading-5 text-ink-2">{sub}</p>}
    </div>
  );
}

export function BackLink({ href, children }) {
  return (
    <Link href={href} className="-my-2.5 -ml-1.5 inline-flex h-11 items-center gap-0.5 self-start rounded-xl px-1.5 text-sm font-semibold text-ink-2 transition-colors duration-200 hover:text-ink">
      <ChevronLeft aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
      {children}
    </Link>
  );
}

/** A white card with a hairline ring; `title` makes it a labelled section. */
export function Card({ title, sub, action, children, className = "", as: Tag = "section" }) {
  return (
    <Tag aria-label={typeof title === "string" ? title : undefined} className={twMerge("flex flex-col gap-[18px] rounded-card bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-6", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-lg font-extrabold leading-6 tracking-[-0.01em] text-ink">{title}</h2>}
            {sub && <span className="text-[13px] leading-[18px] text-ink-3">{sub}</span>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}

export function StatTile({ label, value, sub, className = "" }) {
  return (
    <div className={twMerge("flex flex-col gap-1.5 rounded-tile bg-soft px-5 py-[18px]", className)}>
      <span className="text-[13px] font-semibold leading-[18px] text-ink-2">{label}</span>
      <span className="tabular text-[26px] font-extrabold leading-[30px] text-ink">{value}</span>
      {sub && <span className="text-[13px] leading-[18px] text-ink-2">{sub}</span>}
    </div>
  );
}

/** Label · amount rows; the last one can be the bold total under a rule. */
export function MoneyLines({ title, rows, className = "" }) {
  return (
    <div className={twMerge("flex flex-col rounded-2xl bg-soft px-[18px] py-3", className)}>
      {title && <Kicker className="mb-1.5">{title}</Kicker>}
      {rows.map(([label, amount, total], i) => (
        <div key={i} className={`flex min-h-10 items-center justify-between gap-3 ${total ? "border-t border-line text-base" : "text-[15px]"}`}>
          <span className={total ? "font-bold text-ink" : "text-ink-2"}>{label}</span>
          <span className={`tabular ${total ? "font-extrabold" : "font-bold"} text-ink`}>{amount}</span>
        </div>
      ))}
    </div>
  );
}

/** A thin bar that fills with a spring. `tone` = action | success | memory. */
export function ProgressBar({ value = 0, label, tone = "action", className = "", thick = false }) {
  const reduce = useReducedMotion();
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  const fill = { action: "bg-action", success: "bg-success", memory: "bg-memory" }[tone] ?? "bg-action";
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className={twMerge(`${thick ? "h-2" : "h-1.5"} w-full overflow-hidden rounded-full bg-soft`, className)}>
      <motion.div className={`h-full rounded-full ${fill}`} initial={{ width: reduce ? `${pct}%` : 0 }} animate={{ width: `${pct}%` }} transition={reduce ? { duration: 0 } : { ...SPRING.soft, delay: 0.15 }} />
    </div>
  );
}

/** "7 of 8" beside a bar: used for checks passed and places booked. */
export function Meter({ value, total, tone, className = "" }) {
  const done = total > 0 && value >= total;
  return (
    <div className={twMerge("flex min-w-[130px] items-center gap-2.5", className)}>
      <ProgressBar value={total ? value / total : 0} tone={tone ?? (done ? "success" : "action")} className="flex-1" />
      <span className="tabular whitespace-nowrap text-sm font-semibold text-ink">{value} of {total}</span>
    </div>
  );
}

/** Green tick and a short line: "Matches your business name". */
export function OkLine({ children, className = "" }) {
  return (
    <span className={twMerge("inline-flex items-center gap-1.5 text-[13px] font-semibold leading-[18px] text-success", className)}>
      <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
      {children}
    </span>
  );
}

const AVATAR = [
  ["bg-action-tint", "text-action-strong"], ["bg-amber-100", "text-amber-700"], ["bg-emerald-100", "text-emerald-700"],
  ["bg-sky-100", "text-sky-700"], ["bg-rose-100", "text-rose-700"],
];
export function Avatar({ name = "", size = 36, dark = false, className = "" }) {
  const code = [...name].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const [bg, fg] = dark ? ["bg-raised-dark", "text-ink-dark"] : AVATAR[code % AVATAR.length];
  return (
    <span aria-hidden="true" className={twMerge(`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${bg} ${fg}`, className)} style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}>
      {initials(name) || "•"}
    </span>
  );
}

export function EmptyState({ title, text, action, className = "" }) {
  return (
    <div className={twMerge("flex flex-col items-center gap-1 rounded-card border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      <p className="text-[15px] font-bold text-ink">{title}</p>
      {text && <p className="max-w-sm text-sm text-ink-2">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={twMerge("animate-pulse rounded-xl bg-soft", className)} />;
}

/** A tick that draws itself: the moment something is done. */
export function DoneMark({ size = 64, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={twMerge("inline-flex items-center justify-center rounded-full bg-success-tint text-success", className)}
      style={{ width: size, height: size }}
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING.playful}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M20 6 9 17l-5-5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: EASE, delay: 0.15 }} />
      </svg>
    </motion.span>
  );
}
