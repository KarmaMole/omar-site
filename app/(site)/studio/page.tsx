export const revalidate = 60;

import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/json-ld";
import { getAllProjects } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import StudioContent from "./studio-content";

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

interface StudioPageProps {
  searchParams: Promise<{ tag?: string; category?: string }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { tag } = await searchParams;
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
    <Suspense>
      <JsonLd data={collectionJsonLd} />
      <StudioContent projects={projects} initialTag={tag} />
    </Suspense>
  );
}
