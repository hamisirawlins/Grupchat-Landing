"use client";

import { twMerge } from "tailwind-merge";

/**
 * Data that is a table on a desk and a list of cards in a hand. Pass the
 * columns for the table and `card` for how one row reads on a phone.
 */
export function ResponsiveTable({ label, columns, rows, rowKey = (r) => r.id, card, empty, className = "" }) {
  if (!rows?.length) return empty ?? null;
  return (
    <div className={className}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-[15px] leading-5" aria-label={label}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={twMerge("pb-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 last:pr-0", c.className)}>
                  {c.srOnly ? <span className="sr-only">{c.header}</span> : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)} className="border-t border-black/[0.06]">
                {columns.map((c) => (
                  <td key={c.key} className={twMerge("py-4 pr-4 align-middle last:pr-0", c.cellClassName)}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-2 md:hidden" aria-label={label}>
        {rows.map((r) => (
          <li key={rowKey(r)}>{card(r)}</li>
        ))}
      </ul>
    </div>
  );
}
