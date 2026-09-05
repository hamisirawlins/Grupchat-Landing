"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

/** iOS-style segmented control. `options: [{ value, label }]`. */
export function Segmented({ value, onChange, options, name = "segment", className = "" }) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
              active ? "text-black" : "text-gray-500 hover:text-black"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${name}-pill`}
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ duration: 0.3, ease: EASE }}
                aria-hidden="true"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
