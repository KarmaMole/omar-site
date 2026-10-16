/**
 * Server-rendered building blocks of the Deck. deck-runtime.tsx sizes every .fig
 * to its native ratio inside its .stage, plays loops, and swaps in players.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { SOCIAL, logoFor } from "@/lib/deck";

type FigProps = {
  ratio: number;
  src?: string;
  alt?: string;
  /** Silent loop that plays while the screen is on */
  loop?: { src: string; poster: string } | null;
  /** YouTube / Vimeo / Spotify player that replaces the picture on request */
  embed?: { src: string; label: string } | null;
  href?: string;
  tag?: string;
  eager?: boolean;
  /** A player shown straight away (extra videos of a piece) */
  frame?: string;
};

export function Fig({ ratio, src, alt = "", loop, embed, href, tag, eager, frame }: FigProps) {
  return (
    <div className={`fig${frame ? " embedded" : ""}`} style={{ ["--r" as string]: ratio.toFixed(4) }} data-embed={embed?.src} data-loop={loop?.src}>
      {frame ? (
        <iframe src={frame} title={alt || "Player"} loading="lazy" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
      ) : loop ? (
        <video muted loop playsInline preload="none" poster={loop.poster} aria-label={alt} />
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} {...(eager ? { fetchPriority: "high" as const } : {})} />
      ) : null}
      {tag ? <span className="tag">{tag}</span> : null}
      {href ? <Link className="cover-link" href={href} aria-label={alt} prefetch={false} /> : null}
      {embed ? (
        <button type="button" className="watch">
          <span>{loop ? "Watch with sound" : embed.label}</span>
        </button>
      ) : null}
    </div>
  );
}

export function Head({ client, project, desc, as = "h2" }: { client: string; project?: string; desc?: string; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <header className="head">
      <span className="no" data-no />
      <H>
        <b>{client}</b>
        {project ? (
          <>
            <span className="bar">|</span>
            {project}
          </>
        ) : null}
      </H>
      {desc ? <p className="desc">{desc}</p> : null}
    </header>
  );
}

type SlideProps = { chapter: string; chapterName: string; id?: string; title?: string; thumb?: string };
const slideAttrs = ({ chapter, chapterName, id, title, thumb }: SlideProps) => ({
  id,
  "data-chapter": chapter,
  "data-chapter-name": chapterName,
  ...(title ? { "data-title": title } : {}),
  ...(thumb ? { "data-thumb": thumb } : {}),
});

export function Piece(props: SlideProps & { head: ReactNode; figs: ReactNode; children?: ReactNode }) {
  return (
    <section className="slide piece" {...slideAttrs(props)}>
      {props.head}
      <div className="stage">{props.figs}</div>
      <div className="aside">{props.children}</div>
    </section>
  );
}

export function TextSlide(props: SlideProps & { head: ReactNode; children: ReactNode; width?: number }) {
  return (
    <section className="slide textslide" {...slideAttrs(props)}>
      {props.head}
      <div className="body" style={props.width ? { maxWidth: props.width } : undefined}>
        {props.children}
      </div>
    </section>
  );
}

export function Divider(props: SlideProps & { light: string; bold: string; sub: string; count?: string; minor?: boolean }) {
  return (
    <section className={`slide divider${props.minor ? " minor" : ""}`} {...slideAttrs({ ...props, title: `${props.light} ${props.bold}` })}>
      <span className="no" data-no />
      <div className="center">
        <h2>
          {props.light} <b>{props.bold}</b>
        </h2>
        <p className="sub">{props.sub}</p>
      </div>
      <span className="count">{props.count}</span>
    </section>
  );
}

export function Credit({ roles }: { roles: string }) {
  if (!roles) return null;
  return (
    <p className="credit">
      <b>My Work</b>
      <span className="bar">|</span>
      <i>{roles}</i>
    </p>
  );
}

export function More({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  if (external || /^https?:/.test(href)) {
    return (
      <a className="more" href={href} target="_blank" rel="noopener noreferrer">
        {children} <span aria-hidden="true">&rarr;</span>
      </a>
    );
  }
  return (
    <Link className="more" href={href} prefetch={false}>
      {children} <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

export function EndSlide({ light = "Thank", bold = "You", chapter = "contact" }: { light?: string; bold?: string; chapter?: string }) {
  return (
    <section className="slide end" id="contact" data-chapter={chapter} data-chapter-name="Contact" data-title={`${light} ${bold}`}>
      <span />
      <div className="center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.svg" alt="" width={64} height={64} />
        <h2>
          <span>{light}</span> {bold}
        </h2>
        <p className="sub">Tell me what you&apos;re making. I&apos;ll tell you how I&apos;d make it.</p>
        <Link className="cta" href="/contact" prefetch={false}>
          Start a conversation <span aria-hidden="true">&rarr;</span>
        </Link>
        <div className="links">
          {SOCIAL.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          ))}
        </div>
      </div>
      <span className="where">omarkamel.com · Based in Dubai, UAE</span>
    </section>
  );
}

export function ClientsSlide({ names, chapter, chapterName }: { names: string[]; chapter: string; chapterName: string }) {
  return (
    <TextSlide chapter={chapter} chapterName={chapterName} title="Clients, worked with" width={1120}
      head={<Head client="Clients" project="Worked With" desc={`twenty years, three countries, ${names.length} of them`} />}>
      <div className="logos">
        {names.map((n) => {
          const l = logoFor(n);
          return (
            <div key={n} className={`logo${l ? " has-img" : ""}`} data-slug={l?.slug}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l ? <img src={l.src} alt={n} loading="lazy" /> : null}
              <span className="nm">{n}</span>
            </div>
          );
        })}
      </div>
    </TextSlide>
  );
}

/** Opening screen of a long page (archives, articles, contact). */
export function TitleSlide({ kicker, light, bold, sub, count, short }: { kicker: string; light: string; bold: string; sub: string; count?: string; short?: boolean }) {
  return (
    <section className={`slide title-slide${short ? " short" : ""}`} data-title={`${light} ${bold}`}>
      <div>
        <span className="no">{kicker}</span>
        <h1>
          {light} <b>{bold}</b>
        </h1>
        <p className="sub">{sub}</p>
        {count ? <span className="count">{count}</span> : null}
      </div>
    </section>
  );
}
