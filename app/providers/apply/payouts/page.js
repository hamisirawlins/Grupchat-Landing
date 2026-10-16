"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FieldRow, Label, MoneyLines, OkLine, RadioCards, SelectField, Switch, TextField } from "@/components/kit";
import { FormError, StepFooter, StepTitle, useApplication } from "@/components/providers/Application";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { chargesFor, fmtMoney, namesMatch } from "@/lib/providers";

/**
 * Step 3: where a provider's share is paid (D-063): a bank account, an M-Pesa Paybill or an
 * M-Pesa Till, with the other kind as an optional backup. A bank that isn't on Paystack's
 * list, or a list that won't load, is typed in; we set those up by hand after approval.
 */

const OTHER = "__other";
const METHODS = [
  { value: "bank", label: "Bank account", sub: "Any bank in Kenya" },
  { value: "mpesa_paybill", label: "M-Pesa Paybill", sub: "A business number, with an account number if it needs one" },
  { value: "mpesa_till", label: "M-Pesa Till", sub: "A Buy Goods till number" },
];
const digits = (v) => String(v || "").replace(/[\s-]/g, "");

function initial(p) {
  const o = p?.payout || {};
  const m = o.mpesa || {};
  const method = o.method || "bank";
  return {
    method,
    bankCode: o.bankListed === false ? OTHER : o.bankCode || "",
    bankName: o.bankListed === false ? o.bankName || "" : "",
    branch: o.branch || "",
    accountNumber: "",
    accountName: o.accountName || p?.business?.name || "",
    mpesaNumber: m.number || "",
    mpesaAccount: m.account || "",
    mpesaName: m.accountName || p?.business?.name || "",
    backup: Boolean(o.backup),
    backupKind: m.kind || "till",
  };
}

/** The checks the server makes, here first, so a mistake is named next to its field. */
function check(f, bankChoice) {
  const errs = {};
  const wantsBank = f.method === "bank" || (f.backup && f.method !== "bank");
  const wantsMpesa = f.method !== "bank" || f.backup;
  if (wantsBank) {
    if (bankChoice === "list" && !f.bankCode) errs.bankCode = "Choose your bank, or pick \"My bank isn't listed\".";
    if (bankChoice === "typed" && f.bankName.trim().length < 2) errs.bankName = "Type your bank's name.";
    if (!/^\d{6,20}$/.test(digits(f.accountNumber))) errs.accountNumber = f.accountNumber ? "Check the account number: 6 to 20 digits." : "Type the account number.";
    if (f.accountName.trim().length < 2) errs.accountName = "Add the name on the account.";
  }
  if (wantsMpesa) {
    const kind = f.method === "bank" ? f.backupKind : f.method.slice(6);
    if (!/^\d{5,8}$/.test(digits(f.mpesaNumber))) errs.mpesaNumber = kind === "till" ? "Check the till number: 5 to 8 digits." : "Check the paybill number: 5 to 8 digits.";
    if (kind === "paybill" && f.mpesaAccount && !/^[A-Za-z0-9-]{1,20}$/.test(f.mpesaAccount.replace(/\s+/g, ""))) errs.mpesaAccount = "Letters, numbers and dashes, up to 20.";
    if (f.mpesaName.trim().length < 2) errs.mpesaName = kind === "till" ? "Add the name on the till." : "Add the name on the paybill.";
  }
  return errs;
}

function body(f, banks, bankChoice) {
  const wantsBank = f.method === "bank" || (f.backup && f.method !== "bank");
  const wantsMpesa = f.method !== "bank" || f.backup;
  const listed = bankChoice === "list" ? banks.find((b) => b.code === f.bankCode) : null;
  return {
    primary: f.method === "bank" ? "bank" : "mpesa",
    ...(wantsBank && {
      bank: listed
        ? { bankCode: listed.code, bankName: listed.name, accountNumber: f.accountNumber, accountName: f.accountName }
        : { bankName: f.bankName, branch: f.branch, accountNumber: f.accountNumber, accountName: f.accountName },
    }),
    ...(wantsMpesa && {
      mpesa: { kind: f.method === "bank" ? f.backupKind : f.method.slice(6), number: f.mpesaNumber, account: f.method === "mpesa_till" || (f.method === "bank" && f.backupKind === "till") ? "" : f.mpesaAccount, name: f.mpesaName },
    }),
  };
}

