"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRequireAuth } from "@/components/app/AppShell";
import { Button, ButtonLink, CompactStepper, Kicker, Skeleton, VerticalStepper } from "@/components/kit";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { useStepVariants } from "@/lib/motion";
import { STEPS, stepIndex } from "@/lib/providers";
import { ProviderTag } from "./Tags";

/**
 * The provider application (KB D-043): four steps under one layout, so the
 * application is read once and kept while the steps change. Steps slide in the
 * direction you travel; on phones the stepper becomes one line and a bar.
 */
const Ctx = createContext(null);
export const useApplication = () => useContext(Ctx);

export function ProviderHeader({ right }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-line bg-white/90 px-5 py-2.5 backdrop-blur sm:min-h-[72px] sm:px-8 lg:px-12">
      <Link href="/providers" className="flex items-center gap-2.5 text-ink">
        <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" priority />
        <span className="text-lg font-extrabold tracking-[-0.01em]">GrupChat</span>
        <ProviderTag />
      </Link>
      {right}
    </header>
  );
}

export function ApplicationShell({ children }) {
  const { ready } = useRequireAuth();
  const pathname = usePathname() || "";
  const router = useRouter();
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const index = stepIndex(pathname);
  const prev = useRef(index);
  const direction = index >= prev.current ? 1 : -1;
  useEffect(() => { prev.current = index; }, [index]);
  const variants = useStepVariants();

  const reload = useCallback(async () => {
    try {
      const data = unwrap(await providersAPI.me());
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
      return null;
    }
  }, []);
  useEffect(() => { if (ready) reload(); }, [ready, reload]);

  // Once an application is with the team, the steps are read-only: the status page says what's next.
  const status = state.data?.provider?.status;
  useEffect(() => {
    if (status === "approved") router.replace("/provider");
    else if (["submitted", "in-review", "declined", "waiting"].includes(status) && !pathname.endsWith("/submit")) router.replace("/providers/status");
  }, [status, pathname, router]);

  if (!ready) return <div className="min-h-screen bg-white" aria-busy="true" />;
  const steps = STEPS.map((s, i) => ({ ...s, href: i < index ? s.href : undefined }));

  return (
    <Ctx.Provider value={{ ...state, reload, setData: (data) => setState((s) => ({ ...s, data })) }}>
      <div className="flex min-h-screen flex-col bg-white text-ink">
        <ProviderHeader right={<ButtonLink href="/providers/status" variant="text" size="md" className="text-ink-2 hover:bg-soft">Save and exit</ButtonLink>} />
        <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-8 px-5 pb-28 pt-6 sm:px-8 sm:pt-12 lg:flex-row lg:gap-14 lg:px-12">
          <nav aria-label="Application steps" className="hidden w-[200px] shrink-0 lg:block">
            <div className="sticky top-28"><VerticalStepper steps={steps} current={index} label="Application steps" /></div>
          </nav>
          <div className="lg:hidden"><CompactStepper steps={STEPS} current={index} /></div>
          <main className="relative min-w-0 max-w-[640px] flex-1">
            {state.loading ? (
              <div className="flex flex-col gap-6" aria-busy="true">
                <Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-2/3" /><Skeleton className="h-[52px] w-full" /><Skeleton className="h-[52px] w-full" /><Skeleton className="h-28 w-full" />
              </div>
            ) : state.error ? (
              <div role="alert" className="flex flex-col items-start gap-4 rounded-card bg-critical-tint p-6">
                <p className="text-[15px] font-semibold text-critical">{state.error.message || "We couldn't load your application."}</p>
                <Button variant="quiet" onClick={() => { setState((s) => ({ ...s, loading: true })); reload(); }}>Try again</Button>
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div key={pathname} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="flex flex-col gap-7">
                  {children}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function StepTitle({ n, title, sub }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="hidden lg:block"><Kicker>Step {n} of 4</Kicker></span>
      <h1 className="text-[28px] font-black leading-[34px] tracking-[-0.03em] sm:text-[32px] sm:leading-[38px]">{title}</h1>
      {sub && <p className="text-base leading-6 text-ink-2">{sub}</p>}
    </div>
  );
}

/** Back on the left, the one primary action on the right; pinned to the bottom on phones. */
export function StepFooter({ back, next, nextLabel = "Continue", loading, disabled, onNext }) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:pt-6 sm:backdrop-blur-0 sm:[border-top:1px_solid_var(--color-line)]">
        {back ? <ButtonLink href={back} variant="quiet" size="lg" className="px-5">Back</ButtonLink> : <span />}
        {onNext ? (
          <Button size="lg" className="px-8" loading={loading} disabled={disabled} onClick={onNext}>{nextLabel}</Button>
        ) : (
          <ButtonLink href={next} size="lg" className="px-8">{nextLabel}</ButtonLink>
        )}
      </div>
    </>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl bg-critical-tint px-4 py-3 text-[15px] font-semibold text-critical">{children}</p>;
}
