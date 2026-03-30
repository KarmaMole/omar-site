import type { Metadata } from "next";
import ProjectCard from "@/components/project-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { dummyProjects } from "@/lib/dummy-data";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Independent projects and side ventures — from VR reviews to journalism and open-source tools.",
};

export default function ProjectsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading
            title="Projects"
            subtitle="Independent ventures and ongoing experiments."
          />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyProjects.map((project) => (
            <FadeIn key={project._id}>
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
