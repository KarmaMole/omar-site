import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { RichText } from "@/components/rich-text";
import { getSiteSettings } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "About",
  description: "Omar Kamel — AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix/Saatchi.",
};

const skills = [
  { category: "AI Tools", items: ["Runway", "Midjourney", "ComfyUI", "Stable Diffusion", "ElevenLabs", "Suno"] },
  { category: "Production", items: ["After Effects", "Premiere Pro", "DaVinci Resolve", "Cinema 4D", "Nuke"] },
  { category: "Creative", items: ["Photoshop", "Illustrator", "Figma", "Clip Studio Paint", "Blender"] },
  { category: "Development", items: ["Next.js", "React", "Python", "TypeScript", "Node.js"] },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const photo = typeof settings.aboutPhoto === "object" && settings.aboutPhoto ? settings.aboutPhoto : null;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="md:col-span-1">
              {photo?.url ? (
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
                  <Image src={photo.sizes?.card?.url ?? photo.url} alt={photo.alt} fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-200 rounded-sm flex items-center justify-center text-gray-400 text-sm">Photo</div>
              )}
            </div>
            <div className="md:col-span-2">
              <SectionHeading title="About" />
              {settings.aboutBio ? (
                <RichText data={settings.aboutBio} />
              ) : (
                <div className="space-y-5 text-gray-700 leading-relaxed">
                  <p>I&apos;m Omar Kamel — AI Creative &amp; Production Lead at Optix/Saatchi &amp; Saatchi, where I help regional and global brands navigate the rapidly evolving intersection of artificial intelligence and creative production.</p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
        <FadeIn>
          <div className="border-t border-gray-200 pt-16">
            <h2 className="font-serif text-3xl font-bold mb-10">Skills &amp; Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">{group.category}</h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (<li key={item} className="text-sm text-gray-700">{item}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
