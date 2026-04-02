import Link from "next/link";
import TagBadge from "./tag-badge";
import { formatDate } from "@/lib/utils";
import { BlogPost } from "@/lib/dummy-data";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug.current}`} className="group block">
      {/* Cover image area */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-sm">
        {/* Placeholder — replace with next/image when Sanity is connected */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">
          {post.title}
        </div>
      </div>

      {/* Card content */}
      <div className="mt-3 space-y-1">
        {post.date && (
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {formatDate(post.date)}
          </p>
        )}

        <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {post.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
