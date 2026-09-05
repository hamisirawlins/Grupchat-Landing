"use client";

import { OutlineButton } from "@/components/ui/Form";

/** Pagination control: one quiet outline button, hidden when there is nothing more. */
export function ShowMore({ onClick, loading, hasMore, label = "Show more" }) {
  if (!hasMore) return null;
  return (
    <div className="mt-4">
      <OutlineButton onClick={onClick} loading={loading} className="sm:w-48">
        {label}
      </OutlineButton>
    </div>
  );
}
