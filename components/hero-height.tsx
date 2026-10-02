"use client";

import { useEffect } from "react";

export default function HeroHeight() {
  useEffect(() => {
    // Lock the hero to the viewport height as a CSS variable. This prevents
    // the hero from resizing when the mobile URL bar collapses on scroll
    // (that only changes the height, never the width), while still
    // re-measuring when the width changes or the device rotates.
    const root = document.documentElement;
    let lastWidth = window.innerWidth;
    let orientationTimer: ReturnType<typeof setTimeout> | undefined;

    const apply = () => {
      lastWidth = window.innerWidth;
      root.style.setProperty("--hero-h", `${window.innerHeight}px`);
    };

    const onResize = () => {
      if (window.innerWidth !== lastWidth) apply();
    };

    // Dimensions can lag the event on some browsers, so measure after it settles.
    const onOrientationChange = () => {
      clearTimeout(orientationTimer);
      orientationTimer = setTimeout(apply, 250);
    };

    apply();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);
    return () => {
      clearTimeout(orientationTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  return null;
}
