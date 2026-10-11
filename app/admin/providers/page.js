"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ListChecks } from "lucide-react";
import { Avatar, Chips, EmptyState, Meter, PageTitle, ResponsiveTable, Skeleton, StatusTag } from "@/components/kit";
import { adminProvidersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { date } from "@/lib/format";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { useAsync } from "@/lib/useAsync";

const VIEWS = [{ value: "open", label: "To review" }, { value: "approved", label: "Approved" }, { value: "declined", label: "Declined" }];

/** Applications waiting for a person, newest first (KB D-043). */
export default function ReviewQueue() {
  const item = useRevealVariants();
  const [view, setView] = useState("open");
  const [market, setMarket] = useState("all");
  const { data, loading, error } = useAsync(async () => unwrap(await adminProvidersAPI.queue({ status: view })), [view]);
  const markets = useAsync(async () => unwrap(await adminProvidersAPI.markets()), []);
  const rows = (data?.providers || []).filter((p) => market === "all" || p.market === market);
  const drafts = (markets.data?.markets || []).filter((m) => m.draft);
  const statusOf = (p) => (p.status === "in-review" && p.checks && p.checks.passed === p.checks.total ? "ready" : p.status);

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-6">
      <motion.div variants={item}><PageTitle>Review</PageTitle></motion.div>
      {drafts.map((m) => (
        <motion.div variants={item} key={m.code}>
          <Link href={`/admin/checklists?market=${m.code}`} className="flex flex-wrap items-center gap-3.5 rounded-2xl bg-action-tint px-[18px] py-3.5 transition-transform duration-300 active:scale-[0.99]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-action-strong"><ListChecks className="h-5 w-5" aria-hidden="true" /></span>
            <span className="flex min-w-[220px] flex-1 flex-col">
              <span className="text-[15px] font-bold leading-5">{m.name} checklist v{m.draft.label} is ready to publish</span>
              <span className="text-[13px] leading-[18px] text-ink-2">{m.live ? `Live version is v${m.live.label}` : `Applications from ${m.name} wait until it's live${m.waiting ? ` · ${m.waiting} waiting` : ""}`}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-action-strong">Open checklists<ChevronRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </motion.div>
      ))}
      <motion.div variants={item} className="flex flex-col gap-3">
        <Chips label="Which applications" multiple={false} options={VIEWS} value={view} onChange={setView} />
        {(data?.markets?.length || 0) > 1 && (
          <Chips label="Markets" multiple={false} options={[{ value: "all", label: "All markets" }, ...data.markets.map((m) => ({ value: m.code, label: m.name }))]} value={market} onChange={setMarket} />
        )}
      </motion.div>
      <motion.div variants={item}>
        {loading && !data ? (
          <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : error ? (
          <p role="alert" className="font-semibold text-critical">{error.message}</p>
        ) : (
          <ResponsiveTable
            label="Applications"
            rows={rows}
            rowKey={(r) => r.uid}
            empty={<EmptyState title={view === "open" ? "Nothing to review" : "None yet"} text={view === "open" ? "New applications show up here as they arrive." : null} />}
            columns={[
              { key: "name", header: "Provider", render: (r) => (
                <div className="flex flex-col gap-0.5">
                  <Link href={`/admin/providers/${r.uid}`} className="text-[15px] font-bold text-ink hover:text-action-strong">{r.name}</Link>
                  <span className="text-[13px] text-ink-3">{r.town}</span>
                </div>
              ) },
              { key: "market", header: "Market", cellClassName: "whitespace-nowrap", render: (r) => `${r.marketName}${r.checklistLabel ? ` · v${r.checklistLabel}` : r.status === "waiting" ? " · not open" : ""}` },
              { key: "submitted", header: "Submitted", cellClassName: "whitespace-nowrap", render: (r) => (r.submittedAt ? date(r.submittedAt, { year: undefined }) : "—") },
              { key: "checks", header: "Checks", render: (r) => (r.checks ? <Meter value={r.checks.passed} total={r.checks.total} /> : <span className="text-ink-3">—</span>) },
              { key: "status", header: "Status", render: (r) => <StatusTag status={statusOf(r)} /> },
              { key: "reviewer", header: "Reviewer", render: (r) => (r.reviewer ? <span className="inline-flex items-center gap-2 whitespace-nowrap"><Avatar name={r.reviewer.name || "?"} size={26} />{r.reviewer.name}</span> : <span className="text-ink-3">—</span>) },
            ]}
            card={(r) => (
              <Link href={`/admin/providers/${r.uid}`} className="flex flex-col gap-3 rounded-tile p-4 shadow-[inset_0_0_0_1px_var(--color-line)] active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-base font-bold">{r.name}</span>
                    <span className="text-[13px] text-ink-3">{r.town} · {r.marketName}{r.submittedAt ? ` · ${date(r.submittedAt, { year: undefined })}` : ""}</span>
                  </div>
                  <StatusTag status={statusOf(r)} />
                </div>
                {r.checks && <Meter value={r.checks.passed} total={r.checks.total} />}
              </Link>
            )}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
