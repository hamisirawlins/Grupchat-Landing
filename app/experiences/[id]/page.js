import ExperienceView from "@/components/tickets/ExperienceView";
import { JsonLd, SITE, breadcrumbs } from "@/components/site/JsonLd";
import { experienceById } from "@/lib/publicApi";

export const revalidate = 300;

/**
 * A listing's public page (KB D-044, D-047). The server fetches it so the first HTML carries the
 * title, description, photos and dates, plus structured data; the view then keeps places current.
 */
export default async function ExperiencePage({ params }) {
  const { id } = await params;
  const e = await experienceById(id);
  return (
    <>
      <ExperienceView id={id} initial={e} />
      {e && (
        <>
          <JsonLd data={breadcrumbs([["Home", "/"], ["Experiences", "/experiences"], [e.title, `/experiences/${e.id}`]])} />
          <JsonLd data={{
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: e.title,
            description: e.description || undefined,
            url: `${SITE}/experiences/${e.id}`,
            image: (e.photos || []).map((p) => p.url).slice(0, 3),
            touristType: "Groups of friends, family and colleagues",
            provider: { "@type": "LocalBusiness", name: e.provider?.name, address: { "@type": "PostalAddress", addressLocality: e.town, addressCountry: e.market || "KE" } },
            offers: {
              "@type": "Offer",
              price: e.price,
              priceCurrency: e.currency,
              url: `${SITE}/experiences/${e.id}`,
              availability: e.ticketsOpen && (e.sessions || []).some((s) => s.left > 0) ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            },
          }} />
        </>
      )}
    </>
  );
}
