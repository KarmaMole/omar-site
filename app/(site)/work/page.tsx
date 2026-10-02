export const revalidate = 300;

import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import { getAllWork } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import WorkView from "./work-content";
import WorkFiltered from "./work-filtered";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected highlights from 20+ years of AI production, video, music, and comics by Omar Kamel.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work: Omar Kamel",
    description: "Selected highlights from 20+ years of AI production, video, music, and comics by Omar Kamel.",
    url: "/work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work: Omar Kamel",
    description: "Selected highlights from 20+ years of AI production, video, music, and comics by Omar Kamel.",
  },
};

export default async function WorkPage() {
  const allWork = await getAllWork();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Work: Omar Kamel",
    description:
      "Selected highlights from 20+ years of AI production, video, music, and comics by Omar Kamel.",
    url: `${SITE_URL}/work`,
    isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allWork.length,
      itemListElement: allWork.map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/work/${w.slug}`,
        name: w.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <div className="pt-24 pb-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header lives on the server, outside Suspense, so the h1 is in the static HTML */}
          <FadeIn>
            <div className="mb-12">
              <span className="section-label">Portfolio</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">Work</h1>
              <p className="text-light-300 mt-3">two decades of production across brands, agencies, and independent work.</p>
            </div>
          </FadeIn>
          {/* Fallback is the full unfiltered grid, so crawlers and no-JS clients see every card.
              WorkFiltered applies ?category= after hydration. */}
          <Suspense fallback={<WorkView work={allWork} category={null} />}>
            <WorkFiltered work={allWork} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
