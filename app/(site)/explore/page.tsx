import type { Metadata } from "next";
import { getAllProjects } from "@/lib/payload/queries";
import ExploreContent from "./explore-content";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Personal projects, music, tools, and experiments by Omar Kamel.",
};

interface ExplorePageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { tag } = await searchParams;
  const projects = await getAllProjects();

  return <ExploreContent projects={projects} initialTag={tag} />;
}
