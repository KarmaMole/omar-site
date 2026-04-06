import Link from "next/link";
import Image from "next/image";
import { sourceSerif } from "@/lib/fonts";
import type { MediaUpload } from "@/lib/payload/types";

interface MoreItem {
  slug: string;
  title: string;
  coverImage?: MediaUpload | string | null;
  href: string;
  subtitle?: string;
  excerpt?: string | null;
}

interface MoreItemsProps {
  items: MoreItem[];
  label?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  /**
   * Layout variant. "media" (default) shows a 16:9 cover image card.
   * "text" shows a text-only card with date, serif title, and excerpt —
   * use this for blog/writing where posts typically don't have covers.
   */
  variant?: "media" | "text";
}

export default function MoreItems({ items, label = "More", viewAllHref, viewAllLabel = "View All", variant = "media" }: MoreItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className="border-t border-white/[0.07] mt-16 pt-12">
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
          if (variant === "text") {
            return (
              <Link
                key={item.slug}
                href={item.href}
                className="group block border-l border-white/[0.07] hover:border-cyan rounded-sm hover:bg-white/[0.02] transition-colors pl-5 py-1"
              >
                {item.subtitle && (
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-light-300 mb-2">
                    {item.subtitle}
                  </p>
                )}
                <h3
                  className={`${sourceSerif.className} text-lg font-light text-light-100 group-hover:text-cyan transition-colors mb-2`}
                >
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p
                    className={`${sourceSerif.className} text-sm text-light-300 line-clamp-3`}
                  >
                    {item.excerpt}
                  </p>
                )}
              </Link>
            );
          }

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
