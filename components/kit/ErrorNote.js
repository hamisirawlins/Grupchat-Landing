"use client";

import { twMerge } from "tailwind-merge";
import { AlertCircle, RotateCw } from "lucide-react";

/**
 * A failed action, said once, next to where it happened: the sentence, a "Try again" when
 * another go could work (our side or the connection), and the server's reference when there
 * is one, so support can find it in the logs. `error` is a string or an ApiError.
 */
export function ErrorNote({ error, onRetry, retryLabel = "Try again", busy = false, topic = "A problem on GrupChat", className = "" }) {
  if (!error) return null;
  const message = typeof error === "string" ? error : error.message || "That didn't work. Try again.";
  const ref = typeof error === "string" ? null : error.ref;
  const canRetry = onRetry && (typeof error === "string" || error.retryable !== false);
  return (
    <div role="alert" className={twMerge("flex flex-col gap-1 text-[13px] leading-[18px]", className)}>
      <span className="flex items-start gap-1.5 font-semibold text-critical">
        <AlertCircle aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
        <span>{message}</span>
      </span>
      {(canRetry || ref) && (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-[22px] text-ink-3">
          {canRetry && (
            <button type="button" onClick={onRetry} disabled={busy} className="inline-flex min-h-8 items-center gap-1.5 text-left font-semibold text-action-strong underline-offset-2 hover:underline disabled:opacity-50">
              <RotateCw aria-hidden="true" className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
              {retryLabel}
            </button>
          )}
          {ref && (
            <span>
              Still stuck? Email <a href={`mailto:info@grupchat.net?subject=${encodeURIComponent(`${topic} (ref ${ref})`)}`} className="font-semibold text-ink-2 underline underline-offset-2">info@grupchat.net</a> with reference <span className="select-all font-mono font-semibold text-ink-2">{ref}</span>.
            </span>
          )}
        </span>
      )}
    </div>
  );
}
