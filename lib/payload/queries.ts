import { getPayload } from "payload";
import config from "@payload-config";
import type {
  WorkDoc,
  ProjectDoc,
  BlogPostDoc,
  ClientDoc,
  SiteSettingsDoc,
} from "./types";

async function getPayloadClient() {
  return getPayload({ config });
}

// ─── Site Settings ──────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings" }) as Promise<SiteSettingsDoc>;
}

// ─── Work ───────────────────────────────────────────────────────

export async function getAllWork(): Promise<WorkDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as WorkDoc[];
}

export async function getFeaturedWork(): Promise<WorkDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    where: { featured: { equals: true } },
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as WorkDoc[];
}

export async function getWorkBySlug(slug: string): Promise<WorkDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as unknown as WorkDoc) ?? null;
}

export async function getAllWorkSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    limit: 1000,
    depth: 0,
  });
  return (result.docs as unknown as WorkDoc[]).map((d) => d.slug);
}

// ─── Projects ───────────────────────────────────────────────────

export async function getAllProjects(): Promise<ProjectDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as ProjectDoc[];
}

export async function getFeaturedProjects(): Promise<ProjectDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { featured: { equals: true } },
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as ProjectDoc[];
}

export async function getProjectBySlug(
  slug: string
): Promise<ProjectDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as unknown as ProjectDoc) ?? null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    limit: 1000,
    depth: 0,
  });
  return (result.docs as unknown as ProjectDoc[]).map((d) => d.slug);
}

// ─── Clients ───────────────────────────────────────────────────

export async function getAllClients(): Promise<ClientDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "clients",
    sort: "sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as ClientDoc[];
}

// ─── Blog Posts ─────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPostDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    sort: "-date",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as BlogPostDoc[];
}

export async function getRecentBlogPosts(
  count: number
): Promise<BlogPostDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    sort: "-date",
    limit: count,
    depth: 1,
  });
  return result.docs as unknown as BlogPostDoc[];
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as unknown as BlogPostDoc) ?? null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    limit: 1000,
    depth: 0,
  });
  return (result.docs as unknown as BlogPostDoc[]).map((d) => d.slug);
}
