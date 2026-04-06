export const revalidate = 60;

import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import { RichText } from "@/components/rich-text";
import { getSiteSettings } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "About",
  description: "Omar Kamel — AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix.",
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
    url: "https://omarkamel.com",
    description:
      "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai.",
    knowsAbout: [
      "AI Video Generation",
      "AI Image Generation",
      "Creative Production",
      "Digital Content",
    ],
    ...(photo?.url ? { image: photo.url } : {}),
  };

  return (
    <>
      <JsonLd data={personJsonLd} />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            {/* Cinematic header */}
            <div className="mb-16">
              <span className="section-label">About</span>
              <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
                Omar Kamel
              </h1>
            </div>

            {/* Two-column: bio left (2/3), photo right (1/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-12 mb-20">
              <div className="md:col-span-2">
                {settings.aboutBio ? (
                  <div className="prose prose-invert max-w-none text-[15px] text-light-200 leading-relaxed [&_p]:text-[15px] [&_p:first-of-type]:!mt-0">
                    <RichText data={settings.aboutBio} />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-[15px] text-light-200 leading-relaxed [&_p]:text-[15px] [&_p:first-of-type]:!mt-0">
                    <p>I&apos;m Omar Kamel, AI Creative &amp; Production Lead at Optix, where I help regional and global brands harness AI across every stage of creative production.</p>
                  </div>
                )}
              </div>
              <div className="md:col-span-1">
                {photo?.url ? (
                  <div className="relative aspect-[3/4] overflow-hidden border border-white/[0.07] bg-dark-200/50">
                    <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-dark-200 border border-white/[0.07] flex items-center justify-center text-light-300 text-sm">Photo</div>
                )}
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            {/* Skills section */}
            <div className="border-t border-white/[0.07] pt-16">
              <span className="section-label">Skills &amp; Tools</span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                {skills.map((group) => (
                  <div key={group.category} className="border-l border-white/[0.07] pl-4">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">{group.category}</h3>
                    <ul className="space-y-2">
                      {group.items.map((item) => (<li key={item} className="text-sm text-light-300">{item}</li>))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
