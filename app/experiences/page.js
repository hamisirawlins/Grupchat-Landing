import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { JsonLd, SITE, breadcrumbs } from "@/components/site/JsonLd";
import { ListingCard } from "@/components/tickets/ListingCard";
import { liveExperiences } from "@/lib/publicApi";
import { CATEGORIES } from "@/lib/providers";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata() {
  const list = await liveExperiences();
  // An empty hub is a thin page: indexed only once something is listed.
  return pageMeta({
    title: "Group experiences in Kenya",
    description: "Trips, outdoor days, food walks and events run by registered businesses. Pick a date and book tickets for your whole group.",
    path: "/experiences",
    noIndex: list.length === 0,
  });
}

/** Public hub of every live listing (KB D-047): server-rendered so search engines and first visits see it whole. */
export default async function Experiences() {
  const list = await liveExperiences();
  const kinds = CATEGORIES.filter((c) => list.some((e) => e.category === c.value));
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <header className="gc-rise flex max-w-[720px] flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Book tickets</p>
          <h1 className="text-[36px] font-black leading-[40px] tracking-[-0.03em] sm:text-[52px] sm:leading-[56px]">Group experiences in Kenya</h1>
          <p className="text-lg leading-7 text-ink-2">Trips, outdoor days, food walks and events run by registered businesses. Pick a date, choose how many of you are going, and pay in one go.</p>
        </header>

        {list.length === 0 ? (
          <div className="gc-rise mt-10 flex flex-col items-start gap-3 rounded-card bg-sheet px-6 py-8" style={{ "--gc-delay": "100ms" }}>
            <p className="text-[17px] font-bold text-ink">The first experiences are on their way.</p>
            <p className="text-[15px] text-ink-2">Run trips, tours, food walks or events? <Link href="/providers" className="font-bold text-action-strong">List them on GrupChat</Link>.</p>
          </div>
        ) : (
          <>
            {kinds.length > 1 && (
              <p className="gc-rise mt-6 text-sm text-ink-3" style={{ "--gc-delay": "60ms" }}>{kinds.map((k) => k.label).join(" · ")}</p>
            )}
            <div className="gc-rise mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ "--gc-delay": "100ms" }}>
              {list.map((e, i) => <ListingCard key={e.id} e={e} priority={i < 3} />)}
            </div>
            <p className="mt-10 text-[15px] text-ink-2">Run something people would book together? <Link href="/providers" className="font-bold text-action-strong">List it on GrupChat</Link>.</p>
          </>
        )}
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbs([["Home", "/"], ["Experiences", "/experiences"]])} />
      {list.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Group experiences in Kenya",
          itemListElement: list.map((e, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/experiences/${e.id}`, name: e.title })),
        }} />
      )}
    </div>
  );
}
