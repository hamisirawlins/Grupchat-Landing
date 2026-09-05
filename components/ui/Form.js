"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import { EASE } from "@/lib/motion";

/**
 * Form primitives — the Apple ID field language. Stacked inputs in one rounded
 * container with hairline dividers; the group takes focus, not the row.
 */
export function FieldGroup({ children }) {
  return (
    <div className="divide-y divide-black/[0.08] overflow-hidden rounded-xl border border-black/[0.12] bg-white transition-[border-color,box-shadow] duration-300 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-600/10">
      {children}
    </div>
  );
}

function FloatingLabel({ htmlFor, floated, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`pointer-events-none absolute left-4 text-gray-500 transition-all duration-200 ease-out ${
        floated ? "top-2.5 text-[11px] font-medium" : "top-1/2 -translate-y-1/2 text-[15px]"
      }`}
    >
      {children}
    </label>
  );
}

/** One row of a FieldGroup. 16px text so iOS doesn't zoom. */
export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = true,
  inputMode,
  min,
  max,
  step,
  prefix,
  trailing,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value !== "" && value !== null && value !== undefined) || !!prefix;

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-4 top-[26px] text-base text-gray-500">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        className={`h-14 w-full bg-transparent pb-2 pt-6 text-base text-black outline-none ${
          prefix ? "pl-14" : "px-4"
        } ${trailing ? "pr-14" : "pr-4"}`}
      />
      <FloatingLabel htmlFor={id} floated={floated}>
        {label}
      </FloatingLabel>
      {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

export function TextAreaField({ id, label, value, onChange, rows = 3, required = false, maxLength }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== "";
  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        required={required}
        maxLength={maxLength}
        className="w-full resize-none bg-transparent px-4 pb-3 pt-7 text-base leading-relaxed text-black outline-none"
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 text-gray-500 transition-all duration-200 ease-out ${
          floated ? "top-2.5 text-[11px] font-medium" : "top-4 text-[15px]"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

export function SelectField({ id, label, value, onChange, options, required = true }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="h-14 w-full appearance-none bg-transparent px-4 pb-2 pt-6 text-base text-black outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="pointer-events-none absolute left-4 top-2.5 text-[11px] font-medium text-gray-500">
        {label}
      </label>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
    </div>
  );
}

export function PasswordField({ id, label, value, onChange, autoComplete = "current-password" }) {
  const [show, setShow] = useState(false);
  const Icon = show ? EyeOff : Eye;
  return (
    <Field
      id={id}
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="rounded-md p-2.5 text-gray-400 transition-colors duration-300 hover:text-black"
        >
          <Icon className="h-[18px] w-[18px]" />
        </button>
      }
    />
  );
}

// Primary — the landing's purple-600, darkening a step on hover.
export const PRIMARY =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-[15px] font-semibold text-white transition-colors duration-300 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600";
// Alternatives — the landing's "Open Web App" outline: a 2px rule that fills on hover.
export const OUTLINE =
  "flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-purple-600 bg-white px-6 text-[15px] font-semibold text-purple-600 transition-all duration-300 hover:bg-purple-600 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-purple-600";

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current ${className}`}
      aria-hidden="true"
    />
  );
}

export function PrimaryButton({ children, loading = false, disabled, type = "submit", className = "", ...props }) {
  const inert = disabled || loading;
  return (
    <motion.button
      type={type}
      disabled={inert}
      whileTap={inert ? undefined : { scale: 0.98 }}
      className={twMerge(PRIMARY, className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

export function OutlineButton({ children, onClick, type = "button", disabled, loading = false, className = "" }) {
  const inert = disabled || loading;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={inert}
      whileTap={inert ? undefined : { scale: 0.98 }}
      className={twMerge(OUTLINE, className)}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

export function ButtonLink({ href, children, variant = "primary", className = "" }) {
  return (
    <Link href={href} className={twMerge(variant === "outline" ? OUTLINE : PRIMARY, className)}>
      {children}
    </Link>
  );
}

export function GoogleButton({ onClick, disabled, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={OUTLINE}
    >
      <Image src="/google.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
      {children}
    </motion.button>
  );
}

export function Divider({ children = "or" }) {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-400" aria-hidden="true">
      <span className="h-px flex-1 bg-black/[0.08]" />
      {children}
      <span className="h-px flex-1 bg-black/[0.08]" />
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <motion.p
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="text-[13px] leading-snug text-red-600"
    >
      {children}
    </motion.p>
  );
}

export function SuccessMark() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white"
    >
      <Check className="h-5 w-5" strokeWidth={2.5} />
    </motion.div>
  );
}
