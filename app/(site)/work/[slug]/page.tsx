import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { ItemDeck } from "@/components/deck/item-deck";
import { getWorkBySlug, getAllWorkSlugs, getDeckWork } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/abs-url";
import { describeFromRichText } from "@/lib/seo-text";
import type { WorkDoc } from "@/lib/payload/types";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** "Title for Client", or just the title when there is no client. */
function workTitle(work: WorkDoc): string {
  return work.client ? `${work.title} for ${work.client}` : work.title;
}

/** CMS rich text first (trimmed at a word boundary); templated fallback otherwise. */
function workDescription(work: WorkDoc): string {
  const fallback = [workTitle(work), work.roleCredits, work.categories?.join(", ")]
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join(". ");
  return describeFromRichText(work.description, fallback);
}

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  // Throwing here (not just in the page) makes missing slugs a real 404
  if (!work) notFound();
  const title = workTitle(work);
  const description = workDescription(work);
  return {
    title,
    description,
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/work/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const cover = typeof work.coverImage === "object" ? work.coverImage : null;

  const workJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    description: workDescription(work),
    ...(cover?.url ? { image: absUrl(cover.url) } : {}),
    ...(work.date ? { datePublished: work.date } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: SITE_URL,
    },
    ...(work.categories?.length ? { keywords: work.categories } : {}),
    url: `${SITE_URL}/work/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/work` },
      { "@type": "ListItem", position: 3, name: work.title, item: `${SITE_URL}/work/${slug}` },
    ],
  };

  const seq = await getDeckWork();

  return (
    <DeckRoot mode="deck" name={work.title}>
      <JsonLd data={workJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ItemDeck doc={work} seq={seq} kind="work" />
    </DeckRoot>
  );
}
