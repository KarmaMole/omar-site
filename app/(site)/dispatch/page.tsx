export const revalidate = 300;

import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import { getAllBlogPosts } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import DispatchView from "./dispatch-content";
import DispatchFiltered from "./dispatch-filtered";

export const metadata: Metadata = {
  title: "Dispatch",
  description:
    "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
  alternates: {
    canonical: "/dispatch",
    // A child `alternates` replaces the layout's, so re-declare the feed link here.
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    title: "Dispatch: Omar Kamel",
    description: "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
    url: "/dispatch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dispatch: Omar Kamel",
    description: "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
  },
};

export default async function DispatchPage() {
  const posts = await getAllBlogPosts();

  // Only include internal posts in the ItemList schema.
  const internalPosts = posts.filter((p) => !p.isExternal);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Dispatch: Omar Kamel",
    description:
      "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
    url: `${SITE_URL}/dispatch`,
    isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: internalPosts.length,
      itemListElement: internalPosts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/dispatch/${p.slug}`,
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
              <span className="section-label">Field Notes</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                Dispatch
              </h1>
              <p className="text-light-300 mt-3">
                articles on AI production, creative workflows, and industry insights.
              </p>
            </div>
          </FadeIn>
          {/* Fallback is the full unfiltered list, so crawlers and no-JS clients see every post.
              DispatchFiltered applies ?category= and ?tag= after hydration. */}
          <Suspense fallback={<DispatchView posts={posts} category={null} tag={null} />}>
            <DispatchFiltered posts={posts} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
