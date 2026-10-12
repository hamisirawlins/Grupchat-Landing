import { PILLARS, listPublished } from "@/lib/blog";
import { liveExperiences } from "@/lib/publicApi";

// The apex 307s to www, so every absolute URL we emit — canonical, og:url and
// especially og:image — must name www. A share-card scraper that does not follow
// redirects on an image simply shows no card.
const SITE = "https://www.grupchat.net";

export const revalidate = 3600;

/**
 * Only pages a stranger can open and that are worth finding (KB D-047). Signed-in screens
 * (Discover, tickets, the portals) and utility forms are deliberately absent. `lastModified`
 * is the date the page last really changed, never the build time: a date that moves on every
 * deploy teaches search engines to ignore it.
 */
const PAGES = [
  { path: "", changed: "2026-10-12", priority: 1.0, changeFrequency: "weekly" },
  { path: "/experiences", changed: null, priority: 0.9, changeFrequency: "daily" },
  { path: "/blog", changed: null, priority: 0.8, changeFrequency: "weekly" },
  { path: "/providers", changed: "2026-10-12", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sign-up", changed: "2026-09-24", priority: 0.5, changeFrequency: "yearly" },
  { path: "/blog/how-we-write", changed: "2026-10-12", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", changed: "2026-10-11", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms-of-service", changed: "2026-10-11", priority: 0.2, changeFrequency: "yearly" },
  { path: "/providers/terms", changed: "2026-10-11", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap() {
  const posts = listPublished();
  const experiences = await liveExperiences();
  const latestPost = posts[0]?.updated || posts[0]?.date || null;
  const latestListing = experiences.map((e) => e.publishedAt).filter(Boolean).sort().at(-1) || null;
  const dated = (d) => (d ? new Date(d) : undefined);

  return [
    ...PAGES.filter((p) => p.path !== "/blog" || posts.length > 0)
      .filter((p) => p.path !== "/experiences" || experiences.length > 0)
      .map((p) => ({
        url: `${SITE}${p.path}`,
        lastModified: dated(p.changed || (p.path === "/blog" ? latestPost : latestListing)),
        changeFrequency: p.changeFrequency,
        priority: p.priority,
      })),
    ...PILLARS.filter((t) => posts.some((p) => p.pillar === t.slug)).map((t) => ({
      url: `${SITE}/blog/topic/${t.slug}`,
      lastModified: dated(posts.find((p) => p.pillar === t.slug)?.date),
      changeFrequency: "weekly",
      priority: 0.5,
    })),
    ...posts.map((p) => ({ url: `${SITE}/blog/${p.slug}`, lastModified: dated(p.updated || p.date), changeFrequency: "monthly", priority: 0.6 })),
    ...experiences.map((e) => ({ url: `${SITE}/experiences/${e.id}`, lastModified: dated(e.publishedAt), changeFrequency: "daily", priority: 0.7 })),
  ];
}
