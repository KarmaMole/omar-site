export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/fade-in";
import PageTransition from "@/components/page-transition";
import { getAllClients } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI production, creative direction, digital builds, and more from Omar Kamel.",
  robots: { index: false, follow: false },
};

const services = [
  {
    label: "AI Video & Motion",
    description:
      "I produce video content using generative AI tools alongside traditional post-production. MidJourney for concepting. Stable Diffusion with custom LoRAs for animation. Kling and Veo for AI-generated footage. DaVinci Resolve and Premiere for final assembly. The result: high-quality video at a fraction of the time and cost of conventional shoots.",
    details:
      "This covers AI music videos, brand films, social content, product promos, explainers, and experimental film. If it moves on a screen, I can build it.",
    references: ["Mycelium (Marze)", "More Fool You (Doc & The Revelators)", "The Strangers (AI Film)", "El Wa7sh El Kasir"],
  },
  {
    label: "Branding & Design",
    description:
      "From logo systems and business cards to full identity packages and CSR reports. I work across Photoshop, Illustrator, and InDesign to build brand systems that hold up at every scale. No templates. No generic output. Every asset designed with intent.",
    details:
      "Particular strength in bilingual English/Arabic design, having worked across Cairo, Italy, and Dubai for over two decades.",
    references: ["7 Black / Lunch Box", "SAWA Media", "Mansour CSR Reports"],
  },
  {
    label: "Production & Film",
    description:
      "I shoot, direct, edit, and post-produce. DSLR cameras. DaVinci Resolve. After Effects for motion graphics. Reaper for audio. I have produced documentaries, awareness campaigns, PSAs, corporate films, and live event coverage across the Middle East and Europe.",
    details:
      "This is not theoretical. It is 200+ projects of hands-on production work with brands like Coca-Cola, Swarovski, the Ford Foundation, and the International Labor Organization.",
    references: ["Kolona (Ford Foundation)", "ILO Working Mothers", "Coca-Cola Earth Day", "Swarovski CX Journey", "Studio Emad Eddin"],
  },
  {
    label: "Digital Builds",
    description:
      "I build functional web platforms, dashboards, and internal tools using Replit, Claude Code, and modern frameworks. Not wireframes and Figma decks that sit in a drawer. Working products.",
    details:
      "Current live builds include an AI-powered news aggregator, a real-time geopolitical monitoring dashboard, a voice-driven corporate training platform, and team collaboration tools. I ship things.",
    references: ["Human Impact", "Iran War Monitor", "Mentora", "Optix AI Hub"],
  },
  {
    label: "Music Videos & Audio",
    description:
      "AI-generated and traditionally produced music videos, plus sound design and audio production using Suno, ElevenLabs, and Reaper. From concept to final cut.",
    details:
      "I direct and produce music videos for artists, blending AI-generated visuals with conventional post-production for a look that stands out.",
    references: ["More Fool You (Doc & The Revelators)", "Mycelium (Marze)", "Pulse Music World"],
  },
  {
    label: "AI Consultation & Training",
    description:
      "I help teams figure out where AI actually fits in their workflow. Not a pitch deck about the future. A practical assessment of what tools to use, what processes to change, and what results to expect.",
    details:
      "I work with ChatGPT, Claude, MidJourney, Gemini, ComfyUI, Ollama, and RunPod daily. I know what works and what is still hype. Currently leading AI integration at Optix in Dubai.",
    references: ["Optix AI Hub", "Mentora"],
  },
];

const steps = [
  {
    number: "01",
    title: "Scope",
    description: "We talk. You tell me what you need, I tell you what is actually possible. No discovery phase that takes six weeks. Usually one call.",
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
    description: "If something needs adjusting, we adjust. No change-order bureaucracy. The goal is work that performs, not work that passed a review gate.",
  },
];

export default async function ServicesPage() {
  const clients = await getAllClients();

  return (
    <PageTransition>
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="mb-16">
              <span className="section-label">Services</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                What I Do
              </h1>
              <p className="text-light-300 text-lg mt-4 max-w-2xl">
                Creative production, AI integration, and digital builds for brands that want to move faster and look sharper.
              </p>
            </div>
          </FadeIn>

          {/* Service Categories */}
          <div className="space-y-8">
            {services.map((service) => (
              <FadeIn key={service.label}>
                <div className="border-l-2 border-cyan/30 pl-8 lg:pl-10 py-6">
                  <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-cyan mb-4">
                    {service.label}
                  </h2>
                  <p className="text-light-200 leading-relaxed max-w-2xl">
                    {service.description}
                  </p>
                  <p className="text-light-300 text-sm leading-relaxed mt-3 max-w-2xl">
                    {service.details}
                  </p>
                  {service.references.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {service.references.map((ref) => (
                        <span
                          key={ref}
                          className="font-mono text-[10px] tracking-widest uppercase text-light-300/70 border border-dark-100 px-2.5 py-1"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* How I Work */}
        <section className="border-t border-dark-100 mt-20 py-16 md:py-24">
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

        {/* Track Record */}
        <section className="border-t border-dark-100 py-16 md:py-20 bg-[#0d0d0d]/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <span className="section-label mb-10 block">Track Record</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-dark-100">
                {[
                  { number: "20+", label: "Years" },
                  { number: "50+", label: "Brands" },
                  { number: "200+", label: "Projects" },
                  { number: "AI", label: "From Day 1" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-mono text-4xl md:text-5xl font-light text-light-100 tracking-tight">
                      {stat.number}
                    </p>
                    <p className="font-mono text-xs tracking-[0.2em] uppercase text-light-300 mt-2">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
            {clients.length > 0 && (
              <FadeIn className="mt-12">
                <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 justify-center">
                  {clients.slice(0, 12).map((client) => (
                    <span
                      key={client.id}
                      className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-light-300/70"
                    >
                      {client.name}
                    </span>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-dark-100 py-20 md:py-32">
          <FadeIn>
            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
              <h2 className="text-4xl md:text-6xl font-light tracking-tight text-light-100">
                Let&apos;s build something.
              </h2>
              <p className="text-light-300 mt-4 max-w-md mx-auto">
                Whether it is a brand film, a product platform, or an AI workflow overhaul, I am one message away.
              </p>
              <div className="mt-10">
                <Link
                  href="/contact"
                  className="inline-block font-mono text-xs tracking-[0.2em] uppercase bg-cyan text-black px-6 py-2.5 hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Start a Conversation
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </PageTransition>
  );
}
