import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Source_Serif_4 } from "next/font/google";
import FadeIn from "@/components/fade-in";
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
            className="object-cover"
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
            <span className="inline-block ml-2 text-light-300 text-sm">
              &nearr;
            </span>
          )}
        </h3>
        {post.excerpt && (
          <p className={`${sourceSerif.className} text-sm text-light-300 line-clamp-2`}>{post.excerpt}</p>
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
              <h2 className="text-4xl font-light text-light-100 mt-2">
                Writing
              </h2>
              <p className="text-light-300 text-lg mt-3">
                Thoughts, articles, and published work.
              </p>
            </div>
          </FadeIn>

          {/* Category filter pills */}
          <FadeIn>
            <div className="flex flex-wrap gap-2 mb-10">
              <Link
                href="/writing"
                className={`font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
                  !activeFilter
                    ? "border-cyan text-cyan bg-cyan/5"
                    : "border-[#1a1a1a] text-light-300 hover:text-light-100 hover:border-[#333]"
                }`}
              >
                All
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/writing?category=${encodeURIComponent(cat)}`}
                  className={`font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
                    activeFilter?.toLowerCase() === cat.toLowerCase()
                      ? "border-cyan text-cyan bg-cyan/5"
                      : "border-[#1a1a1a] text-light-300 hover:text-light-100 hover:border-[#333]"
                  }`}
                >
                  {cat}
                </Link>
              ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map((post) => (
                <FadeIn key={post.id}>
                  <WritingCard post={post} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <p className="text-light-300 font-mono text-sm mt-8">
              No posts found{activeFilter ? ` for "${activeFilter}"` : ""}.
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
