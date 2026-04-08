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
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-section-sm md:py-section border-t border-white/[0.07]">
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

      {/* ── From the Studio ───────────────────────────── */}
      {featuredProjects.length > 0 && (() => {
        const heroProject = featuredProjects[0];
        const heroCover = typeof heroProject.coverImage === "object" && heroProject.coverImage ? heroProject.coverImage : null;
        const heroProjectVideo = heroProject.media?.find((m) => m.type === "youtube" || m.type === "vimeo") ?? null;
        return (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-section-sm md:py-section border-t border-white/[0.07]">
            <FadeIn>
              <h2 className="section-label-primary">From the Studio</h2>
            </FadeIn>
            {/* Hero studio item (first item) */}
            <FadeIn className="mt-8">
              <HeroCard
                href={`/studio/${heroProject.slug}`}
                title={heroProject.title}
                coverImage={heroCover}
                eyebrow={heroProject.contentType ? getContentTypeLabel(heroProject.contentType) : null}
                size="lg"
                aspect={heroProjectVideo ? "video" : "21/9"}
                priority
                videoEmbed={heroProjectVideo}
              />
            </FadeIn>

            {/* Remaining featured studio items */}
            {featuredProjects.length > 1 && (
              <FadeIn className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {featuredProjects.slice(1).map((project) => {
                    const cover = typeof project.coverImage === "object" && project.coverImage ? project.coverImage : null;
                    return (
                      <HeroCard
                        key={project.id}
                        href={`/studio/${project.slug}`}
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
                href="/studio"
                className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                View All Studio Work &rarr;
              </Link>
            </FadeIn>
          </section>
        );
      })()}

      {/* ── Recent Work Grid ──────────────────────────────────── */}
      {gridWork.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-section-sm md:py-section border-t border-white/[0.07]">
          <FadeIn>
            <h2 className="section-label">Recent Work</h2>
          </FadeIn>
          <FadeIn className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
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
                      eyebrow={work.client || work.roleCredits || null}
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

      {/* ── Latest Dispatch ───────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="border-t border-white/[0.07] py-section-sm md:py-section bg-[#0d0d0d]/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="section-label">Latest Dispatch</h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
              {recentPosts.map((post, i) => (
                <FadeIn key={post.id} delay={i * 100}>
                  <Link
                    href={`/dispatch/${post.slug}`}
                    className="group block -mx-3 px-3 py-3 rounded-sm hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] md:border-b-0 border-l-2 border-l-transparent hover:border-l-cyan"
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
                </FadeIn>
              ))}
            </div>
            <FadeIn className="mt-10">
              <Link
                href="/dispatch"
                className="font-mono text-xs tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                Read More &rarr;
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Track Record ──────────────────────────────────────── */}
      <section className="border-y border-white/[0.07] py-section-sm md:py-section bg-[#0d0d0d]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="section-label">Track Record</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/[0.07] mt-10">
            {[
              { number: "20+", label: "Years" },
              { number: "50+", label: "Brands" },
              { number: "200+", label: "Projects" },
              { number: "AI", label: "From Day 1" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 80}>
                <div className="text-center md:px-4">
                  <p className="text-4xl md:text-5xl font-light text-light-100 tracking-tight">
                    {stat.number}
                  </p>
                  <p className="font-mono text-xs tracking-[0.2em] uppercase text-light-300 mt-2">
                    {stat.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients ─────────────────────────────────────────── */}
      {clients.length > 0 && (
        <section className="py-section-sm md:py-section border-t border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="section-label">Selected Clients</h2>
            </FadeIn>
            <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 mt-8">
              {clients.slice(0, 18).map((client, i) => (
                <FadeIn key={client.id} delay={i * 40}>
                  <span className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-light-300/70">
                    {client.name}
                  </span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Transmissions ────────────────────────────────────── */}
      <section className="border-t border-white/[0.07] py-section-sm md:py-section bg-[#0d0d0d]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="section-label-primary">Transmissions</h2>
            <p className="text-light-300 text-sm mt-3 max-w-xl">
              Ongoing platforms and independent projects broadcasting on their own frequencies.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
            {[
              { name: "6DOF Reviews", url: "https://6dofreviews.com", domain: "6dofreviews.com", description: "VR hardware reviews, game deep-dives, and immersive tech analysis focused on the Meta Quest ecosystem and beyond.", tags: ["VR", "Reviews", "YouTube", "Quest"] },
              { name: "Human Impact", url: "https://humanimpact.news", domain: "humanimpact.news", description: "AI-powered news aggregator that ranks global stories by their actual human impact rather than clicks or engagement.", tags: ["AI", "News", "Aggregator", "Impact"] },
              { name: "Mentora", url: "https://mentora.replit.app/", domain: "mentora.replit.app", description: "Conversational AI coaches that transform corporate training materials into interactive, voice-driven learning sessions.", tags: ["AI", "Voice", "Corporate", "Training"] },
              { name: "Iran War Monitor", url: "https://war-monitor.replit.app/", domain: "war-monitor.replit.app", description: "Real-time monitoring dashboard tracking military and geopolitical developments across the Iran region with live data feeds.", tags: ["Geopolitics", "Real-time", "Dashboard"] },
              { name: "Optix AI Hub", url: "https://optixhub.replit.app/", domain: "optixhub.replit.app", description: "Centralized team platform for discovering, organizing, and managing AI tools and resources across collaborative workflows.", tags: ["AI", "Tools", "Team", "Platform"] },
              { name: "Optix Projects", url: "https://optixprojects.replit.app/", domain: "optixprojects.replit.app", description: "Project management and tracking platform built for the Optix creative production pipeline and cross-team coordination.", tags: ["Projects", "Management", "Workflow"] },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 80}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col h-full bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-[border-color,box-shadow] duration-300 pl-8 pr-9 py-8 lg:pl-10 lg:pr-11 lg:py-10 overflow-hidden shadow-[rgba(255,255,255,0.03)_0px_1px_0px_0px_inset]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="live-indicator-dot inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                      <span className="live-indicator-label font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">Live</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">{t.name}</h3>
                    <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md flex-1">{t.description}</p>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {t.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[10px] tracking-widest uppercase text-light-300/70 border border-white/[0.07] rounded px-2.5 py-1">{tag}</span>
                      ))}
                    </div>
                    <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">{t.domain} &rarr;</span>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.07] py-section md:py-section-lg">
        <FadeIn>
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl md:text-6xl font-light tracking-display text-light-100">
              Have a project in mind?
            </h2>
            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-block font-mono text-xs tracking-[0.2em] uppercase bg-cyan text-black px-6 py-2.5 shadow-[0_2px_8px_rgba(0,217,255,0.2)] hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
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
