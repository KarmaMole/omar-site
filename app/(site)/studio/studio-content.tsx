import Link from "next/link";
import ContentCard from "@/components/content-card";
import FadeIn from "@/components/fade-in";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import { PROJECT_CATEGORIES, sameCategory } from "@/lib/categories";
import type { ProjectDoc } from "@/lib/payload/types";

interface StudioViewProps {
  projects: ProjectDoc[];
  /** Active category from the URL; null means all */
  category: string | null;
  /** Active tag from the URL; null means none */
  tag: string | null;
}

/**
 * Presentational pills + grid. Rendered on the server with no filters so the
 * static HTML contains every card, and re-rendered on the client with the real
 * URL params by StudioFiltered. Deliberately free of hooks.
 */
export default function StudioView({ projects, category, tag }: StudioViewProps) {
  const filtered = projects.filter((p) => {
    if (category && !p.categories?.some((c) => sameCategory(c, category))) return false;
    if (tag && !p.tags?.split(",").some((t) => t.trim().toLowerCase() === tag.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* Category filter tabs, only showing categories with items */}
      <FadeIn>
        <div className="mb-6">
          <ScrollFilters>
            <FilterPill href="/studio" label="All" active={!category && !tag} />
            {PROJECT_CATEGORIES
              .filter((cat) => projects.some((p) => p.categories?.some((c) => sameCategory(c, cat))))
              .map((cat) => (
                <FilterPill
                  key={cat}
                  href={`/studio?category=${encodeURIComponent(cat)}`}
                  label={cat}
                  active={sameCategory(category, cat) && !tag}
                />
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
              href="/studio"
              className="text-light-300 hover:text-light-100 transition-colors text-sm"
              title="Clear filter"
              aria-label="Clear filter"
            >
              &#10005;
            </Link>
          </div>
        </FadeIn>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((project, index) => {
          const cover =
            typeof project.coverImage === "object" && project.coverImage
              ? project.coverImage
              : null;
          const tags = project.tags
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          return (
            <FadeIn key={project.id}>
              <ContentCard
                href={`/studio/${project.slug}`}
                title={project.title}
                coverImage={cover}
                label={project.categories?.length ? project.categories.join(", ") : null}
                overlayTags={tags}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </FadeIn>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-light-300 font-mono text-sm mb-4">
            No items found{tag ? ` for "${tag}"` : " in this category"}.
          </p>
          <Link
            href="/studio"
            className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline"
          >
            Reset
          </Link>
        </div>
      )}
    </>
  );
}
