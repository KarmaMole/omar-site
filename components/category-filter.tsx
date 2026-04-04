"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "All";

  function handleClick(category: string) {
    if (category === "All") {
      router.push("/work");
    } else {
      router.push(`/work?category=${encodeURIComponent(category)}`);
    }
  }

  return (
    <div className="mb-10">
      <ScrollFilters>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleClick(category)}
            className={`shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors duration-200 ${
              active === category
                ? "bg-cyan/10 border-cyan text-cyan"
                : "border-dark-100 text-light-300 hover:text-white hover:border-white/30"
            }`}
          >
            {category}
          </button>
        ))}
      </ScrollFilters>
    </div>
  );
}
