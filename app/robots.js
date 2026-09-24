const SITE = "https://grupchat.net";

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
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
