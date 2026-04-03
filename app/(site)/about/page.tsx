import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import { RichText } from "@/components/rich-text";
import { getSiteSettings } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "About",
  description: "Omar Kamel — AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix/Saatchi.",
};

// TODO: Move skills to SiteSettings CMS global (add a "skills" array field with category + items)
const skills = [
  { category: "AI Tools", items: ["Runway", "Midjourney", "ComfyUI", "Stable Diffusion", "ElevenLabs", "Suno"] },
  { category: "Production", items: ["After Effects", "Premiere Pro", "DaVinci Resolve", "Cinema 4D", "Nuke"] },
  { category: "Creative", items: ["Photoshop", "Illustrator", "Figma", "Clip Studio Paint", "Blender"] },
  { category: "Development", items: ["Next.js", "React", "Python", "TypeScript", "Node.js"] },
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
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            {/* Cinematic header */}
            <div className="mb-16">
              <span className="section-label">About</span>
              <h1 className="text-5xl md:text-6xl font-light text-light-100 mt-3">
                Omar Kamel
              </h1>
            </div>

            {/* Two-column: bio left (2/3), photo right (1/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
              <div className="md:col-span-2">
                {settings.aboutBio ? (
                  <div className="prose prose-invert prose-sm prose-p:text-light-300 prose-p:leading-relaxed max-w-none">
                    <RichText data={settings.aboutBio} />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm prose-p:text-light-300 prose-p:leading-relaxed max-w-none">
                    <p>I&apos;m Omar Kamel — AI Creative &amp; Production Lead at Optix/Saatchi &amp; Saatchi, where I help regional and global brands navigate the rapidly evolving intersection of artificial intelligence and creative production.</p>
                  </div>
                )}
              </div>
              <div className="md:col-span-1">
                {photo?.url ? (
                  <div className="relative aspect-[3/4] overflow-hidden border border-dark-100">
                    <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-dark-200 border border-dark-100 flex items-center justify-center text-light-300 text-sm">Photo</div>
                )}
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            {/* Skills section */}
            <div className="border-t border-dark-100 pt-16">
              <span className="section-label">Skills &amp; Tools</span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                {skills.map((group) => (
                  <div key={group.category} className="border-l border-cyan pl-4">
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
