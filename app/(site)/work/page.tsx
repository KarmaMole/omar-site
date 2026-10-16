export const revalidate = 300;

import type { Metadata } from "next";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { TitleSlide } from "@/components/deck/parts";
import { Filter, Group, type CardItem } from "@/components/deck/archive";
import { getDeckWork } from "@/lib/payload/queries";
import { WORK_CATEGORIES } from "@/lib/categories";
import { clientLabel, coverOf, displayTitle, yearOf } from "@/lib/deck";
import { SITE_URL } from "@/lib/constants";

const DESCRIPTION = "Selected highlights from 20+ years of AI production, video, music, and comics by Omar Kamel.";

export const metadata: Metadata = {
  title: "Work",
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: { title: "Work: Omar Kamel", description: DESCRIPTION, url: "/work", type: "website" },
  twitter: { card: "summary_large_image", title: "Work: Omar Kamel", description: DESCRIPTION },
};

export default async function WorkPage() {
  const work = await getDeckWork();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Work: Omar Kamel",
    description: DESCRIPTION,
    url: `${SITE_URL}/work`,
    isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: work.length,
      itemListElement: work.map((w, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/work/${w.slug}`, name: w.title })),
    },
  };

  // Year chapters, newest first; anything undated closes the archive.
  const groups = new Map<string, CardItem[]>();
  for (const w of work) {
    const y = yearOf(w.date) || "More from the archive";
    const label = clientLabel(w.client);
    const item: CardItem = {
      key: String(w.id),
      href: `/work/${w.slug}`,
      cover: coverOf(w),
      client: label,
      title: label ? displayTitle(w.title, label) : w.title,
      sub: (w.categories ?? []).slice(0, 2).join(", ").toLowerCase(),
      cats: w.categories ?? [],
    };
    groups.set(y, [...(groups.get(y) ?? []), item]);
  }
  const years = [...groups.keys()].sort((a, b) => (b === "More from the archive" ? -1 : a === "More from the archive" ? 1 : b.localeCompare(a)));
  const first = yearOf(work[work.length - 1]?.date);
  const last = yearOf(work[0]?.date);
  const starts = years.map((_, i) => years.slice(0, i).reduce((a, y) => a + groups.get(y)!.length, 0));

  return (
    <DeckRoot mode="doc">
      <JsonLd data={collectionJsonLd} />
      <TitleSlide kicker="Archive" light="The" bold="Work" sub={`every piece in the archive${first && last ? `, ${first} to ${last}` : ""}`} count={`${work.length} pieces · newest first`} />
      <div className="wrap">
        <Filter total={work.length} options={WORK_CATEGORIES.map((c) => ({ value: c, count: work.filter((w) => w.categories?.includes(c)).length }))} />
        {years.map((y, i) => (
          <Group key={y} title={y} count={groups.get(y)!.length} items={groups.get(y)!} start={starts[i]} />
        ))}
      </div>
    </DeckRoot>
  );
}
