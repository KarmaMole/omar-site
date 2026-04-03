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
  // SSR: start visible, animate on client hydration
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start hidden, then animate in after delay
    setVisible(false);
    const frame = requestAnimationFrame(() => {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(frame);
  }, [delay]);

  const styles = animationStyles[animation];

  return (
    <div
      style={{
        ...(visible ? styles.animate : styles.initial),
        transition: `opacity 0.8s ease-out, transform 0.8s ease-out`,
      }}
    >
      {children}
    </div>
  );
}
