"use client";

import { useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";

const CATEGORIES = [
  "All",
  "Commercial",
  "Branding",
  "Corporate",
  "Documentary",
  "Awareness",
  "Design",
  "Digital",
];

export default function CategoryFilter() {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "All";

  return (
    <div className="mb-10">
      <ScrollFilters>
        {CATEGORIES.map((category) => {
          const href =
            category === "All"
              ? "/work"
              : `/work?category=${encodeURIComponent(category)}`;
          return (
            <FilterPill
              key={category}
              href={href}
              label={category}
              active={active === category}
            />
          );
        })}
      </ScrollFilters>
    </div>
  );
}
