"use client";

import { forwardRef, useId } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";

/**
 * Labelled fields for longer forms (the provider application, listings, admin
 * checklists): the label sits above, the input is 52px tall with an inset ring,
 * and text is 16px so iOS never zooms. Errors replace the helper and are read
 * out (role="alert").
 */
const INPUT =
  "w-full rounded-input bg-white text-base text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] outline-none transition-[box-shadow] duration-200 ease-gc placeholder:text-gray-400 focus:shadow-[inset_0_0_0_2px_var(--color-action)] disabled:bg-soft disabled:text-ink-2";

export function Label({ htmlFor, children, optional = false, className = "" }) {
  return (
    <label htmlFor={htmlFor} className={twMerge("text-[13px] font-semibold leading-[18px] text-ink", className)}>
      {children}
      {optional && <span className="font-medium text-ink-3"> (optional)</span>}
    </label>
  );
}

export function Helper({ id, error, children }) {
  if (error) {
    return (
      <span id={id} role="alert" className="text-[13px] leading-[18px] text-critical">
        {error}
      </span>
    );
  }
  if (!children) return null;
  return (
    <span id={id} className="text-[13px] leading-[18px] text-ink-3">
      {children}
    </span>
  );
}

export const TextField = forwardRef(function TextField(
  { id, label, helper, error, optional, prefix, className = "", inputClassName = "", ...rest },
  ref,
) {
  const auto = useId();
  const fid = id || auto;
  const hid = `${fid}-help`;
  const ring = error ? "shadow-[inset_0_0_0_2px_var(--color-critical)] focus-within:shadow-[inset_0_0_0_2px_var(--color-critical)]" : "";
  return (
    <div className={twMerge("flex min-w-0 flex-col gap-1.5", className)}>
      {label && <Label htmlFor={fid} optional={optional}>{label}</Label>}
      {prefix ? (
        <div className={twMerge("flex h-[52px] items-center gap-2.5 rounded-input bg-white px-4 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-[box-shadow] duration-200 focus-within:shadow-[inset_0_0_0_2px_var(--color-action)]", ring)}>
          <span className="text-base font-semibold text-ink-2">{prefix}</span>
          <input ref={ref} id={fid} aria-invalid={!!error || undefined} aria-describedby={helper || error ? hid : undefined} className={twMerge("h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-gray-400", inputClassName)} {...rest} />
        </div>
      ) : (
        <input ref={ref} id={fid} aria-invalid={!!error || undefined} aria-describedby={helper || error ? hid : undefined} className={twMerge(INPUT, "h-[52px] px-4", ring, inputClassName)} {...rest} />
      )}
      <Helper id={hid} error={error}>{helper}</Helper>
    </div>
  );
});

export const TextArea = forwardRef(function TextArea({ id, label, helper, error, optional, rows = 4, className = "", ...rest }, ref) {
  const auto = useId();
  const fid = id || auto;
  const hid = `${fid}-help`;
  return (
    <div className={twMerge("flex min-w-0 flex-col gap-1.5", className)}>
      {label && <Label htmlFor={fid} optional={optional}>{label}</Label>}
      <textarea
        ref={ref}
        id={fid}
        rows={rows}
        aria-invalid={!!error || undefined}
        aria-describedby={helper || error ? hid : undefined}
        className={twMerge(INPUT, "resize-y px-3.5 py-3 leading-6", error && "shadow-[inset_0_0_0_2px_var(--color-critical)]")}
        {...rest}
      />
      <Helper id={hid} error={error}>{helper}</Helper>
    </div>
  );
});

/** A native select (the right picker on every phone) dressed like the other fields. */
export function SelectField({ id, label, helper, error, options = [], placeholder, className = "", ...rest }) {
  const auto = useId();
  const fid = id || auto;
  const hid = `${fid}-help`;
  return (
    <div className={twMerge("flex min-w-0 flex-col gap-1.5", className)}>
      {label && <Label htmlFor={fid}>{label}</Label>}
      <div className="relative">
        <select
          id={fid}
          aria-invalid={!!error || undefined}
          aria-describedby={helper || error ? hid : undefined}
          className={twMerge(INPUT, "h-[52px] appearance-none pl-4 pr-11", error && "shadow-[inset_0_0_0_2px_var(--color-critical)]")}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-2" />
      </div>
      <Helper id={hid} error={error}>{helper}</Helper>
    </div>
  );
}

/** Two fields side by side from 480px, stacked below. */
export function FieldRow({ children, className = "" }) {
  return <div className={twMerge("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
