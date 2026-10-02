"use client";

import { useSearchParams } from "next/navigation";
import WorkView from "./work-content";
import type { WorkDoc } from "@/lib/payload/types";

/**
 * Client-only filter layer. Reads ?category= after hydration so the page itself
 * stays static (no searchParams in the server component).
 */
export default function WorkFiltered({ work }: { work: WorkDoc[] }) {
  const category = useSearchParams().get("category") || null;
  return <WorkView work={work} category={category} />;
}
