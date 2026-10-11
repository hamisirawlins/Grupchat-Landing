"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, FieldRow, Kicker, Label, PageTitle, RadioCards, SelectField, Skeleton, StatusTag, Switch, TextArea, TextField } from "@/components/kit";
import { Sheet } from "@/components/ui/Sheet";
import { adminProvidersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { date } from "@/lib/format";
import { STAGGER, useListItemVariants, useRevealVariants } from "@/lib/motion";

const KINDS = [
  { value: "document", label: "Document" },
  { value: "photos-document", label: "Photos and document" },
  { value: "payout", label: "Payout check" },
  { value: "terms", label: "Confirmation" },
];
const APPLIES = [
  { value: "all", label: "All providers" },
  { value: "water", label: "Water activities" },
  { value: "food", label: "Food experiences" },
];
const blank = () => ({ id: "", title: "", hint: "", kind: "document", appliesTo: "all", required: true, _new: Math.random().toString(36).slice(2) });

/** Provider checklists by market, versioned (KB D-043). A published version never changes. */
export default function Checklists() {
  const item = useRevealVariants();
  const [list, setList] = useState(null);
  const [code, setCode] = useState(null);
  const [market, setMarket] = useState(null);
  const [draft, setDraft] = useState(null); // { checks, changeNote, recheckApproved }
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null); // "publish" | "add"
  const [newMarket, setNewMarket] = useState({ code: "", name: "", currency: "", phonePrefix: "", utcOffsetMinutes: "180" });

  const loadList = () => adminProvidersAPI.markets().then((r) => { const d = unwrap(r); setList(d.markets); return d.markets; });
  useEffect(() => {
    loadList().then((ms) => {
      const wanted = new URLSearchParams(window.location.search).get("market");
      setCode(ms.find((m) => m.code === wanted)?.code || ms.find((m) => m.draft)?.code || ms[0]?.code || null);
    }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!code) return;
    setMarket(null);
    adminProvidersAPI.market(code).then((r) => {
      const m = unwrap(r).market;
      setMarket(m);
      setDraft(m.draft ? { checks: m.draft.checks.map((c) => ({ ...c })), changeNote: m.draft.changeNote || "", recheckApproved: Boolean(m.draft.recheckApproved) } : null);
    }).catch((e) => setError(e.message));
  }, [code]);

  const apply = (m) => {
    setMarket(m);
    setDraft(m.draft ? { checks: m.draft.checks.map((c) => ({ ...c })), changeNote: m.draft.changeNote || "", recheckApproved: Boolean(m.draft.recheckApproved) } : null);
    loadList();
  };
  const startDraft = () => setDraft({ checks: (market.live?.checks || []).map((c) => ({ ...c })), changeNote: "", recheckApproved: false });
  const editCheck = (i, k, v) => setDraft((d) => ({ ...d, checks: d.checks.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }));
  const move = (i, by) => setDraft((d) => {
    const checks = [...d.checks];
    const [x] = checks.splice(i, 1);
    checks.splice(Math.max(0, Math.min(checks.length, i + by)), 0, x);
    return { ...d, checks };
  });
  const run = (name, fn) => async () => {
    setBusy(name); setError("");
    try { await fn(); } catch (e) { setError(e.message || "Something went wrong."); } finally { setBusy(""); }
  };
  const saveDraft = run("save", async () => {
    const m = unwrap(await adminProvidersAPI.saveDraft(market.code, { checks: draft.checks.map(({ _new, ...c }) => c), changeNote: draft.changeNote, recheckApproved: draft.recheckApproved })).market;
    apply(m);
    toast.success("Draft saved");
  });
  const publish = run("publish", async () => {
    await adminProvidersAPI.saveDraft(market.code, { checks: draft.checks.map(({ _new, ...c }) => c), changeNote: draft.changeNote, recheckApproved: draft.recheckApproved });
    const out = unwrap(await adminProvidersAPI.publish(market.code));
    apply(out.market);
    setSheet(null);
    toast.success(`${out.market.name} v${out.market.live.label} is live${out.opened ? ` · ${out.opened} waiting application${out.opened === 1 ? "" : "s"} reopened` : ""}`);
  });
  const discard = run("discard", async () => {
    if (!market.draft) return setDraft(null);
    apply(unwrap(await adminProvidersAPI.discardDraft(market.code)).market);
  });
  const addMarket = run("add", async () => {
    const out = unwrap(await adminProvidersAPI.createMarket({ ...newMarket, utcOffsetMinutes: Number(newMarket.utcOffsetMinutes) }));
    setSheet(null);
    await loadList();
    setCode(out.market.code);
    setNewMarket({ code: "", name: "", currency: "", phonePrefix: "", utcOffsetMinutes: "180" });
  });

  const label = market ? (draft ? `v${market.draft?.label || `1.${market.versions?.length || 0}`}` : market.live ? `v${market.live.label}` : "") : "";

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item}><PageTitle>Checklists</PageTitle></motion.div>
      {error && <p role="alert" className="rounded-xl bg-critical-tint px-4 py-3 text-[15px] font-semibold text-critical">{error}</p>}
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
        <motion.nav variants={item} aria-label="Markets" className="flex flex-col gap-2.5 lg:w-[280px] lg:shrink-0">
          <Kicker>Markets</Kicker>
          {!list ? <Skeleton className="h-24 w-full rounded-[18px]" /> : (
            <div className="flex gap-2.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {list.map((m) => {
                const on = m.code === code;
                return (
                  <button key={m.code} type="button" aria-pressed={on} onClick={() => setCode(m.code)} className={`flex min-w-[220px] flex-col gap-1.5 rounded-[18px] px-[18px] py-4 text-left transition-[background-color,box-shadow] duration-200 ${on ? "bg-action-tint shadow-[inset_0_0_0_2px_var(--color-action)]" : "bg-white shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] hover:bg-soft"}`}>
                    <span className="flex items-center justify-between gap-2.5"><span className="text-base font-extrabold">{m.name}</span><StatusTag status={m.live ? "live" : "draft"} /></span>
                    <span className="text-[13px] text-ink-2">{m.live ? `v${m.live.label} · ${m.live.checks} checks` : "Not open yet"}{m.waiting ? ` · ${m.waiting} waiting` : ""}</span>
                    {m.draft && <span className="text-[13px] font-bold text-action-strong">Draft v{m.draft.label} ready</span>}
                  </button>
                );
              })}
            </div>
          )}
          <Button variant="quiet" size="md" className="self-start" onClick={() => setSheet("add")}><Plus className="h-[18px] w-[18px]" />Add market</Button>
        </motion.nav>

        <motion.div variants={item} className="min-w-0 flex-1">
          {!market ? <Skeleton className="h-96 w-full rounded-card" /> : (
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-extrabold tracking-[-0.01em]">{market.name}</h2>
                  <span className="text-sm text-ink-2">
                    {draft ? `Editing draft ${label}${market.live ? ` · live version is v${market.live.label}` : " · not open yet"}` : market.live ? `Live version v${market.live.label} · published ${date(market.live.publishedAt)}` : "No checklist yet"}
                  </span>
                </div>
                {!draft && <Button variant="secondary" size="md" onClick={startDraft}>{market.live ? "Edit as a new version" : "Start a checklist"}</Button>}
              </div>

              {!draft ? (
                <ul>
                  {(market.live?.checks || []).map((c) => (
                    <li key={c.id} className="flex flex-col gap-1.5 border-b border-black/[0.06] py-3 last:border-0">
                      <span className="text-[15px] font-bold">{c.title}</span>
                      <span className="flex flex-wrap gap-1.5 text-xs font-semibold text-ink-2">
                        <Pill>{KINDS.find((k) => k.value === c.kind)?.label}</Pill>
                        <Pill accent={c.appliesTo !== "all"}>{APPLIES.find((a) => a.value === c.appliesTo)?.label}</Pill>
                        {!c.required && <Pill>Optional</Pill>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <DraftRows draft={draft} editCheck={editCheck} move={move} setDraft={setDraft} live={market.live} />
                  <Button variant="secondary" size="md" className="self-start" onClick={() => setDraft((d) => ({ ...d, checks: [...d.checks, blank()] }))}><Plus className="h-[18px] w-[18px]" />Add a check</Button>
                  {market.live && (
                    <div className="flex flex-col gap-2">
                      <Label>When {label} goes live</Label>
                      <RadioCards label={`When ${label} goes live`} value={draft.recheckApproved ? "recheck" : "new"} onChange={(v) => setDraft((d) => ({ ...d, recheckApproved: v === "recheck" }))} options={[{ value: "new", label: "New applications only" }, { value: "recheck", label: "Also re-check approved providers" }]} />
                    </div>
                  )}
                  <TextArea label="What changed" rows={2} value={draft.changeNote} onChange={(e) => setDraft((d) => ({ ...d, changeNote: e.target.value }))} placeholder="Adds a food handling check for food experiences." />
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <Button size="lg" onClick={() => setSheet("publish")}>Publish {label}</Button>
                    <Button size="lg" variant="secondary" onClick={saveDraft} loading={busy === "save"}>Save draft</Button>
                    <Button size="lg" variant="quiet" onClick={discard} loading={busy === "discard"}>Discard draft</Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </motion.div>
      </div>

      <Sheet open={sheet === "publish"} onClose={() => setSheet(null)} title={`Publish ${market?.name} ${label}?`} footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={() => setSheet(null)}>Not yet</Button>
          <Button onClick={publish} loading={busy === "publish"}>Publish</Button>
        </div>
      }>
        <p className="text-[15px] leading-[22px] text-ink-2">
          New applications use it straight away; ones already sent keep the version they were sent against.
          {!market?.live ? ` ${market?.name} opens to providers${list?.find((m) => m.code === code)?.waiting ? `, and the ${list.find((m) => m.code === code).waiting} waiting are emailed` : ""}.` : ""}
          {draft?.recheckApproved ? " Approved providers in this market are flagged for a re-check." : ""}
        </p>
      </Sheet>
      <Sheet open={sheet === "add"} onClose={() => setSheet(null)} title="Add a market" footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={() => setSheet(null)}>Cancel</Button>
          <Button onClick={addMarket} loading={busy === "add"}>Add market</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <FieldRow>
            <TextField label="Country code" value={newMarket.code} maxLength={2} placeholder="TZ" onChange={(e) => setNewMarket((s) => ({ ...s, code: e.target.value.toUpperCase() }))} />
            <TextField label="Name" value={newMarket.name} placeholder="Tanzania" onChange={(e) => setNewMarket((s) => ({ ...s, name: e.target.value }))} />
          </FieldRow>
          <FieldRow>
            <TextField label="Currency" value={newMarket.currency} maxLength={3} placeholder="TZS" onChange={(e) => setNewMarket((s) => ({ ...s, currency: e.target.value.toUpperCase() }))} />
            <TextField label="Phone prefix" value={newMarket.phonePrefix} placeholder="+255" onChange={(e) => setNewMarket((s) => ({ ...s, phonePrefix: e.target.value }))} />
          </FieldRow>
          <TextField label="Minutes ahead of UTC" inputMode="numeric" value={newMarket.utcOffsetMinutes} helper="180 for East Africa, 120 for South Africa" onChange={(e) => setNewMarket((s) => ({ ...s, utcOffsetMinutes: e.target.value }))} />
        </div>
      </Sheet>
    </motion.div>
  );
}

function Pill({ children, accent = false }) {
  return <span className={`inline-flex h-[22px] items-center rounded-tag px-2 ${accent ? "bg-action-tint text-action-strong" : "bg-soft text-ink-2"}`}>{children}</span>;
}

function DraftRows({ draft, editCheck, move, setDraft, live }) {
  const variants = useListItemVariants();
  const liveIds = new Set((live?.checks || []).map((c) => c.id));
  return (
    <ul className="flex flex-col">
      <AnimatePresence initial={false}>
        {draft.checks.map((c, i) => {
          const isNew = !liveIds.has(c.id) && live;
          return (
            <motion.li key={c.id || c._new} layout variants={variants} initial="initial" animate="animate" exit="exit" className={`flex flex-col gap-3 border-b border-black/[0.06] py-4 last:border-0 ${isNew ? "-mx-2 rounded-xl bg-success-tint/60 px-2" : ""}`}>
              <div className="flex items-start gap-2">
                <div className="flex shrink-0 flex-col">
                  <button type="button" aria-label={`Move ${c.title || "check"} up`} disabled={i === 0} onClick={() => move(i, -1)} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 hover:bg-soft disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" aria-label={`Move ${c.title || "check"} down`} disabled={i === draft.checks.length - 1} onClick={() => move(i, 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 hover:bg-soft disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <TextField aria-label="Check" className="min-w-[200px] flex-1" value={c.title} placeholder="Food handling certificate" onChange={(e) => editCheck(i, "title", e.target.value)} />
                    {isNew && <span className="inline-flex h-[22px] items-center rounded-tag bg-success-tint px-2 text-xs font-bold text-success">New</span>}
                  </div>
                  <TextField aria-label="Hint for providers" value={c.hint} placeholder="What to upload, in a few words" onChange={(e) => editCheck(i, "hint", e.target.value)} />
                  <div className="flex flex-wrap items-center gap-3">
                    <SelectField aria-label="Kind" className="min-w-[180px] flex-1" value={c.kind} options={KINDS} onChange={(e) => editCheck(i, "kind", e.target.value)} />
                    <SelectField aria-label="Applies to" className="min-w-[180px] flex-1" value={c.appliesTo} options={APPLIES} onChange={(e) => editCheck(i, "appliesTo", e.target.value)} />
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-2">Required<Switch compact label={`${c.title || "Check"} required`} checked={c.required} onChange={(v) => editCheck(i, "required", v)} /></span>
                    <button type="button" aria-label={`Remove ${c.title || "check"}`} onClick={() => setDraft((d) => ({ ...d, checks: d.checks.filter((_, j) => j !== i) }))} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 hover:bg-critical-tint hover:text-critical"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
