"use client";

import { useSearchParams } from "next/navigation";
import DispatchView from "./dispatch-content";
import type { BlogPostDoc } from "@/lib/payload/types";

/**
 * Client-only filter layer. Reads ?category= and ?tag= after hydration so the
 * page itself stays static (no searchParams in the server component).
 */
export default function DispatchFiltered({ posts }: { posts: BlogPostDoc[] }) {
  const params = useSearchParams();
  return (
    <DispatchView
      posts={posts}
      category={params.get("category") || null}
      tag={params.get("tag") || null}
    />
  );
}
