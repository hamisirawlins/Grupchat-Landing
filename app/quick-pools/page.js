"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ButtonLink, EmptyState, Kicker, ProgressBar, Skeleton, StatusTag } from "@/components/kit";
import { quickPoolAPI, kes, closingLine, palette } from "@/lib/quickPool";
import { useAsync } from "@/lib/useAsync";

function PoolRow({ p, yours }) {
  const pal = palette(p.theme);
  return (
    <Link href={`/q/${p.code}`} className="group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors duration-200 hover:bg-soft active:scale-[0.99]">
      <span aria-hidden="true" className="h-11 w-11 shrink-0 rounded-[14px]" style={{ background: `linear-gradient(150deg, ${pal.soft}, ${pal.strong})` }} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[16px] font-bold text-ink">{p.name}</span>
          {p.status === "closed" && <StatusTag status="paused">Closed</StatusTag>}
        </span>
        <span className="mt-1 block text-[13px] text-ink-2">
          {kes(p.collected)} of {kes(p.target)}{yours != null ? ` · you: ${kes(yours)}` : ""} · {closingLine(p.endsAt, p.status === "closed")}
        </span>
        <ProgressBar value={p.target ? p.collected / p.target : 0} className="mt-2" tone={p.collected >= p.target ? "success" : "action"} />
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
    </Link>
  );
}

/** My pools (D-053): the ones I made, and the ones I pooled into, found by account or verified email. */
export default function MyPools() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => quickPoolAPI.mine(), [user?.uid], { enabled: !!user });
  const created = data?.created ?? [];
  const pooled = data?.pooled ?? [];

  return (
    <PageFrame eyebrow="Quick Pool" title="My pools" onRefresh={reload} trailing={<ButtonLink href="/quick-pools/new" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> New</ButtonLink>}>
      {loading && !data ? (
        <Reveal className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</Reveal>
      ) : error ? (
        <Reveal><EmptyState title="Couldn't load your pools" text={error.message} /></Reveal>
      ) : !created.length && !pooled.length ? (
        <Reveal>
          <EmptyState title="No pools yet" text={user?.emailVerified ? "Start one and share the link with your group." : "Pools you pool into show here once your email is verified."} action={<ButtonLink href="/quick-pools/new">Start a pool</ButtonLink>} />
        </Reveal>
      ) : (
        <>
          {created.length > 0 && (
            <Reveal className="flex flex-col gap-1">
              <Kicker className="px-4 pb-1">Started by you</Kicker>
              {created.map((p) => <PoolRow key={p.planId} p={p} />)}
            </Reveal>
          )}
          {pooled.length > 0 && (
            <Reveal className="mt-8 flex flex-col gap-1">
              <Kicker className="px-4 pb-1">Pooled into</Kicker>
              {pooled.map((p) => <PoolRow key={p.planId} p={p} yours={p.yourTotal} />)}
            </Reveal>
          )}
        </>
      )}
    </PageFrame>
  );
}
