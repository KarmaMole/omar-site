import { MetadataRoute } from "next";
import { getWorkSitemapEntries, getProjectSitemapEntries, getBlogSitemapEntries } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const baseUrl = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, projects, posts] = await Promise.all([
    getWorkSitemapEntries(),
    getProjectSitemapEntries(),
    getBlogSitemapEntries(),
  ]);

  // Google ignores priority and changeFrequency; lastModified is what it uses
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/work` },
    { url: `${baseUrl}/services` },
    { url: `${baseUrl}/studio` },
    { url: `${baseUrl}/dispatch` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
  ];

  const entries = (path: string, docs: { slug: string; updatedAt?: string | null }[]) =>
    docs.map((doc) => ({
      url: `${baseUrl}/${path}/${doc.slug}`,
      ...(doc.updatedAt ? { lastModified: new Date(doc.updatedAt) } : {}),
    }));

  return [...staticPages, ...entries("work", work), ...entries("studio", projects), ...entries("dispatch", posts)];
}
