export const revalidate = 60;

import type { Metadata } from "next";
import DeckRoot from "@/components/deck/deck-root";
import { EndSlide, Fig, Head, More, Piece, TextSlide } from "@/components/deck/parts";
import { PieceFig } from "@/components/deck/work-piece";
import { getDeckWork } from "@/lib/payload/queries";
import { pad } from "@/lib/deck";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI production, creative direction, digital builds, and more from Omar Kamel.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services: Omar Kamel",
    description: "AI production, creative direction, digital builds, and more from Omar Kamel.",
    url: "/services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services: Omar Kamel",
    description: "AI production, creative direction, digital builds, and more from Omar Kamel.",
  },
};

const services = [
  {
    label: "AI Video & Motion",
    description:
      "I produce video content using generative AI tools alongside traditional post-production. MidJourney for concepting. Stable Diffusion with custom LoRAs for animation. Kling and Veo for AI-generated footage. DaVinci Resolve and Premiere for final assembly.",
    benefit:
      "The result: high-quality video at a fraction of the time and cost of conventional shoots. Brand films, music videos, social content, promos, explainers, experimental film. From initial concept to final delivery, every frame is intentional and every cut is deliberate.",
    references: [
      { label: "Mycelium (Marze)", href: "/work/mycelium-marze" },
      { label: "More Fool You", href: "/work/more-fool-you-revelators" },
      { label: "The Strangers", href: "/work/the-strangers" },
      { label: "El Wa7sh El Kasir", href: "/studio/el-wa7sh-el-kasir" },
    ],
  },
  {
    label: "AI Consultation & Training",
    description:
      "I run structured AI training programs for marketing teams. Six sessions covering content creation, social media, strategy, presentations, and automation. Live, online, practical. Participants leave with tools and workflows they can use the next day.",
    benefit:
      "Currently leading AI creative and production at Optix (Publicis Groupe), building AI-powered pipelines for major airlines, automotive brands, and financial institutions. I use Claude, ChatGPT, MidJourney, ComfyUI, Veo, Kling, and Suno daily. I know what works and what's still hype.",
    references: [
      { label: "AI Workshop Program", href: "/contact" },
    ],
  },
  {
    label: "Digital Builds",
    description:
      "I build functional web platforms, desktop apps, dashboards, and internal tools using Replit, Claude Code, and modern frameworks. Not wireframes and Figma decks that sit in a drawer. Working products that solve real problems, ship fast, and hold up under actual use.",
    benefit:
      "Current live builds include an AI-powered news aggregator and Savage Impulse, a suite of local-first desktop tools for people who work with content. Full-stack delivery from database to deployment, no handoffs to a dev team. You get the product, not a pitch deck.",
    references: [
      { label: "Human Impact", href: "https://humanimpact.news" },
      { label: "Savage Impulse", href: "https://savageimpulse.com" },
    ],
  },
  {
    label: "Production & Film",
    description:
      "I shoot, direct, edit, and post-produce. DSLR cameras. DaVinci Resolve. After Effects for motion graphics. Reaper for audio and sound design. End-to-end capability across documentaries, awareness campaigns, PSAs, corporate films, and live event coverage.",
    benefit:
      "200+ projects of hands-on production work with brands like Coca-Cola, Swarovski, the Ford Foundation, and the International Labor Organization. Two decades of delivering under real deadlines and real budgets. Every role from camera operator to creative director.",
    references: [
      { label: "Kolona", href: "/work/hiv-awareness-documentary" },
      { label: "ILO Working Mothers", href: "/work/ilo-working-mothers" },
      { label: "Coca-Cola Earth Day", href: "/work/coca-cola-earth-day" },
      { label: "Studio Emad Eddin", href: "/work/studio-emad-eddin" },
    ],
  },
  {
    label: "Branding & Design",
    description:
      "From logo systems and business cards to full identity packages and CSR reports. Photoshop, Illustrator, InDesign. Brand systems that hold up at every scale, from business cards to building wraps. No templates. No stock-art filler. No generic output.",
    benefit:
      "Particular strength in bilingual English/Arabic design, having worked across Cairo, Italy, and Dubai for over two decades. Every asset designed with intent and delivered in production-ready formats for print and digital. Consistent identity systems, not one-off graphics.",
    references: [
      { label: "7 Black / Lunch Box", href: "/work/7-black-lunch-box-branding" },
      { label: "SAWA Media", href: "/work/sawabusinesscards" },
      { label: "Mansour CSR", href: "/work/csr2016" },
    ],
  },
];

