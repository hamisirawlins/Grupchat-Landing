import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { JsonLd, breadcrumbs } from "@/components/site/JsonLd";
import { PostCard } from "@/components/blog/PostCard";
import { PILLARS, listPosts, listPublished, pillarFor } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return PILLARS.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }) {
  const { pillar } = await params;
  const p = pillarFor(pillar);
  return pageMeta({
    title: p.name,
    description: p.blurb,
    path: `/blog/topic/${p.slug}`,
    noIndex: listPublished().filter((x) => x.pillar === p.slug).length === 0,
  });
}

/** A topic hub: every article in one of the blog's four pillars. */
export default async function Topic({ params }) {
  const { pillar } = await params;
  const p = pillarFor(pillar);
  if (!p) notFound();
  const posts = listPosts({ pillar: p.slug });
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="gc-rise text-sm text-ink-3"><Link href="/blog" className="font-semibold hover:text-ink">Blog</Link> / {p.name}</nav>
        <header className="gc-rise mt-4 flex max-w-[720px] flex-col gap-3" style={{ "--gc-delay": "60ms" }}>
          <h1 className="text-[34px] font-black leading-[40px] tracking-[-0.03em] sm:text-[46px] sm:leading-[52px]">{p.name}</h1>
          <p className="text-lg leading-7 text-ink-2">{p.blurb}</p>
        </header>
        {posts.length === 0 ? (
          <p className="gc-rise mt-10 rounded-card bg-sheet px-6 py-8 text-[17px] text-ink-2" style={{ "--gc-delay": "120ms" }}>Nothing here yet. <Link href="/blog" className="font-bold text-action-strong">See every article</Link>.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((x, i) => <PostCard key={x.slug} post={x} delay={120 + i * 60} />)}
          </div>
        )}
        <div className="mt-12 flex flex-wrap gap-2">
          {PILLARS.filter((x) => x.slug !== p.slug).map((x) => (
            <Link key={x.slug} href={`/blog/topic/${x.slug}`} className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-soft hover:text-ink">{x.name}</Link>
          ))}
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbs([["Home", "/"], ["Blog", "/blog"], [p.name, `/blog/topic/${p.slug}`]])} />
    </div>
  );
}
