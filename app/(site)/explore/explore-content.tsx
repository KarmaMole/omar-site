"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProjectCard from "@/components/project-card";
import FadeIn from "@/components/fade-in";
import ScrollFilters from "@/components/scroll-filters";
import PageTransition from "@/components/page-transition";
import type { ProjectDoc } from "@/lib/payload/types";

const categories = [
  { value: "all", label: "All" },
  { value: "music", label: "Music" },
  { value: "visual", label: "Visual" },
  { value: "comics", label: "Comics" },
  { value: "film", label: "Film" },
  { value: "ai", label: "AI" },
  { value: "writing", label: "Writing" },
  { value: "photography", label: "Photography" },
];

interface ExploreContentProps {
  projects: ProjectDoc[];
  initialTag?: string;
}

export default function ExploreContent({ projects, initialTag }: ExploreContentProps) {
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
    <PageTransition>
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="mb-12">
              <span className="section-label">Explore</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                Creative Explorations
              </h1>
              <p className="text-light-300 text-lg mt-3">
                Personal projects, music, tools, and experiments.
              </p>
            </div>
          </FadeIn>

          {/* Category filter tabs — URL-driven */}
          <FadeIn>
            <div className="mb-6">
              <ScrollFilters>
                {categories.map((cat) => {
                  const href = cat.value === "all" ? "/explore" : `/explore?category=${cat.value}`;
                  return (
                    <Link
                      key={cat.value}
                      href={href}
                      className={`shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
                        activeCategory === cat.value && !activeTag
                          ? "bg-cyan/10 border-cyan text-cyan"
                          : "border-dark-100 text-light-300 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {cat.label}
                    </Link>
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
                  href="/explore"
                  className="text-light-300 hover:text-light-100 transition-colors text-sm"
                  title="Clear filter"
                >
                  ✕
                </Link>
              </div>
            </FadeIn>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((project) => (
              <FadeIn key={project.id}>
                <ProjectCard project={project} />
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-light-300 font-mono text-sm mb-4">
                No items found{activeTag ? ` for "${activeTag}"` : " in this category"}.
              </p>
              <Link
                href="/explore"
                className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline"
              >
                Reset
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
