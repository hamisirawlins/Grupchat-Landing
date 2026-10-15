import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/api";
import { debugError, debugLog } from "@/lib/debug";

/**
 * Quick Pool (KB 2a). The pool page and the pay sheet are public, but a signed-in viewer
 * sees more (their own payments; the owner's controls), so these calls send the ID token
 * when there is one and carry on without it when there isn't. Errors keep the server's
 * `code` ("link-inactive", "email-unverified", "prompt-open", …) for the screens to read.
 */
async function optionalToken() {
  try {
    if (typeof auth.authStateReady === "function") await auth.authStateReady();
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}

export class QuickPoolError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth: withAuth = true } = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set.");
  const token = withAuth ? await optionalToken() : null;
  debugLog("api", `→ ${method} ${path} (quick pool)`);
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new QuickPoolError("You seem to be offline. Check your connection and try again.", { code: "offline" });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    debugError("api", `← ${res.status} ${path}`, data);
    throw new QuickPoolError(data.message || "Something went wrong. Try again.", { status: res.status, code: data.code, details: data.details });
  }
  return data.data;
}

export const quickPoolAPI = {
  options: () => request("/v2/quick-pools/options"),
  create: (body) => apiRequest("/v2/quick-pools", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  mine: () => apiRequest("/v2/quick-pools/mine").then((r) => r.data),
  view: (code) => request(`/v2/quick-pools/link/${encodeURIComponent(code)}`),
  pay: (code, body) => request(`/v2/quick-pools/link/${encodeURIComponent(code)}/pay`, { method: "POST", body }),
  /** Held by the server until the payment settles (≤25 s): await it, don't poll (D-023). */
  status: (txId, key, wait = 25) => request(`/v2/quick-pools/tx/${encodeURIComponent(txId)}?key=${encodeURIComponent(key)}&wait=${wait}`, { auth: false }),
  update: (planId, body) => apiRequest(`/v2/quick-pools/${planId}`, { method: "PUT", body: JSON.stringify(body) }).then((r) => r.data),
  requestRefund: (planId, body) => apiRequest(`/v2/quick-pools/${planId}/refunds`, { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  approveRefund: (planId, txId) => apiRequest(`/v2/quick-pools/${planId}/refunds/${txId}/approve`, { method: "POST", body: "{}" }).then((r) => r.data),
  declineRefund: (planId, txId, reason) => apiRequest(`/v2/quick-pools/${planId}/refunds/${txId}/decline`, { method: "POST", body: JSON.stringify({ reason }) }).then((r) => r.data),
  withdraw: (planId, body) => apiRequest(`/v2/plans/${planId}/payout`, { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  usernameAvailable: (name) => request(`/v2/usernames/${encodeURIComponent(name)}/available`, { auth: false }),
  emailLink: (body) => request("/v2/auth/email-link", { method: "POST", body, auth: false }),
};

/** Admin: Quick Pool flags, caps and system insights (KB 2a, 2b). The server decides who may call. */
export const quickPoolAdminAPI = {
  flags: () => apiRequest("/v2/admin/quick-pools/flags").then((r) => r.data),
  resolveUnmatched: (id, body) => apiRequest(`/v2/admin/quick-pools/unmatched/${encodeURIComponent(id)}/resolve`, { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  refundMember: (memberKey, body = {}) => apiRequest(`/v2/admin/quick-pools/members/${encodeURIComponent(memberKey)}/refund`, { method: "POST", body: JSON.stringify(body) }).then((r) => r.data),
  capEligibility: (uid) => apiRequest(`/v2/admin/quick-pools/creators/${encodeURIComponent(uid)}/cap`).then((r) => r.data),
  setCap: (uid, body) => apiRequest(`/v2/admin/quick-pools/creators/${encodeURIComponent(uid)}/cap`, { method: "PUT", body: JSON.stringify(body) }).then((r) => r.data),
  system: (days = 30) => apiRequest(`/v2/admin/insights/system?days=${days}`).then((r) => r.data),
  review: () => apiRequest("/v2/admin/insights/review").then((r) => r.data),
  refreshReview: () => apiRequest("/v2/admin/insights/review", { method: "POST", body: "{}" }).then((r) => r.data),
};

/* ── Presentation helpers ──────────────────────────────────────────────────── */

export const kes = (n) => `KES ${Math.round(Number(n) || 0).toLocaleString("en-KE")}`;
export const kesShort = (n) => {
  const v = Math.round(Number(n) || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M`;
  if (v >= 10_000) return `${Math.round(v / 1000)}k`;
  return v.toLocaleString("en-KE");
};

/** Accepts 07…, 01…, 7…, 2547…, +2547…; returns 2547XXXXXXXX or null. */
export function normalizePhone(raw) {
  let n = String(raw || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = `254${n.slice(1)}`;
  else if (/^[17]\d{8}$/.test(n)) n = `254${n}`;
  return /^254[17]\d{8}$/.test(n) ? n : null;
}

/** "Closes in 3 days", "Closes today at 6 pm", "Closed". */
export function closingLine(endsAt, closed) {
  if (closed) return "Closed";
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(end)) return "";
  const ms = end - Date.now();
  if (ms <= 0) return "Closing now";
  const hours = ms / 3_600_000;
  if (hours < 24) return `Closes ${new Date(end).toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Nairobi" })} today`;
  const days = Math.ceil(hours / 24);
  return `Closes in ${days} ${days === 1 ? "day" : "days"}`;
}

/** A light, premium palette from the pool's hue (KB 2b: the visual is themed by code from the name). */
export function palette(theme) {
  const h = Number(theme?.hue ?? 265);
  const quiet = ["condolence", "medical"].includes(theme?.kind);
  const s = quiet ? 28 : 72;
  return {
    hue: h,
    quiet,
    ground: `hsl(${h} ${quiet ? 30 : 80}% 97%)`,
    soft: `hsl(${h} ${s}% 92%)`,
    mid: `hsl(${h} ${s}% 80%)`,
    strong: `hsl(${h} ${quiet ? 30 : 62}% ${quiet ? 42 : 52}%)`,
    accent2: `hsl(${(h + 38) % 360} ${s}% 78%)`,
    ink: `hsl(${h} ${quiet ? 20 : 45}% 22%)`,
  };
}

export const KIND_LABEL = {
  condolence: "In support",
  medical: "Get well",
  wedding: "Wedding",
  birthday: "Birthday",
  trip: "Trip",
  party: "Party",
  savings: "Savings",
  community: "Community",
  gift: "Gift",
  everyday: "Pool",
};

/** Share the pool: the native sheet where there is one, else copy the link. Returns "shared" | "copied" | "failed". */
export async function sharePool({ name, url }) {
  const text = `Pool with us for ${name} on GrupChat. It takes a phone number and M-Pesa.`;
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: name, text, url });
      return "shared";
    }
  } catch (e) {
    if (e?.name === "AbortError") return "cancelled";
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
