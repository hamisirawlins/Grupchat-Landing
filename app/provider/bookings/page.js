"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ScanLine } from "lucide-react";
import { Avatar, Button, ButtonLink, EmptyState, Meter, PageTitle, Skeleton, StatTile, TextField } from "@/components/kit";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { SPRING, STAGGER, useRevealVariants } from "@/lib/motion";
import { fmtMoney } from "@/lib/providers";
import { sessionParts } from "@/lib/tickets";
import { useAsync } from "@/lib/useAsync";

/**
 * Who's coming and who has arrived (KB D-044). A guest's QR code opens this
 * page with their code filled in, so checking in is one tap at the door.
 */
export default function Bookings() {
  const { data, loading, error, reload } = useAsync(async () => unwrap(await providersAPI.bookings()), []);
  const [arrivals, setArrivals] = useState({});
  const item = useRevealVariants();
  const s = data?.summary;

  const arrived = (g) => (g.id in arrivals ? arrivals[g.id] : g.checkedInAt);
  const toggle = async (g) => {
    const undo = Boolean(arrived(g));
    setArrivals((a) => ({ ...a, [g.id]: undo ? null : new Date().toISOString() }));
    try {
      const out = unwrap(await providersAPI.checkIn(g.id, { undo }));
      setArrivals((a) => ({ ...a, [g.id]: out.booking.checkedInAt }));
    } catch {
      setArrivals((a) => ({ ...a, [g.id]: undo ? g.checkedInAt || new Date().toISOString() : null }));
    }
  };

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item}><PageTitle sub="Who's coming, and who has arrived.">Bookings</PageTitle></motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {loading && !data ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[104px] rounded-tile" />) : s ? (
          <>
            <StatTile label="Guests coming" value={s.upcomingGuests} />
            <StatTile label={`Tickets in ${s.month}`} value={s.ticketsThisMonth} />
            <StatTile className="col-span-2 sm:col-span-1" label={`Paid to you in ${s.month}`} value={fmtMoney(s.paidThisMonth, s.currency)} sub="After provider charges" />
          </>
        ) : null}
      </motion.div>

      <motion.div variants={item}><FindByCode arrived={arrived} toggle={toggle} /></motion.div>

      <motion.section variants={item} aria-label="Coming up" className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold tracking-[-0.01em]">Coming up</h2>
        {loading && !data ? <Skeleton className="h-[88px] rounded-tile" /> : error ? (
          <div role="alert" className="flex flex-col items-start gap-3"><p className="font-semibold text-critical">{error.message}</p><Button variant="quiet" onClick={reload}>Try again</Button></div>
        ) : (data?.sessions || []).length === 0 ? (
          <EmptyState title="No bookings yet" text="When a group books one of your experiences, the date and the guest list show here." action={<ButtonLink href="/provider/experiences" variant="secondary">Your experiences</ButtonLink>} />
        ) : (
          data.sessions.map((session, i) => <SessionRow key={`${session.experienceId}_${session.key}`} session={session} open={i === 0} arrived={arrived} toggle={toggle} />)
        )}
      </motion.section>
    </motion.div>
  );
}

function SessionRow({ session, open: initiallyOpen, arrived, toggle }) {
  const [open, setOpen] = useState(initiallyOpen);
  const reduce = useReducedMotion();
  const p = sessionParts(session.key);
  const here = session.guests.filter(arrived).reduce((n, g) => n + g.quantity, 0);
  const id = `guests-${session.experienceId}-${session.key}`;
  return (
    <div className="overflow-hidden rounded-tile bg-white shadow-[inset_0_0_0_1px_var(--color-line)]">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 p-3.5 text-left transition-colors duration-200 hover:bg-soft/60">
        <span className="flex h-[60px] w-[60px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-action-tint text-action-strong">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{p.month}</span>
          <span className="tabular text-[22px] font-extrabold leading-6">{p.day}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="line-clamp-2 text-base font-bold leading-[22px]">{session.title}</span>
          <span className="text-sm text-ink-2">{p.weekday}, {p.time} · {here} of {session.booked} arrived</span>
          <Meter value={session.booked} total={session.capacity} className="max-w-[260px]" />
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : SPRING.ui} className="shrink-0 text-ink-3"><ChevronDown className="h-5 w-5" aria-hidden="true" /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={id}
            key="list"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0.15 } : SPRING.ui}
            className="border-t border-line"
          >
            {session.guests.map((g) => <GuestRow key={g.id} g={g} arrived={arrived(g)} onToggle={() => toggle(g)} />)}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuestRow({ g, arrived, onToggle, as: Tag = "li" }) {
  return (
    <Tag className="flex items-center gap-3 px-3.5 py-3 [&+&]:border-t [&+&]:border-line">
      <Avatar name={g.buyerName} size={40} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-bold">{g.buyerName} <span className="font-semibold text-ink-3">× {g.quantity}</span></span>
        <span className="font-mono text-[13px] tracking-[0.06em] text-ink-3">{g.code}</span>
      </span>
      <CheckInButton arrived={arrived} onClick={onToggle} name={g.buyerName} />
    </Tag>
  );
}

function CheckInButton({ arrived, onClick, name }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={Boolean(arrived)}
      aria-label={arrived ? `${name} arrived. Tap to undo.` : `Check in ${name}`}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      transition={SPRING.ui}
      className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors duration-200 ${arrived ? "bg-success-tint text-success" : "bg-action text-white hover:bg-action-strong"}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {arrived && (
          <motion.span key="tick" initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={SPRING.playful}>
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
      {arrived ? "Arrived" : "Check in"}
    </motion.button>
  );
}

function FindByCode({ arrived, toggle }) {
  const search = useSearchParams();
  const [code, setCode] = useState(search.get("code") || "");
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState(null);
  const [error, setError] = useState("");
  const reduce = useReducedMotion();
  const auto = useRef(Boolean(search.get("code")));

  const find = async (value = code) => {
    if (!value.trim()) return;
    setBusy(true);
    setError("");
    try {
      setFound(unwrap(await providersAPI.findBooking(value)).booking);
    } catch (e) {
      setFound(null);
      setError(e.message || "No booking with that code.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (auto.current) { auto.current = false; find(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-label="Find a booking" className="flex flex-col gap-3 rounded-card bg-sheet p-5 sm:p-6">
      <div className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-memory-ink" aria-hidden="true" /><h2 className="text-lg font-extrabold">Check in a guest</h2></div>
      <p className="-mt-1 text-sm text-ink-2">Scan the QR on their ticket with your phone camera, or type the code.</p>
      <form onSubmit={(e) => { e.preventDefault(); find(); }} className="flex max-w-[520px] items-start gap-2.5">
        <TextField aria-label="Ticket code" placeholder="GC-7Q4K-2M" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" spellCheck={false} className="flex-1" inputClassName="font-mono tracking-[0.08em]" error={error || undefined} />
        <Button type="submit" size="lg" loading={busy} className="h-[52px]">Find</Button>
      </form>
      <AnimatePresence mode="popLayout">
        {found && (
          <motion.div key={found.id} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={SPRING.soft} className="max-w-[520px] overflow-hidden rounded-tile bg-white shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="px-3.5 pt-3 text-[13px] font-semibold text-ink-2">{found.title} · {found.session}</div>
            <GuestRow as="div" g={found} arrived={arrived(found)} onToggle={() => toggle(found)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
