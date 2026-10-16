export const revalidate = 60;

import type { Metadata } from "next";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { ClientsSlide, Divider, EndSlide, Fig, Head, More, Piece, TextSlide } from "@/components/deck/parts";
import { WorkPiece } from "@/components/deck/work-piece";
import {
  getSiteSettings,
  getHomepageConfig,
  getDeckWork,
  getDeckProjects,
  getRecentBlogPosts,
  getAllClients,
} from "@/lib/payload/queries";
import { fillRecentSlots } from "@/lib/payload/homepage";
import type { WorkDoc } from "@/lib/payload/types";
import { dispatchHref } from "@/lib/dispatch-link";
import { coverOf, plainText, ratioOf, srcOf } from "@/lib/deck";
import { SITE_URL } from "@/lib/constants";

const DESCRIPTION =
  "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Specializing in AI video/image generation, creative production, and digital content.";

export const metadata: Metadata = {
  title: { absolute: "Omar Kamel: AI Creative & Production Lead" },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
    // A child `alternates` replaces the layout's, so re-declare the feed link here.
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    title: "Omar Kamel: AI Creative & Production Lead",
    description: DESCRIPTION,
    url: "/",
    type: "website",
    siteName: "Omar Kamel",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar Kamel: AI Creative & Production Lead",
    description: DESCRIPTION,
    creator: "@omarkamel",
  },
};

const TRANSMISSIONS = [
  { name: "6DOF Reviews", kind: "vr and immersive tech", url: "https://6dofreviews.com", domain: "6dofreviews.com", text: "VR hardware reviews, game deep-dives and immersive tech analysis, focused on the Meta Quest ecosystem and beyond. Over 2 million views." },
  { name: "Human Impact", kind: "news, ranked differently", url: "https://humanimpact.news", domain: "humanimpact.news", text: "An AI-powered news aggregator that ranks global stories by their actual human impact rather than clicks or engagement." },
  { name: "Savage Impulse", kind: "desktop tools", url: "https://savageimpulse.com", domain: "savageimpulse.com", text: "Local-first desktop tools for people who work with content, from a voice-over studio to semantic footage search, built from twenty years in production." },
];

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dubai" });

/**
 * The home page is a deck in the form of Omar's portfolio presentation, filled from the CMS:
 * Selected Work follows the homepage curation (featured + recent slots), then the newest
 * AI productions, client work, the studio picks, builds, dispatches, about, clients.
 */
