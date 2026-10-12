import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { JsonLd, breadcrumbs } from "@/components/site/JsonLd";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How we write",
  description: "How the GrupChat blog uses AI, who checks each article, and how we pick and cite sources.",
  path: "/blog/how-we-write",
});

const SECTIONS = [
  ["Why we write", "To help people plan, pay for and enjoy things together, and to make sense of what new technology, and AI especially, changes for them. We write for readers first; an article that only exists to be found by search does not get written."],
  ["How AI is used", "AI helps us draft. It works from a brief and from sources we have opened and read, and it never publishes anything. Every article is edited, fact-checked and approved by a named person on our team before it goes live, and the article says who. Where AI did most of the drafting, the article says that too."],
  ["Sources", "News and analysis link the sources they rely on, at the end of the article. We prefer the original: the study, the filing, the announcement, the people involved. When a fact changes, we update the article and its date."],
  ["What we don't do", "We don't publish articles in bulk, rewrite other people's reporting as our own, invent quotes, people or numbers, or let a sponsor decide what we say. When we write about GrupChat, we say so."],
  ["Corrections", "If something is wrong, write to info@grupchat.net. We fix errors quickly and note what changed when it matters to the meaning."],
];

/** The blog's editorial policy (KB D-047): who writes, how AI is used, how sources are handled. */
export default function HowWeWrite() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="gc-rise text-sm text-ink-3"><Link href="/blog" className="font-semibold hover:text-ink">Blog</Link> / How we write</nav>
        <h1 className="gc-rise mt-4 text-[34px] font-black leading-[40px] tracking-[-0.03em] sm:text-[44px] sm:leading-[50px]" style={{ "--gc-delay": "40ms" }}>How we write</h1>
        <p className="gc-rise mt-3 text-lg leading-7 text-ink-2" style={{ "--gc-delay": "80ms" }}>AI helps us draft. People decide what is published, and their name is on it.</p>
        <div className="mt-8 flex flex-col">
          {SECTIONS.map(([title, body], i) => (
            <section key={title} className="gc-rise flex flex-col gap-2 border-t border-line py-6" style={{ "--gc-delay": `${120 + i * 50}ms` }}>
              <h2 className="text-lg font-extrabold">{title}</h2>
              <p className="text-base leading-7 text-ink-2">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbs([["Home", "/"], ["Blog", "/blog"], ["How we write", "/blog/how-we-write"]])} />
    </div>
  );
}
