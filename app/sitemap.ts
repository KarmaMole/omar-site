import { MetadataRoute } from "next";
import { getAllWorkSlugs, getAllProjectSlugs, getAllBlogSlugs } from "@/lib/payload/queries";

const baseUrl = "https://omarkamel.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workSlugs, projectSlugs, blogSlugs] = await Promise.all([
    getAllWorkSlugs(),
    getAllProjectSlugs(),
    getAllBlogSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/work`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/explore`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const workPages: MetadataRoute.Sitemap = workSlugs.map((slug) => ({
    url: `${baseUrl}/work/${slug}`, changeFrequency: "monthly", priority: 0.6,
  }));

  const explorePages: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/explore/${slug}`, changeFrequency: "monthly", priority: 0.6,
  }));

  const writingPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`, changeFrequency: "monthly", priority: 0.7,
  }));

  return [...staticPages, ...workPages, ...explorePages, ...writingPages];
}
