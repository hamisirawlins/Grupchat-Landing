"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { Button, Card, EmptyState, Helper, Kicker, Skeleton, StatTile, StatusTag, TextField } from "@/components/kit";
import { Bars, Sparkline } from "@/components/home/Charts";
import { Segmented } from "@/components/ui/Segmented";
import { quickPoolAdminAPI, kes, kesShort } from "@/lib/quickPool";
import { relative } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";

const change = (now, before) => {
  if (!before) return now ? "new this week" : "no change";
  const pct = Math.round(((now - before) / before) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% on the week before`;
};

function Series({ title, values, kind = "bars", foot }) {
  return (
    <div className="flex flex-col gap-2 rounded-tile bg-soft px-5 py-4">
      <span className="text-[13px] font-semibold text-ink-2">{title}</span>
      {values.some(Boolean) ? (kind === "line" ? <Sparkline values={values.length > 1 ? values : [0, ...values]} height={56} /> : <Bars values={values} height={56} />) : <span className="flex h-14 items-center text-[13px] text-ink-3">Nothing yet</span>}
      {foot && <span className="text-[12px] text-ink-3">{foot}</span>}
    </div>
  );
}

function Review() {
  const { data, loading, reload } = useAsync(() => quickPoolAdminAPI.review(), []);
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    setBusy(true);
    try {
      await quickPoolAdminAPI.refreshReview();
      toast.success("Review refreshed");
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const r = data?.review;
  return (
    <Card title="The week, read" sub={data ? `${data.trigger === "weekly" ? "Monday review" : "Refreshed"} ${relative(data.createdAt)}${data.source === "model" ? ` · ${data.model}` : " · written from the totals by template"}` : "Weekly on Mondays from the totals only"}
      action={<Button size="sm" variant="secondary" onClick={refresh} loading={busy}><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh</Button>}>
      {loading && !data ? <Skeleton className="h-24 w-full" /> : !r ? (
        <p className="text-[15px] text-ink-2">No review yet. The first one runs on Monday, or refresh it now (once a day).</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[16px] leading-6 text-ink">{r.summary}</p>
          {[["What went well", r.highlights], ["Watch", r.risks], ["Next", r.actions]].map(([label, items]) => items?.length ? (
            <div key={label} className="flex flex-col gap-1.5">
              <Kicker>{label}</Kicker>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px] text-ink-2">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          ) : null)}
        </div>
      )}
      <p className="text-[11px] text-ink-3">Written from totals only: no member's name, number or email reaches the model. At most one manual refresh a day.</p>
    </Card>
  );
}

function Flags() {
  const { data, loading, error, reload } = useAsync(() => quickPoolAdminAPI.flags(), []);
  const [assign, setAssign] = useState({});
  const [busy, setBusy] = useState(null);
  const act = async (key, fn, ok) => {
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };
  if (loading && !data) return <Skeleton className="h-40 w-full rounded-card" />;
  if (error) return <EmptyState title="Couldn't load the flags" text={error.message} />;
  const { overCap = [], overLimit = [], unmatched = [] } = data || {};
  return (
    <Card title="Quick Pool flags" sub="Money is never refused; these need a person.">
      {!overCap.length && !overLimit.length && !unmatched.length && <p className="text-[15px] text-ink-2">Nothing flagged.</p>}
      {overCap.length > 0 && (
        <div className="flex flex-col gap-2">
          <Kicker>Over their cap</Kicker>
          {overCap.map((p) => (
            <div key={p.planId} className="flex flex-col gap-1 rounded-2xl bg-soft px-4 py-3">
              <span className="text-[15px] font-bold text-ink">{p.name}</span>
              <span className="tabular text-[13px] text-ink-2">{kes(p.collected)} collected · cap {kes(p.cap)} · {kes(p.balance)} in the pool</span>
              <span className="text-[12px] text-ink-3">A withdrawal from it needs "allow beyond the cap" on Withdrawals.</span>
            </div>
          ))}
        </div>
      )}
      {overLimit.length > 0 && (
        <div className="flex flex-col gap-2">
          <Kicker>Paid with no seat (refund in full)</Kicker>
          {overLimit.map((m) => (
            <div key={m.memberKey} className="flex flex-col gap-2 rounded-2xl bg-soft px-4 py-3 sm:flex-row sm:items-center">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-ink">{m.planName || m.planId}</span>
                <span className="tabular block text-[13px] text-ink-2">{kes(m.totalPaid - m.refunded)} from {m.phone}{m.refundPending ? ` · ${kes(m.refundPending)} refund in progress` : ""}{m.hasAccount ? " · has an account" : ""}</span>
              </span>
              {m.totalPaid - m.refunded - m.refundPending > 0 && (
                <Button size="sm" variant="secondary" loading={busy === m.memberKey} onClick={() => act(m.memberKey, () => quickPoolAdminAPI.refundMember(m.memberKey), "Refund opened: approve it on Withdrawals")}>Open refund</Button>
              )}
            </div>
          ))}
        </div>
      )}
      {unmatched.length > 0 && (
        <div className="flex flex-col gap-2">
          <Kicker>Paybill payments that matched no pool</Kicker>
          {unmatched.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 rounded-2xl bg-soft px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tabular text-[15px] font-bold text-ink">{u.amount != null ? kes(u.amount) : "—"}</span>
                <span className="font-mono text-[13px] text-ink-2">{u.ref}</span>
                <span className="font-mono text-[12px] text-ink-3">{u.transId}</span>
                <StatusTag status={u.status === "noted" ? "draft" : "fix"}>{u.status === "noted" ? "Near miss" : "Unmatched"}</StatusTag>
                <span className="text-[12px] text-ink-3">{relative(u.createdAt)}</span>
              </div>
              {u.status === "open" && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <TextField id={`as-${u.id}`} label="Member's account number" className="flex-1" value={assign[u.id] || ""} onChange={(e) => setAssign((a) => ({ ...a, [u.id]: e.target.value.toUpperCase() }))} placeholder="8 characters" />
                  <Button loading={busy === `as${u.id}`} onClick={() => act(`as${u.id}`, () => quickPoolAdminAPI.resolveUnmatched(u.id, { action: "assign", accountCode: assign[u.id] }), "Booked to the member")}>Book it</Button>
                  <Button variant="quiet" loading={busy === `rf${u.id}`} onClick={() => act(`rf${u.id}`, () => quickPoolAdminAPI.resolveUnmatched(u.id, { action: "refunded", note: "Refunded from the M-Pesa portal" }), "Marked refunded")}>I refunded it</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CreatorCap() {
  const [uid, setUid] = useState("");
  const [info, setInfo] = useState(null);
  const [cap, setCap] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const look = async () => {
    setBusy("look"); setError("");
    try { setInfo(await quickPoolAdminAPI.capEligibility(uid.trim())); } catch (e) { setError(e.message); } finally { setBusy(null); }
  };
  const save = async () => {
    setBusy("save"); setError("");
    try { setInfo(await quickPoolAdminAPI.setCap(uid.trim(), { cap: Number(cap) })); toast.success("Cap set"); } catch (e) { setError(e.message); } finally { setBusy(null); }
  };
  const c = info?.checks;
  return (
    <Card title="A creator's cap" sub="Every pool is capped at KES 1,000,000. A custom cap needs 90 days, 3 completed pools and more than KES 1M pooled.">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <TextField id="cap-uid" label="Creator's user id" className="flex-1" value={uid} onChange={(e) => setUid(e.target.value)} />
        <Button variant="secondary" onClick={look} loading={busy === "look"} disabled={!uid.trim()}>Check</Button>
      </div>
      {c && (
        <div className="flex flex-col gap-2 text-[15px]">
          <span className={c.accountOk ? "text-success" : "text-ink-2"}>{c.accountOk ? "✓" : "✗"} {c.accountDays ?? "?"} days on GrupChat</span>
          <span className={c.completedOk ? "text-success" : "text-ink-2"}>{c.completedOk ? "✓" : "✗"} {c.completedPools} completed pools</span>
          <span className={c.pooledOk ? "text-success" : "text-ink-2"}>{c.pooledOk ? "✓" : "✗"} {kes(c.pooledKes)} pooled</span>
          <span className="text-ink">Current cap: {kes(info.cap)}{info.custom ? " (custom)" : ""}</span>
          {info.eligible && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <TextField id="cap-new" label="New cap" prefix="KES" inputMode="numeric" className="flex-1" value={cap} onChange={(e) => setCap(e.target.value.replace(/[^\d]/g, ""))} />
              <Button onClick={save} loading={busy === "save"} disabled={!cap}>Set cap</Button>
            </div>
          )}
        </div>
      )}
      <Helper error={error} />
    </Card>
  );
}

/** Admin insights (KB 2b, D-055): the whole system's totals, a weekly AI reading of them, and the Quick Pool flags. */
export default function AdminInsights() {
  const { isAdmin, profileLoading } = useAuth();
  const [days, setDays] = useState(30);
  const { data: m, loading, error, reload } = useAsync(() => quickPoolAdminAPI.system(days), [days, isAdmin], { enabled: isAdmin });

  if (!isAdmin) {
    return <PageFrame eyebrow="Admin" title="Insights"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;
  }
  const s = m?.series || [];
  const col = (k) => s.map((r) => r[k]);
  return (
    <PageFrame eyebrow="Admin" title="Insights" meta={m ? `${m.from} to ${m.to}${m.truncated?.length ? ` · partial: ${m.truncated.join(", ")}` : ""}` : "The whole system, from totals."} onRefresh={reload} wide>
      <Reveal className="mb-6"><Segmented name="days" value={days} onChange={setDays} options={[{ value: 7, label: "7 days" }, { value: 30, label: "30 days" }, { value: 90, label: "90 days" }]} /></Reveal>
      {error && <Reveal><EmptyState title="Couldn't load insights" text={error.message} /></Reveal>}
      {loading && !m ? (
        <Reveal className="grid gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-tile" />)}</Reveal>
      ) : m ? (
        <>
          <Reveal className="grid gap-3 sm:grid-cols-4">
            <StatTile label="Money in" value={kesShort(m.totals.moneyIn)} sub={change(m.last7.moneyIn, m.previous7.moneyIn)} />
            <StatTile label="Money out" value={kesShort(m.totals.moneyOut)} sub={`${kesShort(m.totals.fees)} in fees · ${kesShort(m.totals.refunds)} refunded`} />
            <StatTile label="Payments that worked" value={m.totals.successRate == null ? "—" : `${m.totals.successRate}%`} sub={`${m.totals.paymentsOk} of ${m.totals.paymentsOk + m.totals.paymentsFailed}`} />
            <StatTile label="Sign-ups" value={m.totals.signups} sub={change(m.last7.signups, m.previous7.signups)} />
            <StatTile label="Quick Pools open" value={m.quickPools.active} sub={`${m.quickPools.created} started · ${kesShort(m.quickPools.inByChannel?.paybill || 0)} by paybill`} />
            <StatTile label="Plans started" value={m.totals.plans} sub={Object.entries(m.plansByType).map(([k, v]) => `${v} ${k}`).join(" · ") || "—"} />
            <StatTile label="Waiting to pay out" value={m.payoutsInFlight.approval + m.payoutsInFlight.creator} sub={`${m.payoutsInFlight.approval} with admins · ${m.payoutsInFlight.creator} with creators · ${m.payoutsInFlight.review} in review`} />
            <StatTile label="AI spend" value={m.totals.aiUsd > 0 && m.totals.aiUsd < 0.01 ? "<$0.01" : `$${m.totals.aiUsd.toFixed(2)}`} sub={`${Object.values(m.ai).reduce((n, j) => n + j.runs, 0)} runs${m.aiConfigured ? "" : " · not switched on"}`} />
          </Reveal>
          <Reveal className="mt-6 grid gap-3 sm:grid-cols-2">
            <Series title="Money in per day" values={col("moneyIn")} foot={`${kes(m.last7.moneyIn)} in the last 7 days`} />
            <Series title="Money out per day" values={col("moneyOut").map((v, i) => v + s[i].refunds)} foot="Withdrawals and refunds" />
            <Series title="Payments that failed per day" values={col("paymentsFailed")} kind="line" />
            <Series title="Sign-ups per day" values={col("signups")} kind="line" />
          </Reveal>
          <Reveal className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatTile label="Pools over their cap" value={m.flags.overCapPools} />
            <StatTile label="Payments with no seat" value={m.flags.overLimitMembers} />
            <StatTile label="Unmatched paybill" value={m.flags.unmatchedPayments} />
          </Reveal>
        </>
      ) : null}
      <Reveal className="mt-8"><Review /></Reveal>
      <Reveal className="mt-6"><Flags /></Reveal>
      <Reveal className="mt-6"><CreatorCap /></Reveal>
      <Reveal className="mt-6 flex items-center gap-2 text-[12px] text-ink-3"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI limits: pool insights {m?.aiLimits?.poolInsights?.runsPerDay ?? "—"} runs a day, USD {m?.aiLimits?.poolInsights?.usdPerDay ?? "—"}; the review {m?.aiLimits?.adminReview?.runsPerDay ?? "—"} a day, USD {m?.aiLimits?.adminReview?.usdPerDay ?? "—"}.</Reveal>
    </PageFrame>
  );
}
