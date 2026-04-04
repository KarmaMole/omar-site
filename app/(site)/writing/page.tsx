export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Source_Serif_4 } from "next/font/google";
import FadeIn from "@/components/fade-in";
import ScrollFilters from "@/components/scroll-filters";
import PageTransition from "@/components/page-transition";
import { formatDate } from "@/lib/utils";
import { getAllBlogPosts } from "@/lib/payload/queries";
import type { BlogPostDoc, MediaUpload } from "@/lib/payload/types";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
});

const CATEGORIES = [
  "AEgypt",
  "Amerika",
  "Media",
  "Rants",
  "Beauty",
  "Mind",
  "Dreams",
];

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Thoughts, articles, and published work by Omar Kamel.",
};

function WritingCard({ post }: { post: BlogPostDoc }) {
  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;

  const href =
    post.isExternal && post.publicationUrl
      ? post.publicationUrl
      : `/blog/${post.slug}`;

  const isExternal = post.isExternal && post.publicationUrl;

  return (
    <Link
      href={href}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group block pb-6 border-b border-[#1a1a1a]"
    >
      {cover?.url && (
        <div className="relative aspect-video overflow-hidden rounded-[2px] mb-4">
          <Image
            src={
              (cover as MediaUpload).sizes?.card?.url ??
              (cover as MediaUpload).url
            }
            alt={(cover as MediaUpload).alt}
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

interface WritingPageProps {
  searchParams: Promise<{ tag?: string; category?: string }>;
}

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const { tag, category } = await searchParams;
  const posts = await getAllBlogPosts();

  const activeFilter = tag || category || null;

  const filtered = activeFilter
    ? posts.filter((p) =>
        p.tags?.some(
          (t) => t.tag.toLowerCase() === activeFilter.toLowerCase()
        )
      )
    : posts;

  return (
    <PageTransition>
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="mb-12">
              <span className="section-label">Writing</span>
              <h1 className="text-4xl font-light text-light-100 mt-2">
                Writing
              </h1>
              <p className="text-light-300 text-lg mt-3">
                Thoughts, articles, and published work.
              </p>
            </div>
          </FadeIn>

          {/* Category filter pills */}
          <FadeIn>
            <div className="mb-10">
              <ScrollFilters>
                <Link
                  href="/writing"
                  className={`shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
                    !activeFilter
                      ? "bg-cyan/10 border-cyan text-cyan"
                      : "border-dark-100 text-light-300 hover:text-white hover:border-white/30"
                  }`}
                >
                  All
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/writing?category=${encodeURIComponent(cat)}`}
                    className={`shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
                      activeFilter?.toLowerCase() === cat.toLowerCase()
                        ? "bg-cyan/10 border-cyan text-cyan"
                        : "border-dark-100 text-light-300 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </ScrollFilters>
            </div>
          </FadeIn>

          {/* Active tag filter indicator */}
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
                  href="/writing"
                  className="text-light-300 hover:text-light-100 transition-colors text-sm"
                  title="Clear filter"
                >
                  ✕
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
                No posts found{activeFilter ? ` for "${activeFilter}"` : ""}.
              </p>
              <Link href="/writing" className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
