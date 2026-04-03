"use client";

import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="flex flex-wrap gap-2 mb-10">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => handleClick(category)}
          className={
            active === category
              ? "px-4 py-2 rounded-[2px] font-mono text-xs font-medium transition-colors border bg-cyan text-black border-cyan"
              : "px-4 py-2 rounded-[2px] font-mono text-xs font-medium transition-colors bg-transparent border border-[#1a1a1a] text-light-300 hover:border-light-300 hover:text-light-100"
          }
        >
          {category}
        </button>
      ))}
    </div>
  );
}
