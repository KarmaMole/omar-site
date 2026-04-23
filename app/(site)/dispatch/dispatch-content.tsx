"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import FadeIn from "@/components/fade-in";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import { formatDate } from "@/lib/utils";
import { sourceSerif } from "@/lib/fonts";
import type { BlogPostDoc, MediaUpload } from "@/lib/payload/types";

const ALL_CATEGORIES = [
  "AI Production",
  "Workflows",
  "Industry",
  "Tools",
  "Case Studies",
];

function WritingCard({ post }: { post: BlogPostDoc }) {
  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;

  const href =
    post.isExternal && post.publicationUrl
      ? post.publicationUrl
      : `/dispatch/${post.slug}`;

  const isExternal = post.isExternal && post.publicationUrl;

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
            alt={(cover as MediaUpload).alt ?? post.title}
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

interface DispatchContentProps {
  posts: BlogPostDoc[];
}

export default function DispatchContent({ posts }: DispatchContentProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || null;
  const activeTag = searchParams.get("tag") || null;

  const filtered = posts.filter((p) => {
    if (activeCategory && !p.categories?.some((c) => c.toLowerCase() === activeCategory.toLowerCase())) return false;
    if (activeTag && !p.tags?.split(",").some((t) => t.trim().toLowerCase() === activeTag.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="mb-12">
            <span className="section-label">Field Notes</span>
            <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
              Dispatch
            </h1>
            <p className="text-light-300 mt-3">
              articles on AI production, creative workflows, and industry insights.
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mb-10">
            <ScrollFilters>
              <FilterPill href="/dispatch" label="All" active={!activeCategory && !activeTag} />
              {ALL_CATEGORIES
                .filter((cat) => posts.some((p) => p.categories?.some((c) => c === cat)))
                .map((cat) => (
                  <FilterPill
                    key={cat}
                    href={`/dispatch?category=${encodeURIComponent(cat)}`}
                    label={cat}
                    active={activeCategory?.toLowerCase() === cat.toLowerCase()}
                  />
                ))}
            </ScrollFilters>
          </div>
        </FadeIn>

        {activeTag && (
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-xs tracking-widest uppercase text-light-300">
                Tagged:
              </span>
              <span className="font-mono text-xs tracking-widest uppercase text-cyan">
                {activeTag}
              </span>
              <Link
                href="/dispatch"
                className="text-light-300 hover:text-light-100 transition-colors text-sm"
                title="Clear filter"
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
              No posts found{activeCategory ? ` in "${activeCategory}"` : activeTag ? ` for "${activeTag}"` : ""}.
            </p>
            <Link href="/dispatch" className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline">
              Clear filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
