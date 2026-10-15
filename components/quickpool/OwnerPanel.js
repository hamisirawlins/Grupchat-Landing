"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2, RefreshCw, Share2, Users, Wallet } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button, Card, TextField, Helper, MoneyLines, StatusTag } from "@/components/kit";
import { quickPoolAPI, kes, normalizePhone, sharePool } from "@/lib/quickPool";
import { relative } from "@/lib/format";

/**
 * The creator's controls (KB 2a): share, the members limit, a new link, refunds waiting on
 * them, and withdrawing (a request an admin approves, D-028; 2% fee).
 */
export function OwnerPanel({ pool, onChanged, onNewCode }) {
  const o = pool.owner;
  const [sheet, setSheet] = useState(null); // "limit" | "reset" | "withdraw" | { decline: txId }
  const [limit, setLimit] = useState(String(o.memberLimit ?? ""));
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(String(o.available || ""));
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const floor = Math.max(2, (o.memberCount || 0) + (o.holding || 0));

  const close = () => { setSheet(null); setError(""); };
  const run = async (key, fn, done, { reload = true } = {}) => {
    setBusy(key);
    setError("");
    try {
      await fn();
      done?.();
      if (reload) onChanged?.();
    } catch (e) {
      setError(e.message || "That didn't work. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    const r = await sharePool({ name: pool.name, url: o.url });
    if (r === "copied") toast.success("Link copied");
    else if (r === "failed") toast.message(o.url);
  };

  const gross = Number(amount) || 0;
  const fee = Math.round(gross * 0.02);
  const waiting = o.refunds.filter((r) => r.stage === "you");

  return (
    <Card title="Your pool" sub={`${o.memberCount} of ${o.memberLimit ?? "1,000"} places taken${o.holding ? ` · ${o.holding} paying now` : ""}`} action={<StatusTag status={pool.status === "open" ? "live" : "paused"}>{pool.status === "open" ? "Open" : "Closed"}</StatusTag>}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="secondary" onClick={share}><Share2 className="h-4 w-4" aria-hidden="true" /> Share</Button>
        {pool.access === "private" && <Button variant="quiet" onClick={() => { setLimit(String(o.memberLimit)); setSheet("limit"); }}><Users className="h-4 w-4" aria-hidden="true" /> Limit</Button>}
        <Button variant="quiet" onClick={() => setSheet("reset")}><RefreshCw className="h-4 w-4" aria-hidden="true" /> New link</Button>
        <Button variant="quiet" onClick={() => { setAmount(String(o.available || "")); setSheet("withdraw"); }} disabled={!o.available}><Wallet className="h-4 w-4" aria-hidden="true" /> Withdraw</Button>
      </div>
      <MoneyLines rows={[["In the pool", kes(o.balance)], ["Held", kes(o.balance - o.available)], ["Available", kes(o.available), true]]} />
      {o.overCap && <p className="text-[13px] text-warning">This pool has passed its cap of {kes(o.cap)}. The money is safe; GrupChat checks a withdrawal before it goes.</p>}
      {o.overLimitCount > 0 && <p className="text-[13px] text-ink-2">{o.overLimitCount === 1 ? "One payment" : `${o.overLimitCount} payments`} came from outside the pool after it was full. GrupChat returns them in full; or raise the limit.</p>}

      {o.refunds.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[15px] font-bold text-ink">Refunds</h3>
          {o.refunds.map((r) => (
            <div key={r.txId} className="flex flex-col gap-3 rounded-2xl bg-soft px-4 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="tabular text-[15px] font-bold text-ink">{kes(r.amount)}{r.overLimit ? " · in full" : ` · they get ${kes(r.net)}`}</div>
                <div className="text-[13px] text-ink-2">
                  {r.stage === "you" ? `Asked ${relative(r.requestedAt)} · goes to GrupChat ${relative(r.escalatesAt)} if you don't answer` : r.stage === "grupchat" ? "With GrupChat to send" : "Sending"}
                </div>
              </div>
              {r.stage === "you" && (
                <div className="flex gap-2">
                  <Button size="sm" loading={busy === `a${r.txId}`} onClick={() => run(`a${r.txId}`, () => quickPoolAPI.approveRefund(o.planId, r.txId), () => toast.success("Passed to GrupChat to send"))}>Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setReason(""); setSheet({ decline: r.txId }); }}>Decline</Button>
                </div>
              )}
            </div>
          ))}
          {waiting.length > 0 && <p className="text-[12px] text-ink-3">Approved refunds go to GrupChat, who send them to the member's number.</p>}
        </div>
      )}

      <Sheet open={sheet === "limit"} onClose={close} title="Members limit">
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); run("limit", () => quickPoolAPI.update(o.planId, { memberLimit: Number(limit) }), () => { toast.success("Limit changed"); close(); }); }}>
          <TextField id="qp-limit" label="Places" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))} helper={`From ${floor} (the places in use) to 1,000. Setting it to ${floor} closes the pool to new numbers.`} />
          <Helper error={error} />
          <Button type="submit" block size="lg" loading={busy === "limit"}>Save</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "reset"} onClose={close} title="Make a new link">
        <div className="flex flex-col gap-4">
          <p className="text-[15px] text-ink-2">The old link stops working at once. Everyone who has pooled keeps their place: we know them by their number.</p>
          <Helper error={error} />
          <Button block size="lg" loading={busy === "reset"} onClick={() => run("reset", async () => { const r = await quickPoolAPI.update(o.planId, { resetLink: true }); onNewCode?.(r.code); }, () => { toast.success("New link ready. Share it again."); close(); }, { reload: false })}>
            <Link2 className="h-4 w-4" aria-hidden="true" /> Make a new link
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "withdraw"} onClose={close} title="Withdraw">
        <form className="flex flex-col gap-4" onSubmit={(e) => {
          e.preventDefault();
          if (!normalizePhone(phone)) return setError("Enter the M-Pesa number to send it to.");
          run("withdraw", () => quickPoolAPI.withdraw(o.planId, { amount: gross, recipient: { type: "custom", phone } }), () => { toast.success("Requested. GrupChat approves it before it's sent."); close(); });
        }}>
          <TextField id="qp-w-amount" label="Amount" prefix="KES" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
          <TextField id="qp-w-phone" label="Send to (M-Pesa)" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
          {gross > 0 && <MoneyLines rows={[["Withdraw", kes(gross)], ["Fee (2%)", kes(fee)], ["They receive", kes(gross - fee), true]]} />}
          <Helper error={error} />
          <Button type="submit" block size="lg" loading={busy === "withdraw"} disabled={!gross || gross > o.available}>Request withdrawal</Button>
        </form>
      </Sheet>

      <Sheet open={!!sheet?.decline} onClose={close} title="Decline the refund">
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); run("decline", () => quickPoolAPI.declineRefund(o.planId, sheet.decline, reason.trim()), () => { toast.message("Declined. The money stays in the pool."); close(); }); }}>
          <TextField id="qp-reason" label="Why" optional value={reason} onChange={(e) => setReason(e.target.value)} helper="They see this." />
          <Helper error={error} />
          <Button type="submit" block size="lg" variant="secondary" loading={busy === "decline"}>Decline</Button>
        </form>
      </Sheet>
    </Card>
  );
}
