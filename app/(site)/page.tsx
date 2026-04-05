export const revalidate = 60;

import Link from "next/link";
import JsonLd from "@/components/json-ld";
import { sourceSerif } from "@/lib/fonts";
import Hero from "@/components/hero";
import FadeIn from "@/components/fade-in";
import HeroCard from "@/components/hero-card";
import { formatDate, getContentTypeLabel } from "@/lib/utils";
import {
  getSiteSettings,
  getFeaturedWork,
  getFeaturedProjects,
  getRecentBlogPosts,
  getAllClients,
} from "@/lib/payload/queries";
import type { WorkDoc, BlogPostDoc, MediaUpload } from "@/lib/payload/types";

function getCoverAlt(doc: WorkDoc | BlogPostDoc): string {
  const img = typeof doc.coverImage === "object" ? doc.coverImage : null;
  return (img as MediaUpload)?.alt ?? doc.title;
}

export default async function HomePage() {
  const [settings, featuredWork, featuredProjects, recentPosts, clients] = await Promise.all([
    getSiteSettings(),
    getFeaturedWork(),
    getFeaturedProjects(),
    getRecentBlogPosts(3),
    getAllClients(),
  ]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Omar Kamel",
    jobTitle: "AI Creative & Production Lead",
    url: "https://omarkamel.com",
    sameAs: (settings.socialLinks ?? []).map((s: { url: string }) => s.url),
  };

  const heroWork = featuredWork.length > 0 ? featuredWork[0] : null;
  const gridWork = featuredWork.slice(1);

  return (
    <>
      <JsonLd data={personJsonLd} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <Hero />

      {/* ── Featured Work Showcase ────────────────────────────── */}
      {heroWork && (() => {
        const heroVideo = heroWork.media?.find((m) => m.type === "youtube" || m.type === "vimeo") ?? null;
        const cover = typeof heroWork.coverImage === "object" ? heroWork.coverImage : null;
        return (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 md:py-28 border-t border-dark-100">
            <FadeIn>
              <h2 className="section-label-primary">Featured Work</h2>
            </FadeIn>
            <FadeIn className="mt-8">
              <HeroCard
                href={`/work/${heroWork.slug}`}
                title={heroWork.title}
                coverImage={cover}
                coverAlt={getCoverAlt(heroWork)}
                eyebrow={heroWork.client ?? null}
                bottomMeta={heroWork.categories && heroWork.categories.length > 0 ? heroWork.categories.join(" / ") : null}
                size="lg"
                aspect={heroVideo ? "video" : "21/9"}
                priority
                videoEmbed={heroVideo}
              />
            </FadeIn>
            <FadeIn className="mt-10">
              <Link
                href="/work"
                className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                View All Work &rarr;
              </Link>
            </FadeIn>
          </section>
        );
      })()}

      {/* ── Featured Explorations ───────────────────────────── */}
      {featuredProjects.length > 0 && (() => {
        const heroProject = featuredProjects[0];
        const heroCover = typeof heroProject.coverImage === "object" && heroProject.coverImage ? heroProject.coverImage : null;
        const heroProjectVideo = heroProject.media?.find((m) => m.type === "youtube" || m.type === "vimeo") ?? null;
        return (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 border-t border-dark-100">
            <FadeIn>
              <h2 className="section-label-primary">Featured Explorations</h2>
            </FadeIn>
            {/* Hero exploration (first item) */}
            <FadeIn className="mt-8">
              <HeroCard
                href={`/explore/${heroProject.slug}`}
                title={heroProject.title}
                coverImage={heroCover}
                eyebrow={heroProject.contentType ? getContentTypeLabel(heroProject.contentType) : null}
                size="lg"
                aspect={heroProjectVideo ? "video" : "21/9"}
                priority
                videoEmbed={heroProjectVideo}
              />
            </FadeIn>

            {/* Remaining featured explorations */}
            {featuredProjects.length > 1 && (
              <FadeIn className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProjects.slice(1).map((project) => {
                    const cover = typeof project.coverImage === "object" && project.coverImage ? project.coverImage : null;
                    return (
                      <HeroCard
                        key={project.id}
                        href={`/explore/${project.slug}`}
                        title={project.title}
                        coverImage={cover}
                        eyebrow={project.contentType ? getContentTypeLabel(project.contentType) : null}
                        size="sm"
                        aspect="4/3"
                      />
                    );
                  })}
                </div>
              </FadeIn>
            )}
            <FadeIn className="mt-10">
              <Link
                href="/explore"
                className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                View All Explorations &rarr;
              </Link>
            </FadeIn>
          </section>
        );
      })()}

      {/* ── Recent Work Grid ──────────────────────────────────── */}
      {gridWork.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 border-t border-dark-100">
          <FadeIn>
            <h2 className="section-label">Recent Work</h2>
          </FadeIn>
          <FadeIn className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridWork.map((work, i) => {
                const cover = typeof work.coverImage === "object" ? work.coverImage : null;
                const isFullWidth = i === 0;
                return (
                  <div
                    key={work.id}
                    className={isFullWidth ? "md:col-span-2" : undefined}
                  >
                    <HeroCard
                      href={`/work/${work.slug}`}
                      title={work.title}
                      coverImage={cover}
                      coverAlt={getCoverAlt(work)}
                      eyebrow={work.client ?? null}
                      size="sm"
                      aspect={isFullWidth ? "21/9" : "4/3"}
                      sizes={isFullWidth ? "100vw" : "50vw"}
                    />
                  </div>
                );
              })}
            </div>
          </FadeIn>
          <FadeIn className="mt-10">
            <Link
              href="/work"
              className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
            >
              View All Work &rarr;
            </Link>
          </FadeIn>
        </section>
      )}

      {/* ── Latest from Blog ──────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="border-t border-dark-100 py-16 md:py-24 bg-[#0d0d0d]/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="section-label">Latest Writing</h2>
            </FadeIn>
            <FadeIn className="mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    {post.date && (
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-light-300 mb-2">
                        {formatDate(post.date)}
                      </p>
                    )}
                    <h3 className={`${sourceSerif.className} text-lg font-light text-light-100 group-hover:text-cyan transition-colors leading-snug`}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className={`${sourceSerif.className} text-sm text-light-300 mt-2 line-clamp-3`}>
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </FadeIn>
            <FadeIn className="mt-10">
              <Link
                href="/writing"
                className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                Read More &rarr;
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Track Record ──────────────────────────────────────── */}
      <section className="border-y border-dark-100 py-16 md:py-20 bg-[#0d0d0d]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="section-label">Track Record</h2>
          </FadeIn>
          <FadeIn className="mt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-dark-100">
              {[
                { number: "20+", label: "Years", qualifier: "Cairo, Italy, Dubai" },
                { number: "50+", label: "Brands", qualifier: "Coca-Cola, Ford Foundation, ILO" },
                { number: "200+", label: "Projects", qualifier: "Film, brand, AI, music" },
                { number: "AI", label: "From Day 1", qualifier: "Claude, MidJourney, ComfyUI" },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:px-4">
                  <p className="font-mono text-4xl md:text-5xl font-light text-light-100 tracking-tight">
                    {stat.number}
                  </p>
                  <p className="font-mono text-xs tracking-[0.2em] uppercase text-light-300 mt-2">
                    {stat.label}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.1em] text-light-300/50 mt-1.5">
                    {stat.qualifier}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Clients ─────────────────────────────────────────── */}
      {clients.length > 0 && (
        <section className="py-12 md:py-16 border-t border-dark-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="section-label">Selected Clients</h2>
            </FadeIn>
            <FadeIn className="mt-8">
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
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Transmissions ────────────────────────────────────── */}
      <section className="border-t border-dark-100 py-16 md:py-24 bg-[#0d0d0d]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="section-label-primary">Transmissions</h2>
            <p className="text-light-300 text-sm mt-3 max-w-xl">
              Ongoing platforms and independent projects broadcasting on their own frequencies.
            </p>
          </FadeIn>
          <FadeIn className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "6DOF Reviews", url: "https://6dofreviews.com", domain: "6dofreviews.com", description: "VR hardware reviews, game coverage, and immersive tech analysis for the Meta Quest ecosystem. YouTube channel & editorial site.", tags: ["VR", "Reviews", "YouTube", "Quest"] },
                { name: "Human Impact", url: "https://humanimpact.news", domain: "humanimpact.news", description: "AI-powered news aggregator that ranks global stories by actual human impact, cutting through noise to surface what matters.", tags: ["AI", "News", "Aggregator", "Impact"] },
                { name: "Mentora", url: "https://mentora.replit.app/", domain: "mentora.replit.app", description: "Conversational AI coaches that turn corporate course materials into interactive, voice-driven employee training.", tags: ["AI", "Voice", "Corporate", "Training"] },
                { name: "Iran War Monitor", url: "https://war-monitor.replit.app/", domain: "war-monitor.replit.app", description: "Real-time monitoring dashboard tracking military and geopolitical developments in the Iran region with live data visualization.", tags: ["Geopolitics", "Real-time", "Dashboard", "OSINT"] },
                { name: "Optix AI Hub", url: "https://optixhub.replit.app/", domain: "optixhub.replit.app", description: "Centralized team platform for discovering, organizing, and managing AI tools and resources across collaborative workflows.", tags: ["AI", "Tools", "Team", "Platform"] },
                { name: "Optix Projects", url: "https://optixprojects.replit.app/", domain: "optixprojects.replit.app", description: "Project management and tracking platform for the Optix creative production pipeline.", tags: ["Projects", "Management", "Production", "Workflow"] },
              ].map((t) => (
                <a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 pl-8 pr-9 py-8 lg:pl-10 lg:pr-11 lg:py-10 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="live-indicator-dot inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                      <span className="live-indicator-label font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">Live</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">{t.name}</h3>
                    <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md line-clamp-3 md:line-clamp-none">{t.description}</p>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {t.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[10px] tracking-widest uppercase text-light-300/70 border border-dark-100 px-2.5 py-1">{tag}</span>
                      ))}
                    </div>
                    <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">{t.domain} &rarr;</span>
                  </div>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-dark-100 py-20 md:py-32">
        <FadeIn>
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-light-100">
              Have a project in mind?
            </h2>
            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-block font-mono text-xs tracking-[0.2em] uppercase bg-cyan text-black px-6 py-2.5 hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
