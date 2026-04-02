import type { Metadata } from "next";
import ProjectCard from "@/components/project-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { getAllProjects } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Projects",
  description: "Independent projects and side ventures — from VR reviews to journalism and open-source tools.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading title="Projects" subtitle="Independent ventures and ongoing experiments." />
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (<FadeIn key={project.id}><ProjectCard project={project} /></FadeIn>))}
        </div>
      </div>
    </div>
  );
}
