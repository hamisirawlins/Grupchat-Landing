"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Share2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Kicker, ProgressBar, Skeleton, EmptyState } from "@/components/kit";
import { useCountUp } from "@/components/home/Charts";
import { PoolVisual } from "@/components/quickpool/PoolVisual";
import { PoolCharts } from "@/components/quickpool/PoolCharts";
import { PaySheet } from "@/components/quickpool/PaySheet";
import { OwnerPanel } from "@/components/quickpool/OwnerPanel";
import { YouPanel } from "@/components/quickpool/YouPanel";
import { ClaimAccount } from "@/components/quickpool/ClaimAccount";
import { quickPoolAPI, kes, closingLine, palette, sharePool } from "@/lib/quickPool";
import { relative } from "@/lib/format";
import { STAGGER, useRevealVariants } from "@/lib/motion";

function Header({ signedIn }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href={signedIn ? "/home" : "/"} className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold">GrupChat</span>
        </Link>
        <Link href={signedIn ? "/quick-pools" : "/sign-in"} className="py-2 text-sm font-semibold text-action-strong">{signedIn ? "My pools" : "Sign in"}</Link>
      </div>
    </header>
  );
}

function Numbers({ m, theme }) {
  const collected = useCountUp(m.collected);
  const p = palette(theme);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <div className="tabular text-[40px] font-black leading-none tracking-[-0.03em] text-ink sm:text-5xl">{kes(collected)}</div>
          <div className="mt-2 text-[15px] text-ink-2">of {kes(m.target)} · {m.pct}%</div>
        </div>
        <div className="flex gap-6 sm:text-right">
          <div><div className="tabular text-2xl font-extrabold text-ink">{m.contributors}</div><div className="text-[13px] text-ink-3">{m.contributors === 1 ? "person" : "people"}</div></div>
          <div><div className="tabular text-2xl font-extrabold text-ink">{m.payments ? kes(m.average) : "—"}</div><div className="text-[13px] text-ink-3">average</div></div>
        </div>
      </div>
      <ProgressBar value={m.target ? m.collected / m.target : 0} label="Share of the target collected" thick tone={m.reached ? "success" : "action"} />
      {!m.closed && m.payments > 0 && (
        <p className="text-[13px]" style={{ color: p.ink }}>{m.reached ? "Target reached." : m.onTrack ? "At this pace the pool reaches its target before it closes." : `${kes(Math.max(0, m.target - m.collected))} to go.`}</p>
      )}
    </div>
  );
}

