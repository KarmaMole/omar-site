import { dummyBlogPosts } from "@/lib/dummy-data";

const baseUrl = "https://omarkamel.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = dummyBlogPosts
    .map((post) => {
      const link = `${baseUrl}/blog/${post.slug.current}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : "";
      const description = post.excerpt ? escapeXml(post.excerpt) : "";
      const title = escapeXml(post.title);

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Omar Kamel</title>
    <link>${baseUrl}</link>
    <description>AI Creative &amp; Production Lead — 20+ years crafting stories across film, music, brand, and emerging media.</description>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
