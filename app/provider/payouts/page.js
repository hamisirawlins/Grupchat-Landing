"use client";

import { motion } from "framer-motion";
import { Card, MoneyLines, OkLine, PageTitle, Skeleton, StatusTag } from "@/components/kit";
import { useProvider } from "@/components/providers/ProviderPortal";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { chargesFor, fmtMoney } from "@/lib/providers";

/** Where a provider's share goes, and how a sale splits (KB D-044). */
export default function Payouts() {
  const { provider, me } = useProvider() || {};
  const item = useRevealVariants();
  const payout = provider?.payout;
  const currency = me?.market?.currency || payout?.currency || "KES";
  const example = chargesFor(3000, me?.charges?.rate ?? 0.1);
  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item}><PageTitle sub="Guests pay when they book. Your share goes straight to your bank, not through GrupChat.">Payouts</PageTitle></motion.div>
      <motion.div variants={item} className="grid gap-5 lg:grid-cols-2">
        <Card title="Payout account" action={payout ? <StatusTag status={payout.ready ? "live" : "pending"}>{payout.ready ? "Ready" : "Being set up"}</StatusTag> : null}>
          {!payout ? <Skeleton className="h-16 w-full" /> : (
            <div className="flex flex-col gap-1.5">
              <span className="text-lg font-bold">{payout.bankName} ••• {payout.accountLast4}</span>
              <span className="text-[15px] text-ink-2">{payout.accountName}</span>
              {payout.nameMatches && <OkLine>In your business's name</OkLine>}
              <p className="mt-2 text-sm leading-5 text-ink-3">To change it, write to info@grupchat.net from your business email. We check a new account before money goes to it.</p>
            </div>
          )}
        </Card>
        <Card title="How a sale splits">
          <MoneyLines title={`For a ${fmtMoney(3000, currency)} ticket`} rows={[["Guest pays", fmtMoney(example.price, currency)], ["Provider charges", `− ${fmtMoney(example.charges, currency)}`], ["You receive", fmtMoney(example.receives, currency), true]]} />
          <p className="text-sm leading-5 text-ink-2">Provider charges cover card and mobile money fees too. Your portal shows what you'll receive before you publish.</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
