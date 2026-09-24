import { Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import PageTransition from "@/components/PageTransition";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import KeverdLoader from '@/components/KeverdLoader';
import AppToaster from '@/components/AppToaster';

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

// The apex 307s to www, so every absolute URL we emit — canonical, og:url and
// especially og:image — must name www. A share-card scraper that does not follow
// redirects on an image simply shows no card.
const SITE = "https://www.grupchat.net";
const TITLE = "GrupChat — Powering Plans Beyond The Chat";
const DESCRIPTION =
  "The group chat decides; GrupChat makes it happen. One plan with a date, a shared pool and everyone paid in before the day arrives. Contributing is free — 2% applies only on withdrawal. M-Pesa and card.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s · GrupChat",
  },
  description: DESCRIPTION,
  applicationName: "GrupChat",
  keywords: [
    "group plans", "group savings", "split the bill", "group trip planning",
    "M-Pesa group payments", "chama", "contribute to a plan", "shared pool",
    "event planning Kenya", "GrupChat",
  ],
  authors: [{ name: "GrupChat" }],
  creator: "GrupChat",
  publisher: "GrupChat",
  category: "productivity",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: "GrupChat",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "GrupChat — a plan collecting contributions from a group, with a shared pool and progress toward its target",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/preview.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Structured data: what the page is, who makes it, and what it costs.
 *  Written as JSON-LD because that is the form Google documents and parses most reliably. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "GrupChat",
      url: SITE,
      logo: `${SITE}/logo.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "GrupChat",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: "en-KE",
    },
    {
      "@type": "SoftwareApplication",
      name: "GrupChat",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Android, Web",
      url: SITE,
      description: DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KES",
        description: "Free to join and to contribute. A 2% fee applies only when a pool is withdrawn.",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} antialiased`}
      >
        {/* JSON-LD goes in the body, which is where Next's own docs put it —
            a hand-written <head> in the App Router fights the metadata export. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
        <AppToaster />
        <KeverdLoader />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
