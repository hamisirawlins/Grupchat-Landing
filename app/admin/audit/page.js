"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Segmented } from "@/components/ui/Segmented";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { ShowMore } from "@/components/ui/ShowMore";
import { Field, FieldGroup, FormError, OutlineButton, SelectField } from "@/components/ui/Form";
import { auditAPI } from "@/lib/api";
import { dateTime, relative } from "@/lib/format";
import { unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

const SOURCE_TONE = { server: "neutral", public: "warning", client: "accent" };
const ACTION_TONE = (a) => (a.startsWith("payment.") || a.startsWith("payout.") ? "success" : a.startsWith("invite.") ? "accent" : "neutral");

export default function AdminAudit() {
  const { isAdmin, profileLoading } = useAuth();
  const [source, setSource] = useState("");
  const [action, setAction] = useState("");
  const [planId, setPlanId] = useState("");
  const [since, setSince] = useState("");
  const [applied, setApplied] = useState({});
  const [selected, setSelected] = useState(null);

  const { data, loading, error, reload } = useAsync(
    async () => unwrap(await auditAPI.list({ source, limit: 50, ...applied })),
    [source, applied],
    { enabled: isAdmin },
  );
  const [extra, setExtra] = useState([]);   // pages appended after the first
  const [cursor, setCursor] = useState(null);
  const [moreLoading, setMoreLoading] = useState(false);
  useEffect(() => { setExtra([]); setCursor(data?.nextCursor ?? null); }, [data]);
  const loadMore = async () => {
    if (!cursor) return;
    setMoreLoading(true);
    try {
      const page = unwrap(await auditAPI.list({ source, limit: 50, ...applied, before: cursor }));
      setExtra((x) => [...x, ...(page?.events ?? [])]);
      setCursor(page?.nextCursor ?? null);
    } finally {
      setMoreLoading(false);
    }
  };

  const actions = useMemo(() => {
    const a = data?.actions;
    return a ? [...a.server, ...a.public, ...a.client] : [];
  }, [data]);

  if (!isAdmin) {
    return <PageFrame eyebrow="Admin" title="Audit trail"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;
  }

  const events = [...(data?.events ?? []), ...extra];

  return (
    <PageFrame eyebrow={<Link href="/admin" className="text-purple-600 hover:text-purple-700">Admin</Link>} onRefresh={reload} title="Audit trail" meta={data ? `${data.matched} matched · ${data.scanned} scanned${data.truncated ? " · within the latest 500" : ""}` : undefined} wide>
      <Reveal className="mb-6 space-y-4">
        <Segmented name="audit-source" value={source} onChange={setSource} options={[{ value: "", label: "All" }, { value: "server", label: "Server" }, { value: "public", label: "Public" }, { value: "client", label: "Client" }]} />
        <form onSubmit={(e) => { e.preventDefault(); setApplied({ action, planId: planId.trim(), since }); }} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <FieldGroup><SelectField id="f-action" label="Action" value={action} onChange={(e) => setAction(e.target.value)} required={false} options={[{ value: "", label: "Any" }, ...actions.map((a) => ({ value: a, label: a }))]} /></FieldGroup>
          <FieldGroup><Field id="f-plan" label="Plan id" value={planId} onChange={(e) => setPlanId(e.target.value)} required={false} autoComplete="off" /></FieldGroup>
          <FieldGroup><Field id="f-since" label="Since" type="date" value={since} onChange={(e) => setSince(e.target.value)} required={false} /></FieldGroup>
          <OutlineButton type="submit" className="h-14 sm:w-28">Apply</OutlineButton>
        </form>
      </Reveal>

      <Reveal>
        {error && <FormError>{error.message || "Couldn't load audit events."}</FormError>}
        {loading && !data ? <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}</div> : events.length === 0 ? (
          <EmptyState title="No events match" action={<OutlineButton onClick={() => { setSource(""); setAction(""); setPlanId(""); setSince(""); setApplied({}); reload(); }} className="sm:w-40">Clear filters</OutlineButton>} />
        ) : (
          <ListGroup>
            {events.map((e) => (
              <Row
                key={e.id}
                onClick={() => setSelected(e)}
                leading={<Tag tone={SOURCE_TONE[e.source] ?? "neutral"}>{e.source}</Tag>}
                title={<span className="inline-flex items-center gap-2"><Tag tone={ACTION_TONE(e.action)}>{e.action}</Tag>{e.entity && <span className="text-[13px] text-gray-500">{e.entity}{e.entityId ? ` · ${String(e.entityId).slice(0, 8)}` : ""}</span>}</span>}
                footnote={`${e.actorUid ? `actor ${String(e.actorUid).slice(0, 8)} (${e.actorRole})` : "no actor"}${e.planId ? ` · plan ${String(e.planId).slice(0, 8)}` : ""}`}
                trailing={<span title={dateTime(e.at)}>{relative(e.at)}</span>}
              />
            ))}
          </ListGroup>
        )}
        <ShowMore onClick={loadMore} loading={moreLoading} hasMore={!!cursor} />
      </Reveal>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.action}>
        {selected && (
          <div className="space-y-3 text-[13px]">
            <ListGroup>
              <Row title="When" trailing={dateTime(selected.at)} chevron={false} />
              <Row title="Source" trailing={selected.source} chevron={false} />
              <Row title="Actor" trailing={selected.actorUid || "—"} chevron={false} />
              {selected.planId && <Row href={`/plans/${selected.planId}`} title="Plan" trailing={selected.planId} />}
              {selected.entityId && <Row title={selected.entity || "Entity"} trailing={selected.entityId} chevron={false} />}
            </ListGroup>
            <pre className="overflow-x-auto rounded-xl bg-gray-50 p-4 text-[12px] leading-relaxed text-gray-700">{JSON.stringify(selected.meta ?? {}, null, 2)}</pre>
          </div>
        )}
      </Sheet>
    </PageFrame>
  );
}
