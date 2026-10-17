import type { ProjectDoc, WorkDoc } from "@/lib/payload/types";
import { RichText } from "@/components/rich-text";
import { toEmbedUrl } from "@/lib/embed-url";
import { Credit, EndSlide, Fig, Head, More, Piece, TextSlide } from "./parts";
import { ElsewhereLink, PieceFig } from "./work-piece";
import { clientLabel, coverOf, credit, headOf, plainText, ratioOf, sentences, srcOf, subtitleOf } from "@/lib/deck";

type Doc = WorkDoc | ProjectDoc;

/**
 * A single piece as a short deck: the piece, its story (when the text is long),
 * its gallery and other films (when the CMS has them), then the next piece.
 */
export function ItemDeck({ doc, seq, kind }: { doc: Doc; seq: Doc[]; kind: "work" | "studio" }) {
  const base = kind === "work" ? "/work" : "/studio";
  const { client, project } = headOf(doc);
  const text = plainText(doc.description);
  const long = text.length > 340;
  const roles = "roleCredits" in doc ? credit(doc.roleCredits) : "";
  const work = kind === "work" ? (doc as WorkDoc) : null;
  const proj = kind === "studio" ? (doc as ProjectDoc) : null;
  const year = work?.date ? new Date(work.date).getFullYear() : null;
  const gallery = (doc.gallery ?? []).filter((g): g is Exclude<typeof g, string> => typeof g === "object" && !!g && "url" in g);
  const extra = (doc.media ?? []).slice(1).map((m) => ({ src: toEmbedUrl(m.type, m.url), m })).filter((x) => x.src);
  const i = seq.findIndex((d) => d.slug === doc.slug);
  const next = seq[(i + 1) % seq.length];
  const prev = seq[(i - 1 + seq.length) % seq.length];
  const nextHead = next ? headOf(next) : null;
  /* more like this: pieces sharing the most categories, newest first among equals (not this one, not the next) */
  const cats = new Set(doc.categories ?? []);
  const related = cats.size
    ? seq
        .filter((d) => d.slug !== doc.slug && d.slug !== next?.slug)
        .map((d, k) => ({ d, k, n: (d.categories ?? []).filter((c) => cats.has(c)).length }))
        .filter((x) => x.n > 0)
        .sort((a, b) => b.n - a.n || a.k - b.k)
        .slice(0, 3)
        .map((x) => x.d)
    : [];
  const shared = related.length ? (related[0].categories ?? []).find((c) => cats.has(c)) : null;

  return (
    <>
      <Piece chapter="piece" chapterName={project ? `${client} | ${project}` : client}
        head={<Head as="h1" client={client} project={project} desc={work ? subtitleOf(work) : (proj?.categories ?? []).join(", ").toLowerCase()} />}
        figs={<PieceFig doc={doc} eager openAudio />}>
        {long ? <p className="lead">{sentences(text)[0]}</p> : doc.description ? <RichText data={doc.description} className="rich" embedTitle={doc.title} /> : null}
        <ul className="facts">
          {work?.client ? <li><span>Client</span>{work.client}</li> : null}
          {year ? <li><span>Year</span>{year}</li> : null}
          {doc.categories?.length ? <li><span>Filed under</span>{doc.categories.join(", ")}</li> : null}
        </ul>
        <Credit roles={roles} />
        <div className="links">
          {long ? <More href="#story">The story</More> : null}
          <ElsewhereLink doc={doc} />
          {work?.externalLink ? <More href={work.externalLink} external>View the project</More> : null}
          {(proj?.links ?? []).filter((l) => !(doc.media ?? []).some((m) => m.url === l.url)).map((l) => <More key={l.url} href={l.url} external>{l.label}</More>)}
        </div>
      </Piece>

      {long && (
        <TextSlide id="story" chapter="story" chapterName="The story" title="The story" width={1000}
          head={<Head client={client} project="The Story" desc={(doc.tags ?? "").toLowerCase()} />}>
          <div className="prose scroll">
            <RichText data={doc.description} className="rich" embedTitle={doc.title} />
          </div>
        </TextSlide>
      )}

      {gallery.length > 0 && (
        <Piece chapter="gallery" chapterName="Gallery" title="Gallery"
          head={<Head client={client} project="Gallery" desc={`${gallery.length} ${gallery.length === 1 ? "image" : "images"}`} />}
          figs={gallery.slice(0, 12).map((g, n) => <Fig key={g.id} ratio={ratioOf(g)} src={srcOf(g)} alt={g.alt || `${doc.title}, image ${n + 1}`} />)}>
          {gallery.length > 12 ? <p>And {gallery.length - 12} more.</p> : null}
        </Piece>
      )}

      {extra.length > 0 && (
        <Piece chapter="films" chapterName="More films" title="More films"
          head={<Head client={client} project={extra.length === 1 ? "One More" : "More Films"} desc={`${extra.length + 1} in all`} />}
          figs={extra.map(({ src, m }, n) => <Fig key={m.url} ratio={16 / 9} frame={src} alt={`${doc.title}, film ${n + 2} of ${extra.length + 1}`} />)} />
      )}

      {related.length > 0 && (
        <Piece chapter="related" chapterName="More like this" title="More like this"
          head={<Head client="More" project="Like This" desc={shared ? `more ${shared.toLowerCase()}` : undefined} />}
          figs={related.map((d) => <Fig key={d.slug} ratio={ratioOf(coverOf(d))} src={srcOf(coverOf(d), "card")} alt={d.title} href={`${base}/${d.slug}`} tag={"client" in d ? clientLabel(d.client) || undefined : undefined} />)}>
          <p>{related.map((d) => d.title).join(". ")}.</p>
          <div className="links"><More href={base}>{kind === "work" ? "All work" : "The whole studio"}</More></div>
        </Piece>
      )}

      {next && nextHead && next.slug !== doc.slug && (
        <Piece chapter="next" chapterName="Next" title={`Next: ${next.title}`}
          head={<Head client="Next" project={nextHead.project ? `${nextHead.client} | ${nextHead.project}` : nextHead.client} desc={`${kind === "work" ? "the work" : "the studio"}, ${((i + 1) % seq.length) + 1} of ${seq.length}`} />}
          figs={<Fig ratio={ratioOf(coverOf(next))} src={srcOf(coverOf(next))} alt={next.title} href={`${base}/${next.slug}`} />}>
          <p className="lead">{next.title}</p>
          {plainText(next.description) ? <p>{sentences(plainText(next.description))[0]}</p> : null}
          <div className="links"><More href={`${base}/${next.slug}`}>Next piece</More></div>
          <p className="credit"><a className="more" href={`${base}/${prev.slug}`}><span aria-hidden="true">&larr;</span> {prev.title}</a></p>
          <div className="links"><More href={base}>{kind === "work" ? "All work" : "The whole studio"}</More><More href="/">Home</More></div>
        </Piece>
      )}

      <EndSlide />
    </>
  );
}
