import Link from "next/link";
import Image from "next/image";
import type { WorkDoc } from "@/lib/payload/types";

interface WorkCardProps {
  work: WorkDoc;
}

export default function WorkCard({ work }: WorkCardProps) {
  const cover = typeof work.coverImage === "object" ? work.coverImage : null;

  return (
    <Link
      href={`/work/${work.slug}`}
      className="group block rounded-[2px] bg-[#141414] border border-[#1a1a1a] hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.08)] transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-[2px]">
        {cover?.url ? (
          <Image
            src={cover.sizes?.card?.url ?? cover.url}
            alt={cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-light-300 text-sm font-light px-4 text-center bg-[#111]">
            {work.title}
          </div>
        )}
        {/* Dark overlay + categories on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4">
          <div className="flex flex-wrap gap-1.5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {work.categories && work.categories.length > 0 ? (
              work.categories.map((cat) => (
                <span
                  key={cat}
                  className="font-mono text-[10px] tracking-widest uppercase text-cyan bg-black/50 px-2 py-0.5 border border-cyan/20"
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="text-white/70 text-sm font-light flex items-center gap-1">
                View <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 space-y-1">
        {work.client && (
          <p className="font-mono text-[10px] tracking-widest uppercase text-cyan">
            {work.client}
          </p>
        )}
        <h3 className="text-lg font-light text-light-100">{work.title}</h3>
      </div>
    </Link>
  );
}
