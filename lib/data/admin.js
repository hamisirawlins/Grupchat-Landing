import { auditAPI, catalogueAPI } from "@/lib/api";
import { asList, unwrap } from "@/lib/data/shape";

/** Light admin stats for Home and the console header. Each source fails independently. */
export async function getAdminSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const since = startOfToday.toISOString();

  const [auditRes, previewRes, catalogueRes] = await Promise.allSettled([
    auditAPI.list({ since, limit: 200 }),
    auditAPI.list({ since, action: "invite.previewed", limit: 200 }),
    catalogueAPI.list({ status: "active" }),
  ]);

  const audit = auditRes.status === "fulfilled" ? unwrap(auditRes.value) : null;
  const previews = previewRes.status === "fulfilled" ? unwrap(previewRes.value) : null;
  const catalogue = catalogueRes.status === "fulfilled" ? asList(unwrap(catalogueRes.value), "items") : null;

  return {
    auditToday: audit ? audit.matched : null,
    auditTruncated: !!audit?.truncated,
    publicPreviews: previews ? previews.matched : null,
    catalogueActive: catalogue ? catalogue.length : null,
    latest: audit?.events?.slice(0, 5) ?? [],
  };
}
