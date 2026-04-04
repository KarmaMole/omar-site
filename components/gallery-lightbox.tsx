"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { MediaUpload } from "@/lib/payload/types";

interface GalleryLightboxProps {
  images: MediaUpload[];
  initialIndex: number;
  onClose: () => void;
}

export default function GalleryLightbox({
  images,
  initialIndex,
  onClose,
}: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = images[index];
  const total = images.length;

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus container for keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Preload adjacent images
  useEffect(() => {
    const preload = (i: number) => {
      if (i >= 0 && i < total) {
        const img = images[i];
        const src = img.sizes?.hero?.url ?? img.url;
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
        return link;
      }
      return null;
    };
    const prev = preload(index - 1);
    const next = preload(index + 1);
    return () => {
      prev?.remove();
      next?.remove();
    };
  }, [index, images, total]);

  const goTo = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= total) return;
      setFading(true);
      setTimeout(() => {
        setIndex(newIndex);
        setFading(false);
      }, 150);
    },
    [total]
  );

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    },
    [close, goTo, index]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDelta.current > 60) goTo(index - 1);
    else if (touchDelta.current < -60) goTo(index + 1);
    touchDelta.current = 0;
  };

  const imgSrc = current.sizes?.hero?.url ?? current.url;

  const lightbox = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`fixed inset-0 z-[9990] flex flex-col items-center justify-center outline-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-sm"
        onClick={close}
      />

      {/* Close button */}
      <button
        onClick={close}
        aria-label="Close gallery"
        className="absolute top-6 right-6 z-10 font-mono text-[10px] tracking-widest uppercase text-light-300 hover:text-cyan transition-colors p-2"
      >
        Close
      </button>

      {/* Navigation arrows (desktop) */}
      {index > 0 && (
        <button
          onClick={() => goTo(index - 1)}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 text-light-300/50 hover:text-cyan transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 text-light-300/50 hover:text-cyan transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="relative z-10 flex items-center justify-center w-full h-full px-4 md:px-16 py-16"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`relative max-w-[90vw] max-h-[85vh] md:max-w-[85vw] transition-opacity duration-150 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={imgSrc}
            alt={current.alt ?? ""}
            width={current.width ?? 1200}
            height={current.height ?? 800}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Counter + Caption */}
      <div className="absolute bottom-6 left-0 right-0 z-10 text-center">
        <span className="font-mono text-[10px] tracking-widest uppercase text-light-300/60">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        {current.alt && (
          <p className="font-mono text-[11px] text-light-300/40 mt-1">
            {current.alt}
          </p>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(lightbox, document.body);
}
