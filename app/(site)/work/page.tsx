import type { Metadata } from "next";
import WorkCard from "@/components/work-card";
import CategoryFilter from "@/components/category-filter";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { dummyWork } from "@/lib/dummy-data";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A selection of work spanning AI production, video, music, and comics — built across 20+ years in Cairo, Italy, and Dubai.",
};

interface WorkPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { category } = await searchParams;

  const filtered = category
    ? dummyWork.filter((w) =>
        w.categories?.some(
          (c) => c.toLowerCase() === category.toLowerCase()
        )
      )
    : dummyWork;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading
            title="Work"
            subtitle="AI production, video, music, and comics."
          />
        </FadeIn>

        <CategoryFilter />

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((work) => (
              <FadeIn key={work._id}>
                <WorkCard work={work} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No work found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
