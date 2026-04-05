import { getBlogPostBySlug } from "@/lib/payload/queries";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Omar Kamel — Writing";

export default async function BlogOg({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return renderOgCard({
      label: "WRITING",
      title: "Omar Kamel",
      subtitle: "AI Creative & Production",
    });
  }

  const cover =
    typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;

  return renderOgCard({
    label: "WRITING",
    title: post.meta?.title ?? post.title,
    subtitle: post.excerpt ?? null,
    coverUrl: cover?.url ?? null,
  });
}
