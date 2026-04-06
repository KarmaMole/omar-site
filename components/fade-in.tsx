"use client";

import { useEffect, useRef, useState } from "react";

// Shared IntersectionObserver singleton for all FadeIn instances
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, () => void>();

function getObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cb = callbacks.get(entry.target);
          if (cb) {
            cb();
            callbacks.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.1 }
  );
  return sharedObserver;
}

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in milliseconds before the transition starts (useful for staggering) */
  delay?: number;
}

export default function FadeIn({ children, className = "", delay }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  // If the user prefers reduced motion, start visible and skip the observer.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = getObserver();
    callbacks.set(element, () => setVisible(true));
    observer.observe(element);

    return () => {
      callbacks.delete(element);
      observer.unobserve(element);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-spring-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${className}`}
      style={delay ? { transitionDelay: visible ? `${delay}ms` : "0ms" } : undefined}
    >
      {children}
    </div>
  );
}
