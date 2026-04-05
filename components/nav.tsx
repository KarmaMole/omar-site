"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const focusable = menu.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    menu.addEventListener("keydown", trap);
    return () => menu.removeEventListener("keydown", trap);
  }, [mobileOpen]);

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
                className={`relative font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-200 [writing-mode:vertical-lr] rotate-180 px-1.5 py-2 ${
                  isActive
                    ? "text-cyan bg-cyan/5"
                    : "text-light-300 hover:text-light-100 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-cyan"
                    style={{ boxShadow: "0 0 8px rgba(0, 217, 255, 0.4)" }}
                  />
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
          ref={hamburgerRef}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-light-100 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </div>
        </button>
      </header>

      {/* Mobile Fullscreen Menu */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        inert={!mobileOpen}
        className={`lg:hidden fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-start justify-center px-12 gap-8 transition-all duration-300 ease-out ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        {navItems.map((item, i) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`text-4xl font-light tracking-tight transition-all duration-300 pl-4 -ml-4 border-l-2 ${
                isActive ? "text-cyan border-cyan bg-cyan/5" : "text-light-100 hover:text-cyan border-transparent"
              } ${mobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
              style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          );
        })}
        <div
          className={`mt-8 transition-all duration-300 ${
            mobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
          style={{ transitionDelay: mobileOpen ? `${navItems.length * 60}ms` : "0ms" }}
        >
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-cyan hover:text-white transition-colors"
          >
            Start a Project &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
