export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/json-ld";
import Hero from "@/components/hero";
import FadeIn from "@/components/fade-in";
import { formatDate } from "@/lib/utils";
import {
  getSiteSettings,
  getFeaturedWork,
  getRecentBlogPosts,
  getAllClients,
} from "@/lib/payload/queries";
import type { WorkDoc, BlogPostDoc, MediaUpload } from "@/lib/payload/types";

function getCoverUrl(doc: WorkDoc | BlogPostDoc): string | null {
  const img = typeof doc.coverImage === "object" ? doc.coverImage : null;
  if (!img) return null;
  return (img as MediaUpload).sizes?.hero?.url ?? (img as MediaUpload).url ?? null;
}

function getCoverAlt(doc: WorkDoc | BlogPostDoc): string {
  const img = typeof doc.coverImage === "object" ? doc.coverImage : null;
  return (img as MediaUpload)?.alt ?? doc.title;
}

export default async function HomePage() {
  const [, featuredWork, recentPosts, clients] = await Promise.all([
    getSiteSettings(),
    getFeaturedWork(),
    getRecentBlogPosts(3),
    getAllClients(),
  ]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Omar Kamel",
    jobTitle: "AI Creative & Production Lead",
    url: "https://omarkamel.com",
    sameAs: [] as string[],
  };

  const heroWork = featuredWork.length > 0 ? featuredWork[0] : null;
  const gridWork = featuredWork.slice(1);

  return (
    <>
      <JsonLd data={personJsonLd} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <Hero />

      {/* ── Featured Work Showcase ────────────────────────────── */}
      {heroWork && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 border-t border-dark-100">
          <FadeIn>
            <span className="section-label-primary">Featured Work</span>
          </FadeIn>
          <FadeIn className="mt-8">
            <Link href={`/work/${heroWork.slug}`} className="group block relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-dark-200">
              {getCoverUrl(heroWork) ? (
                <Image
                  src={getCoverUrl(heroWork)!}
                  alt={getCoverAlt(heroWork)}
                  fill
                  className="object-cover group-hover:scale-[1.05] transition-transform duration-700"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-dark-200 to-dark-100" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 lg:p-12">
                {heroWork.client && (
                  <p className="font-mono text-xs tracking-[0.2em] uppercase text-cyan mb-2">
                    {heroWork.client}
                  </p>
                )}
                <h3 className="text-3xl md:text-5xl font-light tracking-tight text-gradient">
                  {heroWork.title}
                </h3>
                {heroWork.categories && heroWork.categories.length > 0 && (
                  <p className="font-mono text-xs tracking-[0.15em] uppercase text-light-300 mt-3">
                    {heroWork.categories.join(" / ")}
                  </p>
                )}
              </div>
            </Link>
          </FadeIn>
        </section>
      )}

      {/* ── Stats Interstitial ────────────────────────────────── */}
      <section className="border-y border-dark-100 py-16 md:py-20 bg-[#0d0d0d]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <span className="section-label">By the Numbers</span>
          </FadeIn>
          <FadeIn className="mt-10">
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
        </div>
      </section>

      {/* ── Clients ─────────────────────────────────────────── */}
      {clients.length > 0 && (
        <section className="py-12 md:py-16 border-t border-dark-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <span className="section-label">Selected Clients</span>
            </FadeIn>
            <FadeIn className="mt-8">
              <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4">
                {clients.slice(0, 12).map((client) => (
                  <span
                    key={client.id}
                    className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-light-300/50"
                  >
                    {client.name}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Transmissions ─────────────────────────────────────── */}
      <section className="border-t border-dark-100 py-16 md:py-24 bg-[#0d0d0d]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <span className="section-label-primary">Transmissions</span>
            <p className="text-light-300 text-sm mt-3 max-w-xl">
              Ongoing platforms and independent projects broadcasting on their own frequencies.
            </p>
          </FadeIn>
          <FadeIn className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 6DOF Reviews */}
              <a
                href="https://6dofreviews.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 p-8 lg:p-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">
                    6DOF Reviews
                  </h3>
                  <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md">
                    VR hardware reviews, game coverage, and immersive tech analysis for the Meta Quest ecosystem. YouTube channel &amp; editorial site.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["VR", "Reviews", "YouTube", "Quest"].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-widest uppercase text-light-300/40 border border-dark-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">
                    6dofreviews.com &rarr;
                  </span>
                </div>
              </a>

              {/* Human Impact */}
              <a
                href="https://humanimpact.news"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 p-8 lg:p-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">
                    Human Impact
                  </h3>
                  <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md">
                    AI-powered news aggregator that ranks global stories by actual human impact, cutting through noise to surface what matters.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["AI", "News", "Aggregator", "Impact"].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-widest uppercase text-light-300/40 border border-dark-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">
                    humanimpact.news &rarr;
                  </span>
                </div>
              </a>
              {/* Mentora */}
              <a
                href="https://mentora.replit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 p-8 lg:p-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">
                    Mentora
                  </h3>
                  <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md">
                    Conversational AI coaches that turn corporate course materials into interactive, voice-driven employee training.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["AI", "Voice", "Corporate", "Training"].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-widest uppercase text-light-300/40 border border-dark-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">
                    mentora.replit.app &rarr;
                  </span>
                </div>
              </a>

              {/* Iran War Monitor */}
              <a
                href="https://war-monitor.replit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 p-8 lg:p-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">
                    Iran War Monitor
                  </h3>
                  <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md">
                    Real-time monitoring dashboard tracking military and geopolitical developments in the Iran region with live data visualization.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["Geopolitics", "Real-time", "Dashboard", "OSINT"].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-widest uppercase text-light-300/40 border border-dark-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">
                    war-monitor.replit.app &rarr;
                  </span>
                </div>
              </a>

              {/* Optix AI Hub */}
              <a
                href="https://optixhub.replit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 p-8 lg:p-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">
                    Optix AI Hub
                  </h3>
                  <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md">
                    Centralized team platform for discovering, organizing, and managing AI tools and resources across collaborative workflows.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["AI", "Tools", "Team", "Platform"].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-widest uppercase text-light-300/40 border border-dark-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">
                    optixhub.replit.app &rarr;
                  </span>
                </div>
              </a>

              {/* Optix Projects */}
              <a
                href="https://optixprojects.replit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-dark-200 border-l-2 border-cyan/30 hover:border-cyan transition-all duration-500 p-8 lg:p-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan/60">
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-light-100 group-hover:text-white transition-colors">
                    Optix Projects
                  </h3>
                  <p className="text-light-300 text-sm mt-3 leading-relaxed max-w-md">
                    Project management and tracking platform for the Optix creative production pipeline.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["Projects", "Management", "Production", "Workflow"].map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-widest uppercase text-light-300/40 border border-dark-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-cyan/70 group-hover:text-cyan transition-colors">
                    optixprojects.replit.app &rarr;
                  </span>
                </div>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Recent Work Grid ──────────────────────────────────── */}
      {gridWork.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 border-t border-dark-100">
          <FadeIn>
            <span className="section-label">Recent Work</span>
          </FadeIn>
          <FadeIn className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridWork.map((work, i) => {
                const coverUrl = getCoverUrl(work);
                const isFullWidth = i === 0;
                return (
                  <Link
                    key={work.id}
                    href={`/work/${work.slug}`}
                    className={`group block relative overflow-hidden bg-dark-200 ${
                      isFullWidth ? "md:col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                    }`}
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={getCoverAlt(work)}
                        fill
                        className="object-cover group-hover:scale-[1.05] transition-transform duration-700"
                        sizes={isFullWidth ? "100vw" : "50vw"}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-200 to-dark-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 lg:p-8">
                      {work.client && (
                        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cyan mb-1">
                          {work.client}
                        </p>
                      )}
                      <h3 className="text-xl md:text-2xl font-light tracking-tight text-white">
                        {work.title}
                      </h3>
                    </div>
                  </Link>
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
              <span className="section-label">Latest Writing</span>
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
                    <h3 className="text-lg font-light text-light-100 group-hover:text-cyan transition-colors leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-light-300 mt-2 line-clamp-2">
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
                className="font-mono text-sm tracking-[0.2em] uppercase text-cyan hover:text-white transition-colors link-underline"
              >
                Start a Project &rarr;
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
