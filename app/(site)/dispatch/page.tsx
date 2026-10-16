export const revalidate = 300;

import type { Metadata } from "next";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { TitleSlide } from "@/components/deck/parts";
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
    canonical: "/dispatch",
    // A child `alternates` replaces the layout's, so re-declare the feed link here.
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    title: "Dispatch: Omar Kamel",
    description: "Articles on AI production, creative workflows, and industry insights by Omar Kamel.",
    url: "/dispatch",
    type: "website",
  },
  twitter: {
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

  return (
    <DeckRoot mode="doc">
      <JsonLd data={collectionJsonLd} />
      <TitleSlide kicker="Writing" light="The" bold="Dispatches" sub="notes from inside production" count={`${posts.length} dispatches${first ? ` since ${first}` : ""}`} />
      <div className="wrap">
        <div className="filter" data-filter role="group" aria-label="Filter">
          <span className="lbl">Filter<span><span data-shown>{pad(posts.length)}</span> / {pad(posts.length)}</span></span>
          <button type="button" data-val="all" aria-pressed="true">All<sup>{pad(posts.length)}</sup></button>
          {years.map((y) => (
            <button key={y} type="button" data-val={y} aria-pressed="false">{y}<sup>{pad(posts.filter((p) => p.date?.startsWith(y)).length)}</sup></button>
          ))}
          <span className="brk" />
          <span className="lbl" style={{ visibility: "hidden" }} aria-hidden="true">Filter</span>
          {DISPATCH_CATEGORIES.map((c) => {
            const count = posts.filter((p) => p.categories?.includes(c)).length;
            return count ? <button key={c} type="button" data-val={c} aria-pressed="false">{c}<sup>{pad(count)}</sup></button> : null;
          })}
        </div>
        <ol className="dlist">
          {posts.map((p) => {
            const { href, external } = dispatchHref(p);
            const cover = typeof p.coverImage === "object" && p.coverImage ? p.coverImage : null;
            return (
              <li key={p.id} data-cats={[...(p.categories ?? []), (p.date ?? "").slice(0, 4)].join("|")}>
                <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <span className="d">{p.date ? fmt(p.date) : ""}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="im">{cover ? <img src={srcOf(cover, "card")} alt="" loading="lazy" /> : null}</span>
                  <span>
                    <h3>{p.title}</h3>
                    {p.excerpt ? <p>{stripEmDashes(p.excerpt)}</p> : null}
                    <span className="k">{[p.publicationName, ...(p.categories ?? [])].filter(Boolean).join(" · ")}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </DeckRoot>
  );
}
