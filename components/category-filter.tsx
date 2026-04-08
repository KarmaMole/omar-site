"use client";

import { useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";

const WORK_TYPES = [
  { value: "all", label: "All" },
  { value: "client", label: "Client Work" },
  { value: "personal", label: "Personal Work" },
];

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
  const activeType = searchParams.get("type") || "all";
  const activeCategory = searchParams.get("category") || null;

  return (
    <div className="mb-10 space-y-4">
      {/* Work type filter */}
      <ScrollFilters>
        {WORK_TYPES.map((wt) => {
          const href =
            wt.value === "all"
              ? "/work"
              : `/work?type=${wt.value}`;
          return (
            <FilterPill
              key={wt.value}
              href={href}
              label={wt.label}
              active={activeType === wt.value && !activeCategory}
            />
          );
        })}
      </ScrollFilters>

      {/* Category filter */}
      <ScrollFilters>
        {CATEGORIES.map((category) => {
          const params = new URLSearchParams();
          if (activeType !== "all") params.set("type", activeType);
          params.set("category", category);
          const href = `/work?${params.toString()}`;
          return (
            <FilterPill
              key={category}
              href={href}
              label={category}
              active={activeCategory === category}
            />
          );
        })}
      </ScrollFilters>
    </div>
  );
}
