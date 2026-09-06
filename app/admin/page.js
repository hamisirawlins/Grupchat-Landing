"use client";

import { BookOpen, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { auditAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { ShowMore } from "@/components/ui/ShowMore";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal, Section } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { StatCard } from "@/components/home/Charts";
import { EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { getAdminSummary } from "@/lib/data/admin";
import { relative } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";

export default function Admin() {
  const { isAdmin, profileLoading } = useAuth();
  const { data: stats, loading, reload } = useAsync(() => getAdminSummary(), [isAdmin], { enabled: isAdmin });
  const [more, setMore] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [moreLoading, setMoreLoading] = useState(false);
  useEffect(() => { setMore([]); setCursor(stats?.latestCursor ?? null); }, [stats]);
  const loadMore = async () => {
    if (!cursor) return;
    setMoreLoading(true);
    try {
      const page = unwrap(await auditAPI.list({ limit: 10, before: cursor }));
      setMore((x) => [...x, ...(page?.events ?? [])]);
      setCursor(page?.nextCursor ?? null);
    } finally {
      setMoreLoading(false);
    }
  };
  const latest = [...(stats?.latest ?? []), ...more];

  if (!isAdmin) {
    return (
      <PageFrame eyebrow="Admin" title="Console">
        <Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal>
      </PageFrame>
    );
  }

  return (
    <PageFrame eyebrow="Admin" title="Console" meta="Today at a glance." onRefresh={reload}>
      <Reveal className="grid gap-4 sm:grid-cols-3">
        {loading && !stats ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Audit events" value={stats?.auditToday ?? "—"} sub={stats?.auditTruncated ? "within the latest 500" : "since midnight"} />
            <StatCard label="Invite previews" value={stats?.publicPreviews ?? "—"} sub="public link opens today" />
            <StatCard label="Live experiences" value={stats?.catalogueActive ?? "—"} sub="in the catalogue" />
          </>
        )}
      </Reveal>

      <Section title="Views" className="mt-10">
        <ListGroup>
          <Row href="/admin/audit" leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><ShieldCheck className="h-4 w-4" /></span>} title="Audit trail" footnote="Who did what, to which plan, when" />
          <Row href="/admin/payouts" leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Wallet className="h-4 w-4" /></span>} title="Payouts to review" footnote="Refund to the pool, or mark as sent with the receipt" />
          <Row href="/admin/ledger" leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><BookOpen className="h-4 w-4" /></span>} title="Ledger" footnote="Every movement of money, independent of provider records" />
          <Row href="/admin/catalogue" leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Sparkles className="h-4 w-4" /></span>} title="Curated plans" footnote="Add, edit, pause and relaunch experiences" />
        </ListGroup>
      </Section>

      {latest.length > 0 && (
        <Section title="Latest activity" className="mt-10">
          <ListGroup>
            {latest.map((e) => (
              <Row key={e.id} href="/admin/audit" title={<Tag tone="accent">{e.action}</Tag>} footnote={`${e.source}${e.planId ? ` · plan ${String(e.planId).slice(0, 8)}` : ""}`} trailing={relative(e.at)} />
            ))}
          </ListGroup>
          <ShowMore onClick={loadMore} loading={moreLoading} hasMore={!!cursor} />
        </Section>
      )}
    </PageFrame>
  );
}
