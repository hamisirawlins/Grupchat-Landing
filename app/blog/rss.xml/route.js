import { listPublished, pillarFor } from "@/lib/blog";

export const dynamic = "force-static";

const SITE = "https://www.grupchat.net";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS for the blog: published articles only, newest first (KB D-047). */
export function GET() {
  const posts = listPublished().slice(0, 30);
  const items = posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <description>${esc(p.description)}</description>
      <category>${esc(pillarFor(p.pillar)?.name || p.pillar)}</category>
      <pubDate>${new Date(`${p.date}T06:00:00Z`).toUTCString()}</pubDate>
    </item>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The GrupChat blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Tech, AI and people; planning and paying for things together; experiences in Kenya.</description>
    <language>en-KE</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
