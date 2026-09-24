"use client";

import { CountUp } from "@/components/bits";

/**
 * The product, in one card. An illustrative plan — not live data — shown because the fastest
 * way to answer "what is this" is to show the thing rather than describe it.
 */
const PEOPLE = [
  { n: "Aisha K", c: "bg-purple-100 text-purple-700" },
  { n: "Brian O", c: "bg-amber-100 text-amber-700" },
  { n: "Cynthia M", c: "bg-emerald-100 text-emerald-700" },
  { n: "Dennis W", c: "bg-sky-100 text-sky-700" },
  { n: "Eunice N", c: "bg-rose-100 text-rose-700" },
];

const RAISED = 48000;
const TARGET = 70000;

export default function PlanCardMock() {
  const pct = Math.round((RAISED / TARGET) * 100);

  return (
    <div className="w-full rounded-3xl border border-black/[0.07] bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(24,16,48,0.35)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-black">Diani, Easter weekend</p>
          <p className="mt-0.5 text-[13px] text-gray-500">6 going · closes in 9 days</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
          Collecting
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-[13px] font-medium text-gray-400">KES</span>
        <span className="text-3xl font-bold tracking-tight text-black">
          <CountUp to={RAISED} duration={1600} format={(n) => Math.round(n).toLocaleString()} />
        </span>
        <span className="text-[13px] text-gray-400">of {TARGET.toLocaleString()}</span>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Plan funded"
      >
        <div
          className="h-full rounded-full bg-purple-600 transition-[width] duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {PEOPLE.map((p) => (
            <span
              key={p.n}
              title={p.n}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-white text-[12px] font-semibold ${p.c}`}
            >
              {p.n[0]}
            </span>
          ))}
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[12px] font-semibold text-gray-500 ring-2 ring-white">
            +1
          </span>
        </div>
        <span className="rounded-full bg-black px-3.5 py-1.5 text-[13px] font-semibold text-white">
          Contribute
        </span>
      </div>

      <p className="mt-4 border-t border-black/[0.06] pt-3 text-[12px] text-gray-400">
        Pooling is free, withdrawal charges apply
      </p>
    </div>
  );
}
