"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Segmented } from "@/components/ui/Segmented";
import { StatCard } from "@/components/home/Charts";
import { EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { Field, FieldGroup, FormError, OutlineButton } from "@/components/ui/Form";
import { ShowMore } from "@/components/ui/ShowMore";
import { ledgerAPI } from "@/lib/api";
import { dateTime, money, relative } from "@/lib/format";
import { unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

const KINDS = [
  { value: "", label: "All" },
  { value: "contribution", label: "Contributions" },
  { value: "premium-join", label: "Payments" },
  { value: "payout", label: "Payouts" },
  { value: "fee", label: "Fees" },
  { value: "adjustment", label: "Adjustments" },
];
const KIND_TONE = { contribution: "success", "premium-join": "success", payout: "warning", fee: "neutral", adjustment: "critical" };

export default function AdminLedger() {
  const { isAdmin, profileLoading } = useAuth();
  const [kind, setKind] = useState("");
  const [planId, setPlanId] = useState("");
  const [applied, setApplied] = useState({});
  const [extra, setExtra] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [moreLoading, setMoreLoading] = useState(false);
  const [check, setCheck] = useState(null);

  const { data, loading, error } = useAsync(
    async () => unwrap(await ledgerAPI.list({ kind, limit: 50, ...applied })),
    [kind, applied],
    { enabled: isAdmin },
  );
  useEffect(() => { setExtra([]); setCursor(data?.nextCursor ?? null); }, [data]);

  const entries = useMemo(() => [...(data?.entries ?? []), ...extra], [data, extra]);
  const totals = useMemo(() => {
    const t = { credit: 0, debit: 0 };
    for (const e of entries) t[e.direction === "debit" ? "debit" : "credit"] += Number(e.amount) || 0;
    return t;
  }, [entries]);

  const loadMore = async () => {
    if (!cursor) return;
    setMoreLoading(true);
    try {
      const page = unwrap(await ledgerAPI.list({ kind, limit: 50, ...applied, before: cursor }));
      setExtra((x) => [...x, ...(page?.entries ?? [])]);
      setCursor(page?.nextCursor ?? null);
    } finally {
      setMoreLoading(false);
    }
  };

  const verify = async () => {
    if (!applied.planId) return;
    try {
      const r = unwrap(await ledgerAPI.verify(applied.planId));
      setCheck(r);
      toast[r.balanced ? "success" : "error"](r.balanced ? "Ledger matches the plan balance" : `Drift of ${money(r.drift, r.currency)}`);
    } catch (e) {
      toast.error(e.message || "Couldn't verify");
    }
  };

  if (!isAdmin) return <PageFrame eyebrow="Admin" title="Ledger"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;

  const currency = entries[0]?.currency || "KES";

  return (
    <PageFrame eyebrow={<Link href="/admin" className="text-purple-600 hover:text-purple-700">Admin</Link>} title="Ledger" meta="Append-only. Written only when money actually moves." wide>
      <Reveal className="mb-6 space-y-4">
        <Segmented name="ledger-kind" value={kind} onChange={setKind} options={KINDS} />
        <form onSubmit={(e) => { e.preventDefault(); setCheck(null); setApplied(planId.trim() ? { planId: planId.trim() } : {}); }} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <FieldGroup><Field id="l-plan" label="Plan id" value={planId} onChange={(e) => setPlanId(e.target.value)} required={false} autoComplete="off" /></FieldGroup>
          <OutlineButton type="submit" className="h-14 sm:w-28">Apply</OutlineButton>
          <OutlineButton onClick={verify} disabled={!applied.planId} className="h-14 sm:w-40">Verify balance</OutlineButton>
        </form>
      </Reveal>

      <Reveal className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Credited (loaded)" value={money(totals.credit, currency)} sub={`${entries.length} entries`} />
        <StatCard label="Debited (loaded)" value={money(totals.debit, currency)} />
        <StatCard
          label="Balance check"
          value={check ? (check.balanced ? "Balanced" : money(check.drift, check.currency)) : "—"}
          sub={check ? `ledger ${money(check.ledgerBalance, check.currency)} · plan ${money(check.planBalance, check.currency)}` : "Filter by a plan, then verify"}
        />
      </Reveal>

      <Reveal>
        {error && <FormError>{error.message || "Couldn't load the ledger."}</FormError>}
        {loading && !data ? <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}</div> : entries.length === 0 ? (
          <EmptyState title="No entries" text={applied.planId ? "This plan has no money movements yet." : "Nothing has moved yet."} />
        ) : (
          <ListGroup>
            {entries.map((e) => (
              <Row
                key={e.id}
                leading={<Tag tone={KIND_TONE[e.kind] ?? "neutral"}>{e.kind}</Tag>}
                title={<span className="tabular-nums">{e.direction === "debit" ? "−" : "+"}{money(e.amount, e.currency)} <span className="text-[13px] font-normal text-gray-500">→ {e.account}</span></span>}
                footnote={[e.provider ? `${e.provider}${e.providerRef ? ` · ${e.providerRef}` : ""}` : null, e.planId ? `plan ${String(e.planId).slice(0, 8)}` : null, e.balanceAfter != null ? `balance ${money(e.balanceAfter, e.currency)}` : null, e.source].filter(Boolean).join(" · ")}
                trailing={<span title={dateTime(e.at)}>{relative(e.at)}</span>}
                chevron={false}
              />
            ))}
          </ListGroup>
        )}
        <ShowMore onClick={loadMore} loading={moreLoading} hasMore={!!cursor} />
      </Reveal>
    </PageFrame>
  );
}
