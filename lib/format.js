/** Formatting helpers shared by every screen. Tolerant of Firestore Timestamps
 *  in any of their serialised forms. */

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value._seconds === "number") return new Date(value._seconds * 1000);
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function money(amount, currency = "KES") {
  const n = Number(amount) || 0;
  return `${currency} ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function date(value, options) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", ...options });
}

export function dateTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** "today", "tomorrow", "in 3 days", "2 days ago", "3h ago" */
export function relative(value) {
  const d = toDate(value);
  if (!d) return "";
  const diffMs = d.getTime() - Date.now();
  const mins = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);
  if (Math.abs(mins) < 60) return mins <= 0 ? `${Math.abs(mins) || 1}m ago` : `in ${mins}m`;
  if (Math.abs(hours) < 24) return hours < 0 ? `${Math.abs(hours)}h ago` : `in ${hours}h`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`;
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** 0..1, safe for missing/zero targets */
export function fraction(part, whole) {
  const w = Number(whole) || 0;
  if (w <= 0) return 0;
  return Math.min(Math.max((Number(part) || 0) / w, 0), 1);
}

export function plural(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
