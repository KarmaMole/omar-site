import { unstable_cache } from "next/cache";
import { getPayloadClient } from "./client";
import type {
  WorkDoc,
  ProjectDoc,
  BlogPostDoc,
  ClientDoc,
  SiteSettingsDoc,
} from "./types";

// ─── Site Settings ──────────────────────────────────────────────

export const getSiteSettings: () => Promise<SiteSettingsDoc> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    return payload.findGlobal({ slug: "site-settings" }) as Promise<SiteSettingsDoc>;
  },
  ["getSiteSettings"],
  { tags: ["settings"], revalidate: 3600 }
);

// ─── Work ───────────────────────────────────────────────────────

export const getAllWork: () => Promise<WorkDoc[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "work",
      where: { hidden: { not_equals: true } },
      sort: "-sortOrder",
      limit: 100,
      depth: 1,
    });
    return result.docs as unknown as WorkDoc[];
  },
  ["getAllWork"],
  { tags: ["work"], revalidate: 3600 }
);

export const getFeaturedWork: () => Promise<WorkDoc[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "work",
      where: { featured: { equals: true }, hidden: { not_equals: true } },
      sort: "-sortOrder",
      limit: 100,
      depth: 1,
    });
    return result.docs as unknown as WorkDoc[];
  },
  ["getFeaturedWork"],
  { tags: ["work"], revalidate: 3600 }
);

export const getWorkBySlug: (slug: string) => Promise<WorkDoc | null> = unstable_cache(
  async (slug: string) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "work",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    return (result.docs[0] as unknown as WorkDoc) ?? null;
  },
  ["getWorkBySlug"],
  { tags: ["work"], revalidate: 3600 }
);

export const getAllWorkSlugs: () => Promise<string[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "work",
      where: { hidden: { not_equals: true } },
      limit: 1000,
      depth: 0,
    });
    return (result.docs as unknown as WorkDoc[]).map((d) => d.slug);
  },
  ["getAllWorkSlugs"],
  { tags: ["work"], revalidate: 3600 }
);

// ─── Projects ───────────────────────────────────────────────────

export const getAllProjects: () => Promise<ProjectDoc[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "projects",
      where: { hidden: { not_equals: true } },
      sort: "-sortOrder",
      limit: 100,
      depth: 1,
    });
    return result.docs as unknown as ProjectDoc[];
  },
  ["getAllProjects"],
  { tags: ["studio"], revalidate: 3600 }
);

export const getFeaturedProjects: () => Promise<ProjectDoc[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "projects",
      where: { featured: { equals: true }, hidden: { not_equals: true } },
      sort: "-sortOrder",
      limit: 100,
      depth: 1,
    });
    return result.docs as unknown as ProjectDoc[];
  },
  ["getFeaturedProjects"],
  { tags: ["studio"], revalidate: 3600 }
);

export const getProjectBySlug: (slug: string) => Promise<ProjectDoc | null> = unstable_cache(
  async (slug: string) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "projects",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    return (result.docs[0] as unknown as ProjectDoc) ?? null;
  },
  ["getProjectBySlug"],
  { tags: ["studio"], revalidate: 3600 }
);

export const getAllProjectSlugs: () => Promise<string[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "projects",
      where: { hidden: { not_equals: true } },
      limit: 1000,
      depth: 0,
    });
    return (result.docs as unknown as ProjectDoc[]).map((d) => d.slug);
  },
  ["getAllProjectSlugs"],
  { tags: ["studio"], revalidate: 3600 }
);

// ─── Clients ───────────────────────────────────────────────────

export const getAllClients: () => Promise<ClientDoc[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "clients",
      sort: "sortOrder",
      limit: 100,
      depth: 1,
    });
    return result.docs as unknown as ClientDoc[];
  },
  ["getAllClients"],
  { tags: ["clients"], revalidate: 3600 }
);

// ─── Blog Posts ─────────────────────────────────────────────────

export const getAllBlogPosts: () => Promise<BlogPostDoc[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blog-posts",
      sort: "-date",
      limit: 100,
      depth: 1,
    });
    return result.docs as unknown as BlogPostDoc[];
  },
  ["getAllBlogPosts"],
  { tags: ["dispatch"], revalidate: 3600 }
);

export const getRecentBlogPosts: (count: number) => Promise<BlogPostDoc[]> = unstable_cache(
  async (count: number) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blog-posts",
      sort: "-date",
      limit: count,
      depth: 1,
    });
    return result.docs as unknown as BlogPostDoc[];
  },
  ["getRecentBlogPosts"],
  { tags: ["dispatch"], revalidate: 3600 }
);

export const getBlogPostBySlug: (slug: string) => Promise<BlogPostDoc | null> = unstable_cache(
  async (slug: string) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blog-posts",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return (result.docs[0] as unknown as BlogPostDoc) ?? null;
  },
  ["getBlogPostBySlug"],
  { tags: ["dispatch"], revalidate: 3600 }
);

export const getAllBlogSlugs: () => Promise<string[]> = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blog-posts",
      limit: 1000,
      depth: 0,
    });
    return (result.docs as unknown as BlogPostDoc[]).map((d) => d.slug);
  },
  ["getAllBlogSlugs"],
  { tags: ["dispatch"], revalidate: 3600 }
);
