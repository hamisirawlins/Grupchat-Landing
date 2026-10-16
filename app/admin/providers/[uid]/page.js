"use client";

import { use, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { Avatar, BackLink, Button, Card, OkLine, ReviewToggle, Skeleton, StatusTag, TextArea, TextField } from "@/components/kit";
import { Sheet } from "@/components/ui/Sheet";
import { useAdminConsole } from "@/components/providers/AdminConsole";
import { AppliesTag } from "@/components/providers/Tags";
import { adminProvidersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { date } from "@/lib/format";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { PAYOUT_METHODS, categoryLabel, hasPayout, payoutLabel, payoutName } from "@/lib/providers";

const REVIEWABLE = ["submitted", "in-review"];

/** One application, checked item by item against its market's checklist (KB D-043). */
export default function ReviewProvider({ params }) {
  const { uid } = use(params);
  const item = useRevealVariants();
  const { refreshCounts } = useAdminConsole();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState(null); // { item, file, url }
  const [busy, setBusy] = useState("");
  const [sheet, setSheet] = useState(null); // "approve" | "decline"
  const [declineNote, setDeclineNote] = useState("");
  const [subaccount, setSubaccount] = useState("");
  const [manualOpen, setManualOpen] = useState(false);

  const load = () => adminProvidersAPI.detail(uid).then((r) => setD(unwrap(r))).catch((e) => setError(e.message || "Couldn't load it."));
  useEffect(() => { load(); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const openFile = async (it, file) => {
    setDoc({ item: it, file, url: null });
    try {
      const { url } = unwrap(await adminProvidersAPI.documentUrl(uid, it.id, file.id));
      setDoc({ item: it, file, url });
    } catch (e) {
      toast.error(e.message || "Couldn't open the file.");
    }
  };
  useEffect(() => {
    if (!d || doc) return;
    const first = d.checklist?.items.find((i) => i.files.length);
    if (first) openFile(first, first.files[0]);
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error && !d) return <p role="alert" className="font-semibold text-critical">{error}</p>;
  if (!d) return <div className="flex flex-col gap-5" aria-busy="true"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96 w-full rounded-card" /></div>;

  const p = d.provider;
  const b = p.business || {};
  const reviewable = REVIEWABLE.includes(p.status) || Boolean(d.recheckVersionId);
  const items = d.checklist?.items || [];
  const needsFix = items.filter((i) => i.result && i.result.state !== "pass");
  const canApprove = reviewable && d.checklist?.allRequiredPass && !items.some((i) => i.result?.state === "fail");

  const setCheck = async (it, state, note) => {
    setBusy(`check:${it.id}`);
    try {
      setD(unwrap(await adminProvidersAPI.setCheck(uid, it.id, { state, note })));
    } catch (e) {
      toast.error(e.message || "Couldn't save that.");
    } finally {
      setBusy("");
    }
  };
  const decide = async (decision, note) => {
    setBusy(decision);
    try {
      const out = unwrap(await adminProvidersAPI.decide(uid, { decision, note }));
      setD(out);
      setSheet(null);
      refreshCounts();
      if (decision === "approve") {
        if (out.payoutSetup && !out.payoutSetup.ok) toast.warning(`Approved. Paystack didn't set up the payout account: ${out.payoutSetup.error}`);
        else toast.success(`${b.name} is approved`);
      } else toast.success(decision === "decline" ? "Declined. They've been emailed." : "Changes requested. They've been emailed.");
    } catch (e) {
      toast.error(e.message || "Couldn't save the decision.");
    } finally {
      setBusy("");
    }
  };
  const retryPayout = async () => {
    setBusy("payout");
    try { setD(unwrap(await adminProvidersAPI.retryPayout(uid))); toast.success("Payout account is ready"); }
    catch (e) { toast.error(e.message); if (e.status === 409) setManualOpen(true); }
    finally { setBusy(""); }
  };
  // Set up in Paystack's dashboard by hand (an unlisted bank, a Paybill with an account): save its code here.
  const saveSubaccount = async () => {
    const code = subaccount.trim();
    if (!/^ACCT_[A-Za-z0-9]{4,40}$/.test(code)) return toast.error("Paste the subaccount code from Paystack. It starts with ACCT_.");
    setBusy("subaccount");
    try {
      setD(unwrap(await adminProvidersAPI.setSubaccount(uid, { subaccountCode: code, settledTo: d.provider.payout?.method })));
      setSubaccount(""); setManualOpen(false);
      toast.success("Saved. Ticket sales now split to this subaccount.");
    } catch (e) { toast.error(e.message); }
    finally { setBusy(""); }
  };

  const meta = [`${b.town}, ${d.market?.name || p.marketName}`, b.type === "company" ? "Company" : "Sole trader", [...(b.categories || []).map(categoryLabel), b.waterActivities ? "water activities" : null].filter(Boolean).join(", "), p.submittedAt ? `Applied ${date(p.submittedAt, { year: undefined })}` : null].filter(Boolean).join(" · ");

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item}><BackLink href="/admin/providers">Review</BackLink></motion.div>
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-2">
          <StatusTag status={d.recheckVersionId ? "recheck" : p.status} />
          <h1 className="text-[28px] font-black leading-[34px] tracking-[-0.03em] sm:text-4xl sm:leading-[42px]">{b.name}</h1>
          <span className="text-[15px] leading-5 text-ink-2">{meta}</span>
        </div>
        {d.reviewer && (
          <span className="inline-flex items-center gap-2.5 text-sm text-ink-2"><Avatar name={d.reviewer.name || "?"} size={32} />Reviewer · <strong className="font-bold text-ink">{d.reviewer.name}</strong></span>
        )}
      </motion.div>

      {p.status === "approved" && !p.payoutSetup?.ready && (
        <motion.div variants={item} className="flex flex-col gap-3 rounded-tile bg-warning-tint px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            <span className="min-w-[220px] flex-1 text-[15px] font-semibold text-warning">
              {p.payoutSetup?.manual
                ? `Set this payout up by hand in Paystack: ${p.payoutSetup.error}. Then paste the subaccount code here.`
                : `Payout account isn't set up on Paystack yet${p.payoutSetup?.error ? `: ${p.payoutSetup.error}` : ""}.`} Ticket sales wait until it is.
            </span>
            {!p.payoutSetup?.manual && <Button variant="secondary" size="sm" onClick={retryPayout} loading={busy === "payout"}>Try again</Button>}
            {!p.payoutSetup?.manual && !manualOpen && <Button variant="text" size="sm" onClick={() => setManualOpen(true)}>Set up by hand</Button>}
          </div>
          {(p.payoutSetup?.manual || manualOpen) && (
            <div className="flex flex-wrap items-end gap-3">
              <TextField className="min-w-[240px] flex-1" label="Paystack subaccount code" value={subaccount} onChange={(e) => setSubaccount(e.target.value)} placeholder="ACCT_xxxxxxxxxx" autoComplete="off" helper={`Create it in Paystack for ${payoutLabel(p.payout) || "their payout"} at ${Math.round((d.charges?.rate ?? 0.1) * 100)}% to GrupChat.`} />
              <Button onClick={saveSubaccount} loading={busy === "subaccount"}>Save code</Button>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
        <motion.div variants={item} className="flex min-w-0 flex-1 flex-col gap-5">
          <Card title="Applicant">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-[15px] leading-5">
              <dt className="text-ink-3">Account</dt><dd>{d.owner.name || "—"}{d.owner.email ? <span className="block text-ink-3 [overflow-wrap:anywhere]">{d.owner.email}</span> : null}</dd>
              <dt className="text-ink-3">Phone</dt><dd className="tabular">{b.phone}</dd>
              <dt className="text-ink-3">Email</dt><dd className="[overflow-wrap:anywhere]">{b.email}</dd>
              {b.website && <><dt className="text-ink-3">Link</dt><dd className="[overflow-wrap:anywhere]"><a href={b.website} target="_blank" rel="noopener noreferrer" className="text-action-strong hover:underline">{b.website}</a></dd></>}
              <dt className="text-ink-3">Payout</dt>
              <dd className="flex flex-col gap-1">
                <span>{hasPayout(p.payout) ? `${payoutLabel(p.payout)} · ${payoutName(p.payout)}` : "Not added"}</span>
                {hasPayout(p.payout) && (
                  <span className="text-[13px] text-ink-3">
                    {[PAYOUT_METHODS[p.payout.method], p.payout.bankListed === false ? "bank typed in, not on Paystack's list" : null, p.payout.branch ? `branch ${p.payout.branch}` : null, p.payout.backupLabel ? `backup ${p.payout.backupLabel}` : null, p.payoutSetup?.ready && p.payoutSetup.settledTo ? `settles to ${PAYOUT_METHODS[p.payoutSetup.settledTo] || p.payoutSetup.settledTo}` : null].filter(Boolean).join(" · ")}
                  </span>
                )}
                {hasPayout(p.payout) && (p.payout.nameMatches ? <OkLine>Name matches the business</OkLine> : <span className="text-[13px] font-semibold text-warning">Name differs from the business</span>)}
              </dd>
              <dt className="text-ink-3">Listings</dt><dd>{d.experiences}</dd>
            </dl>
          </Card>
          <Card title={doc?.item?.title || "Documents"} sub={doc?.file?.fileName} action={doc?.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-soft px-4 text-[15px] font-bold text-ink hover:bg-gray-200"><ExternalLink className="h-4 w-4" aria-hidden="true" />Open full size</a> : null}>
            <div className="flex h-[340px] items-center justify-center overflow-hidden rounded-[14px] bg-soft sm:h-[440px]">
              {!doc ? <span className="text-sm text-ink-3">No documents to show</span> : !doc.url ? <Skeleton className="h-full w-full" /> : doc.file.contentType?.startsWith("image/") ? (
                <img src={doc.url} alt={doc.file.fileName} className="h-full w-full object-contain" />
              ) : doc.file.contentType === "application/pdf" ? (
                <iframe title={doc.file.fileName} src={doc.url} className="h-full w-full bg-white" />
              ) : (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-action-strong">Download {doc.file.fileName}</a>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.section variants={item} aria-label="Checklist" className="flex min-w-0 flex-[1.15] flex-col gap-1.5 rounded-card bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">Checklist · {d.market?.name} v{d.checklist?.label}</h2>
            <span className="text-sm font-semibold text-ink-2">{d.checklist?.passed} of {d.checklist?.total} pass</span>
          </div>
          <ul>
            {items.map((it) => <CheckItem key={it.id} it={it} reviewable={reviewable} busy={busy === `check:${it.id}`} onSet={setCheck} onOpen={openFile} active={doc?.item?.id === it.id ? doc.file.id : null} />)}
          </ul>
          <div className="flex flex-col gap-3 pt-3">
            <div className="flex flex-wrap gap-2.5">
              <Button size="lg" disabled={!canApprove} onClick={() => setSheet("approve")}>Approve provider</Button>
              <Button size="lg" variant="secondary" disabled={!reviewable || needsFix.length === 0} onClick={() => decide("request-changes")} loading={busy === "request-changes"}>Request changes</Button>
              <Button size="lg" variant="danger" disabled={!reviewable} onClick={() => setSheet("decline")}>Decline</Button>
            </div>
            <span className="text-[13px] text-ink-3">{reviewable ? (canApprove ? "Every required check passes. Approving sets up their payout account." : needsFix.length ? "Request changes sends the fixes to the provider by email." : "Approve opens when every required check passes.") : p.status === "changes-requested" ? "With the provider for fixes. It comes back here when they send it." : "Decided."}</span>
          </div>
        </motion.section>
      </div>

      <Sheet open={sheet === "approve"} onClose={() => setSheet(null)} title={`Approve ${b.name}?`} footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={() => setSheet(null)}>Not yet</Button>
          <Button onClick={() => decide("approve")} loading={busy === "approve"}>Approve</Button>
        </div>
      }>
        <p className="text-[15px] leading-[22px] text-ink-2">They can publish experiences straight away, and we set up their payout account on Paystack so ticket sales split to them. They'll get an email.</p>
      </Sheet>
      <Sheet open={sheet === "decline"} onClose={() => setSheet(null)} title={`Decline ${b.name}?`} footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={() => setSheet(null)}>Cancel</Button>
          <Button variant="danger" className="bg-critical-tint" disabled={declineNote.trim().length < 5} onClick={() => decide("decline", declineNote)} loading={busy === "decline"}>Decline</Button>
        </div>
      }>
        <TextArea label="Why, in a sentence they'll read" rows={3} value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} helper="Their live listings are paused too." />
      </Sheet>
    </motion.div>
  );
}

function CheckItem({ it, reviewable, busy, onSet, onOpen, active }) {
  const [state, setState] = useState(it.result?.state || null);
  const [note, setNote] = useState(it.result?.note || "");
  useEffect(() => { setState(it.result?.state || null); setNote(it.result?.note || ""); }, [it.result?.state, it.result?.note]);
  const choose = (s) => {
    setState(s);
    if (s === "pass") onSet(it, "pass", null);
  };
  const unsaved = state && state !== "pass" && (state !== it.result?.state || note !== (it.result?.note || ""));
  const evidence = it.kind === "payout" ? "Payout account" : it.kind === "terms" ? (it.provided ? "Accepted" : "Accepted when sent") : null;

  return (
    <li className="flex flex-col gap-2.5 border-b border-black/[0.06] py-3.5 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[200px] flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold leading-5">{it.title}</span>
            <AppliesTag appliesTo={it.appliesTo} />
            {it.result?.respondedAt && it.result.state !== "pass" && <span className="text-xs font-bold text-action-strong">Updated by provider</span>}
          </div>
          {evidence ? <span className="text-[13px] text-ink-3">{evidence}</span> : (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {it.files.length === 0 && <span className="text-[13px] text-warning">No file</span>}
              {it.files.map((f) => (
                <button key={f.id} type="button" onClick={() => onOpen(it, f)} className={`inline-flex items-center gap-1.5 text-[13px] leading-[18px] hover:underline ${active === f.id ? "font-bold text-action-strong" : "text-ink-3"}`}>
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />{f.fileName}
                </button>
              ))}
            </div>
          )}
        </div>
        <ReviewToggle label={it.title} value={state} onChange={choose} disabled={!reviewable || busy} />
      </div>
      <AnimatePresence initial={false}>
        {state && state !== "pass" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 overflow-hidden">
            <TextArea label="Note to the provider" rows={2} value={note} onChange={(e) => setNote(e.target.value)} disabled={!reviewable} helper="The provider sees this note." />
            {reviewable && unsaved && <Button size="sm" variant="secondary" className="self-start" disabled={note.trim().length < 3} loading={busy} onClick={() => onSet(it, state, note)}>Save note</Button>}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
