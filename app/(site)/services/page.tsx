import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI production services from Omar Kamel — coming soon.",
  robots: { index: false, follow: false },
};

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-16">
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-0.5 bg-cyan mb-8" />
        <span className="section-label mb-4">Services</span>
        <h2 className="text-4xl font-bold text-light-100 mb-4">Services</h2>
        <p className="text-light-300 max-w-md mb-8 leading-relaxed">
          A full breakdown of AI production services — brand films, campaigns, generative content, and creative consulting — is coming soon. Get in touch to discuss your project in the meantime.
        </p>
        <Link
          href="/contact"
          className="inline-block border border-cyan text-cyan px-8 py-3 rounded-[2px] font-mono text-sm hover:bg-cyan hover:text-black transition-colors"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
}
