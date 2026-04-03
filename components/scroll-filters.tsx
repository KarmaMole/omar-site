"use client";

import { useRef, useState, useEffect } from "react";

export default function ScrollFilters({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function check() {
      if (!el) return;
      setShowFade(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0 scrollbar-hide"
      >
        {children}
      </div>
      {showFade && (
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none md:hidden" />
      )}
    </div>
  );
}
