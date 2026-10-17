export const revalidate = 300;

import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { TitleSlide } from "@/components/deck/parts";
import { Filter } from "@/components/deck/archive";
import { sourceSerif as serif } from "@/lib/fonts";
import { getAllBlogPosts } from "@/lib/payload/queries";
import { SITE_URL } from "@/lib/constants";
import { DISPATCH_CATEGORIES } from "@/lib/categories";
import { dispatchHref } from "@/lib/dispatch-link";
import { stripEmDashes } from "@/lib/seo-text";
import { pad, srcOf } from "@/lib/deck";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dubai" });

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
      <TitleSlide short kicker="Writing" light="The" bold="Dispatches" sub="notes from inside production" count={`${posts.length} dispatches${first ? ` since ${first}` : ""}`} />
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
                {inYear.map((p) => {
                  const { href, external } = dispatchHref(p);
                  const cover = typeof p.coverImage === "object" && p.coverImage ? p.coverImage : null;
                  const i = order.get(p.id) ?? 0;
                  return (
                    <li key={p.id} data-cats={(p.categories ?? []).join("|")}>
                      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <span className="im">{cover ? <img src={srcOf(cover, "card")} alt="" loading={i < 6 ? "eager" : "lazy"} /> : null}</span>
                        <span className="k">
                          <span className="no">{p.date ? fmt(p.date) : ""}</span>
                          {external && p.publicationName ? <span>on {p.publicationName} &#8599;</span> : p.categories?.[0] ? <span>{p.categories[0]}</span> : null}
                        </span>
                        <h3>{p.title}</h3>
                        {p.excerpt ? <p className={serif.className}>{stripEmDashes(p.excerpt)}</p> : null}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </DeckRoot>
  );
}
