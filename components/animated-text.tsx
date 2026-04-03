"use client";

import { useState, useEffect } from "react";

const WORDS = [
  "AI Creative Director",
  "Filmmaker",
  "Creative Technologist",
  "Music Producer",
  "Photographer",
];

interface AnimatedTextProps {
  words?: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedText({
  words = WORDS,
  interval = 3000,
  className = "",
}: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setFlash(true);
        setIsVisible(true);
        setTimeout(() => setFlash(false), 300);
      }, 400);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={`inline-block font-mono text-sm tracking-widest uppercase transition-all duration-[400ms] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${flash ? "text-cyan" : "text-light-300"} ${className}`}
    >
      {words[currentIndex]}
    </span>
  );
}
