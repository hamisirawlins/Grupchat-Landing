"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Copy, Link2, Pencil, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal, Section } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Sheet } from "@/components/ui/Sheet";
import { Avatar, EmptyState, Skeleton, StickyAction, Tag } from "@/components/ui/Bits";
import { Ring } from "@/components/home/Charts";
import { Field, FieldGroup, FormError, OutlineButton, PrimaryButton, SuccessMark, TextAreaField } from "@/components/ui/Form";
import { auditAPI, catalogueAPI, plansAPI, premiumAPI } from "@/lib/api";
import { date, dateTime, fraction, money, plural, relative } from "@/lib/format";
import { asList, isPooled, planTypeLabel, STATUS_TONE, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";
import { debugLog } from "@/lib/debug";

const TX_TONE = { success: "success", pending: "warning", failed: "critical" };
const TX_LABEL = { contribution: "Contribution", "premium-join": "Payment", payout: "Payout" };
const COMMITMENT = { in: "In", tentative: "Tentative", watching: "Watching" };
const POLL_MS = 5000;
const POLL_MAX = 24; // 2 minutes

/** Accepts 07XXXXXXXX, 7XXXXXXXX, 2547…, +2547…; returns 2547XXXXXXXX or null. */
function normalizePhone(raw) {
  let n = String(raw || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = `254${n.slice(1)}`;
  else if (/^[17]\d{8}$/.test(n)) n = `254${n}`;
  return /^254[17]\d{8}$/.test(n) ? n : null;
}

const toMs = (v) => {
  if (!v) return 0;
  if (typeof v._seconds === "number") return v._seconds * 1000;
  if (typeof v.seconds === "number") return v.seconds * 1000;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

export default function PlanDetails() {
  const { planId } = useParams();
  const { user } = useAuth();
  const uid = user?.uid;

  const plan$ = useAsync(async () => unwrap(await plansAPI.getPlan(planId)), [planId], { enabled: !!user });
  const members$ = useAsync(async () => asList(unwrap(await plansAPI.getPlanMembers(planId)), "members"), [planId], { enabled: !!user });
  const txs$ = useAsync(async () => asList(unwrap(await plansAPI.getPlanTransactions(planId))), [planId], { enabled: !!user });

  const plan = plan$.data;
  const isOwner = !!plan && plan.ownerId === uid;
  const pooled = isPooled(plan);
  const me = useMemo(() => (members$.data ?? []).find((m) => m.userId === uid), [members$.data, uid]);
  const premiumUnpaid = plan?.planType === "premium" && !pooled && me?.paymentStatus !== "paid";

  // Curated plans created before pooling was enabled pay the listed price; fetch it.
  const item$ = useAsync(
    async () => (plan?.catalogueItemId ? unwrap(await catalogueAPI.getItem(plan.catalogueItemId)) : null),
    [plan?.catalogueItemId],
    { enabled: !!plan?.catalogueItemId },
  );

  useEffect(() => {
    if (plan?.id) auditAPI.emit({ action: "ui.plan_viewed", entity: "plan", entityId: plan.id, planId: plan.id });
  }, [plan?.id]);

  const [sheet, setSheet] = useState(null); // "pay" | "invite" | "edit" | "resource"

  // While any of my payments is pending, keep watching the ledger (every 15s, up to 30 min)
  // so a callback or the reconciliation job shows up here without a manual refresh.
  const watchPolls = useRef(0);
  const myPending = useMemo(
    () => (txs$.data ?? []).filter((t) => t.userId === uid && t.status === "pending").map((t) => t.id),
    [txs$.data, uid],
  );
  useEffect(() => {
    if (myPending.length === 0 || watchPolls.current >= 120) return undefined;
    const t = setInterval(async () => {
      watchPolls.current += 1;
      try {
        const list = asList(unwrap(await plansAPI.getPlanTransactions(planId)));
        const changed = list.filter((x) => myPending.includes(x.id) && x.status !== "pending");
        if (changed.length) {
          if (changed.some((x) => x.status === "success")) toast.success("Payment received");
          else toast.error("Payment didn't go through");
          plan$.reload(); members$.reload(); txs$.reload();
        }
      } catch { /* try again next tick */ }
    }, 15000);
    return () => clearInterval(t);
  }, [myPending, planId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Landing back from Paystack (?payment=…): the webhook may not have arrived yet,
  // so verify my latest pending transaction against the provider (P4.4).
  const verifiedRef = useRef(false);
  useEffect(() => {
    if (verifiedRef.current || !txs$.data || !uid) return;
    if (!new URLSearchParams(window.location.search).has("payment")) return;
    verifiedRef.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    const mine = txs$.data.filter((t) => t.userId === uid && t.status === "pending").sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    if (!mine[0]) return;
    premiumAPI
      .verifyTransaction(mine[0].id)
      .then((res) => {
        const status = unwrap(res)?.status;
        if (status === "success") toast.success("Payment received");
        else if (status === "failed") toast.error("Payment didn't go through");
        else toast.message("Payment is still processing — this page will update.");
      })
      .catch(() => {})
      .finally(() => { plan$.reload(); members$.reload(); txs$.reload(); });
  }, [txs$.data, uid]); // eslint-disable-line react-hooks/exhaustive-deps
  const reloadPlan = plan$.reload;
  const reloadMembers = members$.reload;
  const reloadTxs = txs$.reload;
  const refresh = useCallback(() => {
    reloadPlan();
    reloadMembers();
    reloadTxs();
  }, [reloadPlan, reloadMembers, reloadTxs]);

  if (plan$.error) {
    return (
      <PageFrame title="Plan">
        <Reveal><EmptyState title="You don't have access to this plan" text="Ask the organiser for an invite link." /></Reveal>
      </PageFrame>
    );
  }
  if (!plan) {
    return (
      <PageFrame>
        <Skeleton className="h-4 w-24" /><Skeleton className="mt-3 h-12 w-2/3" /><Skeleton className="mt-4 h-4 w-1/2" /><Skeleton className="mt-12 h-40 w-full rounded-2xl" />
      </PageFrame>
    );
  }

  const progress = fraction(plan.currentBalance, plan.targetAmount);
  const currency = plan.currency || "KES";
  const memberCount = plan.membersCount ?? members$.data?.length ?? 0;
  const meta = [planTypeLabel(plan), plan.category, date(plan.targetDate) ? `${date(plan.targetDate)} · ${relative(plan.targetDate)}` : null, plural(memberCount, "member")].filter(Boolean).join(" · ");
  const priceLabel = item$.data?.listedPrice ? money(item$.data.listedPrice, item$.data.currency || currency) : null;
  const primaryLabel = pooled ? "Contribute" : premiumUnpaid ? (priceLabel ? `Pay ${priceLabel}` : "Pay") : null;

  return (
    <PageFrame
      onRefresh={refresh}
      eyebrow={<span className="inline-flex items-center gap-2">Plan <Tag tone={STATUS_TONE[plan.status] ?? "neutral"}>{plan.status || "active"}</Tag></span>}
      title={plan.name}
      meta={meta}
    >
      <Reveal className="mb-10 flex items-center gap-6">
        {pooled && Number(plan.targetAmount) > 0 ? (
          <>
            <Ring value={progress} size={88} stroke={8} />
            <div>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{money(plan.currentBalance, currency)}</p>
              <p className="text-sm text-gray-500">of {money(plan.targetAmount, currency)} · {Math.round(progress * 100)}%</p>
            </div>
          </>
        ) : pooled ? (
          // Pooling without a target: show what's in, and let the owner set one rather than drawing an empty ring.
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{money(plan.currentBalance, currency)} <span className="text-base font-normal text-gray-500">pooled</span></p>
            <p className="text-sm text-gray-500">
              No target set.{" "}
              {isOwner && (
                <button type="button" onClick={() => setSheet("edit")} className="font-medium text-purple-600 hover:text-purple-700">Set a target</button>
              )}
            </p>
          </div>
        ) : plan.planType === "premium" ? (
          <div>
            <p className="text-2xl font-semibold tracking-tight">{me?.paymentStatus === "paid" ? "You're paid up" : "Payment due"}</p>
            <p className="text-sm text-gray-500">{priceLabel ? `${priceLabel} per person` : "Listed price per person"}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">This plan coordinates without collecting money.</p>
        )}
      </Reveal>

      <Reveal className="mb-12 flex flex-col gap-3 sm:flex-row">
        {primaryLabel && (
          <div className="sm:w-56"><StickyAction><PrimaryButton type="button" onClick={() => setSheet("pay")}>{primaryLabel}</PrimaryButton></StickyAction></div>
        )}
        <OutlineButton onClick={() => setSheet("invite")} className="sm:w-48"><Share2 className="h-4 w-4" aria-hidden="true" /> Invite</OutlineButton>
        {isOwner && <OutlineButton onClick={() => setSheet("edit")} className="sm:w-40"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</OutlineButton>}
      </Reveal>

      <Section title="Members">
        {members$.loading && !members$.data ? <Skeleton className="h-16 w-full rounded-2xl" /> : (members$.data ?? []).length === 0 ? (
          <EmptyState title="Just you so far" text="Invite your group to get started." />
        ) : (
          <ListGroup>
            {members$.data.map((m) => (
              <Row
                key={m.userId || m.id}
                leading={<Avatar name={m.displayName || m.username || ""} size={36} />}
                title={m.displayName || (m.username ? `@${m.username}` : "Member")}
                footnote={m.role === "owner" ? "Organiser" : COMMITMENT[m.commitmentStatus]}
                trailing={plan.planType === "premium" && !pooled ? <Tag tone={m.paymentStatus === "paid" ? "success" : "warning"}>{m.paymentStatus || "unpaid"}</Tag> : undefined}
                chevron={false}
              />
            ))}
          </ListGroup>
        )}
      </Section>

      <Section
        title="Resources"
        className="mt-10"
        action={(isOwner || me) ? <button type="button" onClick={() => setSheet("resource")} className="py-2 text-sm font-medium text-purple-600 hover:text-purple-700">Add link</button> : null}
      >
        {(plan.resources ?? []).filter((r) => !r.removedAt).length === 0 ? <p className="text-sm text-gray-400">No links yet.</p> : (
          <ListGroup>
            {plan.resources.filter((r) => !r.removedAt).map((r) => (
              <Row
                key={r.id || r.url}
                href={r.url}
                leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Link2 className="h-4 w-4" /></span>}
                title={r.title || r.url}
                footnote={r.url}
                trailing={isOwner ? <RemoveResource planId={plan.id} resource={r} onDone={refresh} /> : undefined}
              />
            ))}
          </ListGroup>
        )}
      </Section>

      <Section title="Activity" className="mt-10">
        {txs$.loading && !txs$.data ? <Skeleton className="h-16 w-full rounded-2xl" /> : (txs$.data ?? []).length === 0 ? <p className="text-sm text-gray-400">No activity yet.</p> : (
          <ListGroup>
            {[...txs$.data].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt)).slice(0, 20).map((tx) => (
              <Row
                key={tx.id}
                title={`${TX_LABEL[tx.type] || tx.type} · ${money(tx.amount, tx.currency || currency)}`}
                footnote={`${tx.provider === "daraja" ? "M-Pesa" : "Card"} · ${dateTime(tx.processedAt || tx.createdAt)}`}
                trailing={<Tag tone={TX_TONE[tx.status] ?? "neutral"}>{tx.status}</Tag>}
                chevron={false}
              />
            ))}
          </ListGroup>
        )}
      </Section>

      {plan.description && <Section title="About" className="mt-10"><p className="text-[15px] leading-relaxed text-gray-600">{plan.description}</p></Section>}

      <PaySheet open={sheet === "pay"} onClose={() => setSheet(null)} plan={plan} pooled={pooled} item={item$.data} onSettled={refresh} />
      <InviteSheet open={sheet === "invite"} onClose={() => setSheet(null)} planId={plan.id} />
      {isOwner && <EditSheet open={sheet === "edit"} onClose={() => setSheet(null)} plan={plan} onSaved={refresh} />}
      <ResourceSheet open={sheet === "resource"} onClose={() => setSheet(null)} planId={plan.id} onSaved={refresh} />
    </PageFrame>
  );
}

function RemoveResource({ planId, resource, onDone }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async (e) => {
        e.preventDefault(); e.stopPropagation(); setBusy(true);
        try { await plansAPI.removeResource(planId, resource.id); toast.success("Link removed"); onDone(); }
        catch (err) { toast.error(err.message || "Couldn't remove link"); }
        finally { setBusy(false); }
      }}
      className="py-2 text-[13px] text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      Remove
    </button>
  );
}

