import { getBlogPostBySlug } from "@/lib/payload/queries";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateAlt({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return post ? `${post.title} by Omar Kamel` : "Dispatch by Omar Kamel";
}

export default async function DispatchOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return renderOgCard({
      label: "DISPATCH",
      title: "Omar Kamel",
      subtitle: "Field Notes",
    });
  }

  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;

  return renderOgCard({
    label: "DISPATCH",
    title: post.title,
    subtitle: post.categories?.[0] ?? null,
    coverUrl: cover?.url ?? null,
  });
}
