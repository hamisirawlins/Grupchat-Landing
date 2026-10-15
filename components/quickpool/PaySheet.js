"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Smartphone, Receipt } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button, TextField, Chips, DoneMark, Helper } from "@/components/kit";
import { quickPoolAPI, kes, normalizePhone } from "@/lib/quickPool";
import { ClaimAccount } from "@/components/quickpool/ClaimAccount";

const AMOUNTS = [100, 500, 1000, 2000, 5000];
const MAX_AWAITS = 5; // a prompt lives about 90 seconds; five server-held waits cover it

function CopyRow({ label, value }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied`);
    } catch {
      toast.message(String(value));
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3">
      <div className="min-w-0">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</div>
        <div className="tabular truncate text-[22px] font-extrabold tracking-[0.04em] text-ink">{value}</div>
      </div>
      <button type="button" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-action-strong hover:bg-action-tint active:scale-95">
        <Copy className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Pooling (KB 2a): a phone number and an amount, then an M-Pesa prompt or the paybill
 * details. The answer reads the same for every number. While a prompt is out, the sheet
 * awaits the outcome on the server instead of polling (D-023).
 */
export function PaySheet({ open, onClose, pool, signedIn, onPaid }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("stk");
  const [step, setStep] = useState("form"); // form | waiting | paybill | success | failed
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paybill, setPaybill] = useState(null);
  const alive = useRef(true);
  const limits = pool?.limits || { minAmount: 10, maxAmount: 250000 };

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useEffect(() => {
    if (open) { setStep("form"); setError(""); setPaybill(null); }
  }, [open]);

  const n = Number(amount);
  const phoneOk = !!normalizePhone(phone);
  const amountOk = Number.isInteger(n) && n >= limits.minAmount && n <= limits.maxAmount;

  const submit = async (e) => {
    e?.preventDefault();
    if (!phoneOk) return setError("Enter a Kenyan M-Pesa number, like 0712 345 678.");
    if (!amountOk) return setError(`Enter a whole amount from ${kes(limits.minAmount)} to ${kes(limits.maxAmount)}.`);
    setError("");
    setBusy(true);
    try {
      const res = await quickPoolAPI.pay(pool.code, { phone, amount: n, email: email.trim() || undefined, method });
      if (res.method === "paybill") {
        setPaybill(res);
        setStep("paybill");
        return;
      }
      setStep("waiting");
      let status = "pending";
      for (let i = 0; i < MAX_AWAITS && status === "pending" && alive.current; i += 1) {
        try {
          status = (await quickPoolAPI.status(res.txId, res.statusKey, 25)).status;
        } catch {
          /* a blip; await again */
        }
      }
      if (!alive.current) return;
      if (status === "success") {
        setStep("success");
        onPaid?.();
      } else setStep(status === "failed" ? "failed" : "waiting-long");
    } catch (err) {
      const byCode = {
        "prompt-open": "A prompt is already on its way to this phone. Finish or cancel it, then try again.",
        throttled: "Too many tries for this number. Wait a few minutes and try again.",
        "ip-throttled": "Too many tries from this network. Wait a few minutes and try again.",
        closed: "This pool has closed.",
        "stk-failed": "M-Pesa didn't take the request. Try again in a moment, or pay by paybill.",
      };
      setError(byCode[err.code] || err.message);
    } finally {
      setBusy(false);
    }
  };

  const title = { form: "Pool", waiting: "Check your phone", "waiting-long": "Still waiting", paybill: "Pay by paybill", success: "Thank you", failed: "It didn't go through" }[step];

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {step === "form" && (
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <div role="radiogroup" aria-label="How to pay" className="grid grid-cols-2 gap-2 rounded-2xl bg-soft p-1">
            {[["stk", "M-Pesa prompt", Smartphone], ["paybill", "Paybill", Receipt]].map(([value, label, Icon]) => (
              <button key={value} type="button" role="radio" aria-checked={method === value} onClick={() => setMethod(value)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-[background-color,color,box-shadow] duration-200 ease-gc ${method === value ? "bg-white text-ink shadow-lift" : "text-ink-2"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
          <TextField id="qp-phone" label="M-Pesa number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="flex flex-col gap-2">
            <TextField id="qp-amount" label="Amount" prefix="KES" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="1,000" />
            <Chips label="Suggested amounts" multiple={false} value={String(n)} onChange={(v) => setAmount(String(v))} options={AMOUNTS.filter((a) => a <= limits.maxAmount).map((a) => ({ value: String(a), label: a.toLocaleString("en-KE") }))} />
          </div>
          {!signedIn && <TextField id="qp-email" label="Email" optional type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} helper="For a receipt, once you verify it with a GrupChat account." />}
          {pool?.seats?.full && <p className="text-[13px] text-ink-2">This pool is full. Only numbers already in it can add money; anything else is returned in full.</p>}
          <Helper error={error} />
          <Button type="submit" size="lg" block loading={busy}>{method === "stk" ? `Pool ${amountOk ? kes(n) : ""}`.trim() : "Show paybill details"}</Button>
          <p className="text-center text-[12px] text-ink-3">Your number is never shown to the group.</p>
        </form>
      )}

      {(step === "waiting" || step === "waiting-long") && (
        <div className="flex flex-col items-center gap-4 py-6 text-center" aria-live="polite">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-action-tint text-action">
            <Smartphone className="h-7 w-7" aria-hidden="true" />
            <span className="absolute inset-0 animate-ping rounded-full bg-action/10 motion-reduce:animate-none" aria-hidden="true" />
          </span>
          <p className="max-w-xs text-[15px] text-ink-2">{step === "waiting" ? "If this number can pool here, an M-Pesa prompt is on its way. Enter your PIN to finish." : "We haven't heard back from M-Pesa yet. If you entered your PIN, it will show on the pool shortly."}</p>
          {step === "waiting-long" && <Button variant="secondary" onClick={onClose}>Close</Button>}
        </div>
      )}

      {step === "paybill" && paybill && (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] text-ink-2">On your phone: M-Pesa, Lipa na M-Pesa, Pay Bill. Then enter these.</p>
          <CopyRow label="Business number" value={paybill.paybill || "—"} />
          <CopyRow label="Account number" value={paybill.account} />
          <CopyRow label="Amount" value={paybill.amount.toLocaleString("en-KE")} />
          <p className="text-[13px] text-ink-3">This account number is yours for this pool: use it every time. Pay within {Math.round((paybill.holdSeconds || 180) / 60)} minutes to keep your place.</p>
          <Button size="lg" block onClick={() => { onPaid?.(); onClose(); }}>Done</Button>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <DoneMark />
          <p className="text-[17px] font-bold text-ink">You pooled {kes(n)}</p>
          {!signedIn ? <ClaimAccount email={email} next={`/q/${pool.code}`} compact /> : <Button variant="secondary" onClick={onClose}>Back to the pool</Button>}
        </div>
      )}

      {step === "failed" && (
        <div className="flex flex-col gap-4 py-2 text-center">
          <p className="text-[15px] text-ink-2">No money moved. Try again, or pay by paybill.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button block onClick={() => setStep("form")}>Try again</Button>
            <Button block variant="secondary" onClick={() => { setMethod("paybill"); setStep("form"); }}>Use paybill</Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
