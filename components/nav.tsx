import Link from "next/link";
import MobileNav from "./mobile-nav";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Services", href: "/services", comingSoon: true },
];

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <Link href="/" className="font-serif text-xl font-bold tracking-tight">
          Omar Kamel
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.comingSoon ? (
                <span className="text-sm tracking-wide text-gray-400 flex items-center gap-1.5 cursor-default">
                  {item.label}
                  <span className="inline-block bg-brick/10 text-brick text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded font-sans">
                    Soon
                  </span>
                </span>
              ) : (
                <Link href={item.href} className="text-sm tracking-wide link-underline">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Nav */}
        <MobileNav items={navItems} />
      </nav>
    </header>
  );
}
