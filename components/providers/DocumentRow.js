"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Upload, X } from "lucide-react";
import { DOCUMENT_ACCEPT, FilePickButton, MAX_DOCUMENT_MB, fileSize } from "@/components/kit";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { useListItemVariants } from "@/lib/motion";
import { AppliesTag } from "./Tags";

/**
 * One checklist item that needs files: what it is, what's uploaded, and the
 * button to add more. Uploads go straight to the API as raw bytes; a file that
 * is too big or the wrong kind is refused here first, with the reason.
 */
export function DocumentRow({ item, onChange, readOnly = false, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);
  const itemVariants = useListItemVariants();
  const done = item.files.length > 0;

  const pick = async (files) => {
    setError("");
    const list = Array.isArray(files) ? files : [files];
    const big = list.find((f) => f.size > MAX_DOCUMENT_MB * 1024 * 1024);
    if (big) return setError(`${big.name} is over ${MAX_DOCUMENT_MB} MB.`);
    setBusy(true);
    try {
      let out = null;
      for (const f of list) out = unwrap(await providersAPI.uploadDocument(item.id, f));
      onChange(out);
    } catch (e) {
      setError(e.message || "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (fileId) => {
    setRemoving(fileId);
    setError("");
    try {
      onChange(unwrap(await providersAPI.removeDocument(item.id, fileId)));
    } catch (e) {
      setError(e.message || "Couldn't remove it.");
    } finally {
      setRemoving(null);
    }
  };

  const open = async (fileId) => {
    try {
      const { url } = unwrap(await providersAPI.documentUrl(item.id, fileId));
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setError(e.message || "Couldn't open it.");
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
        {error && <span role="alert" className="text-[13px] font-semibold text-critical">{error}</span>}
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
