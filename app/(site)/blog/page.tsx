import type { Metadata } from "next";
import BlogCard from "@/components/blog-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { dummyBlogPosts } from "@/lib/dummy-data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on AI production, creative technology, storytelling, and building a career at the edge of art and tools.",
};

export default function BlogPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading
            title="Blog"
            subtitle="Reflections on creativity, technology, and the work in between."
          />
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {dummyBlogPosts.map((post) => (
            <FadeIn key={post._id}>
              <BlogCard post={post} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
