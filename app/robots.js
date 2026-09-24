// The apex 307s to www, so every absolute URL we emit — canonical, og:url and
// especially og:image — must name www. A share-card scraper that does not follow
// redirects on an image simply shows no card.
const SITE = "https://www.grupchat.net";

/** Signed-in and transactional routes are noise in an index and a privacy risk in a snippet. */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/home", "/plans", "/notifications", "/admin",
          "/manage-data", "/delete-account", "/verify-email",
          "/reset-password", "/forgot-password", "/api/",
          // an invite code in an index is a code that has leaked
          "/invite/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
