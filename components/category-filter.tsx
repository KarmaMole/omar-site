"use client";

import { useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import type { WorkDoc } from "@/lib/payload/types";

const WORK_TYPES = [
  { value: "all", label: "All Work" },
  { value: "client", label: "Client" },
  { value: "personal", label: "Personal" },
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

interface CategoryFilterProps {
  allWork: WorkDoc[];
}

export default function CategoryFilter({ allWork }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") || "all";
  const activeCategory = searchParams.get("category") || null;

  // Get the work items for the active type to determine which categories have items
  const typeFiltered =
    activeType === "all"
      ? allWork
      : allWork.filter((w) => w.workType === activeType);

  // Only show categories that have at least one item in the current type
  const availableCategories = CATEGORIES.filter((cat) =>
    typeFiltered.some((w) =>
      w.categories?.some((c) => c.toLowerCase() === cat.toLowerCase())
    )
  );

  return (
    <div className="mb-10">
      {/* Work type — segmented control style */}
      <div className="flex gap-0 mb-5">
        {WORK_TYPES.map((wt) => {
          const isActive = activeType === wt.value;
          const href =
            wt.value === "all" ? "/work" : `/work?type=${wt.value}`;
          return (
            <a
              key={wt.value}
              href={href}
              className={`font-mono text-xs tracking-[0.15em] uppercase px-5 py-2.5 transition-colors duration-200 border ${
                isActive
                  ? "bg-cyan/10 border-cyan text-cyan z-10"
                  : "border-white/[0.07] text-light-300 hover:text-white hover:border-white/20"
              } ${
                wt.value === "all"
                  ? "rounded-l"
                  : wt.value === "personal"
                    ? "rounded-r -ml-px"
                    : "-ml-px"
              }`}
            >
              {wt.label}
            </a>
          );
        })}
      </div>

      {/* Connecting line + category pills */}
      {availableCategories.length > 0 && (
        <div className="relative pl-4 border-l-2 border-cyan/20">
          <ScrollFilters>
            {availableCategories.map((category) => {
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
      )}
    </div>
  );
}
