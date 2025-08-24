import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GrupChat - Powering Plans Beyond The Chat",
  description: "Transform your group conversations into powerful collaborations. Pool funds with friends and family seamlessly, turning dreams into reality.",
  metadataBase: new URL('https://grupchat.info'),
  openGraph: {
    title: "GrupChat - Powering Plans Beyond The Chat",
    description: "Transform your group conversations into powerful collaborations. Pool funds with friends and family seamlessly, turning dreams into reality.",
    url: 'https://grupchat.info',
    siteName: 'GrupChat',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'GrupChat - Powering Plans Beyond The Chat',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "GrupChat - Powering Plans Beyond The Chat",
    description: "Transform your group conversations into powerful collaborations. Pool funds with friends and family seamlessly, turning dreams into reality.",
    images: ['/preview.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
