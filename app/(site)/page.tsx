import Link from "next/link";
import Hero from "@/components/hero";
import WorkCard from "@/components/work-card";
import ProjectCard from "@/components/project-card";
import BlogCard from "@/components/blog-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import {
  getSiteSettings,
  getFeaturedWork,
  getFeaturedProjects,
  getRecentBlogPosts,
} from "@/lib/payload/queries";

export default async function HomePage() {
  const [settings, featuredWork, featuredProjects, recentPosts] =
    await Promise.all([
      getSiteSettings(),
      getFeaturedWork(),
      getFeaturedProjects(),
      getRecentBlogPosts(3),
    ]);

  return (
    <>
      <Hero
        headline={settings.heroHeadline || "Omar Kamel"}
        tagline={settings.heroTagline || "AI Creative & Production Lead"}
      />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn>
          <SectionHeading
            title="Work"
            subtitle="Selected projects across brand, film, music, and emerging media."
          />
        </FadeIn>
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWork.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </FadeIn>
        <FadeIn className="mt-10">
          <Link href="/work" className="link-underline text-brick font-medium text-sm uppercase tracking-wider">
            View all work
          </Link>
        </FadeIn>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <SectionHeading title="Projects" subtitle="Side ventures, tools, and ongoing experiments." />
          </FadeIn>
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </FadeIn>
          <FadeIn className="mt-10">
            <Link href="/projects" className="link-underline text-brick font-medium text-sm uppercase tracking-wider">
              View all projects
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn>
          <SectionHeading title="Latest" subtitle="Thoughts on AI, production, and creative work." />
        </FadeIn>
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </FadeIn>
        <FadeIn className="mt-10">
          <Link href="/blog" className="link-underline text-brick font-medium text-sm uppercase tracking-wider">
            Read more
          </Link>
        </FadeIn>
      </section>

      <section className="bg-black text-white py-24">
        <FadeIn>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">Let&apos;s Work Together</h2>
            <p className="text-gray-300 text-lg mt-4">Have a project in mind? I&apos;d love to hear about it.</p>
            <div className="mt-8">
              <Link href="/contact" className="inline-block bg-brick text-white px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-brick/90 transition-colors">
                Get in touch
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
