import Link from "next/link";
import ContentCard from "@/components/content-card";
import CategoryFilter from "@/components/category-filter";
import FadeIn from "@/components/fade-in";
import { sameCategory } from "@/lib/categories";
import type { WorkDoc } from "@/lib/payload/types";

interface WorkViewProps {
  work: WorkDoc[];
  /** Active category from the URL; null renders the full, unfiltered grid */
  category: string | null;
}

/**
 * Presentational pills + grid. Rendered on the server with category=null so the
 * static HTML contains every card, and re-rendered on the client with the real
 * URL param by WorkFiltered. Deliberately free of hooks.
 */
export default function WorkView({ work, category }: WorkViewProps) {
  const filtered = category
    ? work.filter((w) => w.categories?.some((c) => sameCategory(c, category)))
    : work;

  return (
    <>
      <CategoryFilter work={work} activeCategory={category} />
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((item, index) => {
            const cover = typeof item.coverImage === "object" ? item.coverImage : null;
            return (
              <FadeIn key={item.id}>
                <ContentCard
                  href={`/work/${item.slug}`}
                  title={item.title}
                  coverImage={cover}
                  label={item.client || item.roleCredits}
                  overlayTags={item.categories}
                  priority={index === 0}
                />
              </FadeIn>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-light-300 text-sm mb-4">No work found in this category.</p>
          <Link href="/work" className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline">
            Clear filters
          </Link>
        </div>
      )}
    </>
  );
}
