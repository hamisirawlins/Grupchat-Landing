"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { ButtonLink, DoneMark, OkLine } from "@/components/kit";
import { FormError, StepFooter, StepTitle, useApplication } from "@/components/providers/Application";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { SPRING } from "@/lib/motion";
import { categoryLabel, uploadChecks } from "@/lib/providers";

function Row({ ok, title, sub, href }) {
  return (
    <li className="flex items-start gap-3 border-b border-black/[0.06] py-3.5 last:border-0">
      <span aria-hidden="true" className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ok ? "bg-success-tint text-success" : "bg-warning-tint text-warning"}`}>
        {ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <AlertCircle className="h-4 w-4" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-bold">{title}</span>
        {sub && <span className="text-[13px] leading-[18px] text-ink-2">{sub}</span>}
      </span>
      {href && <Link href={href} className="shrink-0 py-1 text-sm font-bold text-action-strong">{ok ? "Edit" : "Fix"}</Link>}
    </li>
  );
}

/** Step 4: one look over everything, the terms, and send. */
export default function Submit() {
  const { data, setData } = useApplication();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const p = data?.provider;
  const b = p?.business;
  const checks = uploadChecks(data?.checklist);
  const missing = checks.filter((c) => c.required && c.files.length === 0);
  const ready = Boolean(p && p.payout && missing.length === 0);
  const resubmit = p?.status === "changes-requested";

  const send = async () => {
    setError("");
    setBusy(true);
    try {
      const out = unwrap(await providersAPI.submit());
      setSent(true);
      setData(out);
    } catch (e) {
      setError(e.message || "Couldn't send it. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.soft} className="flex flex-col items-start gap-5 pt-6">
          <DoneMark size={72} />
          <h1 className="text-[32px] font-black leading-[38px] tracking-[-0.03em]">{data?.provider?.status === "waiting" ? "You're on the list" : "Application sent"}</h1>
          <p className="max-w-md text-base leading-6 text-ink-2">
            {data?.provider?.status === "waiting"
              ? `We'll email you when we open in ${data?.market?.name || "your country"}.`
              : "We check every provider before they go live. You'll hear from us by email, usually within two working days."}
          </p>
          <ButtonLink href="/providers/status" size="lg">See your application</ButtonLink>
        </motion.div>
      ) : (
        <motion.div key="form" className="flex flex-col gap-7" exit={{ opacity: 0 }}>
          <StepTitle n={4} title={resubmit ? "Send your fixes" : "Check and send"} sub="We'll review it against the checklist for your country." />
          <ul className="rounded-card px-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <Row ok={Boolean(b)} title={b?.name || "Your business"} sub={b ? `${b.type === "company" ? "Company" : "Sole trader"} · ${b.town} · ${(b.categories || []).map(categoryLabel).join(", ")}${b.waterActivities ? " · water activities" : ""}` : "Not added yet"} href="/providers/apply/business" />
            {data?.checklist && (
              <Row ok={missing.length === 0} title={`Documents · ${checks.length - missing.length} of ${checks.length}`} sub={missing.length ? `Still to add: ${missing.map((m) => m.title).join(", ")}` : "Everything your checklist asks for"} href="/providers/apply/documents" />
            )}
            <Row ok={Boolean(p?.payout)} title={p?.payout ? `${p.payout.bankName} ••• ${p.payout.accountLast4}` : "Payout account"} sub={p?.payout ? p.payout.accountName : "Not added yet"} href="/providers/apply/payouts" />
          </ul>
          {p?.payout?.nameMatches && <OkLine>Your payout account is in your business's name</OkLine>}
          <p className="text-sm leading-5 text-ink-2">
            By sending your application, you agree to the{" "}
            <Link href="/providers/terms" target="_blank" className="font-semibold text-action-strong underline-offset-2 hover:underline">provider terms</Link>.
          </p>
          <FormError>{error}</FormError>
          <StepFooter back="/providers/apply/payouts" onNext={send} nextLabel={resubmit ? "Send fixes" : "Send application"} loading={busy} disabled={!ready} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
