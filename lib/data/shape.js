/** The REST API wraps payloads inconsistently; normalise once here. */
export const unwrap = (res) => (res && typeof res === "object" && "data" in res ? res.data : res);

export function asList(value, key) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    if (key && Array.isArray(value[key])) return value[key];
    for (const k of ["plans", "members", "items", "transactions", "invitations", "notifications", "events", "data"]) {
      if (Array.isArray(value[k])) return value[k];
    }
  }
  return [];
}

export const isPooled = (plan) => ["pool", "both"].includes(plan?.poolMode);
export const planTypeLabel = (plan) => (plan?.planType === "premium" ? "Curated" : plan?.planType === "quick" ? "Quick Pool" : "Self-managed");
/** Where a plan opens: a Quick Pool opens its pool page (KB 2a). */
export const planHref = (plan) => (plan?.planType === "quick" && plan?.quickPool?.linkCode ? `/q/${plan.quickPool.linkCode}` : `/plans/${plan?.id}`);
export const STATUS_TONE = { active: "success", locked: "warning", completed: "accent", archived: "neutral" };
