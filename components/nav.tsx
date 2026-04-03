"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/explore", label: "Explore" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-20 flex-col items-center justify-between py-8 z-50 border-r border-[#1a1a1a]" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="font-mono text-xs tracking-widest text-light-300 hover:text-cyan transition-colors [writing-mode:vertical-lr] rotate-180">
          OMAR KAMEL
        </Link>

        {/* Nav Links */}
        <div className="flex flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative font-mono text-[10px] tracking-[0.2em] uppercase transition-colors [writing-mode:vertical-lr] rotate-180 ${
                  isActive ? "text-cyan" : "text-light-300 hover:text-light-100"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-cyan" />
                )}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/contact"
          className="font-mono text-[10px] tracking-[0.15em] uppercase text-cyan hover:text-white transition-colors [writing-mode:vertical-lr] rotate-180"
        >
          Start a Project
        </Link>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
        <Link href="/" className="font-mono text-sm tracking-widest text-light-100">
          OK
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-light-100 p-2"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </div>
        </button>
      </header>

      {/* Mobile Fullscreen Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-start justify-center px-12 gap-8" onClick={() => setMobileOpen(false)}>
          {navItems.map((item, i) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-4xl font-light tracking-tight transition-colors ${
                  isActive ? "text-cyan" : "text-light-100 hover:text-cyan"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-8 pt-8 border-t border-[#1a1a1a]">
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="font-mono text-sm tracking-widest text-cyan uppercase">
              Start a Project →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