function NameHelper({ name, business }) {
  if (!name) return null;
  return namesMatch(name, business) ? <OkLine>Matches your business name</OkLine> : "Use one in your business's name if you can. We check it in review.";
}

function BankFields({ f, set, errs, banks, bankState, retryBanks, business, backup = false }) {
  const typed = bankState !== "ok" || f.bankCode === OTHER;
  return (
    <div className="flex flex-col gap-4">
      {bankState === "ok" ? (
        <SelectField
          label="Bank"
          value={f.bankCode}
          onChange={set("bankCode")}
          placeholder="Choose your bank"
          options={[...banks.map((b) => ({ value: b.code, label: b.name })), { value: OTHER, label: "My bank isn't listed" }]}
          error={errs.bankCode}
        />
      ) : bankState === "loading" ? (
        <SelectField label="Bank" value="" onChange={() => {}} placeholder="Loading banks…" options={[]} disabled />
      ) : null}
      {typed && bankState !== "loading" && (
        <FieldRow>
          <TextField
            label="Bank name"
            value={f.bankName}
            onChange={set("bankName")}
            autoComplete="off"
            placeholder="Sidian Bank"
            error={errs.bankName}
            helper={bankState === "failed" ? (
              <>
                We couldn't load the list of banks, so type the name.{" "}
                <button type="button" onClick={retryBanks} className="font-semibold text-action-strong underline-offset-2 hover:underline">Load the list again</button>
              </>
            ) : "We set this bank up by hand after approval."}
          />
          <TextField label="Branch" optional value={f.branch} onChange={set("branch")} autoComplete="off" placeholder="Ukunda" />
        </FieldRow>
      )}
      <TextField
        label="Account number"
        value={f.accountNumber}
        onChange={set("accountNumber")}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0123 4567 8901"
        error={errs.accountNumber}
        helper={backup ? null : "We keep it apart and only ever show the last four digits."}
      />
      <TextField label="Account name" value={f.accountName} onChange={set("accountName")} error={errs.accountName} helper={<NameHelper name={f.accountName} business={business} />} />
    </div>
  );
}

function MpesaFields({ kind, f, set, errs, business }) {
  const till = kind === "till";
  return (
    <div className="flex flex-col gap-4">
      <FieldRow>
        <TextField
          label={till ? "Till number" : "Paybill number"}
          value={f.mpesaNumber}
          onChange={set("mpesaNumber")}
          inputMode="numeric"
          autoComplete="off"
          placeholder={till ? "5123456" : "247247"}
          error={errs.mpesaNumber}
        />
        {!till && (
          <TextField
            label="Account number"
            optional
            value={f.mpesaAccount}
            onChange={set("mpesaAccount")}
            autoComplete="off"
            placeholder="MWEZI-001"
            error={errs.mpesaAccount}
            helper="Only if your paybill needs one to know it's you."
          />
        )}
      </FieldRow>
      <TextField
        label={till ? "Name on the till" : "Name on the paybill"}
        value={f.mpesaName}
        onChange={set("mpesaName")}
        error={errs.mpesaName}
        helper={<NameHelper name={f.mpesaName} business={business} />}
      />
    </div>
  );
}

