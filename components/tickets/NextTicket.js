"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ticketsAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { sessionParts } from "@/lib/tickets";
import { useAsync } from "@/lib/useAsync";

/** Home: the next paid ticket, one tap from the code. Renders nothing without one. */
export function NextTicket({ variants }) {
  const { data } = useAsync(async () => unwrap(await ticketsAPI.mine()), []);
  const next = data?.upcoming?.find((t) => t.status === "paid");
  if (!next) return null;
  const p = sessionParts(next.session?.key);
  const more = (data.upcoming.length || 1) - 1;
  return (
    <motion.div variants={variants} initial="hidden" animate="show" className="mt-4">
      <Link href={`/tickets/${next.id}`} className="group flex items-center gap-4 rounded-2xl border border-black/[0.08] p-4 transition-all duration-300 hover:border-purple-600 active:scale-[0.99]">
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-50 text-purple-700">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{p.month}</span>
          <span className="text-xl font-extrabold leading-6 tabular-nums">{p.day}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-medium text-gray-500">Your next ticket</span>
          <span className="truncate text-[15px] font-semibold">{next.title}</span>
          <span className="truncate text-[13px] text-gray-500">{p.weekday}, {p.time} · {next.quantity} {next.quantity === 1 ? "guest" : "guests"}{more > 0 ? ` · ${more} more booked` : ""}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
