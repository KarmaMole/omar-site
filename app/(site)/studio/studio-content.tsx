"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ContentCard from "@/components/content-card";
import FadeIn from "@/components/fade-in";
import { getContentTypeLabel } from "@/lib/utils";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import type { ProjectDoc } from "@/lib/payload/types";

const ALL_CATEGORIES = [
  { value: "music", label: "Music" },
  { value: "visual", label: "Visual" },
  { value: "comics", label: "Comics" },
  { value: "film", label: "Film" },
  { value: "ai", label: "AI" },
  { value: "photography", label: "Photography" },
  { value: "research", label: "Research" },
];

interface StudioContentProps {
  projects: ProjectDoc[];
  initialTag?: string;
}

export default function StudioContent({ projects, initialTag }: StudioContentProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeTag = initialTag || searchParams.get("tag") || null;

  const filtered = (() => {
    let result = activeCategory === "all"
      ? projects
      : projects.filter((p) => p.contentType === activeCategory);

    if (activeTag) {
      result = result.filter((p) =>
        p.tags?.split(",").some((t) => t.trim().toLowerCase() === activeTag.toLowerCase())
      );
    }

    return result;
  })();

  return (
      <div className="pt-24 pb-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="mb-12">
              <span className="section-label">Explore</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                Studio
              </h1>
              <p className="text-light-300 mt-3">
                films, music, comics, and tools built.
              </p>
            </div>
          </FadeIn>

          {/* Category filter tabs -- only show categories with items */}
          <FadeIn>
            <div className="mb-6">
              <ScrollFilters>
                <FilterPill href="/studio" label="All" active={activeCategory === "all" && !activeTag} />
                {ALL_CATEGORIES
                  .filter((cat) => projects.some((p) => p.contentType === cat.value))
                  .map((cat) => {
                    const href = `/studio?category=${cat.value}`;
                    return (
                      <FilterPill
                        key={cat.value}
                        href={href}
                        label={cat.label}
                        active={activeCategory === cat.value && !activeTag}
                      />
                    );
                  })}
              </ScrollFilters>
            </div>
          </FadeIn>

          {/* Active tag filter indicator */}
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
                  href="/studio"
                  className="text-light-300 hover:text-light-100 transition-colors text-sm"
                  title="Clear filter"
                >
                  &#10005;
                </Link>
              </div>
            </FadeIn>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((project) => {
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
                    label={project.contentType ? getContentTypeLabel(project.contentType) : null}
                    overlayTags={tags}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </FadeIn>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-light-300 font-mono text-sm mb-4">
                No items found{activeTag ? ` for "${activeTag}"` : " in this category"}.
              </p>
              <Link
                href="/studio"
                className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline"
              >
                Reset
              </Link>
            </div>
          )}
        </div>
      </div>
  );
}
