"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ImageIcon } from "lucide-react";
import { StatusTag } from "@/components/kit";
import { fmtMoney } from "@/lib/providers";

/** One of a provider's listings, as a row they can open. */
export function ExperienceCard({ e, variants }) {
  const cover = e.photos?.[0]?.url;
  const meta = e.status === "draft" && !e.scheduleLine
    ? "Draft — add dates, price and photos"
    : [e.town, e.scheduleLine, e.price ? fmtMoney(e.price, e.currency) : null].filter(Boolean).join(" · ");
  return (
    <motion.div variants={variants} layout>
      <Link href={`/provider/experiences/${e.id}`} className="group flex items-center gap-4 rounded-tile p-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[box-shadow,transform] duration-300 ease-gc hover:shadow-[inset_0_0_0_2px_var(--color-action)] active:scale-[0.99]">
        <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-sheet text-memory-ink">
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <ImageIcon className="h-5 w-5" aria-hidden="true" />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold leading-[22px]">{e.title || "Untitled experience"}</span>
            <StatusTag status={e.status} />
          </span>
          <span className="truncate text-sm leading-5 text-ink-2">{meta}</span>
        </span>
        {e.status === "live" && e.stats?.ticketsSold > 0 && <span className="hidden shrink-0 text-sm font-semibold text-ink-2 sm:inline">{e.stats.ticketsSold} sold</span>}
        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
