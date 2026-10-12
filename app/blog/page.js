import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { JsonLd, SITE, breadcrumbs } from "@/components/site/JsonLd";
import { PostCard } from "@/components/blog/PostCard";
import { PILLARS, listPosts, listPublished, withFeed } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";

export function generateMetadata() {
  // An empty blog is a thin page: keep it out of the index until an article is published.
  return withFeed(pageMeta({
    title: "Blog",
    description: "Tech, AI and people, planning together, money together, and experiences in Kenya, from the GrupChat team.",
    path: "/blog",
    noIndex: listPublished().length === 0,
  }));
}

/** The blog's front page (KB D-047): the newest article large, the rest by date, and the four topics. */
export default function Blog() {
  const posts = listPosts();
  const [lead, ...rest] = posts;
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <header className="gc-rise flex max-w-[720px] flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">The GrupChat blog</p>
          <h1 className="text-[36px] font-black leading-[40px] tracking-[-0.03em] sm:text-[52px] sm:leading-[56px]">Plans, people and the tech in between</h1>
          <p className="text-lg leading-7 text-ink-2">What technology and AI change for people, and how groups plan, pay for and enjoy things together.</p>
        </header>

        <nav aria-label="Topics" className="gc-rise mt-8 flex flex-wrap gap-2" style={{ "--gc-delay": "80ms" }}>
          {PILLARS.map((p) => (
            <Link key={p.slug} href={`/blog/topic/${p.slug}`} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors hover:bg-soft">
              {p.name}
            </Link>
          ))}
        </nav>

        {posts.length === 0 ? (
          <p className="gc-rise mt-12 rounded-card bg-sheet px-6 py-8 text-[17px] text-ink-2" style={{ "--gc-delay": "140ms" }}>The first articles are being written. <Link href="/blog/how-we-write" className="font-bold text-action-strong">See how we write them</Link>.</p>
        ) : (
          <div className="mt-10 flex flex-col gap-5">
            <PostCard post={lead} feature delay={140} />
            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => <PostCard key={p.slug} post={p} delay={200 + i * 60} />)}
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbs([["Home", "/"], ["Blog", "/blog"]])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Blog", name: "The GrupChat blog", url: `${SITE}/blog`, publisher: { "@id": `${SITE}/#organization` }, inLanguage: "en-KE" }} />
    </div>
  );
}
