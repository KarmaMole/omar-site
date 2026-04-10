export const revalidate = 60;

import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import ObfuscatedEmail from "@/components/obfuscated-email";
import FadeIn from "@/components/fade-in";
import { getSiteSettings } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Omar Kamel for production enquiries, collaborations, or anything in between.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact: Omar Kamel",
    description: "Get in touch with Omar Kamel for production enquiries, collaborations, or anything in between.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact: Omar Kamel",
    description: "Get in touch with Omar Kamel for production enquiries, collaborations, or anything in between.",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const socialLinks = settings.socialLinks ?? [];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          {/* Header */}
          <div className="mb-16">
            <span className="section-label">Contact</span>
            <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">
              Start a Project
            </h1>
            <p className="text-light-300 mt-3">tell me about your vision.</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-5 items-start gap-16">
          {/* Left: form (60%) */}
          <div className="md:col-span-3">
            <FadeIn>
              <ContactForm />
            </FadeIn>
          </div>

          {/* Right: info (40%) */}
          <div className="md:col-span-2">
            <FadeIn>
              <div className="space-y-10">
                {/* Based in */}
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-cyan mb-3">
                    Based In
                  </h3>
                  <p className="text-light-100">Dubai, UAE</p>
                </div>

                {/* Email */}
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-cyan mb-3">
                    Email
                  </h3>
                  <ObfuscatedEmail
                    user="omar"
                    domain="omarkamel.com"
                    className="text-light-100 link-underline"
                  />
                </div>

                {/* Social links */}
                {socialLinks && socialLinks.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-cyan mb-3">
                      Connect
                    </h3>
                    <ul className="space-y-2">
                      {socialLinks.map((link) => (
                        <li key={link.platform}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-light-300 link-underline transition-colors hover:text-light-100"
                          >
                            {link.platform}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
