import type { Metadata } from "next";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";

export const metadata: Metadata = {
  title: "About",
  description:
    "Omar Kamel — AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix/Saatchi.",
};

const skills = [
  {
    category: "AI Tools",
    items: ["Runway", "Midjourney", "ComfyUI", "Stable Diffusion", "ElevenLabs", "Suno"],
  },
  {
    category: "Production",
    items: ["After Effects", "Premiere Pro", "DaVinci Resolve", "Cinema 4D", "Nuke"],
  },
  {
    category: "Creative",
    items: ["Photoshop", "Illustrator", "Figma", "Clip Studio Paint", "Blender"],
  },
  {
    category: "Development",
    items: ["Next.js", "React", "Python", "TypeScript", "Node.js"],
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Bio section */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {/* Photo placeholder */}
            <div className="md:col-span-1">
              <div className="aspect-[3/4] bg-gray-200 rounded-sm flex items-center justify-center text-gray-400 text-sm">
                Photo
              </div>
            </div>

            {/* Bio text */}
            <div className="md:col-span-2">
              <SectionHeading title="About" />

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  I&apos;m Omar Kamel — AI Creative &amp; Production Lead at Optix/Saatchi &amp; Saatchi,
                  where I help regional and global brands navigate the rapidly evolving intersection of
                  artificial intelligence and creative production. My work sits at the command line between
                  what a story needs to be and what technology currently allows.
                </p>

                <p>
                  Over 20+ years, I&apos;ve built work across Cairo, Italy, and Dubai for clients
                  including Saudia Airlines, GMC, Coca-Cola, ADCB, Core42, and others across MENA
                  and beyond. That range — from Arabic broadcast to European brand to Gulf enterprise —
                  shaped a perspective that doesn&apos;t default to a single visual language or
                  production playbook.
                </p>

                <p>
                  Outside client work, I run{" "}
                  <a
                    href="https://6dof.reviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brick hover:underline"
                  >
                    6DOF Reviews
                  </a>
                  , an independent platform covering VR and XR with the depth the medium deserves. I also
                  write, make AI films, produce electronic music, and am slowly building{" "}
                  <em>The Last Archive</em> — a sci-fi graphic novel told in Arabic.
                </p>

                <p>
                  I didn&apos;t plan to become a creative technologist. I planned to tell stories, and
                  technology kept becoming the most interesting part of how to do that. Two decades in,
                  that still feels like the right accident to have had.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Skills section */}
        <FadeIn>
          <div className="border-t border-gray-200 pt-16">
            <h2 className="font-serif text-3xl font-bold mb-10">Skills &amp; Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">
                    {group.category}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-gray-700">
                        {item}
                      </li>
                    ))}
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
