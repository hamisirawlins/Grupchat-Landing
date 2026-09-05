import { invitationsAPI, plansAPI } from "@/lib/api";
import { toDate } from "@/lib/format";
import { asList, isPooled, unwrap } from "@/lib/data/shape";

const MAX_PLANS_FOR_TX = 10;

/**
 * Everything Home needs, composed from REST with per-source failure isolation:
 * a failing source yields `null` for its slice rather than failing the page.
 */
export async function getHomeSummary(uid) {
  const [plansRes, invitesRes] = await Promise.allSettled([
    plansAPI.getPlans({ limit: 50, page: 1 }),
    invitationsAPI.getPending(),
  ]);

  const plans = plansRes.status === "fulfilled" ? asList(unwrap(plansRes.value), "plans") : null;
  const invites = invitesRes.status === "fulfilled" ? asList(unwrap(invitesRes.value)) : null;

  // Pooled progress across every plan that is actually pooling money.
  const pooledPlans = (plans ?? []).filter((p) => isPooled(p) && Number(p.targetAmount) > 0);
  const pooled = {
    count: pooledPlans.length,
    balance: pooledPlans.reduce((s, p) => s + (Number(p.currentBalance) || 0), 0),
    target: pooledPlans.reduce((s, p) => s + (Number(p.targetAmount) || 0), 0),
    currency: pooledPlans[0]?.currency || "KES",
  };
  pooled.fraction = pooled.target > 0 ? Math.min(pooled.balance / pooled.target, 1) : 0;

  // My successful contributions this year, by month.
  const year = new Date().getFullYear();
  const months = Array(12).fill(0);
  let total = 0;
  const targets = (plans ?? []).slice(0, MAX_PLANS_FOR_TX);
  const txResults = await Promise.allSettled(targets.map((p) => plansAPI.getPlanTransactions(p.id)));
  for (const r of txResults) {
    if (r.status !== "fulfilled") continue;
    for (const tx of asList(unwrap(r.value))) {
      if (tx.type !== "contribution" || tx.status !== "success") continue;
      if (uid && tx.userId && tx.userId !== uid) continue;
      const d = toDate(tx.processedAt || tx.createdAt);
      if (!d || d.getFullYear() !== year) continue;
      const amt = Number(tx.amount) || 0;
      months[d.getMonth()] += amt;
      total += amt;
    }
  }

  return {
    plans,
    activePlans: plans ? plans.filter((p) => p.status === "active").length : null,
    pooled,
    contributions: {
      total,
      months,
      year,
      partial: txResults.some((r) => r.status === "rejected") || (plans?.length ?? 0) > MAX_PLANS_FOR_TX,
    },
    invites,
    errors: {
      plans: plansRes.status === "rejected" ? plansRes.reason?.message : null,
      invites: invitesRes.status === "rejected" ? invitesRes.reason?.message : null,
    },
  };
}
