"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ListGroup } from "@/components/ui/ListGroup";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { Field, FieldGroup, FormError, OutlineButton, PrimaryButton } from "@/components/ui/Form";
import { premiumAPI } from "@/lib/api";
import { dateTime, money, relative } from "@/lib/format";
import { asList, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

/** Payouts parked for review: refund the full amount to the pool, or mark as sent with the M-Pesa receipt. */
export default function AdminPayouts() {
  const { isAdmin, profileLoading } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => asList(unwrap(await premiumAPI.listPayoutReviews())), [], { enabled: isAdmin });
  const [selected, setSelected] = useState(null);
  const [receipt, setReceipt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(null);
  const [formError, setFormError] = useState("");

  const resolve = async (outcome) => {
    if (!selected) return;
    if (outcome === "success" && !receipt.trim()) return setFormError("Enter the M-Pesa receipt from the portal to mark it sent.");
    setBusy(outcome);
    setFormError("");
    try {
      await premiumAPI.resolvePayout(selected.id, outcome === "success" ? { outcome, receipt: receipt.trim() } : { outcome, reason: note.trim() || undefined });
      toast.success(outcome === "success" ? "Marked as sent" : `${money(selected.amount, selected.currency)} refunded to the pool`);
      setSelected(null);
      reload();
    } catch (e) {
      setFormError(e.message || "Couldn't resolve this payout.");
    } finally {
      setBusy(null);
    }
  };

  if (!isAdmin) return <PageFrame eyebrow="Admin" title="Payouts"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;

  const items = data ?? [];
  return (
    <PageFrame eyebrow={<Link href="/admin" className="text-purple-600 hover:text-purple-700">Admin</Link>} title="Payouts to review" meta={data ? `${items.length} awaiting a decision` : undefined} onRefresh={reload}>
      <Reveal>
        {error && <FormError>{error.message || "Couldn't load payouts."}</FormError>}
        {loading && !data ? <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div> : items.length === 0 ? (
          <EmptyState title="Nothing to review" text="Failed or unconfirmed transfers appear here." />
        ) : (
          <ListGroup>
            {items.map((t) => (
              <button key={t.id} type="button" onClick={() => { setSelected(t); setReceipt(""); setNote(""); setFormError(""); }} className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100">
                <Tag tone="warning">review</Tag>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium tabular-nums">{money(t.amount, t.currency)} · {t.planName || t.planId}</span>
                  <span className="mt-0.5 block truncate text-[13px] text-gray-500">to {t.recipientName || t.mpesaPhone} · {t.reviewReason || "no result"} · {relative(t.reviewRequestedAt || t.createdAt)}</span>
                </span>
              </button>
            ))}
          </ListGroup>
        )}
      </Reveal>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected ? `${money(selected.amount, selected.currency)} to ${selected.recipientName || selected.mpesaPhone}` : undefined}>
        {selected && (
          <div className="space-y-4">
            <ListGroup>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Plan</span><span>{selected.planName || selected.planId}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Requested</span><span>{dateTime(selected.createdAt)}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Recipient sees</span><span className="tabular-nums">{money(selected.netAmount ?? selected.amount, selected.currency)} (fee {money(selected.platformFee ?? 0, selected.currency)})</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">M-Pesa ref</span><span className="font-mono text-[12px]">WITHDRAW_{selected.id}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Reason</span><span className="max-w-[60%] text-right">{selected.reviewReason || "—"}</span></div>
            </ListGroup>
            <p className="text-sm text-gray-500">Check the M-Pesa portal for <span className="font-mono text-[12px]">WITHDRAW_{selected.id}</span>. If the money left, mark it sent; otherwise refund the full amount so the owner can withdraw again.</p>
            <FieldGroup>
              <Field id="rv-receipt" label="M-Pesa receipt (to mark as sent)" value={receipt} onChange={(e) => setReceipt(e.target.value)} required={false} autoComplete="off" />
              <Field id="rv-note" label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} required={false} autoComplete="off" />
            </FieldGroup>
            <FormError>{formError}</FormError>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton type="button" onClick={() => resolve("failed")} loading={busy === "failed"} disabled={busy === "success"}>Refund {money(selected.amount, selected.currency)} to pool</PrimaryButton>
              <OutlineButton onClick={() => resolve("success")} loading={busy === "success"} disabled={busy === "failed"}>Mark as sent</OutlineButton>
            </div>
          </div>
        )}
      </Sheet>
    </PageFrame>
  );
}
