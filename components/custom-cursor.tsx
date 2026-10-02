"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Elements that should light up the cursor ring. */
const INTERACTIVE = "a, button, [role='button'], input[type='submit']";
/** Elements where the native cursor (text caret, iframe pointer) must stay. */
const NATIVE =
  "input:not([type='submit']):not([type='button']):not([type='reset']):not([type='checkbox']):not([type='radio']), textarea, select, [contenteditable]:not([contenteditable='false']), iframe";

/** Hide the native cursor everywhere except where the user needs it. */
const CURSOR_CSS = `
body, a, button, [role='button'], label { cursor: none !important; }
${NATIVE} { cursor: auto !important; }
`;

function CursorLayer() {
  const circleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const resetHoverRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    const mouse = { x: -100, y: -100 };
    const circle = { x: -100, y: -100 };
    let hovering = false;
    let inWindow = false;
    let overNative = false;
    let shown = false;
    let hasPosition = false;
    let raf = 0;

    const style = document.createElement("style");
    style.textContent = CURSOR_CSS;
    document.head.appendChild(style);

    const syncVisible = () => {
      const v = inWindow && !overNative;
      if (v === shown) return;
      shown = v;
      const opacity = v ? "1" : "0";
      if (circleRef.current) circleRef.current.style.opacity = opacity;
      if (dotRef.current) dotRef.current.style.opacity = opacity;
    };

    const placeCircle = () => {
      if (!circleRef.current) return;
      const offset = hovering ? 24 : 12;
      circleRef.current.style.transform = `translate(${circle.x - offset}px, ${circle.y - offset}px)`;
    };

    const setHovering = (h: boolean) => {
      if (hovering === h) return;
      hovering = h;
      if (circleRef.current) {
        const size = h ? 48 : 24;
        circleRef.current.style.width = `${size}px`;
        circleRef.current.style.height = `${size}px`;
        circleRef.current.style.borderColor = h
          ? "rgba(0, 217, 255, 1)"
          : "rgba(0, 217, 255, 0.5)";
      }
      placeCircle();
    };

    // Ease the ring toward the pointer; stop looping once it has caught up.
    const tick = () => {
      const dx = mouse.x - circle.x;
      const dy = mouse.y - circle.y;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        circle.x = mouse.x;
        circle.y = mouse.y;
        placeCircle();
        raf = 0;
        return;
      }
      circle.x += dx * 0.15;
      circle.y += dy * 0.15;
      placeCircle();
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!hasPosition) {
        // First sighting: appear in place instead of flying in from the corner.
        hasPosition = true;
        circle.x = mouse.x;
        circle.y = mouse.y;
        placeCircle();
      }
      inWindow = true;
      syncVisible();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
      }
      kick();
    };

    // One delegated listener pair replaces per-element binding.
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const target = e.target instanceof Element ? e.target : null;
      inWindow = true;
      overNative = Boolean(target?.closest(NATIVE));
      setHovering(Boolean(target?.closest(INTERACTIVE)));
      syncVisible();
      kick();
    };

    const onOut = (e: PointerEvent) => {
      // relatedTarget is null when the pointer leaves the window.
      if (e.relatedTarget === null) {
        inWindow = false;
        overNative = false;
        setHovering(false);
        syncVisible();
      }
    };

    resetHoverRef.current = () => {
      setHovering(false);
      overNative = false;
      syncVisible();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      if (raf) cancelAnimationFrame(raf);
      style.remove();
      resetHoverRef.current = () => {};
    };
  }, []);

  // The element under the pointer is replaced on navigation without a
  // pointerout, so clear the hover ring when the route changes.
  useEffect(() => {
    resetHoverRef.current();
  }, [pathname]);

  return (
    <>
      {/* Circle outline, smoothly follows */}
      <div
        ref={circleRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border transition-[width,height,border-color,opacity] duration-200"
        style={{
          width: 24,
          height: 24,
          borderColor: "rgba(0, 217, 255, 0.5)",
          opacity: 0,
        }}
      />
      {/* Precision dot, follows the pointer exactly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-cyan"
        style={{
          width: 4,
          height: 4,
          opacity: 0,
        }}
      />
    </>
  );
}

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  // Only for fine pointers (mouse, trackpad) and only when motion is welcome.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return enabled ? <CursorLayer /> : null;
}
