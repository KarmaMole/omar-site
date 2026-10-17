export const revalidate = 60;

import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import JsonLd from "@/components/json-ld";
import DeckRoot from "@/components/deck/deck-root";
import { ClientsSlide, EndSlide, Fig, Head, More, Piece, TextSlide } from "@/components/deck/parts";
import { getAllClients, getSiteSettings } from "@/lib/payload/queries";
import { plainText, ratioOf, srcOf } from "@/lib/deck";
import { SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/abs-url";

export const metadata: Metadata = {
  title: "About",
  description:
    "Omar Kamel: AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix.",
  alternates: {
    types: FEED,
    canonical: "/about",
  },
  openGraph: {
    ...OG_BASE,
    title: "About: Omar Kamel",
    description:
      "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix.",
    url: "/about",
    type: "website",
  },
  twitter: {
    ...TWITTER_BASE,
    card: "summary_large_image",
    title: "About: Omar Kamel",
    description:
      "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix.",
  },
};

// TODO: Move skills to SiteSettings CMS global (add a "skills" array field with category + items)
const skills = [
  { category: "AI", items: ["Claude", "ChatGPT", "MidJourney", "Gemini", "Kling", "Seedance 2"] },
  { category: "Production", items: ["DSLR Cameras", "DaVinci Resolve", "Premiere Pro", "After Effects", "Reaper", "Weavy"] },
  { category: "Creative", items: ["Milanote", "Photoshop", "Illustrator", "InDesign", "Suno", "ElevenLabs"] },
  { category: "Development", items: ["Replit", "Claude Code", "RunPod", "OpenClaw", "Ollama", "ComfyUI"] },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const photo = typeof settings.aboutPhoto === "object" && settings.aboutPhoto ? settings.aboutPhoto : null;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Omar Kamel",
    jobTitle: "AI Creative & Production Lead",
    url: SITE_URL,
    description:
      "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai.",
    knowsAbout: [
      "AI Video Generation",
      "AI Image Generation",
      "Creative Production",
      "Digital Content",
    ],
    sameAs: (settings.socialLinks ?? []).map((s: { url: string }) => s.url),
    ...(photo?.url ? { image: absUrl(photo.url) } : {}),
  };

  const clients = await getAllClients();
  const paras = bioParagraphs(settings.aboutBio);

  return (
    <DeckRoot mode="deck" name="About">
      <JsonLd data={personJsonLd} />
      <Piece chapter="who" chapterName="About" title="Different runtimes, same core logic"
        head={<Head as="h1" client="Omar Kamel" project="About" desc="online, karmamole · based in dubai, uae" />}
        figs={photo ? <Fig ratio={ratioOf(photo, 0.75)} src={srcOf(photo)} alt={photo.alt || "Omar Kamel"} eager /> : null}>
        <p className="lead">Different runtimes, same core logic: find the medium, tell the story, ship it.</p>
        {paras[0] ? <p>{paras[0]}</p> : null}
        <div className="links"><More href="/play">The CV, behind /play</More></div>
      </Piece>
      {paras.length > 1 && (
        <TextSlide chapter="who" chapterName="About" title="Before AI" width={1040}
          head={<Head client="Before AI" project="Twenty Years" desc="broadcast, production, music, comics, writing" />}>
          <p className="quote">Broadcast in Italy. A production house in Cairo. <b>Cloud workflows for TV networks in Dubai.</b></p>
          <div className="prose"><p>{paras[1]}</p></div>
        </TextSlide>
      )}
      <TextSlide chapter="who" chapterName="About" title="In numbers"
        head={<Head client="In Numbers" project="So Far" desc="every one of them is in the bio" />}>
        <div className="figs">
          <div><b>20<em>+</em></b><span>years across three countries</span></div>
          <div><b>5</b><span>albums released</span></div>
          <div><b>2M<em>+</em></b><span>views on 6DOF Reviews</span></div>
          <div><b>1M<em>+</em></b><span>reads on a single Medium article</span></div>
        </div>
      </TextSlide>
      <TextSlide chapter="who" chapterName="About" title="The runtime so far"
        head={<Head client="The Runtime" project="So Far" desc="three countries, one way of working" />}>
        <div className="split3" style={{ ["--n" as string]: 4 }}>
          <div><span className="no">Italy</span><h3>A.R.T. TV</h3><p className="kind">broadcast, where it started</p><p>Broadcast television in Italy.</p></div>
          <div><span className="no">Cairo</span><h3>KAYAN</h3><p className="kind">production house, co-founded</p><p>Spots for Coca&#8209;Cola, Mansour Group, Metro Markets, Cartier, Swarovski and Christie&apos;s.</p></div>
          <div><span className="no">Dubai</span><h3>SAWA Media</h3><p className="kind">cloud workflows</p><p>Cloud-based workflows for international TV networks.</p></div>
          <div><span className="no">Now</span><h3>Optix</h3><p className="kind">publicis groupe</p><p>An AI production and creative lead, for e&amp;, GMC and Saudia Airlines.</p></div>
        </div>
      </TextSlide>
      {paras.length > 2 && (
        <TextSlide chapter="who" chapterName="About" title="The hybrid runtime" width={1040}
          head={<Head client="The Hybrid" project="Runtime" desc="what the work runs on today" />}>
          <p className="quote">As comfortable behind a DSLR as <b>inside a ComfyUI pipeline.</b></p>
          <div className="prose">{paras.slice(2, 4).map((t) => <p key={t}>{t}</p>)}</div>
        </TextSlide>
      )}
      <TextSlide chapter="who" chapterName="About" title="The toolkit"
        head={<Head client="The Toolkit" project="Daily" desc="what is open on the desk" />}>
        <div className="split3" style={{ ["--n" as string]: 4 }}>
          {skills.map((g) => (
            <div key={g.category}><span className="no">{g.category}</span><p>{g.items.join(", ")}</p></div>
          ))}
        </div>
      </TextSlide>
      {clients.length > 0 && <ClientsSlide names={clients.map((c) => c.name)} chapter="who" chapterName="About" />}
      <EndSlide />
    </DeckRoot>
  );
}

/** The bio's paragraphs as plain text, in order. */
function bioParagraphs(rich: unknown): string[] {
  const root = (rich as { root?: { children?: unknown[] } } | null)?.root;
  return (root?.children ?? [])
    .map((n) => plainText({ root: { type: "root", children: [n] } }))
    .filter(Boolean);
}
