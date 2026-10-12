import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { JsonLd, SITE, breadcrumbs } from "@/components/site/JsonLd";
import { PostCard } from "@/components/blog/PostCard";
import { preconnect } from "react-dom";
import { coverSrc, coverSrcSet, formatDate, isRemoteCover, getPost, listPosts, pillarFor, relatedPosts, sourceName, withFeed } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const base = pageMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    noIndex: post.status !== "published",
    ...(post.shareImage ? { image: post.shareImage } : {}),
  });
  return {
    ...withFeed(base),
    authors: [{ name: post.author }],
    openGraph: { ...base.openGraph, type: "article", publishedTime: post.date || undefined, modifiedTime: post.updated || post.date || undefined, section: pillarFor(post.pillar)?.name },
  };
}

/** One article (KB D-047): readable first, with its sources and who approved it in plain view. */
export default async function Article({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  if (isRemoteCover(post.cover)) preconnect("https://images.pexels.com");
  const pillar = pillarFor(post.pillar);
  const related = relatedPosts(post);
  const url = `${SITE}/blog/${post.slug}`;

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <SiteHeader />
      {post.status === "draft" && (
        <div role="note" className="border-b border-warning/20 bg-warning-tint px-5 py-3 text-center text-sm font-semibold text-warning">
          Draft, visible only on previews. To publish: set status to published, approvedBy and approvedAt, then merge.
        </div>
      )}
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="gc-rise text-sm text-ink-3">
          <Link href="/blog" className="font-semibold hover:text-ink">Blog</Link> / <Link href={`/blog/topic/${pillar.slug}`} className="hover:text-ink">{pillar.name}</Link>
        </nav>

        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
          <article className="min-w-0 max-w-[720px]">
            <header className="gc-rise flex flex-col gap-4" style={{ "--gc-delay": "40ms" }}>
              <h1 className="text-[34px] font-black leading-[40px] tracking-[-0.03em] sm:text-[46px] sm:leading-[52px]">{post.title}</h1>
              <p className="text-xl leading-8 text-ink-2">{post.description}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-line py-3 text-sm text-ink-3">
                <span className="font-semibold text-ink">{post.author}</span>
                <span aria-hidden="true">·</span>
                {post.date ? <time dateTime={post.date}>{formatDate(post.date)}</time> : <span>Not yet published</span>}
                {post.updated && post.updated !== post.date && <><span aria-hidden="true">·</span><span>Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></span></>}
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} min read</span>
              </p>
            </header>

            {post.cover && (
              <figure className="gc-rise mt-8" style={{ "--gc-delay": "80ms" }}>
                <img
                  src={coverSrc(post.cover, 1200, 675)}
                  srcSet={coverSrcSet(post.cover)}
                  sizes="(min-width: 768px) 720px, calc(100vw - 40px)"
                  alt={post.coverAlt}
                  width={1200}
                  height={675}
                  fetchPriority="high"
                  className="aspect-[16/9] w-full rounded-card bg-sheet object-cover"
                />
                {post.coverCredit && (
                  <figcaption className="mt-2 text-[13px] text-ink-3">
                    {post.coverSource ? (
                      <>
                        Photo by{" "}
                        {post.coverCreditUrl ? <a href={post.coverCreditUrl} target="_blank" rel="noopener" className="underline decoration-line underline-offset-2 hover:text-ink">{post.coverCredit}</a> : post.coverCredit}
                        {" "}on{" "}
                        <a href={post.coverSource} target="_blank" rel="noopener" className="underline decoration-line underline-offset-2 hover:text-ink">{sourceName(post.coverSource)}</a>
                      </>
                    ) : post.coverCredit}
                  </figcaption>
                )}
              </figure>
            )}

            <div className="gc-prose gc-rise mt-8" style={{ "--gc-delay": "80ms" }} dangerouslySetInnerHTML={{ __html: post.html }} />

            {post.sources.length > 0 && (
              <section aria-label="Sources" className="mt-12 rounded-card bg-sheet px-5 py-5 sm:px-6">
                <h2 className="text-base font-extrabold">Sources</h2>
                <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-6 text-ink-2">
                  {post.sources.map((s) => (
                    <li key={s.url}><a href={s.url} target="_blank" rel="noopener" className="font-semibold text-action-strong underline decoration-1 underline-offset-2">{s.title || s.url}</a>{s.publisher ? `, ${s.publisher}` : ""}</li>
                  ))}
                </ol>
              </section>
            )}

            <p className="mt-8 text-sm leading-6 text-ink-3">
              {post.aiAssisted
                ? <>Drafted with AI{post.sources.length ? " from the sources above" : ""}{post.approvedBy ? <>, then edited and approved by <span className="font-semibold text-ink-2">{post.approvedBy}</span></> : ", and waiting for a person to edit and approve it"}. </>
                : post.approvedBy ? <>Approved by <span className="font-semibold text-ink-2">{post.approvedBy}</span>. </> : null}
              <Link href="/blog/how-we-write" className="font-semibold text-action-strong">How we write</Link>
            </p>

            <aside className="mt-10 flex flex-col items-start gap-3 rounded-card bg-action-tint px-5 py-6 sm:px-7">
              <p className="text-lg font-extrabold text-ink">Planning something with your people?</p>
              <p className="text-[15px] leading-6 text-ink-2">GrupChat keeps the plan, the money and the bookings in one place, so the group chat can go back to being a chat.</p>
              <Link href="/sign-up" className="inline-flex h-11 items-center rounded-full bg-action px-5 text-[15px] font-semibold text-white transition-colors hover:bg-action-strong">Start a plan, free</Link>
            </aside>
          </article>

          {post.headings.length > 2 && (
            <aside className="hidden lg:block">
              <nav aria-label="On this page" className="sticky top-24 flex flex-col gap-2 border-l border-line pl-4 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">On this page</span>
                {post.headings.map((h) => <a key={h.id} href={`#${h.id}`} className="leading-5 text-ink-2 transition-colors hover:text-ink">{h.text}</a>)}
              </nav>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section aria-label="More on this topic" className="mt-16">
            <h2 className="text-xl font-extrabold tracking-[-0.01em]">More in {pillar.name}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((p) => <PostCard key={p.slug} post={p} />)}</div>
          </section>
        )}
      </main>
      <SiteFooter />

      <JsonLd data={breadcrumbs([["Home", "/"], ["Blog", "/blog"], [pillar.name, `/blog/topic/${pillar.slug}`], [post.title, `/blog/${post.slug}`]])} />
      {post.status === "published" && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          url,
          mainEntityOfPage: url,
          datePublished: post.date,
          dateModified: post.updated || post.date,
          author: { "@type": post.author === "GrupChat Editorial" ? "Organization" : "Person", name: post.author },
          publisher: { "@id": `${SITE}/#organization` },
          image: /^https?:/.test(post.shareImage || "") ? post.shareImage : `${SITE}${post.shareImage || "/preview.png"}`,
          articleSection: pillar.name,
          keywords: post.tags.join(", ") || undefined,
          inLanguage: "en-KE",
        }} />
      )}
    </div>
  );
}
