"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { kesShort, palette } from "@/lib/quickPool";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BANDS = [["lt100", "Under 100"], ["100to499", "100–499"], ["500to999", "500–999"], ["1kto4999", "1k–5k"], ["5kto9999", "5k–10k"], ["10kplus", "10k+"]];
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;

function Columns({ values, labels, color, faint, height = 88, highlightLast = true, title }) {
  const reduce = useReducedMotion();
  const max = Math.max(...values, 1);
  const last = values.length - 1;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-[13px] font-semibold text-ink-2">{title}</figcaption>
      <div className="flex items-end gap-[3px]" style={{ height }} aria-hidden="true">
        {values.map((v, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-[4px]"
            style={{ height: `${Math.max((v / max) * 100, v ? 8 : 3)}%`, originY: 1, background: (highlightLast ? i === last : v === max && v > 0) ? color : faint }}
            initial={{ scaleY: reduce ? 1 : 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.025 }}
          />
        ))}
      </div>
      {labels && (
        <div className="flex justify-between text-[11px] text-ink-3">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </figure>
  );
}

/** The pool's numbers as pictures: the last 14 days, the hours people pool, and amount sizes. Totals only. */
export function PoolCharts({ charts, theme }) {
  const p = palette(theme);
  const days = charts?.last14 || [];
  const dayLabels = days.length ? [new Date(days[0].day).toLocaleDateString("en-KE", { day: "numeric", month: "short" }), "Today"] : null;
  const hours = charts?.byHour || [];
  const busiest = hours.some(Boolean) ? hours.indexOf(Math.max(...hours)) : null;
  const bands = BANDS.map(([k, label]) => [label, Number(charts?.bands?.[k]) || 0]);
  const totalBands = bands.reduce((s, [, n]) => s + n, 0);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Columns title={`Pooled each day · ${kesShort(days.reduce((s, d) => s + d.amount, 0))} in 14 days`} values={days.map((d) => d.amount)} labels={dayLabels} color={p.strong} faint={p.soft} />
      </div>
      <Columns title={busiest == null ? "When people pool" : `When people pool · busiest around ${hourLabel(busiest)}`} values={hours} labels={["12am", "6am", "12pm", "6pm", ""]} color={p.strong} faint={p.soft} height={64} highlightLast={false} />
      <figure className="flex flex-col gap-2">
        <figcaption className="text-[13px] font-semibold text-ink-2">Payment sizes (KES)</figcaption>
        <div className="flex flex-col gap-1.5">
          {bands.map(([label, n]) => (
            <div key={label} className="flex items-center gap-2 text-[12px]">
              <span className="w-16 shrink-0 text-ink-3">{label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
                <motion.span className="block h-full rounded-full" style={{ background: p.strong }} initial={{ width: 0 }} animate={{ width: `${totalBands ? (n / totalBands) * 100 : 0}%` }} transition={{ duration: 0.7, ease: EASE, delay: 0.4 }} />
              </span>
              <span className="tabular w-6 text-right text-ink-2">{n}</span>
            </div>
          ))}
        </div>
      </figure>
      <p className="sr-only">Busiest day: {charts?.byDow?.some(Boolean) ? DAYS[charts.byDow.indexOf(Math.max(...charts.byDow))] : "none yet"}.</p>
    </div>
  );
}
