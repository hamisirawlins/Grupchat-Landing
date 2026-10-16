"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Upload, X } from "lucide-react";
import { DOCUMENT_ACCEPT, ErrorNote, FilePickButton, MAX_DOCUMENT_MB, fileSize } from "@/components/kit";
import { providersAPI, uploadType } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { useListItemVariants } from "@/lib/motion";
import { AppliesTag } from "./Tags";

/**
 * One checklist item that needs files: what it is, what's uploaded, and the
 * button to add more. Uploads go straight to the API as raw bytes; a file that
 * is too big or the wrong kind is refused here first, with the reason.
 */
const ACCEPTED = new Set(DOCUMENT_ACCEPT.split(","));

/** Why a file can't go, before it's sent; null when it can. */
function refuse(f) {
  if (!ACCEPTED.has(uploadType(f))) return `${f.name} isn't a PDF, JPG or PNG. Save it as one of those and try again.`;
  if (f.size === 0) return `${f.name} is empty. Choose the file again.`;
  if (f.size > MAX_DOCUMENT_MB * 1024 * 1024) return `${f.name} is ${fileSize(f.size)}. Files must be ${MAX_DOCUMENT_MB} MB or smaller: try a photo or a scan at a lower quality.`;
  return null;
}

export function DocumentRow({ item, onChange, readOnly = false, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [failed, setFailed] = useState([]); // files to send again with "Try again"
  const [removing, setRemoving] = useState(null);
  const itemVariants = useListItemVariants();
  const done = item.files.length > 0;

  // One file at a time; each success shows straight away, so a later failure never hides it.
  const send = async (list) => {
    setError(null);
    setFailed([]);
    const refused = list.map(refuse).find(Boolean);
    if (refused) return setError(refused);
    setBusy(true);
    for (let i = 0; i < list.length; i += 1) {
      try {
        onChange(unwrap(await providersAPI.uploadDocument(item.id, list[i])));
      } catch (e) {
        if (e?.name === "SessionError") break;
        const rest = list.slice(i);
        setFailed(e?.retryable === false ? [] : rest);
        setError(rest.length > 1 && e?.retryable !== false ? Object.assign(e, { message: `${e.message} ${rest.length} files weren't sent.` }) : e);
        break;
      }
    }
    setBusy(false);
  };

  const pick = (files) => send(Array.isArray(files) ? files : [files]);

  const remove = async (fileId) => {
    setRemoving(fileId);
    setError(null);
    setFailed([]);
    try {
      onChange(unwrap(await providersAPI.removeDocument(item.id, fileId)));
    } catch (e) {
      setError(e?.message ? e : "Couldn't remove it. Try again.");
    } finally {
      setRemoving(null);
    }
  };

  const open = async (fileId) => {
    try {
      const { url } = unwrap(await providersAPI.documentUrl(item.id, fileId));
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setError(e?.message ? e : "Couldn't open it. Try again.");
    }
  };

  return (
    <div className={`flex gap-3.5 ${compact ? "" : "border-b border-black/[0.06] py-4"}`}>
      <span aria-hidden="true" className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${done ? "bg-success-tint text-success" : "shadow-[inset_0_0_0_2px_rgb(0_0_0/0.12)] text-ink-3"}`}>
        {done ? <Check className="h-[18px] w-[18px]" strokeWidth={2.5} /> : <FileText className="h-4 w-4" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold leading-5">{item.title}</span>
          <AppliesTag appliesTo={item.appliesTo} />
          {!item.required && <span className="text-xs font-semibold text-ink-3">Optional</span>}
        </div>
        {item.hint && <span className="text-[13px] leading-[18px] text-ink-2">{item.hint}</span>}
        <ul className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {item.files.map((f) => (
              <motion.li key={f.id} layout variants={itemVariants} initial="initial" animate="animate" exit="exit" className="flex items-center gap-1.5 text-[13px] leading-[18px] text-ink-3">
                <FileText aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <button type="button" onClick={() => open(f.id)} className="min-w-0 truncate text-left font-medium text-ink-2 underline-offset-2 hover:underline">{f.fileName}</button>
                <span className="shrink-0">· {fileSize(f.bytes)}</span>
                {!readOnly && (
                  <button type="button" onClick={() => remove(f.id)} disabled={removing === f.id} aria-label={`Remove ${f.fileName}`} className="ml-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-soft hover:text-ink disabled:opacity-40">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <ErrorNote error={error} onRetry={failed.length ? () => send(failed) : null} retryLabel={failed.length > 1 ? `Send the ${failed.length} files again` : "Try again"} busy={busy} topic={`Document upload: ${item.title}`} />
      </div>
      {!readOnly && (
        <div className="shrink-0">
          <FilePickButton accept={DOCUMENT_ACCEPT} multiple={item.kind === "photos-document"} onPick={pick} loading={busy} variant={done ? "quiet" : "secondary"} size="md" label={`${done ? "Add another file for" : "Upload"} ${item.title}`}>
            {done ? "Add" : <><Upload className="h-4 w-4" aria-hidden="true" />Upload</>}
          </FilePickButton>
        </div>
      )}
    </div>
  );
}
