"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { SPRING } from "@/lib/motion";

/**
 * Buttons in the "Plans to memories" scheme (KB 25 §Scheme). One primary per
 * screen; the rest are secondary (outlined), quiet (filled grey) or plain text.
 * Gold is for remembering — a recap, a share — never for doing.
 */
const VARIANTS = {
  primary: "bg-action text-white hover:bg-action-strong disabled:bg-soft disabled:text-gray-400",
  secondary: "bg-white text-action-strong shadow-[inset_0_0_0_2px_var(--color-action)] hover:bg-action-tint disabled:text-gray-400 disabled:shadow-[inset_0_0_0_2px_#e5e7eb]",
  quiet: "bg-soft text-ink hover:bg-gray-200 disabled:text-gray-400",
  text: "bg-transparent text-action-strong hover:bg-action-tint disabled:text-gray-400",
  gold: "bg-memory text-ink hover:brightness-95 disabled:opacity-50",
  danger: "bg-transparent text-critical hover:bg-critical-tint disabled:text-gray-400",
  dark: "bg-ink text-white hover:bg-black disabled:bg-gray-300",
};
const SIZES = {
  lg: "h-[52px] gap-2 rounded-button px-6 text-base",
  md: "h-11 gap-2 rounded-[14px] px-4 text-[15px]",
  sm: "h-9 gap-1.5 rounded-xl px-3 text-sm",
};

export function buttonClasses({ variant = "primary", size = "md", block = false, className = "" } = {}) {
  return twMerge(
    "relative inline-flex select-none items-center justify-center whitespace-nowrap font-bold transition-[background-color,color,box-shadow,filter] duration-200 ease-gc disabled:cursor-not-allowed",
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    block && "w-full",
    className,
  );
}

function Spinner() {
  return (
    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
      <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-r-transparent" />
    </span>
  );
}

/** A button that answers the press, and shows a spinner (and keeps its width) while `loading`. */
export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", block = false, loading = false, disabled, className = "", children, type = "button", ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileTap={disabled || loading || reduce ? undefined : { scale: 0.98 }}
      transition={SPRING.ui}
      className={buttonClasses({ variant, size, block, className })}
      {...rest}
    >
      <span className={`inline-flex items-center gap-2 ${loading ? "invisible" : ""}`}>{children}</span>
      {loading && <Spinner />}
    </motion.button>
  );
});

/** A link that looks like a button. */
export function ButtonLink({ href, variant = "primary", size = "md", block = false, className = "", children, ...rest }) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, block, className: `active:scale-[0.98] ${className}` })} {...rest}>
      {children}
    </Link>
  );
}

/** A 44pt icon-only button. Always pass `label`. */
export function IconButton({ label, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={twMerge("inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-soft hover:text-ink active:scale-95", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
