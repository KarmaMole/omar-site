export const revalidate = 300;

import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/json-ld";
import { getAllBlogPosts } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import DispatchContent from "./dispatch-content";

export const metadata: Metadata = {
  title: "Dispatch",
  description:
    "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
  alternates: {
    canonical: "/dispatch",
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
    <Suspense>
      <JsonLd data={collectionJsonLd} />
      <DispatchContent posts={posts} />
    </Suspense>
  );
}
