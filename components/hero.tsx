import Image from "next/image";
import Link from "next/link";
import AnimatedText from "./animated-text";
import HeroAnimations from "./hero-animations";
import HeroHeight from "./hero-height";
import { getSiteSettings } from "@/lib/payload/queries";

export default async function Hero() {
  const settings = await getSiteSettings();
  const bg =
    typeof settings.heroBackground === "object" && settings.heroBackground
      ? settings.heroBackground
      : null;

  return (
    <section className="relative h-[100svh] flex items-center overflow-hidden" style={{ height: "var(--hero-h, 100svh)" }}>
      <HeroHeight />
      {/* Background image or gradient fallback */}
      {bg?.url ? (
        <>
          <Image
            src={bg.url}
            alt=""
            fill
            priority
            className="object-cover"
            style={{ filter: "saturate(0.85) contrast(1.1)" }}
          />
          {/* Strong overlay — content dominates, image is atmosphere */}
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/70" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
      )}

      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Option B: Everything stacked vertically */}
        <div className="max-w-3xl">
          <HeroAnimations animation="fade-up" delay={300}>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan mb-5">
              AI Creative &amp; Production
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] text-white" style={{ marginLeft: "-0.04em" }}>
              Omar Kamel
            </h1>
          </HeroAnimations>

          <HeroAnimations animation="fade-up" delay={600}>
            <div className="mt-8">
              <AnimatedText />
            </div>
          </HeroAnimations>

          <HeroAnimations animation="fade-up" delay={800}>
            <p className="text-light-300 text-sm leading-relaxed mt-5 max-w-lg">
              20+ years crafting stories across film, music, brand, and
              emerging media. Currently leading AI-driven creative production.
            </p>
          </HeroAnimations>

          <HeroAnimations animation="fade-up" delay={1000}>
            <div className="mt-8 flex items-center gap-6">
              <Link
                href="/contact"
                className="font-mono text-xs tracking-[0.2em] uppercase bg-cyan text-black px-4 py-2 hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Start a Project
              </Link>
              <Link
                href="/work"
                className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                Explore Work &rarr;
              </Link>
            </div>
          </HeroAnimations>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-light-300/50">
          Scroll
        </span>
        <div className="w-px h-6 bg-gradient-to-b from-light-300/50 to-transparent" />
      </div>
    </section>
  );
}
