"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { MediaUpload } from "@/lib/payload/types";

const GalleryLightbox = dynamic(() => import("./gallery-lightbox"), {
  ssr: false,
});

interface GalleryGridProps {
  images: MediaUpload[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {images.map((img, i) => (
          <button
            key={img.id ?? i}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-[16/10] overflow-hidden rounded-[2px] group cursor-pointer"
          >
            <Image
              src={img.sizes?.hero?.url ?? img.url}
              alt={img.alt ?? ""}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-cyan/0 group-hover:bg-cyan/5 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
