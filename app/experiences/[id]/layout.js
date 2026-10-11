import { pageMeta } from "@/lib/seo";

// A listing is public, so a shared link should preview as the listing itself.
// Metadata streams after the page for people; only crawlers wait for it.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const path = `/experiences/${id}`;
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/experiences/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    });
    const e = r.ok ? (await r.json())?.data?.experience : null;
    if (e) {
      const where = e.town?.split(",")[0];
      return pageMeta({
        title: e.title,
        description: `${where ? `${where}, with` : "With"} ${e.provider?.name || "a local provider"}. Pick a date and book tickets for your group on GrupChat.`,
        path,
        image: e.cover || undefined,
      });
    }
  } catch {
    // Fall through: the page still renders and says what's wrong.
  }
  return pageMeta({ title: "Experience", path, noIndex: true });
}

export default function Layout({ children }) {
  return children;
}
