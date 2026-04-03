import Link from "next/link";
import { getSiteSettings } from "@/lib/payload/queries";

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();
  const socialLinks = settings.socialLinks ?? [];

  return (
    <footer aria-label="Site footer" className="lg:ml-20 border-t border-[#1a1a1a]">
      <div className="flex items-center justify-between px-6 py-6">
        {/* Left: Copyright */}
        <p className="font-mono text-xs text-light-300">
          &copy; {currentYear} Omar Kamel
        </p>

        {/* Right: Social links as text */}
        <div className="flex items-center gap-6">
          {socialLinks.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-light-300 hover:text-light-100 link-underline transition-colors"
            >
              {social.platform}
            </a>
          ))}
          <Link
            href="/contact"
            className="font-mono text-xs text-light-300 hover:text-light-100 link-underline transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
