"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ContentCard from "@/components/content-card";
import CategoryFilter from "@/components/category-filter";
import FadeIn from "@/components/fade-in";
import type { WorkDoc } from "@/lib/payload/types";

interface WorkContentProps {
  work: WorkDoc[];
  initialCategory?: string;
}

export default function WorkContent({ work, initialCategory }: WorkContentProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || initialCategory || null;

  const filtered = category
    ? work.filter((w) => w.categories?.some((c) => c.toLowerCase() === category.toLowerCase()))
    : work;

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="mb-12">
            <span className="section-label">Portfolio</span>
            <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">Work</h1>
            <p className="text-light-300 mt-3">two decades of production across brands, agencies, and independent work.</p>
          </div>
        </FadeIn>
        <CategoryFilter work={work} />
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((work, index) => {
              const cover = typeof work.coverImage === "object" ? work.coverImage : null;
              return (
                <FadeIn key={work.id}>
                  <ContentCard
                    href={`/work/${work.slug}`}
                    title={work.title}
                    coverImage={cover}
                    label={work.client || work.roleCredits}
                    overlayTags={work.categories}
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
      </div>
    </div>
  );
}
