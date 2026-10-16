import Link from "next/link";
import type { MediaUpload } from "@/lib/payload/types";
import { pad, ratioOf, srcOf } from "@/lib/deck";

export type CardItem = {
  key: string;
  href: string;
  cover: MediaUpload | null;
  client: string;
  title: string;
  sub: string;
  cats: string[];
};

/** The shared filter: "Filter shown / total", one row, zero-padded counts. deck-root.tsx wires it. */
export function Filter({ total, options }: { total: number; options: { value: string; count: number }[] }) {
  return (
    <div className="filter" data-filter role="group" aria-label="Filter">
      <span className="lbl">
        Filter<span><span data-shown>{pad(total)}</span> / {pad(total)}</span>
      </span>
      <button type="button" data-val="all" aria-pressed="true">
        All<sup>{pad(total)}</sup>
      </button>
      {options.filter((o) => o.count > 0).map((o) => (
        <button key={o.value} type="button" data-val={o.value} aria-pressed="false">
          {o.value}<sup>{pad(o.count)}</sup>
        </button>
      ))}
    </div>
  );
}

/** A chapter of thumbnails at their own ratio (justified into rows by deck-root.tsx). */
export function Group({ title, sub, count, items, start }: { title: string; sub?: string; count: number; items: CardItem[]; start: number }) {
  return (
    <section className="yr" data-group>
      <header>
        <h2>{title}</h2>
        <span className="count">{pad(count)} {count === 1 ? "piece" : "pieces"}</span>
        {sub ? <span className="sub">{sub}</span> : null}
      </header>
      <div className="sorter">
        {items.map((it, i) => (
          <Link key={it.key} className="card" href={it.href} prefetch={false} style={{ ["--r" as string]: ratioOf(it.cover).toFixed(4) }} data-cats={it.cats.join("|")}>
            <span className="im">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.cover ? <img src={srcOf(it.cover, "card")} alt="" loading={start + i < 6 ? "eager" : "lazy"} /> : null}
            </span>
            <span className="cap">
              <span className="no">{pad(start + i + 1)}</span>
              <h3>
                {it.client ? (
                  <>
                    <b>{it.client}</b>
                    <span className="bar">|</span>
                    <wbr />
                    {it.title}
                  </>
                ) : (
                  <b>{it.title}</b>
                )}
              </h3>
              <p>{it.sub}</p>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
