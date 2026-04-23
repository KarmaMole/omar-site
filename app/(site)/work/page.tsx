export const revalidate = 300;

import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/json-ld";
import { getAllWork } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import WorkContent from "./work-content";

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
    <Suspense>
      <JsonLd data={collectionJsonLd} />
      <WorkContent work={allWork} />
    </Suspense>
  );
}
