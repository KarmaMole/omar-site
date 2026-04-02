import Link from "next/link";
import Image from "next/image";
import TagBadge from "./tag-badge";
import type { WorkDoc } from "@/lib/payload/types";

interface WorkCardProps {
  work: WorkDoc;
}

export default function WorkCard({ work }: WorkCardProps) {
  const cover = typeof work.coverImage === "object" ? work.coverImage : null;

  return (
    <Link href={`/work/${work.slug}`} className="group block">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-sm">
        {cover?.url ? (
          <Image src={cover.sizes?.card?.url ?? cover.url} alt={cover.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">{work.title}</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
      </div>
      <div className="mt-3 space-y-1">
        {work.client && <p className="text-xs uppercase tracking-wider text-gray-500">{work.client}</p>}
        <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">{work.title}</h3>
        {work.categories && work.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {work.categories.map((category) => (<TagBadge key={category} label={category} variant="category" />))}
          </div>
        )}
      </div>
    </Link>
  );
}
