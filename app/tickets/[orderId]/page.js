"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/app/AppShell";
import { BackLink, Button, ButtonLink, DoneMark, EmptyState, Skeleton, StatusTag } from "@/components/kit";
import { TicketCard } from "@/components/tickets/TicketCard";
import { premiumAPI, ticketsAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { SPRING, STAGGER, useRevealVariants } from "@/lib/motion";
import { useAsync } from "@/lib/useAsync";

/**
 * One ticket. Back from Paystack (`?payment=done`) it asks for the payment's
 * outcome straight away (the server checks with Paystack), waits briefly only
 * if it is still settling, then says so.
 */
export default function TicketPage({ params }) {
  const { orderId } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const fromPaystack = useRef(search.get("payment") === "done").current;
  const [confirming, setConfirming] = useState(fromPaystack);
  const { data: t, loading, error, reload } = useAsync(async () => unwrap(await ticketsAPI.get(orderId))?.ticket, [orderId]);
  const item = useRevealVariants();

  useEffect(() => {
    if (!t || !confirming) return;
    if (t.status !== "pending") { setConfirming(false); return; }
    let live = true;
    // Paystack only sends the buyer back once the charge is done, so ask now; wait only if it's still settling.
    premiumAPI.verifyTransaction(t.txId)
      .then((r) => (unwrap(r)?.status === "pending" && live ? premiumAPI.verifyTransaction(t.txId, { wait: 20 }) : r))
      .catch(() => null)
      .then(() => live && reload())
      .finally(() => live && setConfirming(false));
    return () => { live = false; };
  }, [t, confirming, reload]);

  // Drop ?payment=done so a refresh doesn't replay the moment.
  useEffect(() => {
    if (fromPaystack) router.replace(`/tickets/${orderId}`, { scroll: false });
  }, [fromPaystack, orderId, router]);

  return (
    <AppShell trailing={<BackLink href="/tickets">Tickets</BackLink>}>
      <div className="min-h-[calc(100vh-57px)] bg-sheet">
        <div className="mx-auto w-full max-w-[480px] px-5 pb-32 pt-6 sm:pb-20 sm:pt-10">
          {loading && !t ? (
            <div aria-busy="true" className="flex flex-col gap-4"><Skeleton className="h-8 w-1/2 bg-white" /><Skeleton className="h-[520px] w-full rounded-[28px] bg-white" /></div>
          ) : error && !t ? (
            <EmptyState className="bg-white" title="We couldn't find that ticket" text={error.message} action={<ButtonLink href="/tickets" variant="secondary">Your tickets</ButtonLink>} />
          ) : t ? (
            confirming || (t.status === "pending" && loading) ? (
              <Confirming />
            ) : (
              <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-6">
                <motion.div variants={item}><Heading t={t} celebrate={fromPaystack} /></motion.div>
                {t.status === "paid" && <motion.div variants={item}><TicketCard t={t} /></motion.div>}
                {t.status === "pending" && <motion.div variants={item}><Pending t={t} reload={reload} /></motion.div>}
                {t.status === "failed" && (
                  <motion.div variants={item} className="flex flex-col items-start gap-4">
                    <ButtonLink href={`/experiences/${t.experienceId}`} size="lg">Try again</ButtonLink>
                  </motion.div>
                )}
              </motion.div>
            )
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

function Heading({ t, celebrate }) {
  if (t.status === "paid" && celebrate) {
    return (
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <DoneMark size={72} />
        <motion.h1 className="text-[36px] font-black leading-[40px] tracking-[-0.03em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.playful, delay: 0.12 }}>You're going</motion.h1>
        <p className="max-w-[320px] text-[15px] leading-[22px] text-ink-2">Your ticket is below, and in your email. Add it to your calendar so the group doesn't forget.</p>
      </div>
    );
  }
  if (t.status === "paid") {
    return <h1 className="text-[28px] font-black leading-[34px] tracking-[-0.03em]">Your ticket</h1>;
  }
  if (t.status === "failed") {
    return (
      <div className="flex flex-col gap-2.5">
        <StatusTag status="failed" />
        <h1 className="text-[28px] font-black leading-[34px] tracking-[-0.03em]">The payment didn't go through</h1>
        <p className="text-[15px] leading-[22px] text-ink-2">No places were booked for {t.title}. You can try again; dates fill up, so pick yours first.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      <StatusTag status="pending" />
      <h1 className="text-[28px] font-black leading-[34px] tracking-[-0.03em]">Waiting for your payment</h1>
      <p className="text-[15px] leading-[22px] text-ink-2">{t.quantity} {t.quantity === 1 ? "place" : "places"} for {t.title}, {t.session?.label}. We hold them while Paystack confirms.</p>
    </div>
  );
}

function Pending({ t, reload }) {
  const [busy, setBusy] = useState(false);
  const check = async () => {
    setBusy(true);
    try { await premiumAPI.verifyTransaction(t.txId, { wait: 15 }); } catch { /* the reload says where it stands */ }
    await reload();
    setBusy(false);
  };
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="secondary" onClick={check} loading={busy}>Check again</Button>
      <p className="text-[13px] leading-[18px] text-ink-3">Paid already? It can take a minute. We'll email your ticket as soon as it's confirmed.</p>
    </div>
  );
}

/** Three dots that breathe while the payment settles. */
function Confirming() {
  const reduce = useReducedMotion();
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-5 pt-16 text-center">
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="h-3 w-3 rounded-full bg-action" animate={reduce ? { opacity: 0.6 } : { y: [0, -8, 0], opacity: [0.5, 1, 0.5] }} transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }} />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Confirming your payment</h1>
        <p className="text-[15px] text-ink-2">This usually takes a few seconds.</p>
      </div>
    </div>
  );
}
