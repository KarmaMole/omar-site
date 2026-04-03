"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const circleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const circle = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on devices with hover capability
    const mq = window.matchMedia("(hover: hover)");
    if (!mq.matches) return;

    // Hide native cursor
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.textContent =
      "a, button, [role='button'], input, textarea, select, label { cursor: none !important; }";
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Update dot immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
      }
    };

    const onMouseEnterInteractive = () => setHovering(true);
    const onMouseLeaveInteractive = () => setHovering(false);

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Observe interactive elements for hover state
    const addListeners = () => {
      const interactives = document.querySelectorAll(
        "a, button, [role='button'], input[type='submit']"
      );
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterInteractive);
        el.addEventListener("mouseleave", onMouseLeaveInteractive);
      });
      return interactives;
    };

    let interactives = addListeners();

    // Re-observe on DOM changes (debounced to prevent listener thrashing)
    let mutationRaf: number | null = null;
    const observer = new MutationObserver(() => {
      if (mutationRaf) return;
      mutationRaf = requestAnimationFrame(() => {
        interactives.forEach((el) => {
          el.removeEventListener("mouseenter", onMouseEnterInteractive);
          el.removeEventListener("mouseleave", onMouseLeaveInteractive);
        });
        interactives = addListeners();
        mutationRaf = null;
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Smooth follow with rAF
    let raf: number;
    const animate = () => {
      const dx = mouse.current.x - circle.current.x;
      const dy = mouse.current.y - circle.current.y;
      circle.current.x += dx * 0.15;
      circle.current.y += dy * 0.15;

      if (circleRef.current) {
        const size = hovering ? 48 : 24;
        const offset = size / 2;
        circleRef.current.style.transform = `translate(${circle.current.x - offset}px, ${circle.current.y - offset}px)`;
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      document.body.style.cursor = "";
      style.remove();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
      observer.disconnect();
      if (mutationRaf) cancelAnimationFrame(mutationRaf);
      cancelAnimationFrame(raf);
    };
  }, [visible, hovering]);

  return (
    <>
      {/* Circle outline - smoothly follows */}
      <div
        ref={circleRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border transition-[width,height,border-color,opacity] duration-200"
        style={{
          width: hovering ? 48 : 24,
          height: hovering ? 48 : 24,
          borderColor: hovering
            ? "rgba(0, 217, 255, 1)"
            : "rgba(0, 217, 255, 0.5)",
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Precision dot - follows mouse exactly */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-cyan"
        style={{
          width: 4,
          height: 4,
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
