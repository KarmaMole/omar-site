import { getDeckWork, getDeckProjects, getAllBlogPosts } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { stripEmDashes } from "@/lib/seo-text";
import { clientLabel, plainText, sentences } from "@/lib/deck";

export const revalidate = 3600;

/** /llms.txt (llmstxt.org): a plain summary of who Omar is and where everything lives, for AI assistants. */
export async function GET() {
  const [work, projects, posts] = await Promise.all([getDeckWork(), getDeckProjects(), getAllBlogPosts()]);
  const line = (title: string, url: string, note?: string) => `- [${stripEmDashes(title)}](${url})${note ? `: ${note}` : ""}`;
  const first = (rich: unknown) => sentences(plainText(rich))[0] ?? "";
  const newest = [...work].sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));

  const body = `# Omar Kamel

> AI Creative & Production Lead based in Dubai, with twenty years across Cairo, Italy and the Gulf: films, AI production, web and app builds, and writing. Currently an AI production and creative lead at Optix (Publicis Groupe), working for brands such as e&, GMC and Saudia Airlines. Takes on a small number of independent projects.

## Pages

${line("Home", SITE_URL, "selected work, AI production, client work, the studio, builds, dispatches")}
${line("Work", `${SITE_URL}/work`, `the full archive, ${work.length} pieces`)}
${line("Studio", `${SITE_URL}/studio`, `personal work: music, films, experiments, ${projects.length} pieces`)}
${line("Dispatches", `${SITE_URL}/dispatch`, "writing on AI production and the industry")}
${line("About", `${SITE_URL}/about`)}
${line("Services", `${SITE_URL}/services`, "AI video and motion, AI training for teams, websites and apps, production and film, branding and design")}
${line("Contact", `${SITE_URL}/contact`)}

## Work

${newest.map((w) => line(w.client && !w.title.startsWith(clientLabel(w.client)) ? `${w.title} (${w.client})` : w.title, `${SITE_URL}/work/${w.slug}`, [w.date?.slice(0, 4), first(w.description)].filter(Boolean).join(", "))).join("\n")}

## Studio

${projects.map((p) => line(p.title, `${SITE_URL}/studio/${p.slug}`, first(p.description))).join("\n")}

## Dispatches

${posts.map((p) => line(p.title, p.isExternal && p.publicationUrl ? p.publicationUrl : `${SITE_URL}/dispatch/${p.slug}`, [p.date?.slice(0, 10), p.excerpt ? stripEmDashes(p.excerpt) : ""].filter(Boolean).join(", "))).join("\n")}

## Optional

${line("RSS feed", `${SITE_URL}/feed.xml`)}
${line("Sitemap", `${SITE_URL}/sitemap.xml`)}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
  });
}
