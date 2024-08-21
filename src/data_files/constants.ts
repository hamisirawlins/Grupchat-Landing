import ogImageSrc from "../images/dash.png";

export const SITE = {
  title: "GrupChat",
  tagline: "From 'We Should Do This' to 'We Did This'",
  description: "GrupChat facilitates easy and transparent pooling of funds among peers for trips, projects and so much more.",
  description_short: "GrupChat facilitates easy pooling of funds among peers.",
  url: "https://grupchat.vercel.app",
  author: "Hamisi Rawlins",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: : Pooling Made Easier`,
  description: "Pool for trips, events and projects with ease. Start those dreams now!",
  image: ogImageSrc,
};
