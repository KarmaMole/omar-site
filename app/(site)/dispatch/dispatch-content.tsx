import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/fade-in";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import { formatDate } from "@/lib/utils";
import { sourceSerif } from "@/lib/fonts";
import { DISPATCH_CATEGORIES, sameCategory } from "@/lib/categories";
import { dispatchHref } from "@/lib/dispatch-link";
import type { BlogPostDoc, MediaUpload } from "@/lib/payload/types";

function WritingCard({ post }: { post: BlogPostDoc }) {
  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;

  const { href, external: isExternal } = dispatchHref(post);

  return (
    <Link
      href={href}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group block pb-6 border-b border-white/[0.07] border-l-2 border-l-transparent hover:border-l-cyan pl-4 rounded-sm hover:bg-white/[0.02] transition-colors"
    >
      {cover?.url && (
        <div className="relative aspect-video overflow-hidden rounded-[2px] mb-4">
          <Image
            src={
              (cover as MediaUpload).sizes?.card?.url ??
              (cover as MediaUpload).url
            }
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {post.date && (
            <p className="font-mono text-[10px] tracking-widest uppercase text-light-300">
              {formatDate(post.date)}
            </p>
          )}
          {post.publicationName && (
            <span className="font-mono text-[10px] tracking-widest uppercase text-cyan">
              {post.publicationName}
            </span>
          )}
        </div>
        <h3 className={`${sourceSerif.className} text-lg font-light text-light-100 group-hover:text-cyan transition-colors duration-200`}>
          {post.title}
          {isExternal && (
            <span className="inline-flex items-center gap-1 ml-2 text-cyan/70 group-hover:text-cyan transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="font-mono text-[10px] tracking-widest uppercase">External</span>
            </span>
          )}
        </h3>
        {post.excerpt && (
          <p className={`${sourceSerif.className} text-sm text-light-300 line-clamp-3`}>{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

interface DispatchViewProps {
  posts: BlogPostDoc[];
  /** Active category from the URL; null means all */
  category: string | null;
  /** Active tag from the URL; null means none */
  tag: string | null;
}

/**
 * Presentational pills + grid. Rendered on the server with no filters so the
 * static HTML contains every post, and re-rendered on the client with the real
 * URL params by DispatchFiltered. Deliberately free of hooks.
 */
export default function DispatchView({ posts, category, tag }: DispatchViewProps) {
  const filtered = posts.filter((p) => {
    if (category && !p.categories?.some((c) => sameCategory(c, category))) return false;
    if (tag && !p.tags?.split(",").some((t) => t.trim().toLowerCase() === tag.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <FadeIn>
        <div className="mb-10">
          <ScrollFilters>
            <FilterPill href="/dispatch" label="All" active={!category && !tag} />
            {DISPATCH_CATEGORIES
              .filter((cat) => posts.some((p) => p.categories?.some((c) => sameCategory(c, cat))))
              .map((cat) => (
                <FilterPill
                  key={cat}
                  href={`/dispatch?category=${encodeURIComponent(cat)}`}
                  label={cat}
                  active={sameCategory(category, cat)}
                />
              ))}
          </ScrollFilters>
        </div>
      </FadeIn>

      {tag && (
        <FadeIn>
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs tracking-widest uppercase text-light-300">
              Tagged:
            </span>
            <span className="font-mono text-xs tracking-widest uppercase text-cyan">
              {tag}
            </span>
            <Link
              href="/dispatch"
              className="text-light-300 hover:text-light-100 transition-colors text-sm"
              title="Clear filter"
              aria-label="Clear filter"
            >
              &#10005;
            </Link>
          </div>
        </FadeIn>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
          {filtered.map((post) => (
            <FadeIn key={post.id}>
              <WritingCard post={post} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-light-300 font-mono text-sm mb-4">
            No posts found{category ? ` in "${category}"` : tag ? ` for "${tag}"` : ""}.
          </p>
          <Link href="/dispatch" className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline">
            Clear filters
          </Link>
        </div>
      )}
    </>
  );
}
