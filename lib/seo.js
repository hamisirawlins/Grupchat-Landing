/**
 * One place for page metadata.
 *
 * Every public route builds its tags through `pageMeta` so canonical, Open Graph and Twitter
 * can never drift apart — and so a wording change is one edit, not nine.
 *
 * House rule for the copy: **say the job, never the terms.** No rates, no counts, no platform
 * lists. "Pooling is free, withdrawal charges apply" survives a change to the fee; "2% on
 * withdrawal" does not. A description that names a number is a description someone has to
 * remember to come back and fix.
 */

export const SITE = "https://www.grupchat.net";

/** The one-line answer to "what is this". Referenced, not retyped. */
export const TAGLINE = "Plan, manage, track and pool for group plans and ideas with ease.";

/**
 * @param {object}  o
 * @param {string}  o.title        bare page title; the root layout adds " · GrupChat"
 * @param {string}  o.description  one sentence, no figures
 * @param {string}  o.path         route path, e.g. "/discover"
 * @param {boolean} o.noIndex      true for anything behind a sign-in
 * @param {string}  o.image        override the share image
 */
export function pageMeta({ title, description = TAGLINE, path = "/", noIndex = false, image = "/preview.png" }) {
  const url = `${SITE}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      title: `${title} · GrupChat`,
      description,
      url,
      siteName: "GrupChat",
      type: "website",
      locale: "en_KE",
      images: [{ url: image, width: 1200, height: 630, alt: `${title} · GrupChat` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · GrupChat`,
      description,
      images: [image],
    },
  };
}

/** Signed-in surfaces: a title for the tab, and kept out of every index. */
export const privateMeta = (title) => pageMeta({ title, noIndex: true, path: "/" });
