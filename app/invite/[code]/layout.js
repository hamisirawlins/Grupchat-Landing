import { pageMeta, SITE } from "@/lib/seo";

/**
 * An invite link is pasted into a group chat, so its preview is the first thing most people
 * ever see of GrupChat. We name the plan in the card when we can read it.
 *
 * The source is the public projection (`GET /v2/invites/:code/preview`, D-014 / KB 26) — the
 * same id-free, money-free payload the signed-out page already shows anyone holding the code,
 * so nothing new is exposed. We deliberately do not put the host's name or the member count in
 * the card: the count changes and the card gets cached by whatever scraped it.
 *
 * If the lookup is slow, down or the code is dead, this falls back to wording that is true of
 * every invite. A share card must never fail to render because a backend blinked.
 *
 * `noIndex` on both paths: the card should be rich when the link is pasted, and the page should
 * never turn up in a search result — an invite code in an index is a code that has leaked.
 */
export async function generateMetadata({ params }) {
  const { code } = await params;
  const generic = pageMeta({
    title: "You have been invited",
    description: "Someone started a plan and wants you in it. Open the invite to see what it is.",
    path: `/invite/${code}`,
    noIndex: true,
  });

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return generic;

  try {
    const res = await fetch(`${base}/v2/invites/${encodeURIComponent(code)}/preview`, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 300 },
    });
    if (!res.ok) return generic;
    const body = await res.json();
    const name = (body?.data?.plan?.name ?? body?.plan?.name ?? "").trim();
    if (!name) return generic;

    return pageMeta({
      title: `Join ${name}`,
      description: "You have been invited to a plan on GrupChat. See what it is and say you are in.",
      path: `/invite/${code}`,
      noIndex: true,
    });
  } catch {
    return generic;
  }
}

export default function Layout({ children }) {
  return children;
}
