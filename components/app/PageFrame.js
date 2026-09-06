"use client";

import { createContext, useContext } from "react";
import { motion } from "framer-motion";
import AppShell, { BackToHome } from "@/components/app/AppShell";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { PullToRefresh } from "@/components/ui/PullToRefresh";

const RevealCtx = createContext(null);

/** Standard signed-in page: large title, optional meta line, staggered reveal.
 *  Pass `onRefresh` to enable pull-to-refresh on touch devices. */
export function PageFrame({ eyebrow, title, meta, trailing, wide = false, onRefresh, children }) {
  const item = useRevealVariants();
  const body = (
        <motion.div
          className={`mx-auto ${wide ? "max-w-5xl" : "max-w-3xl"} px-6 pb-32 pt-8 sm:pb-24 sm:pt-16`}
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          {(eyebrow || title) && (
            <motion.header variants={item} className="mb-8">
              {eyebrow && <div className="text-sm font-medium text-gray-500">{eyebrow}</div>}
              {title && (
                <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
              )}
              {meta && <p className="mt-3 text-[15px] text-gray-500">{meta}</p>}
            </motion.header>
          )}
          {children}
        </motion.div>
  );
  return (
    <AppShell trailing={trailing === undefined ? <BackToHome /> : trailing}>
      <RevealCtx.Provider value={item}>
        {onRefresh ? <PullToRefresh onRefresh={onRefresh}>{body}</PullToRefresh> : body}
      </RevealCtx.Provider>
    </AppShell>
  );
}

/** A block that takes part in the page's staggered reveal. */
export function Reveal({ className = "", children }) {
  const item = useContext(RevealCtx);
  return (
    <motion.div variants={item ?? undefined} className={className}>
      {children}
    </motion.div>
  );
}

export function Section({ title, action, children, className = "" }) {
  return (
    <Reveal className={`border-t border-black/[0.08] pt-8 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </Reveal>
  );
}
