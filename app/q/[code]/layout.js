import { pageMeta } from "@/lib/seo";

/**
 * A Quick Pool link is pasted into a group chat (KB 2a), so its card names the pool when it
 * can. `noIndex` always: the code is a capability, like an invite (D-039). If the lookup is
 * slow or the link is dead, the card falls back to wording that is true of every pool.
 */
export async function generateMetadata({ params }) {
  const { code } = await params;
  const generic = pageMeta({ title: "Pool with us", description: "Someone started a pool on GrupChat. Open it to see the target and add money by M-Pesa.", path: `/q/${code}`, noIndex: true });
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return generic;
  try {
    const res = await fetch(`${base}/v2/quick-pools/link/${encodeURIComponent(code)}`, { signal: AbortSignal.timeout(2500), next: { revalidate: 300 } });
    if (!res.ok) return generic;
    const name = String((await res.json())?.data?.name || "").trim();
    if (!name) return generic;
    return pageMeta({ title: name, description: "Pool with the group on GrupChat. All it takes is an M-Pesa number.", path: `/q/${code}`, noIndex: true });
  } catch {
    return generic;
  }
}

export default function Layout({ children }) {
  return children;
}
