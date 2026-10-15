"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cake, Gift, Heart, HeartPulse, Flower2, PartyPopper, PiggyBank, Plane, Sparkles, Users } from "lucide-react";
import { EASE, SPRING } from "@/lib/motion";
import { KIND_LABEL, palette } from "@/lib/quickPool";

const ICON = { trip: Plane, party: PartyPopper, wedding: Heart, birthday: Cake, condolence: Flower2, medical: HeartPulse, savings: PiggyBank, community: Users, gift: Gift, everyday: Sparkles };

/** One period of a soft wave, repeated across twice the width so it can slide forever. */
function wavePath(width, amp, phase, base) {
  const steps = 32;
  let d = `M 0 ${base}`;
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width * 2;
    const y = base + Math.sin((x / width) * Math.PI * 2 * 2 + phase) * amp;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L ${width * 2} 400 L 0 400 Z`;
}

/**
 * The pool's picture (KB 2b): a vessel that fills to the share of the target collected, in a
 * light palette chosen by code from the pool's name. Calm and slow for loss and illness;
 * gently moving otherwise; still when the viewer prefers reduced motion.
 */
export function PoolVisual({ theme, pct = 0, reached = false, className = "" }) {
  const reduce = useReducedMotion();
  const p = palette(theme);
  const kind = theme?.kind || "everyday";
  const Icon = ICON[kind] || Sparkles;
  const seed = Number(theme?.seed) || 0;
  const W = 400;
  const H = 220;
  const level = Math.min(Math.max(pct, 0), 100);
  const top = H - 14 - (level / 100) * (H - 40);
  const amp = p.quiet ? 3 : 6;
  const [front, back] = useMemo(() => [wavePath(W, amp, seed % 7, 0), wavePath(W, amp * 0.8, (seed % 5) + 2, 6)], [amp, seed]);
  const orbs = useMemo(() => [0, 1, 2].map((i) => ({ x: 40 + ((seed * (i + 3) * 37) % 320), y: 30 + ((seed * (i + 5) * 13) % 90), r: 18 + ((seed + i * 11) % 22) })), [seed]);
  const slide = (seconds) => (reduce ? {} : { animate: { x: [0, -W] }, transition: { duration: seconds, ease: "linear", repeat: Infinity } });

  return (
    <div className={`relative overflow-hidden rounded-card ${className}`} style={{ background: `linear-gradient(160deg, ${p.ground}, #ffffff 70%)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`${Math.round(level)}% of the target collected`}>
        <defs>
          <linearGradient id={`qp-liquid-${seed}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={p.mid} />
            <stop offset="100%" stopColor={p.strong} stopOpacity="0.85" />
          </linearGradient>
          <filter id={`qp-blur-${seed}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        {orbs.map((o, i) => (
          <motion.circle
            key={i}
            cx={o.x}
            cy={o.y}
            r={o.r}
            fill={i % 2 ? p.accent2 : p.soft}
            filter={`url(#qp-blur-${seed})`}
            opacity={0.9}
            {...(reduce || p.quiet ? {} : { animate: { cy: [o.y, o.y + 10, o.y] }, transition: { duration: 7 + i * 2, ease: "easeInOut", repeat: Infinity } })}
          />
        ))}
        <motion.g initial={{ y: reduce ? top : H }} animate={{ y: top }} transition={reduce ? { duration: 0 } : { ...SPRING.heavy, delay: 0.2 }}>
          <motion.path d={back} fill={p.mid} opacity={0.45} {...slide(p.quiet ? 30 : 14)} />
          <motion.path d={front} fill={`url(#qp-liquid-${seed})`} opacity={0.9} {...slide(p.quiet ? 22 : 9)} />
        </motion.g>
        {reached && !p.quiet && !reduce && (
          <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING.playful, delay: 1 }} style={{ originX: "50%", originY: "50%" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={60 + i * 56} cy={36 + ((i * 29) % 40)} r={3} fill="#fff" opacity={0.9} />
            ))}
          </motion.g>
        )}
      </svg>
      <motion.span
        className="absolute left-4 top-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-[12px] font-bold backdrop-blur"
        style={{ color: p.ink }}
        initial={reduce ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
      >
        <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
        {KIND_LABEL[kind] || "Pool"}
      </motion.span>
    </div>
  );
}
