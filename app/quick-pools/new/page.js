"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Globe2, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { Button, ButtonLink, Card, Chips, CompactStepper, DoneMark, EmptyState, Helper, MoneyLines, RadioCards, Skeleton, TextField } from "@/components/kit";
import { PoolVisual } from "@/components/quickpool/PoolVisual";
import { quickPoolAPI, kes, sharePool } from "@/lib/quickPool";
import { requestVerificationEmail, verificationToast } from "@/lib/verification";
import { useStepVariants } from "@/lib/motion";

const STEPS = [{ label: "Name" }, { label: "Target" }, { label: "Duration" }, { label: "Who can pool" }];
const DAY = 86_400_000;

/** The pool's look follows its name; this mirrors the server's choice closely enough to preview it. */
function previewTheme(name) {
  const s = ` ${name.toLowerCase()} `;
  const kinds = [["condolence", 220, /funeral|burial|condolence|memorial|mazishi|send ?off|rest in peace/], ["medical", 195, /hospital|medical|surgery|treatment|clinic|get well|matibabu/], ["wedding", 335, /wedding|ruracio|dowry|harusi|engagement/], ["birthday", 20, /birthday|bday|cake/], ["trip", 175, /trip|safari|beach|diani|naivasha|mombasa|getaway|weekend|hike|holiday/], ["party", 285, /party|sherehe|bash|choma|bbq|concert/], ["savings", 145, /chama|sacco|savings|merry/], ["community", 40, /harambee|church|community|school|fees|fundraiser/], ["gift", 355, /gift|present|farewell|shower/]];
  const hit = kinds.find(([, , re]) => re.test(s));
  let seed = 0;
  for (const ch of s) seed = (seed * 31 + ch.charCodeAt(0)) % 10000;
  return { kind: hit?.[0] || "everyday", hue: hit?.[1] ?? seed % 360, seed };
}

