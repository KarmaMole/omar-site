import type { Metadata } from "next";
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
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Omar Kamel — AI Creative & Production Lead",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@omarkamel",
  },
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
        <Nav />
        {/* TODO: Add Suspense boundaries around page sections for streaming / partial rendering */}
        <main className="lg:pl-20 pt-14 lg:pt-0">{children}</main>
        <Footer />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
