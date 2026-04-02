import Link from "next/link";
import Image from "next/image";
import TagBadge from "./tag-badge";
import { formatDate } from "@/lib/utils";
import type { BlogPostDoc } from "@/lib/payload/types";

interface BlogCardProps {
  post: BlogPostDoc;
}

export default function BlogCard({ post }: BlogCardProps) {
  const cover = typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;
  const tags = post.tags?.map((t) => t.tag) ?? [];

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-sm">
        {cover?.url ? (
          <Image src={cover.sizes?.card?.url ?? cover.url} alt={cover.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">{post.title}</div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {post.date && <p className="text-xs uppercase tracking-wider text-gray-500">{formatDate(post.date)}</p>}
        <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">{post.title}</h3>
        {post.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.map((tag) => (<TagBadge key={tag} label={tag} />))}
          </div>
        )}
      </div>
    </Link>
  );
}
