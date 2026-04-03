import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CustomCursor from "@/components/custom-cursor";
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
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${sourceSerif.variable} bg-[#0a0a0a] text-[#f5f5f5]`}>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-[#f5f5f5]`}>
        <CustomCursor />
        <Nav />
        <main className="lg:pl-20 pt-14 lg:pt-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
