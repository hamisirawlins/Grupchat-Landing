"use client";

import { useEffect, useState } from "react";
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

/**
 * Every withdrawal passes through here (D-028). Nothing reaches M-Pesa until it is
 * approved on this screen; what M-Pesa says back is kept under each one.
 */
const STAGES = {
  approval: { title: "Awaiting your approval", blurb: "Held, and not sent anywhere yet.", tag: "approve", tone: "accent" },
  review: { title: "Needs review", blurb: "Sent, but M-Pesa never confirmed it.", tag: "review", tone: "warning" },
  sent: { title: "With M-Pesa", blurb: "Approved and waiting on the result.", tag: "sent", tone: "neutral" },
};
const ORDER = ["approval", "review", "sent"];

const pretty = (raw) => {
  if (!raw) return "—";
  try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return String(raw); }
};

export default function AdminPayouts() {
  const { isAdmin, profileLoading } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => asList(unwrap(await premiumAPI.listPayoutReviews())), [], { enabled: isAdmin });
  const [selected, setSelected] = useState(null);
  const [callbacks, setCallbacks] = useState(null);
  const [receipt, setReceipt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(null);
  const [formError, setFormError] = useState("");

  // What the provider said about this one, loaded when the sheet opens.
  useEffect(() => {
    if (!selected) { setCallbacks(null); return undefined; }
    let alive = true;
    premiumAPI.payoutCallbacks(selected.id)
      .then((r) => { if (alive) setCallbacks(asList(unwrap(r))); })
      .catch(() => { if (alive) setCallbacks([]); });
    return () => { alive = false; };
  }, [selected]);

  const open = (t) => { setSelected(t); setReceipt(""); setNote(""); setFormError(""); };

  const act = async (kind) => {
    if (!selected) return;
    if (kind === "mark-sent" && !receipt.trim()) return setFormError("Enter the M-Pesa receipt from the portal to mark it sent.");
    if (kind === "decline" && !note.trim()) return setFormError("Say why — the owner sees this.");
    setBusy(kind);
    setFormError("");
    try {
      const gross = money(selected.amount, selected.currency);
      const net = money(selected.netAmount ?? selected.amount, selected.currency);
      const who = selected.recipientName || selected.mpesaPhone;
      if (kind === "approve") {
        const res = unwrap(await premiumAPI.approvePayout(selected.id, note.trim() ? { note: note.trim() } : {}));
        if (res?.sent) toast.success(`${net} on its way to ${who}`);
        else toast.message(res?.message || "M-Pesa didn't accept it — it's parked for review");
      } else if (kind === "decline") {
        await premiumAPI.declinePayout(selected.id, { reason: note.trim() });
        toast.success(`${gross} returned to the pool`);
      } else if (kind === "mark-sent") {
        await premiumAPI.resolvePayout(selected.id, { outcome: "success", receipt: receipt.trim() });
        toast.success("Marked as sent");
      } else {
        await premiumAPI.resolvePayout(selected.id, { outcome: "failed", reason: note.trim() || undefined });
        toast.success(`${gross} refunded to the pool`);
      }
      setSelected(null);
      reload();
    } catch (e) {
      setFormError(e.message || "Couldn't complete that.");
    } finally {
      setBusy(null);
    }
  };

  if (!isAdmin) return <PageFrame eyebrow="Admin" title="Withdrawals"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;

  const items = data ?? [];
  const groups = ORDER.map((key) => [key, items.filter((t) => (t.stage || "review") === key)]).filter(([, rows]) => rows.length > 0);
  const awaiting = items.filter((t) => t.stage === "approval").length;
  const stage = selected ? STAGES[selected.stage] ?? STAGES.review : null;

  return (
    <PageFrame
      eyebrow={<Link href="/admin" className="text-purple-600 hover:text-purple-700">Admin</Link>}
      title="Withdrawals"
      meta={data ? (awaiting ? `${awaiting} awaiting your approval` : "Nothing to approve") : undefined}
      onRefresh={reload}
    >
      <Reveal>
        {error && <FormError>{error.message || "Couldn't load withdrawals."}</FormError>}
        {loading && !data ? (
          <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState title="Nothing in flight" text="Withdrawal requests appear here for approval before any money moves." />
        ) : (
          <div className="space-y-6">
            {groups.map(([key, rows]) => (
              <section key={key} className="space-y-2">
                <div className="px-1">
                  <h2 className="text-[15px] font-semibold tracking-tight">{STAGES[key].title}</h2>
                  <p className="text-[13px] text-gray-500">{STAGES[key].blurb}</p>
                </div>
                <ListGroup>
                  {rows.map((t) => (
                    <button key={t.id} type="button" onClick={() => open(t)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100">
                      <Tag tone={STAGES[key].tone}>{STAGES[key].tag}</Tag>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium tabular-nums">{money(t.amount, t.currency)} · {t.planName || t.planId}</span>
                        <span className="mt-0.5 block truncate text-[13px] text-gray-500">
                          to {t.recipientName || t.mpesaPhone} · {key === "approval" ? "requested" : t.reviewReason || "sent"} {relative(t.reviewRequestedAt || t.createdAt)}
                        </span>
                      </span>
                    </button>
                  ))}
                </ListGroup>
              </section>
            ))}
          </div>
        )}
      </Reveal>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected ? `${money(selected.amount, selected.currency)} to ${selected.recipientName || selected.mpesaPhone}` : undefined}>
        {selected && (
          <div className="space-y-4">
            <ListGroup>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Plan</span><span>{selected.planName || selected.planId}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Requested</span><span>{dateTime(selected.createdAt)}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Recipient gets</span><span className="tabular-nums">{money(selected.netAmount ?? selected.amount, selected.currency)} (fee {money(selected.platformFee ?? 0, selected.currency)})</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">M-Pesa number</span><span className="tabular-nums">{selected.mpesaPhone || "—"}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Reference</span><span className="font-mono text-[12px]">WITHDRAW_{selected.id}</span></div>
              {selected.stage !== "approval" && (
                <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-gray-500">Reason</span><span className="max-w-[60%] text-right">{selected.reviewReason || "—"}</span></div>
              )}
            </ListGroup>

            {selected.stage === "approval" ? (
              <>
                <p className="text-sm text-gray-500">Nothing has been sent yet. Approving releases {money(selected.netAmount ?? selected.amount, selected.currency)} to {selected.recipientName || selected.mpesaPhone}; declining puts {money(selected.amount, selected.currency)} back in the plan.</p>
                <FieldGroup>
                  <Field id="pv-note" label="Note (required to decline)" value={note} onChange={(e) => setNote(e.target.value)} required={false} autoComplete="off" />
                </FieldGroup>
                <FormError>{formError}</FormError>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton type="button" onClick={() => act("approve")} loading={busy === "approve"} disabled={busy === "decline"}>Approve and send {money(selected.netAmount ?? selected.amount, selected.currency)}</PrimaryButton>
                  <OutlineButton onClick={() => act("decline")} loading={busy === "decline"} disabled={busy === "approve"}>Decline</OutlineButton>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">Check the M-Pesa portal for <span className="font-mono text-[12px]">WITHDRAW_{selected.id}</span>. If the money left, mark it sent; otherwise refund the full amount so the owner can withdraw again.</p>
                <FieldGroup>
                  <Field id="rv-receipt" label="M-Pesa receipt (to mark as sent)" value={receipt} onChange={(e) => setReceipt(e.target.value)} required={false} autoComplete="off" />
                  <Field id="rv-note" label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} required={false} autoComplete="off" />
                </FieldGroup>
                <FormError>{formError}</FormError>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton type="button" onClick={() => act("refund")} loading={busy === "refund"} disabled={busy === "mark-sent"}>Refund {money(selected.amount, selected.currency)} to pool</PrimaryButton>
                  <OutlineButton onClick={() => act("mark-sent")} loading={busy === "mark-sent"} disabled={busy === "refund"}>Mark as sent</OutlineButton>
                </div>
              </>
            )}

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h3 className="text-[13px] font-semibold text-gray-500">What M-Pesa sent us</h3>
              {callbacks === null ? (
                <Skeleton className="h-10 w-full rounded-xl" />
              ) : callbacks.length === 0 ? (
                <p className="text-[13px] text-gray-400">Nothing yet.</p>
              ) : (
                <div className="space-y-2">
                  {callbacks.map((c) => (
                    <details key={c.id} className="rounded-xl bg-gray-50 px-4 py-3">
                      <summary className="cursor-pointer list-none text-[13px]">
                        <span className="font-medium">{c.source}</span>
                        <span className="text-gray-500"> · {c.resultDesc || c.outcome}{c.resultCode === null || c.resultCode === undefined ? "" : ` (${c.resultCode})`} · {relative(c.receivedAt)}</span>
                      </summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-[12px] leading-relaxed text-gray-700">{pretty(c.rawJson)}</pre>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </PageFrame>
  );
}
