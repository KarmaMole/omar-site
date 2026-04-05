import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CustomCursor from "@/components/custom-cursor";
import CookieConsent from "@/components/cookie-consent";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Omar Kamel — AI Creative & Production Lead",
    template: "%s — Omar Kamel",
  },
  description:
    "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Specializing in AI video/image generation, creative production, and digital content.",
  metadataBase: new URL("https://omarkamel.com"),
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
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="site" className={`${inter.variable} ${jetbrains.variable} ${sourceSerif.variable} bg-[#0a0a0a] text-[#f5f5f5]`}>
      <head />
      <body className={`${inter.className} bg-[#0a0a0a] text-[#f5f5f5]`}>
        <CustomCursor />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-cyan focus:text-black focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:tracking-widest focus:uppercase">
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="lg:pl-20 pt-14 lg:pt-0">{children}</main>
        <Footer />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
