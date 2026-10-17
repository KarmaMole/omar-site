export const revalidate = 300;

import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { TitleSlide } from "@/components/deck/parts";
import { Filter, Group, type CardItem } from "@/components/deck/archive";
import { getDeckProjects } from "@/lib/payload/queries";
import { PROJECT_CATEGORIES } from "@/lib/categories";
import { coverOf } from "@/lib/deck";
import { SITE_URL } from "@/lib/constants";

const DESCRIPTION = "Self-directed projects, music, photography, and experiments by Omar Kamel.";

export const metadata: Metadata = {
  title: "Studio",
  description: DESCRIPTION,
  alternates: { types: FEED, canonical: "/studio" },
  openGraph: { ...OG_BASE, title: "Studio: Omar Kamel", description: DESCRIPTION, url: "/studio", type: "website" },
  twitter: { ...TWITTER_BASE, card: "summary_large_image", title: "Studio: Omar Kamel", description: DESCRIPTION },
};

/** Lowercase subtitles for each studio chapter. */
const SUBS: Record<string, string> = {
  Music: "albums and singles, as karmamole",
  Visual: "posters and covers",
  Comics: "an arabic comic series",
  Film: "short films",
  AI: "experiments and tools",
  Photography: "from the road",
  Research: "digging into the numbers",
};

export default async function StudioPage() {
  const projects = await getDeckProjects();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Studio: Omar Kamel",
    description: DESCRIPTION,
    url: `${SITE_URL}/studio`,
    isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/studio/${p.slug}`, name: p.title })),
    },
  };

  // One chapter per category, in curated order; each piece sits in its first category.
  const seen = new Set<string>();
  const groups = PROJECT_CATEGORIES.map((cat) => {
    const items = projects.filter((p) => !seen.has(String(p.id)) && p.categories?.[0] === cat);
    items.forEach((p) => seen.add(String(p.id)));
    return { cat, items };
  }).filter((g) => g.items.length);
  const rest = projects.filter((p) => !seen.has(String(p.id)));
  if (rest.length) groups.push({ cat: "More" as (typeof PROJECT_CATEGORIES)[number], items: rest });
  const starts = groups.map((_, i) => groups.slice(0, i).reduce((a, g) => a + g.items.length, 0));

  return (
    <DeckRoot mode="doc">
      <JsonLd data={collectionJsonLd} />
      <TitleSlide kicker="Personal work" light="The" bold="Studio" sub="music, comics, posters and experiments, made for myself" count={`${projects.length} pieces`} />
      <div className="wrap">
        <Filter total={projects.length} options={PROJECT_CATEGORIES.map((c) => ({ value: c, count: projects.filter((p) => p.categories?.includes(c)).length }))} />
        {groups.map(({ cat, items }, gi) => {
          const cards: CardItem[] = items.map((p) => ({
            key: String(p.id), href: `/studio/${p.slug}`, cover: coverOf(p), client: "", title: p.title,
            sub: (p.categories ?? []).join(", ").toLowerCase(), cats: p.categories ?? [],
          }));
          return <Group key={cat} title={cat} sub={SUBS[cat]} count={cards.length} items={cards} start={starts[gi]} />;
        })}
      </div>
    </DeckRoot>
  );
}
