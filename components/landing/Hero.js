"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { SplitText, Magnet, ClickSpark, SpotlightCard, DotGrid, AnimatedContent } from "@/components/bits";
import PlanCardMock from "./PlanCardMock";

/**
 * The hero.
 *
 * Asymmetric rather than centred: the copy holds the left and the product holds the right, so
 * the page answers "what is this" with a picture of the thing instead of another sentence. The
 * accent is `purple-600`, which is the app's primary per D-008 — the landing had been left on
 * the superseded gold, so the two halves of the product did not look related.
 *
 * Every figure on this page is either a real product fact or visibly an illustration. No
 * invented traction.
 */

/* One fact, not a claim: contributions carry no platform fee (D-029). The withdrawal fee and
   the payment rails were here too and were taken out on 2026-09-24 — the hero is not the place
   to price the product. */
const FACTS = [{ k: "Free", v: "to contribute" }];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* the field, and one soft bloom behind the product card */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.9]">
          <DotGrid gap={28} dot={1.5} baseAlpha={0.06} radius={190} />
        </div>
        <div className="absolute -right-24 -top-24 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-purple-200/50 via-indigo-100/40 to-transparent blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-amber-100/40 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ---- the case ------------------------------------------------ */}
          <div className="lg:col-span-7">
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5">
                {!reduce && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-70" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-600" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                Live on Android and web
              </span>
            </motion.div>

            <SplitText
              as="h1"
              text="Powering plans beyond the chat"
              className="mt-6 text-[2.6rem] font-bold leading-[1.04] tracking-[-0.03em] text-black sm:text-6xl lg:text-7xl"
              highlight={["beyond", "the", "chat"]}
              highlightClassName="text-purple-600"
              delay={0.08}
              stagger={0.05}
            />

            <motion.p
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.42 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg"
            >
              Less apps, notifications and follow ups to make those group plans reality!
            </motion.p>

            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.52 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Magnet strength={0.22} radius={90}>
                <ClickSpark color="#7c3aed">
                  <Link
                    href="/sign-up"
                    className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-purple-600 px-7 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.7)] transition-[background-color,box-shadow] duration-300 hover:bg-purple-700"
                  >
                    Start a plan
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </ClickSpark>
              </Magnet>

              <Link
                href="/discover"
                className="inline-flex min-h-[48px] items-center rounded-full border border-black/[0.12] bg-white/70 px-6 text-[15px] font-semibold text-black backdrop-blur transition-colors duration-300 hover:border-black/25"
              >
                Browse plans
              </Link>
            </motion.div>

            {/* the three true things */}
            <motion.dl
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.62 }}
              className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-black/[0.07] pt-6"
            >
              {FACTS.map((f) => (
                <div key={f.k} className="flex items-baseline gap-2">
                  <dt className="text-lg font-bold tracking-tight text-black">{f.k}</dt>
                  <dd className="text-[13px] text-gray-500">{f.v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* ---- the thing itself ---------------------------------------- */}
          <div className="lg:col-span-5">
            <AnimatedContent delay={0.25} distance={26}>
              <SpotlightCard className="rounded-3xl" radius={380}>
                <motion.div
                  animate={reduce ? {} : { y: [0, -8, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <PlanCardMock />
                </motion.div>
              </SpotlightCard>
            </AnimatedContent>
          </div>
        </div>
      </div>
    </section>
  );
}
