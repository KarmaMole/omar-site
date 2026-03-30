import { MetadataRoute } from "next";
import { dummyWork, dummyProjects, dummyBlogPosts } from "@/lib/dummy-data";

const baseUrl = "https://omarkamel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const workPages: MetadataRoute.Sitemap = dummyWork.map((item) => ({
    url: `${baseUrl}/work/${item.slug.current}`,
    lastModified: item.date ? new Date(item.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectPages: MetadataRoute.Sitemap = dummyProjects.map((item) => ({
    url: `${baseUrl}/projects/${item.slug.current}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = dummyBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug.current}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...workPages, ...projectPages, ...blogPages];
}
