"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { SplitText, Magnet, ClickSpark, SpotlightCard, DotGrid } from "@/components/bits";
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
            <div
              className="gc-rise inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 backdrop-blur"
              style={{ "--gc-rise-y": "10px" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                {!reduce && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-70" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-600" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                Plans to memories
              </span>
            </div>

            <SplitText
              as="h1"
              text="Powering plans beyond the chat"
              className="mt-6 text-[2.6rem] font-bold leading-[1.04] tracking-[-0.03em] text-black sm:text-6xl lg:text-7xl"
              highlight={["beyond", "the", "chat"]}
              highlightClassName="text-purple-600"
              delay={0.08}
              stagger={0.05}
            />

            <p
              className="gc-rise mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg"
              style={{ "--gc-delay": "420ms" }}
            >
              Less apps, notifications and follow ups to make those group plans reality!
            </p>

            <div
              className="gc-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ "--gc-delay": "520ms" }}
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
                href="/experiences"
                className="inline-flex min-h-[48px] items-center rounded-full border border-black/[0.12] bg-white/70 px-6 text-[15px] font-semibold text-black backdrop-blur transition-colors duration-300 hover:border-black/25"
              >
                Browse experiences
              </Link>
            </div>

            {/* the three true things */}
            <dl
              className="gc-rise mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-black/[0.07] pt-6"
              style={{ "--gc-delay": "620ms" }}
            >
              {FACTS.map((f) => (
                <div key={f.k} className="flex items-baseline gap-2">
                  <dt className="text-lg font-bold tracking-tight text-black">{f.k}</dt>
                  <dd className="text-[13px] text-gray-500">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ---- the thing itself ---------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="gc-rise" style={{ "--gc-delay": "250ms", "--gc-rise-y": "26px" }}>
              <SpotlightCard className="rounded-3xl" radius={380}>
                <div className="gc-drift" style={{ "--gc-dy": "-8px", "--gc-dur": "7s" }}>
                  <PlanCardMock />
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
