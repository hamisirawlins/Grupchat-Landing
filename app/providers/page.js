"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ButtonLink } from "@/components/kit";
import { ProviderTag } from "@/components/providers/Tags";
import { SPRING } from "@/lib/motion";

const STEPS = [
  ["Apply", "Your business, documents and payout account"],
  ["We check", "Checks depend on your country"],
  ["Go live", "Add experiences and get paid per ticket"],
];

/** Why providers list with GrupChat, and the way in (KB D-043). Public. */
export default function ProvidersWelcome() {
  const { user, loading } = useAuth();
  const reduce = useReducedMotion();
  const applyHref = user ? "/providers/apply" : "/sign-up?redirect=/providers/apply";
  const statusHref = user ? "/providers/status" : "/sign-in?redirect=/providers/status";
  const float = (delay, rotate) => (reduce ? {} : { initial: { opacity: 0, y: 24, rotate: 0 }, animate: { opacity: 1, y: 0, rotate }, transition: { ...SPRING.soft, delay } });

  return (
    <main className="grid min-h-screen bg-white text-ink lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10 sm:px-12 lg:py-12">
        <div className="flex w-full max-w-[500px] flex-col gap-8">
          <div className="gc-rise">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" priority />
              <span className="text-lg font-extrabold tracking-[-0.01em]">GrupChat</span>
              <ProviderTag />
            </Link>
          </div>
          <div className="gc-rise flex flex-col gap-3.5" style={{ "--gc-delay": "70ms" }}>
            <h1 className="text-[40px] font-black leading-[44px] tracking-[-0.03em] sm:text-[52px] sm:leading-[56px]">Get booked by whole groups</h1>
            <p className="text-lg leading-[27px] text-ink-2">Groups on GrupChat plan trips together and book what they find in Discover. List what you run and get paid for every ticket.</p>
          </div>
          <ol className="gc-rise grid gap-5 sm:grid-cols-3" style={{ "--gc-delay": "140ms" }}>
            {STEPS.map(([t, s], i) => (
              <li key={t} className="flex flex-col gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-action-tint text-sm font-extrabold text-action-strong">{i + 1}</span>
                <span className="text-base font-extrabold leading-[22px]">{t}</span>
                <span className="text-sm leading-5 text-ink-2">{s}</span>
              </li>
            ))}
          </ol>
          <div className="gc-rise flex flex-wrap items-center gap-3" style={{ "--gc-delay": "210ms" }}>
            <ButtonLink href={applyHref} size="lg" className="px-7" aria-disabled={loading}>Apply as a provider</ButtonLink>
            <ButtonLink href={statusHref} variant="text" size="lg">Check my application</ButtonLink>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-sheet px-6 py-12 lg:min-h-0">
        <div className="relative h-[380px] w-[340px] sm:h-[420px] sm:w-[440px]">
          <motion.div className="absolute right-0 top-5 h-[240px] w-[240px] rounded-full bg-memory sm:h-[300px] sm:w-[300px]" initial={reduce ? false : { scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.heavy} />
          <motion.div className="absolute left-2 top-[110px] flex w-[300px] flex-col overflow-hidden rounded-card bg-white shadow-float sm:left-5 sm:w-[340px]" {...float(0.25, -2)}>
            <div className="relative flex h-[150px] items-center justify-center bg-memory-tint">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-memory-ink"><ImageIcon className="h-[18px] w-[18px]" />Your photo</span>
              <span className="absolute left-3 top-3 inline-flex h-6 items-center rounded-tag bg-white px-2 text-[11px] font-bold uppercase tracking-[0.06em]">Tickets</span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3.5">
              <span className="text-[17px] font-bold leading-[22px]">Kisite reef snorkelling by dhow</span>
              <span className="text-[13px] leading-[18px] text-ink-2">Shimoni · Sat and Sun, 8 am · 6 hours</span>
              <span className="tabular text-base font-extrabold">KES 3,000 <span className="text-[13px] font-medium text-ink-3">per person</span></span>
            </div>
          </motion.div>
          <motion.div className="absolute left-20 top-8 flex items-center gap-2.5 rounded-[20px_20px_6px_20px] bg-white py-3 pl-3 pr-4 shadow-lift sm:left-[110px]" {...float(0.45, 2)}>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-action-tint text-xs font-bold text-action-strong">AK</span>
            <span className="text-[15px] font-semibold leading-5">Booked 8 for our Diani trip</span>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
