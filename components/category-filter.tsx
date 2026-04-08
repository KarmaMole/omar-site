"use client";

import { useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import type { WorkDoc } from "@/lib/payload/types";

const ALL_CATEGORIES = [
  "Commercial",
  "Corporate",
  "Documentary",
  "AI Production",
  "Design",
  "Digital",
  "Awareness",
];

interface CategoryFilterProps {
  work: WorkDoc[];
}

export default function CategoryFilter({ work }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || null;

  // Only show categories that have at least one item
  const categories = ALL_CATEGORIES.filter((cat) =>
    work.some((w) => w.categories?.some((c) => c.toLowerCase() === cat.toLowerCase()))
  );

  return (
    <div className="mb-10">
      <ScrollFilters>
        <FilterPill href="/work" label="All" active={!activeCategory} />
        {categories.map((category) => (
          <FilterPill
            key={category}
            href={`/work?category=${encodeURIComponent(category)}`}
            label={category}
            active={activeCategory === category}
          />
        ))}
      </ScrollFilters>
    </div>
  );
}
