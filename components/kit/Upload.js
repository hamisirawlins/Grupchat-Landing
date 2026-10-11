"use client";

import { useRef } from "react";
import { Button } from "./Button";

/**
 * A button that opens the file picker. On phones `capture` is left off on
 * purpose: people choose between camera and files themselves.
 */
export function FilePickButton({ accept, multiple = false, onPick, children, variant = "quiet", size = "md", loading = false, disabled = false, className = "", label }) {
  const ref = useRef(null);
  return (
    <>
      <Button variant={variant} size={size} loading={loading} disabled={disabled} className={className} onClick={() => ref.current?.click()} aria-label={label}>
        {children}
      </Button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.target.files || [])];
          e.target.value = "";
          if (files.length) onPick(multiple ? files : files[0]);
        }}
      />
    </>
  );
}

export const DOCUMENT_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif";
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
export const MAX_DOCUMENT_MB = 10;
export const MAX_PHOTO_MB = 8;

/** "insurance.pdf · 1.2 MB" */
export function fileSize(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