function Insight({ pool }) {
  const { insights, signoff, metrics } = pool;
  const quiet = signoff?.mood === "quiet";
  if (!insights && !signoff) return null;
  return (
    <Card className="gap-3">
      <div className="flex items-center gap-2 text-ink-3">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <Kicker>How it's going</Kicker>
      </div>
      {insights ? (
        <>
          <p className="text-[19px] font-extrabold leading-6 tracking-[-0.01em] text-ink">{insights.headline}</p>
          <p className="text-[15px] leading-[22px] text-ink-2">{insights.body}</p>
        </>
      ) : (
        <p className="text-[15px] text-ink-2">{metrics.contributors < 5 ? "A short read on the pool appears once five people have pooled." : "A short read on the pool is on its way."}</p>
      )}
      {signoff && <span className={`self-start rounded-full px-3 py-1 text-[13px] font-bold ${quiet ? "bg-soft text-ink-2" : "bg-memory-tint text-memory-ink"}`}>{signoff.text}</span>}
      {insights && <span className="text-[11px] text-ink-3">Written from the pool's totals only{insights.generatedAt ? ` · ${relative(insights.generatedAt)}` : ""}</span>}
    </Card>
  );
}

function Feed({ recent }) {
  if (!recent?.length) return null;
  return (
    <Card title="Latest" sub="Amounts only. Nobody's name or number is shown.">
      <ul className="flex flex-col">
        {recent.slice(0, 12).map((r, i) => (
          <li key={`${r.at}-${i}`} className="flex items-center justify-between border-t border-line py-2.5 first:border-t-0">
            <span className="tabular text-[15px] font-bold text-ink">{kes(r.amount)}</span>
            <span className="text-[13px] text-ink-3">{relative(r.at)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function QuickPoolPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const item = useRevealVariants();
  const [code, setCode] = useState(params.code);
  const [state, setState] = useState({ loading: true, pool: null, error: null });
  const [paying, setPaying] = useState(false);

  const load = useCallback(async (c = code) => {
    try {
      const pool = await quickPoolAPI.view(c);
      setState({ loading: false, pool, error: null });
    } catch (e) {
      setState((s) => ({ loading: false, pool: s.pool && e.code !== "link-inactive" ? s.pool : null, error: e }));
    }
  }, [code]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, user?.uid, load]);

  const onNewCode = (next) => {
    setCode(next);
    router.replace(`/q/${next}`);
    load(next);
  };

  const pool = state.pool;
  const share = async () => {
    const url = `${window.location.origin}/q/${pool.code}`;
    const r = await sharePool({ name: pool.name, url });
    if (r === "copied") toast.success("Link copied");
  };

  if (state.loading) {
    return (
      <main className="min-h-screen bg-white" aria-busy="true">
        <Header signedIn={!!user} />
        <div className="mx-auto max-w-3xl px-6 pt-10">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-2/3" />
          <Skeleton className="mt-8 h-56 w-full rounded-card" />
        </div>
      </main>
    );
  }

  if (!pool) {
    return (
      <main className="min-h-screen bg-white">
        <Header signedIn={!!user} />
        <div className="mx-auto max-w-3xl px-6 pt-16">
          <EmptyState title={state.error?.code === "link-inactive" ? "This link doesn't open a pool" : "Couldn't open this pool"} text={state.error?.code === "link-inactive" ? "Ask the person who shared it for a new link." : state.error?.message} action={state.error?.code === "link-inactive" ? null : <Button onClick={() => load()}>Try again</Button>} />
        </div>
      </main>
    );
  }

  const m = pool.metrics;
  const closed = pool.status === "closed";
  const seatsLine = pool.seats?.limit ? (pool.seats.full ? "Full" : `${pool.seats.left} ${pool.seats.left === 1 ? "place" : "places"} left`) : null;

  return (
    <main className="min-h-screen bg-white text-ink">
      <Header signedIn={!!user} />
      <motion.div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-36 pt-8 sm:pb-24 sm:pt-14" variants={STAGGER} initial="hidden" animate="show">
        <motion.div variants={item} className="flex flex-col gap-2">
          <Kicker>{[closingLine(pool.endsAt, closed), seatsLine].filter(Boolean).join(" · ")}</Kicker>
          <h1 className="text-[34px] font-black leading-[40px] tracking-[-0.03em] sm:text-5xl sm:leading-[54px]">{pool.name}</h1>
        </motion.div>

        <motion.div variants={item}><PoolVisual theme={pool.theme} pct={m.pct} reached={m.reached} /></motion.div>
        <motion.div variants={item}><Numbers m={m} theme={pool.theme} /></motion.div>

        <motion.div variants={item} className="hidden gap-3 sm:flex">
          <Button size="lg" onClick={() => setPaying(true)} disabled={closed} className="min-w-48">{closed ? "This pool has closed" : "Pool"}</Button>
          <Button size="lg" variant="secondary" onClick={share}><Share2 className="h-4 w-4" aria-hidden="true" /> Share</Button>
        </motion.div>

        <motion.div variants={item}><Insight pool={pool} /></motion.div>
        {pool.owner && <motion.div variants={item}><OwnerPanel pool={pool} onChanged={() => load()} onNewCode={onNewCode} /></motion.div>}
        {user && <motion.div variants={item}><YouPanel pool={pool} user={user} onChanged={() => load()} /></motion.div>}
        {m.payments > 0 && (
          <motion.div variants={item}>
            <Card title="The numbers"><PoolCharts charts={pool.charts} theme={pool.theme} /></Card>
          </motion.div>
        )}
        <motion.div variants={item}><Feed recent={pool.recent} /></motion.div>
        {!user && !closed && <motion.div variants={item}><ClaimAccount next={`/q/${pool.code}`} /></motion.div>}
        <motion.p variants={item} className="text-center text-[12px] text-ink-3">
          Pooling takes an M-Pesa number; your number is never shown to the group. <Link href="/terms-of-service" className="underline underline-offset-2">Terms</Link>
        </motion.p>
      </motion.div>

      {/* One primary action, resting above the bottom edge on phones. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.06] bg-white/90 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
        <div className="flex gap-2">
          <Button size="lg" block onClick={() => setPaying(true)} disabled={closed}>{closed ? "Closed" : "Pool"}</Button>
          <Button size="lg" variant="secondary" onClick={share} aria-label="Share"><Share2 className="h-4 w-4" aria-hidden="true" /></Button>
        </div>
      </div>

      <PaySheet open={paying} onClose={() => setPaying(false)} pool={pool} signedIn={!!user} onPaid={() => load()} />
    </main>
  );
}
