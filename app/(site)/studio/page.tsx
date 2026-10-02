export const revalidate = 300;

import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import { getAllProjects } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import StudioView from "./studio-content";
import StudioFiltered from "./studio-filtered";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Self-directed projects, music, photography, and experiments by Omar Kamel.",
  alternates: {
    canonical: "/studio",
  },
  openGraph: {
    title: "Studio: Omar Kamel",
    description: "Self-directed projects, music, photography, and experiments by Omar Kamel.",
    url: "/studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio: Omar Kamel",
    description: "Self-directed projects, music, photography, and experiments by Omar Kamel.",
  },
};

export default async function StudioPage() {
  const projects = await getAllProjects();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Studio: Omar Kamel",
    description:
      "Self-directed projects, music, photography, and experiments by Omar Kamel.",
    url: `${SITE_URL}/studio`,
    isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/studio/${p.slug}`,
        name: p.title,
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
              <span className="section-label">Explore</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                Studio
              </h1>
              <p className="text-light-300 mt-3">
                films, music, comics, and tools built.
              </p>
            </div>
          </FadeIn>
          {/* Fallback is the full unfiltered grid, so crawlers and no-JS clients see every card.
              StudioFiltered applies ?category= and ?tag= after hydration. */}
          <Suspense fallback={<StudioView projects={projects} category={null} tag={null} />}>
            <StudioFiltered projects={projects} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
