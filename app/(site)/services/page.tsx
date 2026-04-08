export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/fade-in";
import { getAllClients } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI production, creative direction, digital builds, and more from Omar Kamel.",
  robots: { index: true, follow: true },
};

const services = [
  {
    label: "AI Video & Motion",
    description:
      "I produce video content using generative AI tools alongside traditional post-production. MidJourney for concepting. Stable Diffusion with custom LoRAs for animation. Kling and Veo for AI-generated footage. DaVinci Resolve and Premiere for final assembly.",
    benefit:
      "The result: high-quality video at a fraction of the time and cost of conventional shoots. Brand films, music videos, social content, promos, explainers, experimental film.",
    references: [
      { label: "Mycelium (Marze)", href: "/studio/mycelium" },
      { label: "More Fool You", href: "/studio/more-fool-you" },
      { label: "The Strangers", href: "/studio/the-strangers" },
      { label: "El Wa7sh El Kasir", href: "/studio/el-wahsh-el-kasir" },
    ],
  },
  {
    label: "AI Consultation & Training",
    description:
      "I run structured AI training programs for marketing teams. Six sessions covering content creation, social media, strategy, presentations, and automation. Live, online, practical. Participants leave with tools and workflows they can use the next day.",
    benefit:
      "Currently leading AI creative and production at Optix / Publicis Groupe, building AI-powered pipelines for major airlines, automotive brands, and financial institutions. I use Claude, ChatGPT, MidJourney, ComfyUI, Veo, Kling, and Suno daily. I know what works and what's still hype.",
    references: [
      { label: "AI Workshop Program", href: "/contact" },
      { label: "Optix AI Hub", href: "/studio/optix-ai-hub" },
      { label: "Mentora", href: "/studio/mentora" },
    ],
  },
  {
    label: "Digital Builds",
    description:
      "I build functional web platforms, dashboards, and internal tools using Replit, Claude Code, and modern frameworks. Not wireframes and Figma decks that sit in a drawer. Working products.",
    benefit:
      "Current live builds include an AI-powered news aggregator, a real-time geopolitical monitoring dashboard, a voice-driven training platform, and team collaboration tools. I ship things.",
    references: [
      { label: "Human Impact", href: "/studio/human-impact" },
      { label: "Iran War Monitor", href: "/studio/iran-war-monitor" },
      { label: "Mentora", href: "/studio/mentora" },
    ],
  },
  {
    label: "Production & Film",
    description:
      "I shoot, direct, edit, and post-produce. DSLR cameras. DaVinci Resolve. After Effects for motion graphics. Reaper for audio and sound design. Documentaries, awareness campaigns, PSAs, corporate films, and live event coverage.",
    benefit:
      "200+ projects of hands-on production work with brands like Coca-Cola, Swarovski, the Ford Foundation, and the International Labor Organization. Not theoretical. Battle-tested.",
    references: [
      { label: "Kolona", href: "/work/kolona" },
      { label: "ILO Working Mothers", href: "/work/ilo-working-mothers" },
      { label: "Coca-Cola Earth Day", href: "/work/coca-cola-earth-day" },
      { label: "Studio Emad Eddin", href: "/work/studio-emad-eddin" },
    ],
  },
  {
    label: "Branding & Design",
    description:
      "From logo systems and business cards to full identity packages and CSR reports. Photoshop, Illustrator, InDesign. Brand systems that hold up at every scale. No templates. No generic output.",
    benefit:
      "Particular strength in bilingual English/Arabic design, having worked across Cairo, Italy, and Dubai for over two decades. Every asset designed with intent.",
    references: [
      { label: "7 Black / Lunch Box", href: "/work/7-black-lunch-box" },
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
    description: "Final assets in the formats you need, ready for deployment. No pending approvals from the design committee. Finished work.",
  },
  {
    number: "04",
    title: "Iterate",
    description: "If something needs adjusting, we adjust. No change-order bureaucracy. The goal is work that performs.",
  },
];

export default async function ServicesPage() {
  const clients = await getAllClients();

  return (
      <div className="pt-24 pb-16 animate-fade-in">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="mb-16">
              <span className="section-label">Services</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                Production Without the Agency
              </h1>
              <p className="text-light-300 mt-3 max-w-2xl">
                one person. no agency overhead. twenty years of production experience now accelerated by AI.
              </p>
            </div>
          </FadeIn>

          {/* Service Categories — 2-col grid on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
            {services.map((service) => (
              <FadeIn key={service.label}>
                <div className="py-2">
                  <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-cyan mb-4">
                    {service.label}
                  </h2>
                  <p className="text-light-200 leading-relaxed">
                    {service.description}
                  </p>
                  <p className="text-light-300 text-sm leading-relaxed mt-3">
                    {service.benefit}
                  </p>
                  {service.references.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {service.references.map((ref) => (
                        <Link
                          key={ref.label}
                          href={ref.href}
                          className="font-mono text-[10px] tracking-widest uppercase text-light-300/70 border border-white/[0.07] px-3 py-1.5 hover:text-cyan hover:border-cyan/30 transition-colors"
                        >
                          {ref.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

        </div>

        {/* How I Work */}
        <section className="border-t border-white/[0.07] mt-12 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <span className="section-label">Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-light-100 mt-2 mb-12">
                How I Work
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <FadeIn key={step.number}>
                  <div>
                    <span className="font-mono text-3xl font-light text-cyan/30">
                      {step.number}
                    </span>
                    <h3 className="font-mono text-sm tracking-[0.15em] uppercase text-light-100 mt-3 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-light-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Client Trust Strip */}
        <section className="border-t border-white/[0.07] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <span className="section-label mb-8 block">Selected Clients</span>
              {clients.length > 0 && (
                <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4">
                  {clients.slice(0, 12).map((client) => (
                    <span
                      key={client.id}
                      className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-light-300/70"
                    >
                      {client.name}
                    </span>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/[0.07] py-20 md:py-32">
          <FadeIn>
            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
              <h2 className="text-4xl md:text-6xl font-light tracking-display text-light-100">
                Let&apos;s build something.
              </h2>
              <p className="text-light-300 mt-4 max-w-md mx-auto">
                Whether it&apos;s a brand film, a product platform, or an AI workflow overhaul, I&apos;m one message away.
              </p>
              <div className="mt-10">
                <Link
                  href="/contact"
                  className="inline-block font-mono text-xs tracking-[0.2em] uppercase bg-cyan text-black px-6 py-2.5 shadow-[0_2px_8px_rgba(0,217,255,0.2)] hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Start a Conversation
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
  );
}
