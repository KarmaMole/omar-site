import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import DeckChrome from "@/components/deck/chrome";
import CookieConsent from "@/components/cookie-consent";
import { SITE_URL } from "@/lib/constants";
import "../globals.css";
import "./deck.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Omar Kamel: AI Creative & Production Lead",
    template: "%s: Omar Kamel",
  },
  description:
    "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Specializing in AI video/image generation, creative production, and digital content.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Omar Kamel",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@omarkamel",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#E7E2D6",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} style={{ ["--body" as string]: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}>
      <head>
        <link rel="preload" href="/fonts/metropolis-semibold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/metropolis-medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip">Skip to content</a>
        <DeckChrome />
        <main id="main-content">{children}</main>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Analytics />
      </body>
    </html>
  );
}
