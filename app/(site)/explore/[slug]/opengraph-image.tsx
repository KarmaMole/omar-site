import { getProjectBySlug } from "@/lib/payload/queries";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Omar Kamel — Explore";

export default async function ExploreOg({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return renderOgCard({
      label: "EXPLORE",
      title: "Omar Kamel",
      subtitle: "AI Creative & Production",
    });
  }

  const cover =
    typeof project.coverImage === "object" && project.coverImage
      ? project.coverImage
      : null;

  return renderOgCard({
    label: "EXPLORE",
    title: project.title,
    subtitle: project.contentType ?? null,
    coverUrl: cover?.url ?? null,
  });
}
