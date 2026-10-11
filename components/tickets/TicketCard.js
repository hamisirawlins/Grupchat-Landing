"use client";

import { CalendarPlus, ImageIcon, Navigation, RotateCcw } from "lucide-react";
import { Button, buttonClasses } from "@/components/kit";
import { TicketQR } from "@/components/tickets/TicketQR";
import { fmtMoney } from "@/lib/providers";
import { checkInUrl, downloadIcs, mapsUrl, sessionParts } from "@/lib/tickets";
import { dateTime } from "@/lib/format";

const CANCEL = { "48h": "Full refund up to 48 hours before. Ask the provider.", none: "No refunds once booked." };

/** A paid ticket: when, where, how many, and the code the provider checks at the door. */
export function TicketCard({ t }) {
  const p = sessionParts(t.session?.key);
  const townHead = (t.town || "").split(",")[0].trim().toLowerCase();
  const place = t.meetingPoint && townHead && t.meetingPoint.toLowerCase().includes(townHead) ? t.meetingPoint : [t.meetingPoint, t.town].filter(Boolean).join(", ");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="flex flex-col gap-4">
      <article aria-label={`Ticket for ${t.title}`} className="overflow-hidden rounded-[28px] bg-white shadow-float">
        <div className="relative h-[150px] bg-memory-tint">
          {t.cover ? <img src={t.cover} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-memory-ink"><ImageIcon className="h-6 w-6" aria-hidden="true" /></span>}
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-5 bottom-4 flex flex-col gap-0.5 text-white">
            <span className="text-xl font-extrabold leading-6 tracking-[-0.01em] [text-shadow:0_1px_8px_rgb(0_0_0/0.35)]">{t.title}</span>
            <span className="text-[13px] font-semibold text-white/85">With {t.providerName}</span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 pb-5 pt-[18px]">
          <Fact label="Date">{p.weekday} {p.day} {p.month}</Fact>
          <Fact label="Time">{p.time}</Fact>
          <Fact label="Guests">{t.quantity}</Fact>
          <Fact label="Paid"><span className="tabular">{fmtMoney(t.amount, t.currency)}</span></Fact>
          {place && <div className="col-span-2"><Fact label="Meeting point">{place}</Fact></div>}
        </dl>

        <div className="relative h-0 border-t-2 border-dashed border-line" aria-hidden="true">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-sheet" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-sheet" />
        </div>

        <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-6">
          {t.code ? (
            <>
              <TicketQR value={checkInUrl(t.code, origin || "https://www.grupchat.net")} label={`Ticket code ${t.code}`} />
              <span className="font-mono text-[26px] font-bold tracking-[0.04em] text-ink">{t.code}</span>
              <span className="text-center text-[13px] leading-[18px] text-ink-3">Show this when you arrive. {t.quantity > 1 ? `One code covers all ${t.quantity} of you.` : ""}</span>
              {t.checkedInAt && <span className="rounded-full bg-success-tint px-3 py-1 text-[13px] font-bold text-success">Checked in {dateTime(t.checkedInAt)}</span>}
            </>
          ) : (
            <span className="text-sm text-ink-3">Your code appears once the payment is confirmed.</span>
          )}
        </div>
      </article>

      {t.code && (
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => downloadIcs(t)}><CalendarPlus className="h-[18px] w-[18px]" aria-hidden="true" />Add to calendar</Button>
          {place ? (
            <a href={mapsUrl(place)} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "secondary" })}><Navigation className="h-[18px] w-[18px]" aria-hidden="true" />Directions</a>
          ) : <span />}
        </div>
      )}
      <p className="flex items-start gap-2 px-1 text-[13px] leading-[18px] text-ink-3">
        <RotateCcw className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{CANCEL[t.cancellation] || "Ask the provider about changes."} Times are local to the experience.</span>
      </p>
    </div>
  );
}

function Fact({ label, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">{label}</dt>
      <dd className="text-base font-bold leading-[22px] text-ink">{children}</dd>
    </div>
  );
}
