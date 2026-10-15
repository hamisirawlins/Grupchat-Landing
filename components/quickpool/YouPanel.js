"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Button, Card, TextField, Helper, MoneyLines } from "@/components/kit";
import { quickPoolAPI, kes } from "@/lib/quickPool";
import { requestVerificationEmail, verificationToast } from "@/lib/verification";

/**
 * A signed-in pooler's own payments in this pool, found by account or verified email
 * (D-053), and the refund request (D-052): 2% fee, or none for money that landed with no
 * seat; the creator approves, then GrupChat sends it.
 */
export function YouPanel({ pool, user, onChanged }) {
  const [target, setTarget] = useState(null); // a membership
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!pool.you?.length) return null;

  const open = (m) => { setTarget(m); setAmount(String(m.refundable)); setError(""); };
  const gross = Number(amount) || 0;
  const fee = target?.overLimit ? 0 : Math.round(gross * 0.02);

  const submit = async (e) => {
    e.preventDefault();
    if (!user.emailVerified) {
      try {
        toast[verificationToast(await requestVerificationEmail(user, `/q/${pool.code}`)).kind]("Verify your email first: we sent you a link.");
      } catch {
        toast.error("Verify your email first.");
      }
      return;
    }
    setBusy(true);
    setError("");
    try {
      await quickPoolAPI.requestRefund(pool.owner?.planId || target.memberKey.split("_")[0], { memberKey: target.memberKey, amount: gross });
      toast.success("Asked. The creator decides first.");
      setTarget(null);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Your part" sub="Only you see this">
      {pool.you.map((m) => (
        <div key={m.memberKey} className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3">
          <div className="min-w-0">
            <div className="tabular text-[17px] font-extrabold text-ink">{kes(m.totalPaid - m.refunded)}</div>
            <div className="text-[13px] text-ink-2">from {m.phone}{m.refundPending ? ` · ${kes(m.refundPending)} refund in progress` : ""}</div>
          </div>
          {m.refundable > 0 && <Button size="sm" variant="secondary" onClick={() => open(m)}>Ask for a refund</Button>}
        </div>
      ))}
      <Sheet open={!!target} onClose={() => setTarget(null)} title="Ask for a refund">
        {target && (
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <TextField id="qp-refund" label="Amount" prefix="KES" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} helper={`Up to ${kes(target.refundable)}`} />
            {gross > 0 && <MoneyLines rows={[["Refund", kes(gross)], [target.overLimit ? "Fee (none: the pool was full)" : "Fee (2%)", kes(fee)], ["You receive", kes(gross - fee), true]]} />}
            <p className="text-[13px] text-ink-2">The creator approves it, then GrupChat sends it to {target.phone}. If the creator doesn't answer in 7 days, GrupChat decides.</p>
            <Helper error={error} />
            <Button type="submit" size="lg" block loading={busy} disabled={!gross || gross > target.refundable}>Ask for {kes(gross - fee)}</Button>
          </form>
        )}
      </Sheet>
    </Card>
  );
}
