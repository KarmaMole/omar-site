export const revalidate = 60;

import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllWork } from "@/lib/payload/queries";
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

interface WorkPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { category } = await searchParams;
  const allWork = await getAllWork();

  return (
    <Suspense>
      <WorkContent work={allWork} initialCategory={category} />
    </Suspense>
  );
}
