import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { ItemDeck } from "@/components/deck/item-deck";
import { getProjectBySlug, getAllProjectSlugs, getDeckProjects } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { PERSON_REF } from "@/lib/person";
import { playerJsonLd } from "@/lib/structured";
import { absUrl } from "@/lib/abs-url";
import { describeFromRichText } from "@/lib/seo-text";
import type { ProjectDoc } from "@/lib/payload/types";

interface StudioDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** CMS rich text first (trimmed at a word boundary); a short fallback that does not repeat the title. */
function projectDescription(project: ProjectDoc): string {
  const categories = project.categories?.join(", ");
  const fallback = `${categories || "Studio"} project by Omar Kamel.`;
  return describeFromRichText(project.description, fallback);
}

export async function generateMetadata({ params }: StudioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  // Throwing here (not just in the page) makes missing slugs a real 404
  if (!project) notFound();
  const description = projectDescription(project);
  return {
    title: project.title,
    description,
    alternates: {
      types: FEED,
      canonical: `/studio/${slug}`,
    },
    openGraph: {
      ...OG_BASE,
      title: project.title,
      description,
      url: `/studio/${slug}`,
    },
    twitter: {
      ...TWITTER_BASE,
      card: "summary_large_image",
      title: project.title,
      description,
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = typeof project.coverImage === "object" ? project.coverImage : null;

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: projectDescription(project),
    ...(cover?.url ? { image: absUrl(cover.url) } : {}),
    author: PERSON_REF,
    creator: PERSON_REF,
    ...playerJsonLd(project as ProjectDoc & { createdAt?: string }, projectDescription(project), cover),
    ...(project.categories?.length ? { keywords: project.categories } : {}),
    url: `${SITE_URL}/studio/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Studio", item: `${SITE_URL}/studio` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${SITE_URL}/studio/${slug}` },
    ],
  };

  const seq = await getDeckProjects();

  return (
    <DeckRoot mode="deck" name={project.title}>
      <JsonLd data={projectJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ItemDeck doc={project} seq={seq} kind="studio" />
    </DeckRoot>
  );
}
