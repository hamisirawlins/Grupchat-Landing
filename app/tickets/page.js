"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import AppShell, { BackToHome } from "@/components/app/AppShell";
import { ButtonLink, EmptyState, PageTitle, Skeleton, StatusTag } from "@/components/kit";
import { ticketsAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { sessionParts } from "@/lib/tickets";
import { useAsync } from "@/lib/useAsync";

/** Tickets the member bought: what's coming up first, then what they've been to. */
export default function Tickets() {
  const { data, loading, error, reload } = useAsync(async () => unwrap(await ticketsAPI.mine()), []);
  const item = useRevealVariants();
  const upcoming = data?.upcoming || [];
  const past = data?.past || [];

  return (
    <AppShell trailing={<BackToHome />}>
      <motion.div variants={STAGGER} initial="hidden" animate="show" className="mx-auto flex w-full max-w-[640px] flex-col gap-8 px-5 pb-32 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <motion.div variants={item}><PageTitle sub="Experiences you've booked for your groups.">Tickets</PageTitle></motion.div>
        {loading && !data ? (
          <div aria-busy="true" className="flex flex-col gap-3">{[0, 1].map((i) => <Skeleton key={i} className="h-[92px] rounded-tile" />)}</div>
        ) : error ? (
          <motion.div variants={item} role="alert" className="flex flex-col items-start gap-3"><p className="font-semibold text-critical">{error.message}</p><button type="button" onClick={reload} className="text-sm font-bold text-action-strong">Try again</button></motion.div>
        ) : upcoming.length === 0 && past.length === 0 ? (
          <motion.div variants={item}>
            <EmptyState title="No tickets yet" text="Find a trip, a food walk or an event in Discover and book for your group." action={<ButtonLink href="/discover">Go to Discover</ButtonLink>} />
          </motion.div>
        ) : (
          <>
            <motion.section variants={item} aria-label="Coming up" className="flex flex-col gap-3">
              <h2 className="text-xl font-extrabold tracking-[-0.01em]">Coming up</h2>
              {upcoming.length === 0 ? <p className="text-[15px] text-ink-2">Nothing booked ahead. <Link href="/discover" className="font-bold text-action-strong">Find something</Link></p> : (
                <motion.ul variants={STAGGER} className="flex flex-col gap-2.5">{upcoming.map((t) => <TicketRow key={t.id} t={t} variants={item} />)}</motion.ul>
              )}
            </motion.section>
            {past.length > 0 && (
              <motion.section variants={item} aria-label="Been there" className="flex flex-col gap-3">
                <h2 className="text-xl font-extrabold tracking-[-0.01em] text-ink-2">Been there</h2>
                <ul className="flex flex-col gap-2.5 opacity-75">{past.map((t) => <TicketRow key={t.id} t={t} past />)}</ul>
              </motion.section>
            )}
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

function TicketRow({ t, variants, past = false }) {
  const p = sessionParts(t.session?.key);
  return (
    <motion.li variants={variants}>
      <Link href={`/tickets/${t.id}`} className="group flex items-center gap-4 rounded-tile bg-white p-3.5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[box-shadow,transform] duration-300 ease-gc hover:shadow-[inset_0_0_0_2px_var(--color-action)] active:scale-[0.99]">
        <span className={`flex h-[64px] w-[64px] shrink-0 flex-col items-center justify-center rounded-[14px] ${past ? "bg-soft text-ink-2" : "bg-action-tint text-action-strong"}`}>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{p.month}</span>
          <span className="tabular text-[24px] font-extrabold leading-7">{p.day}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="line-clamp-2 text-base font-bold leading-[22px]">{t.title}</span>
          <span className="truncate text-sm text-ink-2">{p.weekday}, {p.time} · {t.quantity} {t.quantity === 1 ? "guest" : "guests"}</span>
          {t.status === "pending" && <StatusTag status="pending" className="self-start" />}
        </span>
        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </motion.li>
  );
}
