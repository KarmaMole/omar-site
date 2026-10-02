import ScrollFilters from "@/components/scroll-filters";
import FilterPill from "@/components/filter-pill";
import { WORK_CATEGORIES, sameCategory } from "@/lib/categories";
import type { WorkDoc } from "@/lib/payload/types";

interface CategoryFilterProps {
  work: WorkDoc[];
  /** Active category from the URL, if any (matched case-insensitively) */
  activeCategory: string | null;
}

export default function CategoryFilter({ work, activeCategory }: CategoryFilterProps) {
  // Only show categories that have at least one item
  const categories = WORK_CATEGORIES.filter((cat) =>
    work.some((w) => w.categories?.some((c) => sameCategory(c, cat)))
  );

  return (
    <div className="mb-10">
      <ScrollFilters>
        <FilterPill href="/work" label="All" active={!activeCategory} />
        {categories.map((category) => (
          <FilterPill
            key={category}
            href={`/work?category=${encodeURIComponent(category)}`}
            label={category}
            active={sameCategory(activeCategory, category)}
          />
        ))}
      </ScrollFilters>
    </div>
  );
}
