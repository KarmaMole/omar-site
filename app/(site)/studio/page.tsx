export const revalidate = 60;

import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProjects } from "@/lib/payload/queries";
import StudioContent from "./studio-content";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Self-directed projects, music, photography, and experiments by Omar Kamel.",
};

interface StudioPageProps {
  searchParams: Promise<{ tag?: string; category?: string }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { tag } = await searchParams;
  const projects = await getAllProjects();

  return (
    <Suspense>
      <StudioContent projects={projects} initialTag={tag} />
    </Suspense>
  );
}
