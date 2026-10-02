"use client";

import { useSearchParams } from "next/navigation";
import StudioView from "./studio-content";
import type { ProjectDoc } from "@/lib/payload/types";

/**
 * Client-only filter layer. Reads ?category= and ?tag= after hydration so the
 * page itself stays static (no searchParams in the server component).
 */
export default function StudioFiltered({ projects }: { projects: ProjectDoc[] }) {
  const params = useSearchParams();
  return (
    <StudioView
      projects={projects}
      category={params.get("category") || null}
      tag={params.get("tag") || null}
    />
  );
}
