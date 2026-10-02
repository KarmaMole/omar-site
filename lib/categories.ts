/**
 * Single source of truth for category lists. Values and order mirror the
 * select options in collections/Work.ts, Projects.ts and BlogPosts.ts.
 * Order is curated: do not sort.
 */
export const WORK_CATEGORIES = [
  "Commercial",
  "Corporate",
  "Documentary",
  "AI Production",
  "Design",
  "Digital",
  "Awareness",
] as const;

export const PROJECT_CATEGORIES = [
  "Music",
  "Visual",
  "Comics",
  "Film",
  "AI",
  "Photography",
  "Research",
] as const;

export const DISPATCH_CATEGORIES = [
  "AI Production",
  "Workflows",
  "Industry",
  "Tools",
  "Case Studies",
] as const;

/** Case-insensitive, whitespace-trimmed category comparison. */
export function sameCategory(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (a == null || b == null) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
