"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Clock, ImageIcon, MapPin, RotateCcw, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BackLink, Button, ButtonLink, EmptyState, Kicker, MoneyLines, Skeleton } from "@/components/kit";
import { QuantityStepper } from "@/components/tickets/QuantityStepper";
import { SessionPicker } from "@/components/tickets/SessionPicker";
import { experiencesAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { SPRING } from "@/lib/motion";
import { categoryLabel, fmtMoney } from "@/lib/providers";
import { clock, MAX_PER_ORDER, sessionParts } from "@/lib/tickets";
import { useAsync } from "@/lib/useAsync";

const CANCEL = { "48h": "Full refund up to 48 hours before", none: "No refunds once booked" };

/**
 * A provider's listing, open to anyone, with dates, places left and checkout (KB D-044).
 * The server hands over the listing (`initial`) so the words and photos are in the first HTML
 * for people and search engines alike (D-047); the client then refreshes it for live places left.
 */
export default function ExperienceView({ id, initial = null }) {
  const res = useAsync(async () => unwrap(await experiencesAPI.get(id))?.experience, [id]);
  const data = res.data ?? initial;
  const loading = res.loading && !data;
  const error = data ? null : res.error;
  const reload = res.reload;

  return (
    <div className="min-h-screen bg-white text-ink">
      <TopBar />
      <main className="mx-auto w-full max-w-[1120px] px-5 pb-36 pt-3 sm:px-8 sm:pt-6 lg:pb-20">
        {loading && !data ? (
          <div aria-busy="true" className="flex flex-col gap-6">
            <Skeleton className="h-[280px] w-full rounded-card sm:h-[420px]" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : error ? (
          <EmptyState className="mt-10" title="This experience isn't taking bookings right now" text={error.message?.includes("isn't") ? "It may be paused or fully booked. There's more in Discover." : error.message} action={<ButtonLink href="/discover" variant="secondary">Go to Discover</ButtonLink>} />
        ) : data ? (
          <div>
            <div className="gc-rise"><Gallery photos={data.photos} title={data.title} /></div>
            <Body e={data} reload={reload} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function TopBar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link href={user ? "/home" : "/"} className="inline-flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full" priority />
          <span className="text-base font-extrabold tracking-[-0.01em]">GrupChat</span>
        </Link>
        <div className="flex items-center">{user ? <BackLink href="/discover">Discover</BackLink> : <ButtonLink href="/sign-in" variant="secondary" size="sm">Sign in</ButtonLink>}</div>
      </div>
    </header>
  );
}

/** Desk: one large photo and two beside it. Phone: a swipeable strip with a counter. */
function Gallery({ photos = [], title }) {
  const [at, setAt] = useState(0);
  const strip = useRef(null);
  if (!photos.length) {
    return <div className="flex h-[220px] items-center justify-center rounded-card bg-sheet text-memory-ink sm:h-[360px]"><ImageIcon className="h-7 w-7" aria-hidden="true" /></div>;
  }
  const onScroll = () => {
    const el = strip.current;
    if (el) setAt(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <>
      <div className="relative -mx-5 sm:hidden">
        <div ref={strip} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={`Photos of ${title}`}>
          {photos.map((p, i) => (
            <img key={p.id} src={p.url} alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" className="aspect-[4/3] w-full shrink-0 snap-center object-cover" />
          ))}
        </div>
        {photos.length > 1 && (
          <span className="tabular absolute bottom-3 right-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">{at + 1} / {photos.length}</span>
        )}
      </div>
      <div className={`hidden h-[440px] gap-2 overflow-hidden rounded-card sm:grid ${photos.length >= 3 ? "grid-cols-[2fr_1fr] grid-rows-2" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {photos.slice(0, 3).map((p, i) => (
          <img key={p.id} src={p.url} alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" className={`h-full w-full object-cover ${photos.length >= 3 && i === 0 ? "row-span-2" : ""}`} />
        ))}
      </div>
    </>
  );
}

function Body({ e, reload }) {
  const sessions = e.sessions || [];
  const facts = [
    e.duration && { icon: Clock, text: e.duration },
    e.scheduleLine && { icon: Ticket, text: e.scheduleLine },
    e.meetingPoint && { icon: MapPin, text: e.meetingPoint },
  ].filter(Boolean);

  return (
    <div className="mt-6 grid gap-x-14 gap-y-8 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr]">
      <header className="gc-rise flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
        <Kicker>{[categoryLabel(e.category), e.town?.split(",")[0]].filter(Boolean).join(" · ")}</Kicker>
        <h1 className="text-[32px] font-black leading-[36px] tracking-[-0.03em] sm:text-[44px] sm:leading-[48px]">{e.title}</h1>
        <p className="inline-flex flex-wrap items-center gap-1.5 text-[15px] text-ink-2">
          With <span className="font-bold text-ink">{e.provider?.name}</span>
          {e.provider?.verified && <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-success"><BadgeCheck className="h-4 w-4" aria-hidden="true" />Registered business</span>}
        </p>
        <ul className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {facts.map(({ icon: Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink"><Icon className="h-[18px] w-[18px] text-ink-3" aria-hidden="true" />{text}</li>
          ))}
        </ul>
      </header>

      <aside id="book" aria-label="Book tickets" className="self-start lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <BookingCard e={e} sessions={sessions} reload={reload} />
      </aside>

      <div className="gc-rise flex flex-col gap-8 lg:col-start-1 lg:row-start-2">
        {e.description && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xl font-extrabold tracking-[-0.01em]">About</h2>
            <p className="whitespace-pre-line text-base leading-[26px] text-ink-2">{e.description}</p>
          </section>
        )}
        {e.included && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xl font-extrabold tracking-[-0.01em]">What's included</h2>
            <ul className="flex flex-wrap gap-2">
              {e.included.split(/,|\n/).map((s) => s.trim()).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).map((s) => (
                <li key={s} className="rounded-full bg-soft px-3.5 py-2 text-sm font-semibold text-ink">{s}</li>
              ))}
            </ul>
          </section>
        )}
        <section className="grid gap-3 sm:grid-cols-2">
          {e.meetingPoint && (
            <div className="flex flex-col gap-1 rounded-tile bg-sheet px-5 py-4">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-memory-ink"><MapPin className="h-4 w-4" aria-hidden="true" />Meeting point</span>
              <span className="text-[15px] font-bold text-ink">{e.meetingPoint}</span>
              {e.town && <span className="text-[13px] text-ink-2">{e.town}</span>}
            </div>
          )}
          <div className="flex flex-col gap-1 rounded-tile bg-sheet px-5 py-4">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-memory-ink"><RotateCcw className="h-4 w-4" aria-hidden="true" />Cancellation</span>
            <span className="text-[15px] font-bold text-ink">{CANCEL[e.cancellation] || "Ask the provider"}</span>
            <span className="text-[13px] text-ink-2">Set by {e.provider?.name}</span>
          </div>
        </section>
      </div>
      <MobileBar e={e} />
    </div>
  );
}

function BookingCard({ e, sessions, reload }) {
  const { user } = useAuth();
  const router = useRouter();
  const firstOpen = sessions.find((s) => s.left > 0)?.key || null;
  const [key, setKey] = useState(firstOpen);
  const picked = sessions.find((s) => s.key === key);
  const max = Math.max(1, Math.min(MAX_PER_ORDER, picked?.left ?? MAX_PER_ORDER));
  const [qty, setQty] = useState(() => Math.min(max, 2));
  // A date and count carried through sign-in (?date=…&qty=…) are applied after the first paint,
  // so the server can render this card for everyone (D-047).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = q.get("date");
    if (d && sessions.some((s) => s.key === d && s.left > 0)) setKey(d);
    const n = Number(q.get("qty"));
    if (n >= 1) setQty(Math.min(MAX_PER_ORDER, n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => { if (qty > max) setQty(max); }, [max, qty]);
  const total = (Number(e.price) || 0) * qty;
  const time = useMemo(() => clock(sessions[0]?.time), [sessions]);

  const book = async () => {
    setError("");
    if (!user) {
      const back = `/experiences/${e.id}?date=${encodeURIComponent(key)}&qty=${qty}`;
      router.push(`/sign-in?redirect=${encodeURIComponent(back)}`);
      return;
    }
    setBusy(true);
    try {
      const out = unwrap(await experiencesAPI.checkout(e.id, { sessionKey: key, quantity: qty }));
      window.location.assign(out.authorizationUrl);
    } catch (err) {
      setError(err.message || "We couldn't start the payment.");
      setBusy(false);
      if (err.status === 409) reload();
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-card bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-line),0_18px_40px_-24px_rgb(20_17_26/0.25)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="tabular text-[26px] font-extrabold tracking-[-0.02em]">{fmtMoney(e.price, e.currency)}</span>
        <span className="text-sm font-medium text-ink-3">per person</span>
      </div>

      {!e.ticketsOpen ? (
        <p className="rounded-tile bg-soft px-4 py-3.5 text-[15px] leading-[22px] text-ink-2"><span className="font-bold text-ink">Tickets open soon.</span> {e.provider?.name} is finishing their set-up with us.</p>
      ) : sessions.length === 0 ? (
        <p className="rounded-tile bg-soft px-4 py-3.5 text-[15px] leading-[22px] text-ink-2"><span className="font-bold text-ink">No dates open right now.</span> Check back soon.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-bold">Choose a date</span>
              {time && <span className="text-[13px] text-ink-3">Starts {time}</span>}
            </div>
            <SessionPicker sessions={sessions} value={key} onChange={(k) => { setKey(k); setError(""); }} />
          </div>
          <QuantityStepper value={qty} onChange={setQty} max={max} />
          <MoneyLines title={picked ? sessionParts(picked.key).short : undefined} rows={[[`${qty} × ${fmtMoney(e.price, e.currency)}`, fmtMoney(total, e.currency)], ["Total", fmtMoney(total, e.currency), true]]} />
          <AnimatePresence initial={false}>
            {error && (
              <motion.p role="alert" key={error} initial={reduce ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING.ui} className="text-sm font-semibold text-critical">{error}</motion.p>
            )}
          </AnimatePresence>
          <Button size="lg" block onClick={book} loading={busy} disabled={!key}>
            {user ? `Book ${qty} ${qty === 1 ? "ticket" : "tickets"}` : "Sign in to book"}
          </Button>
          <p className="-mt-1 text-center text-[13px] leading-[18px] text-ink-3">You'll pay on Paystack's secure page. Your places are held while you pay.</p>
        </>
      )}
    </div>
  );
}

/** Phones: price and a Book button pinned to the bottom while the booking card is off screen. */
function MobileBar({ e }) {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top > 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const go = () => document.getElementById("book")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/92 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur lg:hidden"
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "100%" }}
          transition={SPRING.ui}
        >
          <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4">
            <span className="flex flex-col">
              <span className="tabular text-lg font-extrabold">{fmtMoney(e.price, e.currency)}</span>
              <span className="text-[13px] text-ink-3">per person</span>
            </span>
            <Button size="lg" onClick={go} className="px-8">{e.ticketsOpen ? "Choose a date" : "See details"}</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
