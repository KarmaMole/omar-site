export const revalidate = 300;

import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { More, TitleSlide } from "@/components/deck/parts";
import { Filter } from "@/components/deck/archive";
import { DispatchCard } from "@/components/deck/dispatch-card";
import { getAllBlogPosts } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { DISPATCH_CATEGORIES } from "@/lib/categories";
import { pad } from "@/lib/deck";

export const metadata: Metadata = {
  title: "Dispatch",
  description:
    "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
  alternates: {
    types: FEED,
    canonical: "/dispatch",
  },
  openGraph: {
    ...OG_BASE,
    title: "Dispatch: Omar Kamel",
    description: "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
    url: "/dispatch",
    type: "website",
  },
  twitter: {
    ...TWITTER_BASE,
    card: "summary_large_image",
    title: "Dispatch: Omar Kamel",
    description: "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
  },
};

export default async function DispatchPage() {
  const posts = await getAllBlogPosts();

  // Only include internal posts in the ItemList schema.
  const internalPosts = posts.filter((p) => !p.isExternal);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Dispatch: Omar Kamel",
    description:
      "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
    url: `${SITE_URL}/dispatch`,
    isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: internalPosts.length,
      itemListElement: internalPosts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/dispatch/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const years = [...new Set(posts.map((p) => (p.date ?? "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const first = years[years.length - 1];
  const order = new Map(posts.map((p, i) => [p.id, i]));

  return (
    <DeckRoot mode="doc">
      <JsonLd data={collectionJsonLd} />
      <TitleSlide short kicker="Writing" light="The" bold="Dispatches" sub="notes from inside production" count={`${posts.length} dispatches${first ? ` since ${first}` : ""}`}>
        <p className="follow"><More href="/feed.xml" external>Follow by RSS</More></p>
      </TitleSlide>
      <div className="wrap">
        <Filter total={posts.length} options={DISPATCH_CATEGORIES.map((c) => ({ value: c, count: posts.filter((p) => p.categories?.includes(c)).length }))} />
        {years.map((y) => {
          const inYear = posts.filter((p) => p.date?.startsWith(y));
          return (
            <section key={y} className="yr" data-group>
              <header>
                <h2>{y}</h2>
                <span className="count">{pad(inYear.length)} {inYear.length === 1 ? "dispatch" : "dispatches"}</span>
              </header>
              <ol className="dgrid">
                {inYear.map((p) => <DispatchCard key={p.id} post={p} eager={(order.get(p.id) ?? 0) < 6} />)}
              </ol>
            </section>
          );
        })}
      </div>
    </DeckRoot>
  );
}
