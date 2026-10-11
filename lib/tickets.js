/**
 * Client-side helpers for tickets (KB D-044). The server owns places, prices
 * and codes; these only shape what the screens show.
 */

export const MAX_PER_ORDER = 10;

const parts = (key) => /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(key || "");

/** 17:00 → "5 pm", 08:30 → "8:30 am". */
export function clock(time) {
  const m = /^(\d{2}):(\d{2})$/.exec(time || "");
  if (!m) return "";
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}${m[2] === "00" ? "" : `:${m[2]}`} ${h < 12 ? "am" : "pm"}`;
}

/** A session key read as the guest sees it, in the experience's own local time. */
export function sessionParts(key) {
  const m = parts(key);
  if (!m) return { weekday: "", day: "", month: "", time: "", long: key || "" };
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const f = (o) => d.toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  const time = clock(`${m[4]}:${m[5]}`);
  return {
    weekday: f({ weekday: "short" }),
    day: String(Number(m[3])),
    month: f({ month: "short" }),
    time,
    long: `${f({ weekday: "long", day: "numeric", month: "long" })}, ${time}`,
    short: `${f({ weekday: "short", day: "numeric", month: "short" })}, ${time}`,
  };
}

/** "6 hours" → 360, "90 minutes" → 90, "2.5 hours" → 150; anything else → two hours. */
export function durationMinutes(text) {
  const s = String(text || "").toLowerCase();
  const h = /(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/.exec(s);
  const m = /(\d+)\s*(m|min|mins|minute|minutes)\b/.exec(s);
  const total = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return total > 0 ? Math.round(total) : 120;
}

const icsDate = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** A calendar file for a paid ticket. */
export function icsFor(t, origin = "") {
  const start = Date.parse(t.session?.startsAt);
  if (!Number.isFinite(start)) return null;
  const end = start + durationMinutes(t.duration) * 60000;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GrupChat//Tickets//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${t.id}@grupchat.net`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(t.title)}`,
    `LOCATION:${icsText([t.meetingPoint, t.town].filter(Boolean).join(", "))}`,
    `DESCRIPTION:${icsText(`${t.quantity} ${t.quantity === 1 ? "ticket" : "tickets"} · ${t.code || ""}\nWith ${t.providerName}${origin ? `\n${origin}/tickets/${t.id}` : ""}`)}`,
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${icsText(t.title)}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(t) {
  const text = icsFor(t, typeof window !== "undefined" ? window.location.origin : "");
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(t.title || "ticket").replace(/[^\w]+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const mapsUrl = (place) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** What the provider scans at the door: opens their bookings with the code filled in. */
export const checkInUrl = (code, origin = "") => `${origin}/provider/bookings?code=${encodeURIComponent(code)}`;
