/**
 * Scoped debug logging.
 *
 * On by default outside production. In production it stays silent unless the
 * user opts in from the console:
 *
 *   localStorage.setItem("gc.debug", "1")   // enable, then reload
 *   localStorage.removeItem("gc.debug")     // disable
 */

const FLAG = "gc.debug";

export function debugEnabled() {
  if (typeof window !== "undefined") {
    try {
      const v = window.localStorage.getItem(FLAG);
      if (v === "1") return true;
      if (v === "0") return false;
    } catch {
      /* storage blocked — fall through to the env default */
    }
  }
  return process.env.NODE_ENV !== "production";
}

/** Never let a token reach the console. */
const SECRET_KEYS = /^(authorization|idtoken|token|password|secret|apikey)$/i;

export function redact(value, depth = 0) {
  if (value == null || depth > 4) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEYS.test(k) ? "«redacted»" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function emit(fn, scope, message, data) {
  if (!debugEnabled()) return;
  const prefix = `%c[${scope}]`;
  const style = "color:#9333ea;font-weight:600";
  if (data === undefined) fn(prefix, style, message);
  else fn(prefix, style, message, redact(data));
}

export const debugLog = (scope, message, data) => emit(console.log, scope, message, data);
export const debugWarn = (scope, message, data) => emit(console.warn, scope, message, data);
export const debugError = (scope, message, data) =>
  emit(console.error, scope, message, data);

/** Summarize an unknown payload: which keys exist, and which are non-empty. */
export function describeShape(value) {
  if (value == null) return { type: value === null ? "null" : "undefined" };
  if (Array.isArray(value)) return { type: "array", length: value.length };
  if (typeof value !== "object") return { type: typeof value, value };
  const keys = Object.keys(value);
  return {
    type: "object",
    keys,
    present: keys.filter(
      (k) => value[k] !== undefined && value[k] !== null && value[k] !== "",
    ),
  };
}