const steps = [
  {
    number: "01",
    title: "Scope",
    description: "We talk. You tell me what you need, I tell you what's actually possible. No discovery phase that takes six weeks. Usually one call.",
  },
  {
    number: "02",
    title: "Build",
    description: "I work fast and in the open. You see progress as it happens, not at a big reveal. One person, no handoffs, no telephone game.",
  },
  {
    number: "03",
    title: "Deliver",
    description: "Final assets in the formats you need, ready for deployment. Ready to use, not waiting on another round. Finished work.",
  },
  {
    number: "04",
    title: "Iterate",
    description: "If something needs adjusting, we adjust. No change-order bureaucracy. The goal is work that performs.",
  },
];

/** The picture beside each service: a cover from the CMS (or a loop) of work that shows it. */
const VISUALS: Record<string, string> = {
  "AI Video & Motion": "storm-ai-short",
  "Digital Builds": "savage-impulse-promo",
  "Production & Film": "ilo-working-mothers",
  "Branding & Design": "sawabusinesscards",
};

const WORKSHOP = [
  ["AI Today: Where We Actually Are", "1.5 hours"],
  ["AI for Content Creation", "2 hours"],
  ["AI for Social Media Management", "2 hours"],
  ["AI for Strategy & Planning", "2 hours"],
  ["AI for Presentations", "2 hours"],
  ["Automation & What's Next", "1.5 hours"],
];

export default async function ServicesPage() {
  const work = await getDeckWork();
  const bySlug = new Map(work.map((w) => [w.slug, w]));
  const id = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

  return (
    <DeckRoot mode="deck" name="Services">
      <Piece chapter="intro" chapterName="Services" title="Independent projects"
        head={<Head as="h1" client="Services" project="Independent Projects" desc="five things i do, one person, no handoffs" />}
        figs={<Fig ratio={16 / 9} alt="Services reel" loop={{ src: "/deck/services-reel.mp4", poster: "/deck/services-reel.jpg" }} />}>
        <p className="lead">Alongside my role leading AI production at Optix (Publicis Groupe), I take on a small number of independent projects.</p>
        <ol className="facts">
          {services.map((sv, i) => (
            <li key={sv.label}><span>{pad(i + 1)}</span><a href={`#${id(sv.label)}`}>{sv.label}</a></li>
          ))}
        </ol>
      </Piece>
      {services.map((sv, i) => {
        const [light, ...restWords] = sv.label.split(" & ");
        const bold = restWords.join(" & ");
        const head = <Head client={`${pad(i + 1)} · ${light}`} project={bold} desc={sv.references.map((r) => r.label.toLowerCase()).join(", ")} />;
        if (sv.label.startsWith("AI Consultation")) {
          return (
            <TextSlide key={sv.label} id={id(sv.label)} chapter={id(sv.label)} chapterName={sv.label} title={sv.label} width={980} head={head}>
              <p className="lead" style={{ font: "500 clamp(16px, 1.25vw, 19px)/1.35 var(--display)", maxWidth: "62ch", marginBottom: 18 }}>{sv.description}</p>
              <ol className="list">
                {WORKSHOP.map(([t, h], k) => (
                  <li key={t}><span className="d">{pad(k + 1)}</span><span className="t">{t}</span><span className="r">{h}</span></li>
                ))}
              </ol>
              <p className="credit" style={{ marginTop: 16, border: 0, padding: 0 }}>
                The workshop: 6 sessions, 11 hours live online, 10 people at most. Weekly, biweekly or as an intensive.{" "}
                <More href="/contact">Ask about the workshop</More>
              </p>
            </TextSlide>
          );
        }
        const doc = bySlug.get(VISUALS[sv.label] ?? "");
        return (
          <Piece key={sv.label} id={id(sv.label)} chapter={id(sv.label)} chapterName={sv.label} title={sv.label} head={head}
            figs={doc ? <PieceFig doc={doc} /> : null}>
            <p className="lead">{sv.description}</p>
            <p>{sv.benefit}</p>
            <div className="links">
              {sv.references.map((r) => <More key={r.href} href={r.href}>{r.label}</More>)}
            </div>
          </Piece>
        );
      })}
      <TextSlide chapter="how" chapterName="How I work" title="How I work"
        head={<Head client="How I Work" project="Four Steps" desc="one person, no handoffs" />}>
        <div className="split3" style={{ ["--n" as string]: 4 }}>
          {steps.map((st) => (
            <div key={st.number}><span className="no">{st.number}</span><h3>{st.title}</h3><p>{st.description}</p></div>
          ))}
        </div>
      </TextSlide>
      <EndSlide light="Let's build" bold="something" />
    </DeckRoot>
  );
}
