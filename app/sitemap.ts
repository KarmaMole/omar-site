import { MetadataRoute } from "next";
import { getAllWorkSlugs, getAllProjectSlugs, getAllBlogSlugs } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const baseUrl = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workSlugs, projectSlugs, blogSlugs] = await Promise.all([
    getAllWorkSlugs(),
    getAllProjectSlugs(),
    getAllBlogSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/work`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/studio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/dispatch`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const workPages: MetadataRoute.Sitemap = workSlugs.map((slug) => ({
    url: `${baseUrl}/work/${slug}`, changeFrequency: "monthly", priority: 0.6,
  }));

  const studioPages: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/studio/${slug}`, changeFrequency: "monthly", priority: 0.6,
  }));

  const dispatchPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/dispatch/${slug}`, changeFrequency: "monthly", priority: 0.7,
  }));

  return [...staticPages, ...workPages, ...studioPages, ...dispatchPages];
}
