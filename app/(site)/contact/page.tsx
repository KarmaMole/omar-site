export const revalidate = 60;

import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import ObfuscatedEmail from "@/components/obfuscated-email";
import DeckRoot from "@/components/deck/deck-root";
import DeckContactForm from "@/components/deck/contact-form";
import { TitleSlide } from "@/components/deck/parts";
import { PieceFig } from "@/components/deck/work-piece";
import { getDeckWork } from "@/lib/payload/queries";
import { SOCIAL } from "@/lib/deck";
import JsonLd from "@/components/json-ld";
import { crumbs } from "@/lib/person";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Omar Kamel for production enquiries, collaborations, or anything in between.",
  alternates: {
    types: FEED,
    canonical: "/contact",
  },
  openGraph: {
    ...OG_BASE,
    title: "Contact: Omar Kamel",
    description: "Get in touch with Omar Kamel for production enquiries, collaborations, or anything in between.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    ...TWITTER_BASE,
    card: "summary_large_image",
    title: "Contact: Omar Kamel",
    description: "Get in touch with Omar Kamel for production enquiries, collaborations, or anything in between.",
  },
};

export default async function ContactPage() {
  const work = await getDeckWork();
  const storm = work.find((w) => w.slug === "storm-ai-short");

  return (
    <DeckRoot mode="doc">
      <JsonLd data={crumbs("Contact", "/contact")} />
      <TitleSlide short kicker="Contact" light="Let's" bold="Talk" sub="usually one call. a few lines about the project is enough. i read every message and reply myself." />
      <div className="wrap">
        <div className="ct">
          <DeckContactForm />
          <aside className="ct-side" aria-label="Elsewhere">
            {storm ? <div className="stage" style={{ display: "block" }}><PieceFig doc={storm} /></div> : null}
            <ul className="facts">
              <li><span>Email</span><ObfuscatedEmail user="omar" domain="omarkamel.com" className="more" /></li>
              <li><span>Based in</span>Dubai, UAE</li>
              <li><span>Working at</span>Optix (Publicis Groupe)</li>
              {SOCIAL.map((s) => (
                <li key={s.name}><span>{s.name}</span><a href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace(/^https?:\/\/(www\.)?/, "")}</a></li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </DeckRoot>
  );
}
