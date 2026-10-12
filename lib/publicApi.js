/**
 * Server-side reads of the public API for pages search engines see (KB D-047): the experiences
 * hub, each listing's metadata and structured data, and the sitemap. Cached for five minutes and
 * bounded by a timeout, so a slow or unreachable API degrades to "nothing listed", never a
 * broken page or a failed build.
 */
const API = process.env.NEXT_PUBLIC_API_URL;

async function get(path) {
  if (!API) return null;
  try {
    const r = await fetch(`${API}${path}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(2500) });
    return r.ok ? (await r.json())?.data ?? null : null;
  } catch {
    return null;
  }
}

/** Live listings from approved providers, newest first. */
export async function liveExperiences() {
  return (await get("/v2/experiences"))?.experiences || [];
}

export async function experienceById(id) {
  return (await get(`/v2/experiences/${encodeURIComponent(id)}`))?.experience || null;
}
