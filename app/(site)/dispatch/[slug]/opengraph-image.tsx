import { notFound } from "next/navigation";
import { stripEmDashes } from "@/lib/seo-text";
import { getBlogPostBySlug } from "@/lib/payload/queries";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const revalidate = 86400;
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
  // Hidden or missing pieces get no card (a real 404), not a generic one
  if (!post) notFound();

  // Dispatch covers are white-ground ink drawings, which a stone wash turns grey, so dispatches use
  // the brand kit's no-image card (og-dispatch.png): title plus a short standfirst.
  const first = (post.excerpt ?? "").split(/(?<=[.!?])\s/)[0]?.trim() ?? "";
  return renderOgCard({
    label: "DISPATCH",
    title: post.title,
    subtitle: first && first.length <= 90 ? stripEmDashes(first) : post.categories?.join(" · ") ?? null,
  });
}
