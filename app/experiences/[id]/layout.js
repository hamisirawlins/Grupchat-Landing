import { pageMeta } from "@/lib/seo";
import { experienceById } from "@/lib/publicApi";

// A listing is public, so a shared link should preview as the listing itself.
// The fetch is shared with the page (same URL, same cache), so it costs one request.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const path = `/experiences/${id}`;
  const e = await experienceById(id);
  if (!e) return pageMeta({ title: "Experience", path, noIndex: true });
  const where = e.town?.split(",")[0];
  return pageMeta({
    title: where ? `${e.title} · ${where}` : e.title,
    description: `${e.duration ? `${e.duration}, ` : ""}${e.scheduleLine ? `${e.scheduleLine}. ` : ""}Run by ${e.provider?.name || "a registered business"}${where ? ` in ${where}` : ""}. Pick a date and book tickets for your group.`,
    path,
    image: e.cover || undefined,
  });
}

export default function Layout({ children }) {
  return children;
}
