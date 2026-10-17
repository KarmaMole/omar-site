import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { ItemDeck } from "@/components/deck/item-deck";
import { getWorkBySlug, getAllWorkSlugs, getDeckWork } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { PERSON_REF } from "@/lib/person";
import { playerJsonLd } from "@/lib/structured";
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

/** The <title>: the long form when it fits Google's ~60 characters with ": Omar Kamel", else the bare title. */
function pageTitle(work: WorkDoc): Metadata["title"] {
  const suffix = ": Omar Kamel".length;
  const long = workTitle(work);
  if (long.length + suffix <= 60) return long;
  if (work.title.length + suffix <= 60) return work.title;
  return { absolute: work.title };
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
    title: pageTitle(work),
    description,
    alternates: {
      types: FEED,
      canonical: `/work/${slug}`,
    },
    openGraph: {
      ...OG_BASE,
      title,
      description,
      url: `/work/${slug}`,
    },
    twitter: {
      ...TWITTER_BASE,
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
    author: PERSON_REF,
    creator: PERSON_REF,
    ...(work.client ? { sourceOrganization: { "@type": "Organization", name: work.client } } : {}),
    ...playerJsonLd(work, workDescription(work), cover),
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
