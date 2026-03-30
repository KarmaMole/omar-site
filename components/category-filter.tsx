"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  "All",
  "AI & Production",
  "Video Production",
  "AI Films",
  "Music",
  "Comics & Writing",
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
              ? "px-4 py-2 rounded-full text-sm font-medium transition-colors bg-black text-white"
              : "px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
          }
        >
          {category}
        </button>
      ))}
    </div>
  );
}