export default function Payouts() {
  const { data, setData } = useApplication();
  const router = useRouter();
  const p = data?.provider;
  const currency = data?.market?.currency || "KES";
  const rate = data?.charges?.rate ?? 0.1;
  const hasPayout = Boolean(p?.payout?.method || p?.payout?.accountLast4);
  const [editing, setEditing] = useState(!hasPayout);
  const [banks, setBanks] = useState([]);
  const [bankState, setBankState] = useState("idle"); // idle → loading → ok | failed
  const [f, setF] = useState(() => initial(p));
  const [errs, setErrs] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => {
    const value = e?.target ? e.target.value : e;
    setF((s) => ({ ...s, [k]: value }));
    setErrs((s) => (s[k] ? { ...s, [k]: undefined } : s));
  };

  const needsBank = f.method === "bank" || f.backup;
  const loadBanks = useCallback(() => {
    setBankState("loading");
    providersAPI.banks(p?.market || "KE")
      .then((r) => {
        const list = unwrap(r)?.banks || [];
        setBanks(list);
        setBankState(list.length ? "ok" : "failed");
      })
      .catch(() => setBankState("failed"));
  }, [p?.market]);

  useEffect(() => {
    if (editing && needsBank && bankState === "idle") loadBanks();
  }, [editing, needsBank, bankState, loadBanks]);

  const bankChoice = bankState === "ok" && f.bankCode !== OTHER ? "list" : "typed";
  const example = chargesFor(3000, rate);
  const backupKind = f.method === "bank" ? "M-Pesa" : "a bank account";

  const save = async () => {
    setError(null);
    if (!editing) return router.push("/providers/apply/submit");
    if (needsBank && bankState === "loading") return setError("The list of banks is still loading. Give it a second.");
    const found = check(f, bankChoice);
    setErrs(found);
    if (Object.keys(found).length) return setError("Check the fields marked in red.");
    setBusy(true);
    try {
      setData(unwrap(await providersAPI.savePayout(body(f, banks, bankChoice))));
      router.push("/providers/apply/submit");
    } catch (e) {
      setError(e?.message ? e : "Couldn't save. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <StepTitle n={3} title="Where your share goes" sub="Guests pay when they book. Your share is paid straight to you, by bank or M-Pesa." />
      {!editing ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-tile bg-soft px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold">{p.payout.label || `${p.payout.bankName} ••• ${p.payout.accountLast4}`}</span>
            <span className="text-[13px] text-ink-2">{p.payout.payeeName || p.payout.accountName}</span>
            {p.payout.backupLabel && <span className="text-[13px] text-ink-2">Backup: {p.payout.backupLabel}</span>}
            {p.payout.nameMatches ? <OkLine>Matches your business name</OkLine> : <span className="text-[13px] font-semibold text-warning">Not in your business's name. We'll check it in review.</span>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => { setF(initial(p)); setEditing(true); }}>Change</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label>Get paid to</Label>
            <RadioCards label="Get paid to" options={METHODS} value={f.method} onChange={(v) => { set("method")(v); setErrs({}); }} className="lg:grid-cols-3" />
          </div>

          {f.method === "bank" ? (
            <BankFields f={f} set={set} errs={errs} banks={banks} bankState={bankState} retryBanks={loadBanks} business={p?.business?.name} />
          ) : (
            <MpesaFields kind={f.method.slice(6)} f={f} set={set} errs={errs} business={p?.business?.name} />
          )}

          <div className="flex flex-col gap-4 rounded-tile bg-soft px-5 py-4">
            <Switch
              label="Add a backup"
              description={`If a payment can't reach your first choice, we pay ${backupKind} instead.`}
              checked={f.backup}
              onChange={(v) => { set("backup")(v); setErrs({}); }}
            />
            {f.backup && (f.method === "bank" ? (
              <>
                <RadioCards
                  label="Backup M-Pesa number"
                  options={[{ value: "till", label: "M-Pesa Till" }, { value: "paybill", label: "M-Pesa Paybill" }]}
                  value={f.backupKind}
                  onChange={set("backupKind")}
                />
                <MpesaFields kind={f.backupKind} f={f} set={set} errs={errs} business={p?.business?.name} />
              </>
            ) : (
              <BankFields f={f} set={set} errs={errs} banks={banks} bankState={bankState} retryBanks={loadBanks} business={p?.business?.name} backup />
            ))}
          </div>
          {hasPayout && needsBank && <p className="-mt-2 text-[13px] text-ink-3">For your security, account numbers are never shown again: type the bank account number each time you change these.</p>}
        </>
      )}
      <MoneyLines title={`For a ${fmtMoney(3000, currency)} ticket`} rows={[["Guest pays", fmtMoney(example.price, currency)], ["Provider charges", `− ${fmtMoney(example.charges, currency)}`], ["You receive", fmtMoney(example.receives, currency), true]]} />
      <FormError>
        {error && (typeof error === "string" ? error : (
          <>
            {error.message}
            {error.ref && <span className="mt-1 block text-[13px] font-medium">Reference {error.ref}. Email info@grupchat.net with it if this keeps happening.</span>}
          </>
        ))}
      </FormError>
      <StepFooter back="/providers/apply/documents" onNext={save} loading={busy} />
    </>
  );
}