export default function NewQuickPool() {
  const router = useRouter();
  const { user } = useAuth();
  const variants = useStepVariants();
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [days, setDays] = useState(7);
  const [customDate, setCustomDate] = useState("");
  const [limit, setLimit] = useState("10");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    quickPoolAPI.options().then(setOptions).catch(setOptionsError);
  }, [user]);

  const cap = options?.cap ?? 1_000_000;
  const theme = useMemo(() => previewTheme(name || "pool"), [name]);
  const n = Number(target);
  const maxDate = new Date(Date.now() + (options?.maxDurationDays ?? 90) * DAY).toISOString().slice(0, 10);
  const minDate = new Date(Date.now() + DAY).toISOString().slice(0, 10);

  const checks = [
    () => (name.trim().length < 2 ? "Give the pool a name." : name.trim().length > 60 ? "Keep the name under 60 characters." : /https?:|www\.|@/.test(name) ? "Leave links and emails out of the name: the pool's page is public." : ""),
    () => (!Number.isInteger(n) || n < 100 ? "Set a target of at least KES 100." : n > cap ? `The most a pool can collect is ${kes(cap)}.` : ""),
    () => (days === "custom" && !customDate ? "Pick the day it closes." : ""),
    () => { const l = Number(limit); return !Number.isInteger(l) || l < 2 || l > 1000 ? "Set a members limit from 2 to 1,000." : ""; },
  ];
  const go = (to) => {
    if (to > step) {
      const problem = checks[step]();
      if (problem) return setError(problem);
    }
    setError("");
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const create = async () => {
    const problem = checks.map((c) => c()).find(Boolean);
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    try {
      const duration = days === "custom" ? { endsAt: new Date(`${customDate}T23:59:00+03:00`).toISOString() } : { days };
      const res = await quickPoolAPI.create({ name: name.trim(), target: n, duration, access: "private", memberLimit: Number(limit) });
      setCreated(res);
    } catch (e) {
      setError(e.message || "Couldn't create the pool.");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/q/${created.code}`;
    const r = await sharePool({ name: name.trim(), url });
    if (r === "copied") toast.success("Link copied");
  };

  const verify = async () => {
    setSending(true);
    try {
      const t = verificationToast(await requestVerificationEmail(user, "/quick-pools/new"));
      toast[t.kind](t.text);
    } catch {
      toast.error("Couldn't send the link. Try again in a minute.");
    } finally {
      setSending(false);
    }
  };

  if (user && !user.emailVerified) {
    return (
      <PageFrame eyebrow="Quick Pool" title="Verify your email first">
        <Reveal>
          <Card>
            <p className="text-[15px] text-ink-2">A Quick Pool collects money from anyone with the link, so its creator needs a verified email. It takes one tap in your inbox.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" onClick={verify} loading={sending}>Send me the link</Button>
              <ButtonLink href="/verify-email?redirect=%2Fquick-pools%2Fnew" variant="secondary" size="lg">I've verified it</ButtonLink>
            </div>
          </Card>
        </Reveal>
      </PageFrame>
    );
  }

  if (optionsError || options?.available === false) {
    return (
      <PageFrame eyebrow="Quick Pool" title="Quick Pool">
        <Reveal><EmptyState title="Coming soon" text="Quick Pool isn't switched on yet. Plans with pooling work as before." action={<ButtonLink href="/plans/new">Create a plan</ButtonLink>} /></Reveal>
      </PageFrame>
    );
  }

  if (created) {
    return (
      <PageFrame eyebrow="Quick Pool" title="Your pool is ready">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <DoneMark />
          <p className="max-w-sm text-[15px] text-ink-2">Share the link with your group. Anyone with it can pool by M-Pesa; no account needed.</p>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Button size="lg" block onClick={share}><Share2 className="h-4 w-4" aria-hidden="true" /> Share the link</Button>
            <Button size="lg" block variant="secondary" onClick={() => router.push(`/q/${created.code}`)}>Open the pool</Button>
          </div>
        </Reveal>
      </PageFrame>
    );
  }

  return (
    <PageFrame eyebrow="Quick Pool" title="Start a pool" meta="A link anyone can pool into with M-Pesa.">
      {!options ? (
        <Reveal><Skeleton className="h-64 w-full rounded-card" /></Reveal>
      ) : (
        <Reveal className="flex flex-col gap-6">
          <PoolVisual theme={theme} pct={Math.min(100, (step + 1) * 25)} className="max-h-44" />
          <CompactStepper steps={STEPS} current={step} />
          <form onSubmit={(e) => { e.preventDefault(); step < STEPS.length - 1 ? go(step + 1) : create(); }} noValidate className="flex flex-col gap-6">
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" className="flex flex-col gap-4">
                  {step === 0 && (
                    <TextField id="qp-name" label="What's it for?" autoFocus maxLength={60} placeholder="Naivasha weekend" value={name} onChange={(e) => setName(e.target.value)} helper="Everyone with the link sees this." />
                  )}
                  {step === 1 && (
                    <>
                      <TextField id="qp-target" label="Target" prefix="KES" inputMode="numeric" autoFocus value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ""))} placeholder="20,000" />
                      <Chips label="Suggested targets" multiple={false} value={String(n)} onChange={(v) => setTarget(String(v))} options={(options.targets || []).map((t) => ({ value: String(t), label: t.toLocaleString("en-KE") }))} />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Chips label="How long it stays open" multiple={false} value={String(days)} onChange={(v) => setDays(v === "custom" ? "custom" : Number(v))} options={[...(options.durations || []).map((d) => ({ value: String(d.days), label: d.label })), { value: "custom", label: "Pick a date" }]} />
                      {days === "custom" && <TextField id="qp-date" label="Closes on" type="date" min={minDate} max={maxDate} value={customDate} onChange={(e) => setCustomDate(e.target.value)} helper={`Up to ${options.maxDurationDays} days from today.`} />}
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <RadioCards label="Who can pool" value="private" onChange={() => {}} options={[
                        { value: "private", label: <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" aria-hidden="true" /> Private</span>, sub: "Anyone with the link, up to a number of people you choose." },
                        { value: "open", label: <span className="inline-flex items-center gap-1.5 text-ink-3"><Globe2 className="h-4 w-4" aria-hidden="true" /> Open · coming soon</span>, sub: "No limit on who can pool." },
                      ]} />
                      <TextField id="qp-limit" label="Members limit" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))} helper="People who can pool, from 2 to 1,000. You can raise it later." />
                      <MoneyLines title="Your pool" rows={[["Name", name.trim()], ["Target", kes(n)], ["Open for", days === "custom" ? `until ${customDate}` : (options.durations.find((d) => d.days === days)?.label || `${days} days`)], ["Places", Number(limit).toLocaleString("en-KE"), true]]} />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <Helper error={error} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              {step > 0 ? <Button variant="text" onClick={() => go(step - 1)}>Back</Button> : <span />}
              <Button type="submit" size="lg" loading={busy} className="sm:min-w-48">{step < STEPS.length - 1 ? "Continue" : "Create pool"}</Button>
            </div>
          </form>
        </Reveal>
      )}
    </PageFrame>
  );
}
