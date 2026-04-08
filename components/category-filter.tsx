"use client";

import { useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";

const CATEGORIES = [
  "Commercial",
  "Corporate",
  "Documentary",
  "AI Production",
  "Design",
  "Digital",
  "Awareness",
];

export default function CategoryFilter() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || null;

  return (
    <div className="mb-10">
      <ScrollFilters>
        <FilterPill href="/work" label="All" active={!activeCategory} />
        {CATEGORIES.map((category) => (
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
