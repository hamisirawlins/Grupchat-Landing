import { Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "GrupChat - Powering Plans Beyond The Chat",
  description: "Transform your group chats into powerful collaborations. Pool funds with friends and family seamlessly, turning dreams into reality.",
  metadataBase: new URL('https://grupchat.net'),
  openGraph: {
    title: "GrupChat - Powering Plans Beyond The Chat",
    description: "Transform your group chats into powerful collaborations. Pool funds with friends and family seamlessly, turning dreams into reality.",
    url: 'https://grupchat.net',
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
    description: "Transform your group chats into powerful collaborations. Pool funds with friends and family seamlessly, turning dreams into reality.",
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
    <html lang="en">
      <body
        className={`${figtree.variable} antialiased`}
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