export default async function HomePage() {
  const homepage = await getHomepageConfig();
  const [settings, work, projects, posts, clients] = await Promise.all([
    getSiteSettings(),
    getDeckWork(),
    getDeckProjects(),
    getRecentBlogPosts(6),
    getAllClients(),
  ]);

  const byId = new Map(work.map((w) => [String(w.id), w]));
  const featured = homepage.featuredWork != null ? byId.get(String(homepage.featuredWork)) ?? null : null;
  const newest = [...work].sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  const slots = fillRecentSlots(homepage.recentPins, newest, featured?.id).flatMap((s) => (s ? [s.item] : []));
  const selected = [featured, ...slots].filter((w): w is WorkDoc => !!w);
  const used = new Set(selected.map((w) => String(w.id)));
  const take = (pred: (w: WorkDoc) => boolean, n: number) => {
    const out = newest.filter((w) => !used.has(String(w.id)) && pred(w)).slice(0, n);
    out.forEach((w) => used.add(String(w.id)));
    return out;
  };
  const ai = take((w) => !!w.categories?.includes("AI Production"), 4);
  const client = take((w) => !!w.client, 6);

  const studioIds = homepage.studio.map(String);
  const studioPicks = studioIds.map((id) => projects.find((p) => String(p.id) === id)).filter((p): p is (typeof projects)[number] => !!p);
  const studioMore = projects.filter((p) => !studioIds.includes(String(p.id))).slice(0, 4);

  const photo = typeof settings.aboutPhoto === "object" && settings.aboutPhoto ? settings.aboutPhoto : null;
  const bio = plainText(settings.aboutBio);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Omar Kamel",
    jobTitle: "AI Creative & Production Lead",
    url: SITE_URL,
    sameAs: (settings.socialLinks ?? []).map((s: { url: string }) => s.url),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_URL,
    name: "Omar Kamel",
    publisher: { "@type": "Person", name: "Omar Kamel", url: SITE_URL },
  };

  return (
    <DeckRoot mode="deck" name="Omar Kamel">
      <JsonLd data={personJsonLd} />
      <JsonLd data={websiteJsonLd} />

      <section className="slide cover-slide" data-chapter="" data-title="Omar Kamel, AI Creative & Production Lead">
        <div className="lock">
          <h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/omar-kamel-horizontal.svg" alt="Omar Kamel" width={300} height={48} />
          </h1>
          <p>
            portfolio of AI work<span className="bar">|</span>2026
          </p>
          <p className="meta">currently at Optix (Publicis Groupe)</p>
        </div>
        <div className="illus">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/desk-illustration.png" alt="Line drawing of Omar at his desk, seen from behind, with scripts, music, screens and guitars drifting up on a red thread" width={430} height={768} fetchPriority="high" />
        </div>
        <p className="line">
          AI Creative &amp; Production Lead. <b>Twenty years</b> across Cairo, Italy and Dubai.
        </p>
        <a className="begin" href="#selected">
          Begin <kbd>&darr;</kbd>
        </a>
      </section>

      {selected.length > 0 && (
        <>
          <Divider id="selected" chapter="selected" chapterName="Selected Work" light="Selected" bold="Work" sub="where to start" count={`${selected.length} pieces`} />
          {selected.map((w) => (
            <WorkPiece key={w.id} doc={w} kind="work" chapter="selected" chapterName="Selected Work" />
          ))}
        </>
      )}

      {ai.length > 0 && (
        <>
          <Divider id="ai" chapter="ai" chapterName="AI Production" light="AI" bold="Production" sub="made with new tools" count={`${ai.length} pieces`} />
          {ai.map((w) => (
            <WorkPiece key={w.id} doc={w} kind="work" chapter="ai" chapterName="AI Production" />
          ))}
        </>
      )}

      {client.length > 0 && (
        <>
          <Divider id="client" chapter="client" chapterName="Client Content" light="Client" bold="Content" sub="things i've made for others" count={`${client.length} of ${work.length} pieces`} />
          {client.map((w) => (
            <WorkPiece key={w.id} doc={w} kind="work" chapter="client" chapterName="Client Content" />
          ))}
          <TextSlide chapter="client" chapterName="Client Content" title="The whole archive" width={980}
            head={<Head client="The Archive" project={`${work.length} Pieces`} desc="twenty years of client work, newest first" />}>
            <ol className="list">
              {newest.filter((w) => !used.has(String(w.id))).slice(0, 6).map((w) => (
                <li key={w.id}>
                  <span className="d">{w.date ? new Date(w.date).getFullYear() : ""}</span>
                  <a href={`/work/${w.slug}`}><span className="t">{w.title}</span></a>
                  <span className="r">{(w.client ?? "").split(/ \/ | \| /)[0]}</span>
                </li>
              ))}
            </ol>
            <div className="foot"><More href="/work">All {work.length} pieces</More></div>
          </TextSlide>
        </>
      )}

      {studioPicks.length + studioMore.length > 0 && (
        <>
          <Divider id="studio" chapter="studio" chapterName="The Studio" light="The" bold="Studio" sub="things i make for myself" count={`${projects.length} pieces`} />
          {studioPicks.map((p) => (
            <WorkPiece key={p.id} doc={p} kind="studio" chapter="studio" chapterName="The Studio" />
          ))}
          {studioMore.length > 0 && (
            <Piece chapter="studio" chapterName="The Studio" title="Also in the studio"
              head={<Head client="Also" project="In the Studio" desc={studioMore.map((p) => p.title.toLowerCase()).join(", ")} />}
              figs={studioMore.map((p) => {
                const c = coverOf(p);
                return <Fig key={p.id} ratio={ratioOf(c)} src={srcOf(c, "card")} alt={p.title} href={`/studio/${p.slug}`} />;
              })}>
              <p>{studioMore.map((p) => p.title).join(". ")}.</p>
              <div className="links"><More href="/studio">The whole studio</More></div>
            </Piece>
          )}
        </>
      )}

      <TextSlide id="builds" chapter="builds" chapterName="Vibe Coding" title="Vibe coding: three live builds"
        head={<Head client="Vibe Coding" project="Transmissions" desc="three builds, all live. full stack, database to deployment, no handoffs" />}>
        <div className="split3">
          {TRANSMISSIONS.map((t, i) => (
            <div key={t.name}>
              <span className="no">{"ABC"[i]}</span>
              <h3>{t.name}</h3>
              <p className="kind">{t.kind}</p>
              <p>{t.text}</p>
              <More href={t.url} external>{t.domain}</More>
            </div>
          ))}
        </div>
        <p className="credit" style={{ marginTop: 28, maxWidth: "60ch" }}>
          <b>My Work</b><span className="bar">|</span><i>Concept, Design, Development, Claude Code.</i>
        </p>
      </TextSlide>

      {posts.length > 0 && (
        <TextSlide id="dispatches" chapter="dispatches" chapterName="The Dispatches" title="Dispatches, latest six" width={980}
          head={<Head client="The Dispatches" project="Latest Six" desc="notes from inside production" />}>
          <ol className="list">
            {posts.map((p) => {
              const { href, external } = dispatchHref(p);
              return (
                <li key={p.id}>
                  <span className="d">{p.date ? fmt(p.date) : ""}</span>
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span className="t">{p.title}</span></a>
                  <span className="r">{p.categories?.[0]?.toLowerCase()}</span>
                </li>
              );
            })}
          </ol>
          <div className="foot"><More href="/dispatch">All dispatches</More></div>
        </TextSlide>
      )}

      <Piece id="about" chapter="about" chapterName="About" title="Omar Kamel, about"
        head={<Head client="Omar Kamel" project="About" desc="online, karmamole" />}
        figs={photo ? <Fig ratio={ratioOf(photo, 0.75)} src={srcOf(photo)} alt={photo.alt || "Omar Kamel"} /> : null}>
        <p className="lead">Different runtimes, same core logic: find the medium, tell the story, ship it.</p>
        <p>{bio.split(/(?<=\.)\s+/).slice(2, 6).join(" ")}</p>
        <div className="links"><More href="/about">The whole story</More></div>
      </Piece>

      {clients.length > 0 && <ClientsSlide names={clients.map((c) => c.name)} chapter="about" chapterName="About" />}

      <EndSlide />
    </DeckRoot>
  );
}
