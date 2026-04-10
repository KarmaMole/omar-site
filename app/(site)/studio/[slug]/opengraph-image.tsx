import { getProjectBySlug } from "@/lib/payload/queries";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateAlt({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return project ? `${project.title} by Omar Kamel` : "Studio by Omar Kamel";
}

export default async function StudioOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return renderOgCard({
      label: "STUDIO",
      title: "Omar Kamel",
      subtitle: "Studio Projects",
    });
  }

  const cover =
    typeof project.coverImage === "object" && project.coverImage
      ? project.coverImage
      : null;

  return renderOgCard({
    label: "STUDIO",
    title: project.title,
    subtitle:
      project.categories?.join(" · ") ||
      project.tags?.split(",")[0]?.trim() ||
      null,
    coverUrl: cover?.url ?? null,
  });
}
