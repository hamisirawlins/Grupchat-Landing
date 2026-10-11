"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { useRequireAuth } from "@/components/app/AppShell";
import { Button, ButtonLink, DoneMark, ProgressBar, Skeleton, StatusTag } from "@/components/kit";
import { ProviderHeader } from "@/components/providers/Application";
import { DocumentRow } from "@/components/providers/DocumentRow";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { date } from "@/lib/format";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { nextStepFor, uploadChecks } from "@/lib/providers";
import { useAsync } from "@/lib/useAsync";

/** Where an application stands, and the one thing to do next (KB D-043). */
export default function Status() {
  const { ready } = useRequireAuth();
  const { data, setData, loading, error, reload } = useMe(ready);
  const item = useRevealVariants();
  const p = data?.provider;

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <ProviderHeader />
      <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        {!ready || loading ? (
          <div className="flex flex-col gap-4" aria-busy="true"><Skeleton className="h-6 w-28" /><Skeleton className="h-10 w-2/3" /><Skeleton className="h-32 w-full" /></div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-start gap-4"><p className="font-semibold text-critical">{error.message}</p><Button variant="quiet" onClick={reload}>Try again</Button></div>
        ) : (
          <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
            {!p ? <NotStarted item={item} /> : <Body p={p} data={data} setData={setData} item={item} />}
          </motion.div>
        )}
      </main>
    </div>
  );
}

function useMe(enabled) {
  const [override, setOverride] = useState(null);
  const res = useAsync(async () => unwrap(await providersAPI.me()), [], { enabled });
  return { ...res, data: override ?? res.data, setData: setOverride };
}

function NotStarted({ item }) {
  return (
    <motion.div variants={item} className="flex flex-col items-start gap-4">
      <h1 className="text-[32px] font-black leading-[38px] tracking-[-0.03em]">You haven't applied yet</h1>
      <p className="text-base text-ink-2">It takes about ten minutes: your business, a few documents and the account you're paid to.</p>
      <ButtonLink href="/providers/apply" size="lg">Apply as a provider</ButtonLink>
    </motion.div>
  );
}

