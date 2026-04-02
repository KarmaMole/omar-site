import type { Metadata } from "next";
import BlogCard from "@/components/blog-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { getAllBlogPosts } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on AI production, creative technology, storytelling, and building a career at the edge of art and tools.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading title="Blog" subtitle="Reflections on creativity, technology, and the work in between." />
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (<FadeIn key={post.id}><BlogCard post={post} /></FadeIn>))}
        </div>
      </div>
    </div>
  );
}
