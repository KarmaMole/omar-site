"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ScrollFilters from "@/components/scroll-filters";

const CATEGORIES = [
  "All",
  "Commercial & Advertising",
  "Documentary & Awareness",
  "Corporate",
  "Branding & Design",
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
            className={
              active === category
                ? "shrink-0 whitespace-nowrap px-4 py-2 rounded-[2px] font-mono text-xs font-medium transition-colors border bg-cyan text-black border-cyan"
                : "shrink-0 whitespace-nowrap px-4 py-2 rounded-[2px] font-mono text-xs font-medium transition-colors bg-transparent border border-[#1a1a1a] text-light-300 hover:border-light-300 hover:text-light-100"
            }
          >
            {category}
          </button>
        ))}
      </ScrollFilters>
    </div>
  );
}