function Body({ p, data, setData, item }) {
  const items = data.checklist?.items || [];
  const fixes = items.filter((i) => i.result && i.result.state !== "pass");
  const passed = items.filter((i) => i.result?.state === "pass").length;
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const headline = {
    draft: ["Finish your application", "Pick up where you left off."],
    waiting: ["You're on the list", `We'll email you when we open in ${p.marketName || "your country"}.`],
    submitted: [p.business?.name, "We're checking your documents. You'll hear from us by email, usually within two working days."],
    "in-review": [p.business?.name, "We're checking your documents now."],
    "changes-requested": [p.business?.name, fixes.length === 1 ? "One check needs a fix before we can approve you." : `${fixes.length} checks need a fix before we can approve you.`],
    approved: ["You're approved", "Add your first experience and publish it when you're ready."],
    declined: [p.business?.name, p.review?.decisionNote || "We can't approve this application."],
  }[p.status] ?? [p.business?.name, ""];

  const resend = async () => {
    setError("");
    setSending(true);
    try {
      setData(unwrap(await providersAPI.submit()));
    } catch (e) {
      setError(e.message || "Couldn't send it.");
    } finally {
      setSending(false);
    }
  };

  const responded = fixes.every((i) => i.kind === "terms" || i.result.respondedAt);
  const docsDone = uploadChecks(data.checklist).filter((c) => c.files.length > 0).length;
  const docsTotal = uploadChecks(data.checklist).length;
  const review = p.review;
  const timeline = [
    { label: "Submitted", sub: p.submittedAt ? date(p.submittedAt, { year: undefined }) : "Not yet", done: Boolean(p.submittedAt) },
    { label: "Reviewed", sub: review?.decidedAt ? date(review.decidedAt, { year: undefined }) : p.status === "in-review" ? "In progress" : "Next", done: Boolean(review?.decidedAt) },
    { label: "Decision", sub: p.status === "approved" ? date(p.approvedAt, { year: undefined }) : p.status === "changes-requested" ? "After your fix" : p.status === "declined" ? "Closed" : "Next", done: ["approved", "declined"].includes(p.status) },
  ];

  return (
    <>
      <motion.div variants={item} className="flex flex-col gap-2.5">
        {p.status === "approved" ? <DoneMark size={64} /> : <StatusTag status={p.status} />}
        <h1 className="text-[32px] font-black leading-[38px] tracking-[-0.03em] sm:text-4xl sm:leading-[42px]">{headline[0]}</h1>
        {headline[1] && <p className="text-base leading-6 text-ink-2">{headline[1]}</p>}
      </motion.div>

      {p.status === "draft" && (
        <motion.div variants={item} className="flex flex-col gap-4">
          {docsTotal > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold">{docsDone} of {docsTotal} documents added</span>
              <ProgressBar value={docsDone / docsTotal} label="Documents added" thick />
            </div>
          )}
          <ButtonLink href={nextStepFor(data)} size="lg" className="self-start">Continue your application</ButtonLink>
        </motion.div>
      )}

      {p.status === "approved" && (
        <motion.div variants={item}><ButtonLink href="/provider" size="lg">Open your portal</ButtonLink></motion.div>
      )}

      {p.status === "changes-requested" && (
        <motion.div variants={item} className="flex flex-col gap-4">
          {fixes.map((i) => (
            <section key={i.id} aria-label={i.title} className="flex flex-col gap-3.5 rounded-card bg-warning-tint p-5 shadow-[inset_0_0_0_1px_rgb(180_83_9/0.25)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-lg font-extrabold">{i.title}</span>
                <StatusTag status="fix" />
              </div>
              {i.result.note && <blockquote className="rounded-xl bg-white px-3.5 py-3 text-[15px] leading-[22px]">{i.result.note}</blockquote>}
              {(i.kind === "document" || i.kind === "photos-document") && (
                <div className="rounded-xl bg-white px-3.5 py-3"><DocumentRow item={i} onChange={setData} compact /></div>
              )}
              {i.kind === "payout" && <ButtonLink href="/providers/apply/payouts" variant="secondary" className="self-start">Change payout account</ButtonLink>}
              {i.result.respondedAt && <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-success"><Check className="h-4 w-4" strokeWidth={2.5} />Updated. Send it back when you're ready.</span>}
            </section>
          ))}
          {error && <p role="alert" className="font-semibold text-critical">{error}</p>}
          <div className="flex flex-col items-start gap-2">
            <Button size="lg" onClick={resend} loading={sending} disabled={!responded}>Send for review</Button>
            {!responded && <span className="text-[13px] text-ink-3">Update each check above first.</span>}
          </div>
        </motion.div>
      )}

      {items.length > 0 && ["submitted", "in-review", "changes-requested"].includes(p.status) && (
        <motion.section variants={item} aria-label="Checks" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">Checks</h2>
            <span className="text-sm font-semibold text-ink-2">{passed} of {items.length} passed</span>
          </div>
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {items.map((i) => {
              const s = i.result?.state;
              return (
                <li key={i.id} className={`flex min-h-10 items-center gap-3 text-[15px] leading-5 ${s && s !== "pass" ? "font-bold" : ""}`}>
                  <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s === "pass" ? "bg-success-tint text-success" : s ? "bg-warning-tint text-warning" : "shadow-[inset_0_0_0_2px_rgb(0_0_0/0.15)]"}`}>
                    {s === "pass" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s ? <AlertCircle className="h-4 w-4" /> : null}
                  </span>
                  {i.title}
                  <span className="sr-only">{s === "pass" ? "passed" : s ? "needs a fix" : "not checked yet"}</span>
                </li>
              );
            })}
          </ul>
        </motion.section>
      )}

      {p.submittedAt && (
        <motion.ol variants={item} aria-label="Application progress" className="grid grid-cols-3 gap-3 border-t border-line pt-5">
          {timeline.map((t) => (
            <li key={t.label} className="flex flex-col gap-1.5">
              <span aria-hidden="true" className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${t.done ? "bg-action text-white" : "shadow-[inset_0_0_0_2px_rgb(0_0_0/0.25)]"}`}>
                {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="text-sm font-bold">{t.label}</span>
              <span className="text-[13px] text-ink-3">{t.sub}</span>
            </li>
          ))}
        </motion.ol>
      )}
    </>
  );
}
