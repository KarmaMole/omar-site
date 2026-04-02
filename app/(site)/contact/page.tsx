import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { getSiteSettings } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Omar Kamel — for production enquiries, collaborations, or anything in between.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const socialLinks = settings.socialLinks ?? [];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left: form */}
          <FadeIn>
            <SectionHeading title="Get in Touch" />
            <ContactForm />
          </FadeIn>

          {/* Right: connect info */}
          <FadeIn>
            <div className="pt-2 space-y-10">
              {/* Email */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                  Email
                </h3>
                <a
                  href="mailto:omar@omarkamel.com"
                  className="text-brick hover:underline text-base"
                >
                  omar@omarkamel.com
                </a>
              </div>

              {/* Social links */}
              {socialLinks && socialLinks.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                    Connect
                  </h3>
                  <ul className="space-y-2">
                    {socialLinks.map((link) => (
                      <li key={link.platform}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-700 hover:text-brick transition-colors"
                        >
                          {link.platform}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                  Based in
                </h3>
                <p className="text-sm text-gray-700">Dubai, UAE</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
