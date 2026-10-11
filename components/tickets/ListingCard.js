"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { fmtMoney } from "@/lib/providers";

/** A provider's live listing as guests meet it in Discover. */
export function ListingCard({ e, variants, priority = false }) {
  return (
    <motion.div variants={variants}>
      <Link
        href={`/experiences/${e.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-[inset_0_0_0_1px_var(--color-line)] transition-[box-shadow,transform] duration-300 ease-gc hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99]"
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-sheet">
          {e.cover ? (
            <img src={e.cover} alt="" loading={priority ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover transition-transform duration-700 ease-gc group-hover:scale-[1.04]" />
          ) : (
            <span className="flex h-full items-center justify-center text-memory-ink"><ImageIcon className="h-6 w-6" aria-hidden="true" /></span>
          )}
          <span className="absolute left-3 top-3 inline-flex h-6 items-center rounded-tag bg-white/95 px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink shadow-sm">Tickets</span>
        </span>
        <span className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3.5">
          <span className="text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-ink">{e.title}</span>
          <span className="text-[13px] leading-[18px] text-ink-2">{[e.town?.split(",")[0], e.scheduleLine, e.duration].filter(Boolean).join(" · ")}</span>
          <span className="tabular mt-auto pt-1.5 text-base font-extrabold text-ink">
            {fmtMoney(e.price, e.currency)} <span className="text-[13px] font-medium text-ink-3">per person</span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
