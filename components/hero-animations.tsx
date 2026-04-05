"use client";

import { useEffect, useState, type ReactNode } from "react";

interface HeroAnimationsProps {
  children: ReactNode;
  animation: "fade-up" | "slide-in-right" | "fade-in";
  delay?: number;
}

const animationStyles = {
  "fade-up": {
    initial: { opacity: 0, transform: "translateY(20px)" },
    animate: { opacity: 1, transform: "translateY(0)" },
  },
  "slide-in-right": {
    initial: { opacity: 0, transform: "translateX(30px)" },
    animate: { opacity: 1, transform: "translateX(0)" },
  },
  "fade-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
};

export default function HeroAnimations({
  children,
  animation,
  delay = 0,
}: HeroAnimationsProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const styles = animationStyles[animation];

  return (
    <div
      style={{
        ...(visible ? styles.animate : styles.initial),
        // No transition on SSR/first paint to avoid flash; enable after mount
        transition: mounted ? `opacity 0.8s ease-out, transform 0.8s ease-out` : "none",
      }}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
