import type { BlogPostDoc } from "@/lib/payload/types";

type LinkablePost = Pick<BlogPostDoc, "slug" | "isExternal" | "publicationUrl">;

/**
 * Resolves where a dispatch post should link. External posts (published
 * elsewhere) go straight to the publication; internal posts to /dispatch/slug.
 */
export function dispatchHref(post: LinkablePost): { href: string; external: boolean } {
  if (post.isExternal && post.publicationUrl) {
    return { href: post.publicationUrl, external: true };
  }
  return { href: `/dispatch/${post.slug}`, external: false };
}
