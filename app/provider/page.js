"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ButtonLink, EmptyState, PageTitle, Skeleton, StatTile } from "@/components/kit";
import { ExperienceCard } from "@/components/providers/ExperienceCard";
import { useProvider } from "@/components/providers/ProviderPortal";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { useAsync } from "@/lib/useAsync";
import { fmtMoney } from "@/lib/providers";

/** The provider's home: how they're doing, and their listings. */
export default function Overview() {
  const { provider, me } = useProvider() || {};
  const item = useRevealVariants();
  const { data, loading } = useAsync(async () => {
    const [mine, bookings] = await Promise.all([providersAPI.experiences(), providersAPI.bookings().catch(() => null)]);
    return { ...unwrap(mine), summary: unwrap(bookings)?.summary || null };
  }, [], {});
  const list = data?.experiences || [];
  const live = list.filter((e) => e.status === "live").length;
  const s = data?.summary;
  const payoutReady = provider?.payout?.ready;

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item}>
        <PageTitle sub={provider ? `${provider.business?.name} · ${provider.business?.town}, ${me?.market?.name || provider.marketName}` : " "}>Overview</PageTitle>
      </motion.div>
      {provider && !payoutReady && (
        <motion.p variants={item} className="rounded-tile bg-sheet px-5 py-4 text-[15px] leading-[22px] text-ink-2">
          <span className="font-bold text-ink">Ticket sales start once your payout account is set up.</span> We're doing that now and will email you.
        </motion.p>
      )}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading && !data ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px] rounded-tile" />) : (
          <>
            <StatTile label="Live experiences" value={live} />
            <StatTile label="Guests coming" value={s?.upcomingGuests ?? 0} />
            <StatTile label={s ? `Paid to you in ${s.month}` : "Paid to you"} value={fmtMoney(s?.paidThisMonth ?? 0, s?.currency || provider?.currency)} sub="After provider charges" />
            <StatTile label="Payout account" value={payoutReady ? "Ready" : "Being set up"} sub={provider?.payout ? `${provider.payout.bankName} ••• ${provider.payout.accountLast4}` : null} />
          </>
        )}
      </motion.div>
      <motion.section variants={item} aria-label="Your experiences" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-[-0.01em]">Your experiences</h2>
          {list.length > 0 && <ButtonLink href="/provider/experiences" variant="text" size="sm">See all</ButtonLink>}
        </div>
        {loading && !data ? <Skeleton className="h-[100px] rounded-tile" /> : list.length === 0 ? (
          <EmptyState title="No experiences yet" text="Add your first and publish it when it's ready. It goes live in Discover straight away." action={<ButtonLink href="/provider/experiences/new" variant="secondary"><Plus className="h-4 w-4" />Add experience</ButtonLink>} />
        ) : (
          list.slice(0, 4).map((e) => <ExperienceCard key={e.id} e={e} />)
        )}
      </motion.section>
    </motion.div>
  );
}
