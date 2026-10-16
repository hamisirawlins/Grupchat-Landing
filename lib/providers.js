/**
 * Client-side helpers for experience providers (KB D-043). The server decides
 * everything that matters; these only shape what the screens show.
 */
import { money } from "@/lib/format";

export const CATEGORIES = [
  { value: "trips", label: "Trips" },
  { value: "outdoors", label: "Outdoors" },
  { value: "food", label: "Food" },
  { value: "events", label: "Events" },
];
export const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

export const STEPS = [
  { key: "business", label: "Your business", href: "/providers/apply/business" },
  { key: "documents", label: "Documents", href: "/providers/apply/documents" },
  { key: "payouts", label: "Payouts", href: "/providers/apply/payouts" },
  { key: "submit", label: "Submit", href: "/providers/apply/submit" },
];
export const stepIndex = (pathname = "") => Math.max(0, STEPS.findIndex((s) => pathname.startsWith(s.href)));

/** Where an applicant should land: the first step they haven't finished. */
export function nextStepFor(data) {
  const p = data?.provider;
  if (!p) return STEPS[0].href;
  if (["submitted", "in-review", "approved", "declined", "waiting"].includes(p.status)) return "/providers/status";
  if (data.checklist && data.checklist.missing?.some((id) => data.checklist.items.find((i) => i.id === id)?.kind !== "payout")) return STEPS[1].href;
  if (!p.payout) return STEPS[2].href;
  return STEPS[3].href;
}

/** Same rule as the server: "Mwezi Dhow Trips Ltd" matches "Mwezi Dhow Trips". */
const normal = (s) => String(s || "").toLowerCase().replace(/\b(ltd|limited|llc|inc|co|company|enterprises?)\b/g, "").replace(/[^a-z0-9]+/g, "");
export const namesMatch = (a, b) => Boolean(normal(a)) && normal(a) === normal(b);

/** "Equity Bank ••• 8901", "M-Pesa Till 5123456"…: the server's label, or the bank-only shape older records have (D-063). */
export const payoutLabel = (payout) => payout?.label || (payout?.accountLast4 ? `${payout.bankName} ••• ${payout.accountLast4}` : "");
export const payoutName = (payout) => payout?.payeeName || payout?.accountName || "";
export const hasPayout = (payout) => Boolean(payout?.method || payout?.accountLast4);
export const PAYOUT_METHODS = { bank: "Bank account", mpesa_paybill: "M-Pesa Paybill", mpesa_till: "M-Pesa Till" };

export const uploadChecks = (checklist) => (checklist?.items || []).filter((i) => i.kind === "document" || i.kind === "photos-document");

export function chargesFor(price, rate = 0.1) {
  const p = Math.max(0, Math.round(Number(String(price ?? "").replace(/[,\s]/g, "")) || 0));
  const charges = Math.round(p * rate);
  return { price: p, charges, receives: p - charges };
}

export const fmtMoney = (n, currency = "KES") => money(n, currency);

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** "Fri and Sat, 5 pm" — mirrors the server's line so a draft reads the same as the listing. */
export function scheduleLine(schedule) {
  if (!schedule) return "";
  const days = [...new Set((schedule.days || []).map(Number))].filter((d) => d >= 1 && d <= 7).sort();
  let when = "";
  if (days.length === 7) when = "Every day";
  else if (days.length) {
    const n = days.map((d) => DAY_NAMES[d - 1]);
    when = n.length === 1 ? `${n[0]}s` : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
  } else if ((schedule.dates || []).length) when = schedule.dates.length === 1 ? "One date" : `${schedule.dates.length} dates`;
  const m = /^(\d{2}):(\d{2})$/.exec(schedule.startTime || "");
  if (!m) return when;
  const h = Number(m[1]);
  const time = `${h % 12 === 0 ? 12 : h % 12}${m[2] === "00" ? "" : `:${m[2]}`} ${h < 12 ? "am" : "pm"}`;
  return when ? `${when}, ${time}` : time;
}

/** The "Ready to publish" lines, as the server checks them. */
export function readiness(e) {
  const today = new Date().toISOString().slice(0, 10);
  const s = e?.schedule || {};
  return [
    { id: "basics", label: "Title and 3 photos", ok: (e?.title || "").trim().length >= 3 && (e?.photos || []).length >= 3 },
    { id: "about", label: "Meeting point and description", ok: (e?.meetingPoint || "").trim().length >= 3 && (e?.description || "").trim().length >= 20 && (e?.duration || "").trim().length > 0 },
    { id: "dates", label: "Dates and spaces", ok: Boolean(s.startTime) && ((s.days || []).length > 0 || (s.dates || []).some((d) => d >= today)) && Number(s.spaces) >= 1 },
    { id: "price", label: "Price", ok: Number(e?.price) >= 1 },
    { id: "cancellation", label: "Cancellation", ok: ["48h", "none"].includes(e?.cancellation) },
  ];
}

export const CANCELLATION = [
  { value: "48h", label: "Full refund up to 48 hours before" },
  { value: "none", label: "No refunds" },
];