/* ---------------- Pay / Contribute ---------------- */
function PaySheet({ open, onClose, plan, pooled, item, onSettled }) {
  // Payment rail follows the plan type (D-017): self-managed → M-Pesa, curated → card via Paystack.
  const method = plan.planType === "premium" ? "paystack" : "mpesa";
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null); // { txId }
  const [result, setResult] = useState(null);   // "success" | "failed" | "timeout"
  const polls = useRef(0);
  const currency = item?.currency || plan.currency || "KES";
  const fixed = !pooled ? Number(item?.listedPrice) || null : null;

  useEffect(() => {
    if (!open) { setError(""); setBusy(false); setPending(null); setResult(null); polls.current = 0; }
  }, [open]);

  // Poll the plan ledger until our transaction settles (interim for onSnapshot — D-013).
  useEffect(() => {
    if (!pending?.txId) return undefined;
    const t = setInterval(async () => {
      polls.current += 1;
      try {
        const list = asList(unwrap(await plansAPI.getPlanTransactions(plan.id)));
        const tx = list.find((x) => x.id === pending.txId);
        debugLog("plan/pay", "poll", { n: polls.current, status: tx?.status });
        if (tx?.status === "success") { setResult("success"); setPending(null); onSettled(); return; }
        if (tx?.status === "failed") { setResult("failed"); setPending(null); return; }
      } catch { /* keep polling */ }
      if (polls.current >= POLL_MAX) { setResult("timeout"); setPending(null); }
    }, POLL_MS);
    return () => clearInterval(t);
  }, [pending, plan.id, onSettled]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const amt = fixed ?? Number(amount);
    if (!fixed && !(amt > 0)) return setError("Enter an amount greater than zero.");
    let msisdn = null;
    if (method === "mpesa") {
      msisdn = normalizePhone(phone);
      if (!msisdn) return setError("Enter a Kenyan mobile number, e.g. 0712 345 678.");
    }
    setBusy(true);
    auditAPI.emit({ action: "ui.checkout_opened", entity: "plan", entityId: plan.id, planId: plan.id, meta: { method, pooled } });
    try {
      if (method === "paystack") {
        const res = pooled ? await premiumAPI.contributePaystack(plan.id, { amount: amt, currency }) : await premiumAPI.joinPaystack(plan.id, currency);
        const url = res?.data?.authorizationUrl || res?.data?.authorization_url || res?.authorizationUrl;
        if (!url) throw new Error("Couldn't open checkout. Try again.");
        window.location.href = url;
        return;
      }
      const res = pooled ? await premiumAPI.contribute(plan.id, { amount: amt, phone: msisdn }) : await premiumAPI.joinMpesa(plan.id, msisdn);
      const txId = res?.data?.txId || res?.data?.transactionId || null;
      polls.current = 0;
      setPending({ txId });
      if (!txId) toast.message("Check your phone for the M-Pesa prompt.");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const waiting = !!pending;
  const showForm = !waiting && !result;

  return (
    <Sheet open={open} onClose={onClose} title={showForm ? (pooled ? "Contribute" : "Pay your share") : undefined}>
      {result === "success" ? (
        <div className="flex flex-col items-start gap-4">
          <SuccessMark />
          <div>
            <h3 className="text-[17px] font-semibold tracking-tight">{pooled ? "Contribution received" : "You're in"}</h3>
            <p className="mt-1 text-sm text-gray-500">The plan has been updated.</p>
          </div>
          <PrimaryButton type="button" onClick={onClose}>Done</PrimaryButton>
        </div>
      ) : !showForm ? (
        <div className="space-y-4">
          <h3 className="text-[17px] font-semibold tracking-tight">{waiting ? "Check your phone" : result === "failed" ? "Payment didn't go through" : "Still waiting"}</h3>
          <p className="text-sm text-gray-500">
            {waiting ? "Enter your M-Pesa PIN on the prompt. This updates automatically."
              : result === "failed" ? "The M-Pesa request was declined or cancelled. You can try again."
              : "We haven't heard back yet. It's safe to close this — the plan will update once the payment lands."}
          </p>
          {waiting && <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100"><div className="h-full w-1/3 animate-pulse rounded-full bg-purple-600" /></div>}
          <div className="flex gap-3">
            {!waiting && <OutlineButton onClick={() => { setResult(null); setPending(null); }}>Try again</OutlineButton>}
            <PrimaryButton type="button" onClick={onClose}>{waiting ? "I'll wait on the plan" : "Close"}</PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FieldGroup>
            {fixed ? (
              <div className="flex h-14 items-center justify-between px-4"><span className="text-[15px] text-gray-500">Your share</span><span className="text-[15px] font-semibold tabular-nums">{money(fixed, currency)}</span></div>
            ) : (
              <Field id="amount" label="Amount" type="number" inputMode="decimal" min={1} step="1" prefix={currency} value={amount} onChange={(e) => setAmount(e.target.value)} autoComplete="off" />
            )}
            {method === "mpesa" && <Field id="phone" label="M-Pesa number" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />}
          </FieldGroup>
          <FormError>{error}</FormError>
          <PrimaryButton loading={busy}>{method === "mpesa" ? "Send M-Pesa prompt" : "Continue to card payment"}</PrimaryButton>
          <p className="text-xs text-gray-400">{method === "mpesa" ? "Self-managed plans take M-Pesa. You'll get a prompt on your phone to approve." : "Curated plans take card payments. You'll be taken to a secure checkout and brought back here."}</p>
        </form>
      )}
    </Sheet>
  );
}

/* ---------------- Invite ---------------- */
function InviteSheet({ open, onClose, planId }) {
  const [state, setState] = useState({ loading: false, code: null, error: "" });
  useEffect(() => {
    if (!open) return;
    setState({ loading: true, code: null, error: "" });
    plansAPI.generateInvite(planId)
      .then((res) => setState({ loading: false, code: unwrap(res)?.inviteCode || null, error: "" }))
      .catch((e) => setState({ loading: false, code: null, error: e.message || "Couldn't create an invite link." }));
  }, [open, planId]);

  const url = state.code && typeof window !== "undefined" ? `${window.location.origin}/invite/${state.code}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast.error("Couldn't copy — select the link instead."); } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: "Join my plan on GrupChat", url }); } catch { /* cancelled */ } } else copy(); };

  return (
    <Sheet open={open} onClose={onClose} title="Invite your group">
      {state.loading ? <Skeleton className="h-14 w-full" /> : state.error ? <FormError>{state.error}</FormError> : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Anyone with this link can see the plan name and ask to join.</p>
          <div className="flex h-14 items-center gap-3 rounded-xl border border-black/[0.12] px-4">
            <Link2 className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[15px] tabular-nums">{url}</span>
            <button type="button" onClick={copy} aria-label="Copy link" className="rounded-md p-2.5 text-gray-400 hover:text-black"><Copy className="h-[18px] w-[18px]" /></button>
          </div>
          <PrimaryButton type="button" onClick={share}><Share2 className="h-4 w-4" aria-hidden="true" /> Share link</PrimaryButton>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Edit (owner) ---------------- */
function EditSheet({ open, onClose, plan, onSaved }) {
  const [name, setName] = useState(plan.name || "");
  const [description, setDescription] = useState(plan.description || "");
  const [target, setTarget] = useState(plan.targetAmount ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setName(plan.name || ""); setDescription(plan.description || ""); setTarget(plan.targetAmount ?? ""); setError(""); } }, [open, plan]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Give the plan a name.");
    setBusy(true);
    try {
      const patch = { name: name.trim(), description: description.trim() };
      if (isPooled(plan)) patch.targetAmount = Number(target) || null;
      await plansAPI.updatePlan(plan.id, patch);
      toast.success("Plan updated"); onSaved(); onClose();
    } catch (err) { setError(err.message || "Couldn't save changes."); } finally { setBusy(false); }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Edit plan">
      <form onSubmit={submit} className="space-y-4">
        <FieldGroup>
          <Field id="edit-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          <TextAreaField id="edit-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          {isPooled(plan) && <Field id="edit-target" label="Target amount" type="number" inputMode="decimal" min={0} step="1" prefix={plan.currency || "KES"} value={target} onChange={(e) => setTarget(e.target.value)} required={false} autoComplete="off" />}
        </FieldGroup>
        <FormError>{error}</FormError>
        <PrimaryButton loading={busy}>Save</PrimaryButton>
      </form>
    </Sheet>
  );
}

/* ---------------- Add resource ---------------- */
function ResourceSheet({ open, onClose, planId, onSaved }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setTitle(""); setUrl(""); setError(""); } }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    let href = url.trim();
    if (href && !/^https?:\/\//i.test(href)) href = `https://${href}`;
    let parsed;
    try { parsed = new URL(href); } catch { return setError("Enter a valid link."); }
    setBusy(true);
    try {
      await plansAPI.addResource(planId, { title: title.trim() || parsed.hostname, url: href, type: "link" });
      toast.success("Link added"); onSaved(); onClose();
    } catch (err) { setError(err.message || "Couldn't add the link."); } finally { setBusy(false); }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add a link">
      <form onSubmit={submit} className="space-y-4">
        <FieldGroup>
          <Field id="res-url" label="Link" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} autoComplete="off" />
          <Field id="res-title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} required={false} autoComplete="off" />
        </FieldGroup>
        <FormError>{error}</FormError>
        <PrimaryButton loading={busy}>Add</PrimaryButton>
      </form>
    </Sheet>
  );
}
