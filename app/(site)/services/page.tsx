import type { Metadata } from "next";
import ComingSoon from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI production services from Omar Kamel — coming soon.",
};

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-16">
      <ComingSoon
        title="Services"
        description="A full breakdown of AI production services — brand films, campaigns, generative content, and creative consulting — is coming soon. Get in touch to discuss your project in the meantime."
      />
    </div>
  );
}
