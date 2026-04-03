export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import WorkCard from "@/components/work-card";
import CategoryFilter from "@/components/category-filter";
import FadeIn from "@/components/fade-in";
import PageTransition from "@/components/page-transition";
import { getAllWork } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of work spanning AI production, video, music, and comics — built across 20+ years in Cairo, Italy, and Dubai.",
};

interface WorkPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { category } = await searchParams;
  const allWork = await getAllWork();
  const filtered = category
    ? allWork.filter((w) => w.categories?.some((c) => c.toLowerCase() === category.toLowerCase()))
    : allWork;

  return (
    <PageTransition>
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="mb-12">
            <span className="section-label">Work</span>
            <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">Work</h1>
            <p className="text-light-300 text-lg mt-3">AI production, video, music, and comics.</p>
          </div>
        </FadeIn>
        <CategoryFilter />
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((work) => (<FadeIn key={work.id}><WorkCard work={work} /></FadeIn>))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-300 text-sm mb-4">No work found in this category.</p>
            <Link href="/work" className="font-mono text-xs uppercase tracking-widest text-cyan hover:text-white transition-colors link-underline">
              Clear filters
            </Link>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
