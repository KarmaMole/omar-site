import { client } from "./client";
import type { Work, Project, BlogPost, SiteSettings } from "./types";

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0]{
      heroHeadline,
      heroTagline,
      heroBackground,
      aboutBio,
      aboutPhoto,
      profilePhoto,
      socialLinks,
      googleAnalyticsId
    }`
  );
}

// ─── Work ─────────────────────────────────────────────────────────────────────

export async function getAllWork(): Promise<Work[]> {
  return client.fetch<Work[]>(
    `*[_type == "work"] | order(sortOrder asc, date desc){
      _id,
      title,
      slug,
      client,
      coverImage,
      categories,
      tags,
      media,
      externalLink,
      featured,
      sortOrder,
      date
    }`
  );
}

export async function getFeaturedWork(): Promise<Work[]> {
  return client.fetch<Work[]>(
    `*[_type == "work" && featured == true] | order(sortOrder asc){
      _id,
      title,
      slug,
      client,
      coverImage,
      categories,
      tags,
      media,
      externalLink,
      featured,
      sortOrder,
      date
    }`
  );
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  return client.fetch<Work | null>(
    `*[_type == "work" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      client,
      description,
      coverImage,
      categories,
      tags,
      media,
      externalLink,
      featured,
      sortOrder,
      date
    }`,
    { slug }
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  return client.fetch<Project[]>(
    `*[_type == "project"] | order(sortOrder asc){
      _id,
      title,
      slug,
      coverImage,
      logo,
      status,
      links,
      tags,
      featured,
      sortOrder
    }`
  );
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return client.fetch<Project[]>(
    `*[_type == "project" && featured == true] | order(sortOrder asc){
      _id,
      title,
      slug,
      coverImage,
      logo,
      status,
      links,
      tags,
      featured,
      sortOrder
    }`
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch<Project | null>(
    `*[_type == "project" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      coverImage,
      logo,
      status,
      links,
      tags,
      featured,
      sortOrder
    }`,
    { slug }
  );
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<Omit<BlogPost, "body">[]> {
  return client.fetch<Omit<BlogPost, "body">[]>(
    `*[_type == "blogPost"] | order(date desc){
      _id,
      title,
      slug,
      coverImage,
      excerpt,
      date,
      tags,
      seo
    }`
  );
}

export async function getRecentBlogPosts(
  limit: number = 3
): Promise<Omit<BlogPost, "body">[]> {
  return client.fetch<Omit<BlogPost, "body">[]>(
    `*[_type == "blogPost"] | order(date desc)[0...$limit]{
      _id,
      title,
      slug,
      coverImage,
      excerpt,
      date,
      tags
    }`,
    { limit }
  );
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  return client.fetch<BlogPost | null>(
    `*[_type == "blogPost" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      coverImage,
      body,
      excerpt,
      date,
      tags,
      seo
    }`,
    { slug }
  );
}

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

export async function getAllWorkSlugs(): Promise<string[]> {
  const results = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "work"]{ slug }`
  );
  return results.map((r) => r.slug.current);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const results = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "project"]{ slug }`
  );
  return results.map((r) => r.slug.current);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const results = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "blogPost"]{ slug }`
  );
  return results.map((r) => r.slug.current);
}
