import { getWorkBySlug } from "@/lib/payload/queries";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateAlt({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  return work ? `${work.title} by Omar Kamel` : "Work by Omar Kamel";
}

export default async function WorkOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) {
    return renderOgCard({
      label: "WORK",
      title: "Omar Kamel",
      subtitle: "AI Creative & Production",
    });
  }

  const cover =
    typeof work.coverImage === "object" && work.coverImage ? work.coverImage : null;

  return renderOgCard({
    label: "WORK",
    title: work.title,
    subtitle: work.client || work.roleCredits || work.categories?.join(" · ") || null,
    coverUrl: cover?.url ?? null,
  });
}
