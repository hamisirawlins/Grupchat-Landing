"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, MoneyLines, OkLine, SelectField, TextField } from "@/components/kit";
import { FormError, StepFooter, StepTitle, useApplication } from "@/components/providers/Application";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { chargesFor, fmtMoney, namesMatch } from "@/lib/providers";

/** Step 3: the bank account a provider's share settles to. */
export default function Payouts() {
  const { data, setData } = useApplication();
  const router = useRouter();
  const p = data?.provider;
  const currency = data?.market?.currency || "KES";
  const rate = data?.charges?.rate ?? 0.1;
  const [editing, setEditing] = useState(!p?.payout);
  const [banks, setBanks] = useState(null);
  const [bankError, setBankError] = useState("");
  const [f, setF] = useState({ bankCode: p?.payout?.bankCode ?? "", accountNumber: "", accountName: p?.payout?.accountName ?? p?.business?.name ?? "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (!editing || banks) return;
    providersAPI.banks(p?.market || "KE")
      .then((r) => setBanks(unwrap(r)?.banks || []))
      .catch((e) => setBankError(e.message || "We couldn't load the banks."));
  }, [editing, banks, p?.market]);

  const example = chargesFor(3000, rate);
  const matches = namesMatch(f.accountName, p?.business?.name);

  const save = async () => {
    setError("");
    if (!editing) return router.push("/providers/apply/submit");
    const bank = banks?.find((b) => b.code === f.bankCode);
    if (!bank) return setError("Choose your bank.");
    if (!/^\d{6,20}$/.test(f.accountNumber.replace(/[\s-]/g, ""))) return setError("Check the account number.");
    if (f.accountName.trim().length < 2) return setError("Add the account name.");
    setBusy(true);
    try {
      setData(unwrap(await providersAPI.savePayout({ bankCode: bank.code, bankName: bank.name, accountNumber: f.accountNumber, accountName: f.accountName })));
      router.push("/providers/apply/submit");
    } catch (e) {
      setError(e.message || "Couldn't save. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <StepTitle n={3} title="Where your share goes" sub="Guests pay when they book. Your share is paid straight to this account." />
      {!editing ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-tile bg-soft px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold">{p.payout.bankName} ••• {p.payout.accountLast4}</span>
            <span className="text-[13px] text-ink-2">{p.payout.accountName}</span>
            {p.payout.nameMatches ? <OkLine>Matches your business name</OkLine> : <span className="text-[13px] font-semibold text-warning">Not in your business's name. We'll check it in review.</span>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Change</Button>
        </div>
      ) : (
        <>
          <SelectField
            label="Bank"
            value={f.bankCode}
            onChange={set("bankCode")}
            placeholder={banks ? "Choose your bank" : bankError ? "Couldn't load banks" : "Loading banks…"}
            options={(banks || []).map((b) => ({ value: b.code, label: b.name }))}
            error={bankError || undefined}
            disabled={!banks}
          />
          <TextField label="Account number" value={f.accountNumber} onChange={set("accountNumber")} inputMode="numeric" autoComplete="off" placeholder="0123 4567 8901" />
          <TextField
            label="Account name"
            value={f.accountName}
            onChange={set("accountName")}
            helper={f.accountName ? (matches ? <OkLine>Matches your business name</OkLine> : "Use an account in your business's name if you can. We check it in review.") : null}
          />
        </>
      )}
      <MoneyLines title={`For a ${fmtMoney(3000, currency)} ticket`} rows={[["Guest pays", fmtMoney(example.price, currency)], ["Provider charges", `− ${fmtMoney(example.charges, currency)}`], ["You receive", fmtMoney(example.receives, currency), true]]} />
      <FormError>{error}</FormError>
      <StepFooter back="/providers/apply/documents" onNext={save} loading={busy} />
    </>
  );
}
