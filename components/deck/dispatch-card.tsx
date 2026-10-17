import Link from "next/link";
import type { BlogPostDoc } from "@/lib/payload/types";
import { sourceSerif as serif } from "@/lib/fonts";
import { dispatchHref } from "@/lib/dispatch-link";
import { stripEmDashes } from "@/lib/seo-text";
import { srcOf } from "@/lib/deck";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dubai" });

/** One dispatch in a .dgrid: cover, date and topic, title, the first lines of the excerpt. */
export function DispatchCard({ post, eager }: { post: BlogPostDoc; eager?: boolean }) {
  const { href, external } = dispatchHref(post);
  const cover = typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <span className="im">{cover ? <img src={srcOf(cover, "card")} alt="" loading={eager ? "eager" : "lazy"} /> : null}</span>
      <span className="k">
        <span className="no">{post.date ? fmt(post.date) : ""}</span>
        {external && post.publicationName ? <span>on {post.publicationName} &#8599;</span> : post.categories?.[0] ? <span>{post.categories[0]}</span> : null}
      </span>
      <h3>{post.title}</h3>
      {post.excerpt ? <p className={serif.className}>{stripEmDashes(post.excerpt)}</p> : null}
    </>
  );
  return (
    <li data-cats={(post.categories ?? []).join("|")}>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
      ) : (
        <Link href={href} prefetch={false}>{inner}</Link>
      )}
    </li>
  );
}
