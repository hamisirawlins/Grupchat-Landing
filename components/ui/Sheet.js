"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { EASE } from "@/lib/motion";

/**
 * Modal surface: a bottom sheet on phones, a centred card from 640px up.
 * Traps initial focus, closes on Esc and scrim tap, locks body scroll.
 */
export function Sheet({ open, onClose, title, children, footer }) {
  const panelRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
            className="relative w-full max-w-md rounded-t-2xl bg-white px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_8px_30px_rgba(0,0,0,0.08)] outline-none sm:rounded-2xl sm:pb-6"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title && (
                <h2 id="sheet-title" className="text-[17px] font-semibold tracking-tight">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 rounded-md p-2.5 text-gray-400 transition-colors duration-300 hover:text-black"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="mt-5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
