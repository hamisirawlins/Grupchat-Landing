"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Settings-style grouped rows. */
export function ListGroup({ label, children, className = "" }) {
  return (
    <section className={className}>
      {label && <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-gray-400">{label}</h2>}
      <div className="divide-y divide-black/[0.08] overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
        {children}
      </div>
    </section>
  );
}

const ROW =
  "flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-200";
const INTERACTIVE = "hover:bg-gray-50 active:bg-gray-100";

/**
 * One row. Pass `href` for a link, `onClick` for a button, neither for static.
 * `trailing` is a value/tag on the right; a chevron appears for interactive rows.
 */
export function Row({ title, footnote, leading, trailing, href, onClick, chevron, disabled }) {
  const interactive = !!href || !!onClick;
  const showChevron = chevron ?? interactive;

  const body = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-black">{title}</span>
        {footnote && <span className="mt-0.5 block truncate text-[13px] text-gray-500">{footnote}</span>}
      </span>
      {trailing && <span className="shrink-0 text-[13px] text-gray-500 tabular-nums">{trailing}</span>}
      {showChevron && <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${ROW} ${INTERACTIVE}`}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={`${ROW} ${INTERACTIVE} disabled:opacity-50`}>
        {body}
      </button>
    );
  }
  return <div className={ROW}>{body}</div>;
}
