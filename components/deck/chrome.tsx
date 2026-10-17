"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SOCIAL } from "@/lib/deck";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/studio", label: "Studio" },
  { href: "/dispatch", label: "Dispatches" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function isCurrent(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

/** Fixed top bar, phone menu sheet and the deck bottom bar. Each page's DeckRoot drives them. */
export default function DeckChrome() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<{ id: string; name: string }[]>([]);
  const [screens, setScreens] = useState(0);
  const mark = useRef<HTMLImageElement>(null);

  // Close the menu when the route changes (state adjusted during render, not in an effect).
  const [shownPath, setShownPath] = useState(path);
  if (shownPath !== path) {
    setShownPath(path);
    setOpen(false);
  }
  useEffect(() => {
    const f = (e: Event) => setChapters((e as CustomEvent<{ id: string; name: string }[]>).detail);
    const g = (e: Event) => setScreens((e as CustomEvent<number>).detail);
    addEventListener("deck:chapters", f);
    addEventListener("deck:screens", g);
    return () => { removeEventListener("deck:chapters", f); removeEventListener("deck:screens", g); };
  }, []);
  /* the mark makes one full turn over the length of each page, as in the Split. Slow on purpose. */
  useEffect(() => {
    const img = mark.current;
    if (!img || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const turn = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      img.style.transform = `rotate(${((max > 0 ? scrollY / max : 0) * 360).toFixed(2)}deg)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(turn); };
    turn();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    document.querySelector<HTMLElement>("#sheet a")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    /* the Menu button disappears at 900px and up, so a sheet left open on a rotated tablet closes itself */
    const wide = matchMedia("(min-width: 900px)");
    const onWide = () => { if (wide.matches) setOpen(false); };
    addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => { removeEventListener("keydown", onKey); wide.removeEventListener("change", onWide); };
  }, [open]);

  return (
    <>
      <header className="top">
        <Link className="brand" href="/" prefetch={false}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={mark} src="/brand/mark.svg" alt="" width={22} height={22} />
          <span>Omar Kamel</span>
        </Link>
        <nav aria-label="Site">
          <ul className="site">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} prefetch={false} aria-current={isCurrent(path, n.href) ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="sheet" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </header>
      <div className="sheet" id="sheet" hidden={!open}>
        <nav aria-label="Menu">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} prefetch={false} aria-current={isCurrent(path, n.href) ? "page" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
        {screens > 1 ? (
          <button type="button" className="screens-btn" onClick={() => { setOpen(false); requestAnimationFrame(() => dispatchEvent(new Event("deck:overview"))); }}>
            All screens <span>{String(screens).padStart(2, "0")}</span>
          </button>
        ) : null}
        {chapters.length > 1 ? (
          <div>
            <span className="kick">On this page</span>
            <div className="chaps">
              {chapters.map((c) => (
                <a key={c.id} href={`#${c.id}`} onClick={() => setOpen(false)}>{c.name}</a>
              ))}
            </div>
          </div>
        ) : null}
        <div className="sheet-foot">
          <span>Based in Dubai, UAE</span>
          <div>
            {SOCIAL.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="foot-bar">
        <div className="prog"><span className="chap">&nbsp;</span></div>
        <button type="button" className="counter" aria-label="Show all screens" aria-haspopup="dialog" />
      </div>
    </>
  );
}
