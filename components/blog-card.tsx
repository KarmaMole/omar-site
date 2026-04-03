import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { BlogPostDoc } from "@/lib/payload/types";

interface BlogCardProps {
  post: BlogPostDoc;
}

export default function BlogCard({ post }: BlogCardProps) {
  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block pb-6 border-b border-[#1a1a1a]"
    >
      {cover?.url && (
        <div className="relative aspect-video overflow-hidden rounded-[2px] mb-4">
          <Image
            src={cover.sizes?.card?.url ?? cover.url}
            alt={cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-2">
        {post.date && (
          <p className="font-mono text-[10px] tracking-widest uppercase text-light-300">
            {formatDate(post.date)}
          </p>
        )}
        <h3 className="text-lg font-light text-light-100 group-hover:text-cyan transition-colors duration-200">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-light-300 line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
