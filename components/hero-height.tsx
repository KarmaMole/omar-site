"use client";

import { useEffect } from "react";

export default function HeroHeight() {
  useEffect(() => {
    // Capture the initial viewport height once and lock it as a CSS variable.
    // This prevents the hero from resizing when mobile browser chrome
    // collapses on scroll (Chromium bug with svh/dvh units).
    const h = window.innerHeight;
    document.documentElement.style.setProperty("--hero-h", `${h}px`);
  }, []);

  return null;
}
