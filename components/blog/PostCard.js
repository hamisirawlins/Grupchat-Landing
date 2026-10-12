import Link from "next/link";
import { preconnect } from "react-dom";
import { coverSrc, coverSrcSet, formatDate, isRemoteCover, pillarFor } from "@/lib/blog";

/** One article in a list. `feature` = the large lead card at the top of the blog. */
export function PostCard({ post, feature = false, delay = 0 }) {
  const pillar = pillarFor(post.pillar);
  if (isRemoteCover(post.cover)) preconnect("https://images.pexels.com");
  return (
    <article className="gc-rise" style={{ "--gc-delay": `${delay}ms` }}>
      <Link
        href={`/blog/${post.slug}`}
        className={`group flex h-full flex-col gap-3 rounded-card bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[box-shadow,transform] duration-300 ease-gc hover:-translate-y-0.5 hover:shadow-lift sm:p-6 ${feature ? "sm:gap-4 sm:p-8 lg:flex-row lg:items-stretch lg:gap-8" : ""}`}
      >
        {post.cover && (
          // Decorative here: the title is the link text.
          <img
            src={coverSrc(post.cover, 800, 450)}
            srcSet={coverSrcSet(post.cover)}
            sizes={feature ? "(min-width: 1024px) 540px, (min-width: 640px) calc(100vw - 128px), calc(100vw - 80px)" : "(min-width: 1024px) 330px, (min-width: 640px) calc(50vw - 70px), calc(100vw - 80px)"}
            alt=""
            width={1200}
            height={675}
            loading={feature ? "eager" : "lazy"}
            decoding="async"
            className={`aspect-[16/9] w-full rounded-card bg-sheet object-cover ${feature ? "lg:w-[54%] lg:shrink-0 lg:self-center" : ""}`} />
        )}
        <div className={`flex flex-1 flex-col gap-3 ${feature ? "sm:gap-4 lg:justify-center" : ""}`}>
          <span className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-memory-ink">
            {pillar?.name}
            {post.status === "draft" && <span className="rounded-tag bg-warning-tint px-2 py-0.5 tracking-[0.06em] text-warning">Draft</span>}
          </span>
          <h3 className={`font-extrabold tracking-[-0.02em] text-ink transition-colors group-hover:text-action-strong ${feature ? "text-[26px] leading-[32px] sm:text-[34px] sm:leading-[40px]" : "text-xl leading-7"}`}>{post.title}</h3>
          <p className={`text-ink-2 ${feature ? "text-[17px] leading-7" : "text-[15px] leading-6"}`}>{post.description}</p>
          <span className={`pt-1 text-[13px] text-ink-3 ${feature ? "lg:mt-2" : "mt-auto"}`}>
            {post.date ? formatDate(post.date) : "Not yet published"} · {post.readingMinutes} min read
          </span>
        </div>
      </Link>
    </article>
  );
}
