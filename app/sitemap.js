// The apex 307s to www, so every absolute URL we emit — canonical, og:url and
// especially og:image — must name www. A share-card scraper that does not follow
// redirects on an image simply shows no card.
const SITE = "https://www.grupchat.net";

/** Only the pages a stranger can open. Anything behind auth is deliberately absent. */
export default function sitemap() {
  const now = new Date();
  const pages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/discover", priority: 0.9, changeFrequency: "daily" },
    { path: "/sign-up", priority: 0.8, changeFrequency: "monthly" },
    { path: "/sign-in", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
    { path: "/report-bug", priority: 0.2, changeFrequency: "yearly" },
    { path: "/rate-app", priority: 0.2, changeFrequency: "yearly" },
  ];
  return pages.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
