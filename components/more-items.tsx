import Link from "next/link";
import Image from "next/image";
import type { MediaUpload } from "@/lib/payload/types";

interface MoreItem {
  slug: string;
  title: string;
  coverImage?: MediaUpload | string | null;
  href: string;
  subtitle?: string;
}

interface MoreItemsProps {
  items: MoreItem[];
  label?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function MoreItems({ items, label = "More", viewAllHref, viewAllLabel = "View All" }: MoreItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className="border-t border-dark-100 mt-16 pt-12">
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-xs tracking-[0.15em] uppercase text-light-300">{label}</span>
        {viewAllHref && (
          <Link href={viewAllHref} className="font-mono text-xs tracking-[0.15em] uppercase text-cyan hover:text-white transition-colors">
            {viewAllLabel} &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const cover = typeof item.coverImage === "object" && item.coverImage ? item.coverImage : null;
          return (
            <Link key={item.slug} href={item.href} className="group block">
              {cover?.url ? (
                <div className="relative aspect-video bg-dark-200 overflow-hidden rounded-[2px] mb-3">
                  <Image
                    src={(cover as MediaUpload).sizes?.card?.url ?? cover.url}
                    alt={(cover as MediaUpload).alt ?? item.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-dark-200 rounded-[2px] mb-3" />
              )}
              {item.subtitle && (
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-light-300 mb-1">{item.subtitle}</p>
              )}
              <h3 className="text-sm font-light text-light-100 group-hover:text-cyan transition-colors">
                {item.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
