import { getAllBlogPosts } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/abs-url";

const baseUrl = SITE_URL;

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllBlogPosts();
  const items = posts
    .map((post) => {
      const link = `${baseUrl}/dispatch/${post.slug}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : "";
      const description = post.excerpt ? escapeXml(post.excerpt) : "";
      const title = escapeXml(post.title);
      const cover =
        typeof post.coverImage === "object" && post.coverImage
          ? (post.coverImage as typeof post.coverImage & { mimeType?: string; filesize?: number })
          : null;
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <author>omar@omarkamel.com (Omar Kamel)</author>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      ${cover?.url && cover.mimeType && cover.filesize ? `<enclosure url="${escapeXml(absUrl(cover.url))}" type="${cover.mimeType}" length="${cover.filesize}" />` : ""}
    </item>`;
    })
    .join("");

  const lastBuildDate = posts.length > 0 && posts[0].date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Omar Kamel</title>
    <link>${baseUrl}</link>
    <description>AI Creative &amp; Production Lead. 20+ years crafting stories across film, music, brand, and emerging media.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
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
