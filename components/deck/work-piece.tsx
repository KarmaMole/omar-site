import type { ProjectDoc, WorkDoc } from "@/lib/payload/types";
import { Credit, Fig, Head, More, Piece } from "./parts";
import {
  coverOf, credit, embedSiteName, headOf, loopFor, plainText, primaryEmbed, ratioOf, sentences, srcOf, subtitleOf,
} from "@/lib/deck";

type Doc = WorkDoc | ProjectDoc;

/** The picture (or loop) of a piece, wired to its player when it has one. */
export function PieceFig({ doc, eager, href }: { doc: Doc; eager?: boolean; href?: string }) {
  const cover = coverOf(doc);
  const embed = primaryEmbed(doc.media);
  const loop = loopFor(doc.slug);
  return (
    <Fig
      ratio={loop ? 16 / 9 : ratioOf(cover)}
      src={srcOf(cover)}
      alt={cover?.alt || doc.title}
      loop={loop}
      embed={href ? null : embed}
      href={href}
      eager={eager}
    />
  );
}

/**
 * One piece as a screen: CLIENT | PROJECT, the work at its own ratio, and beside it
 * the first lines of the description, the "My Work" credit and a link through.
 */
export function WorkPiece({
  doc, chapter, chapterName, kind, sentencesShown = 2, eager, link = true,
}: {
  doc: Doc; chapter: string; chapterName: string; kind: "work" | "studio"; sentencesShown?: number; eager?: boolean; link?: boolean;
}) {
  const { client, project } = headOf(doc);
  const text = sentences(plainText(doc.description));
  const lead = text.slice(0, 1).join(" ");
  const rest = text.slice(1, sentencesShown).join(" ");
  const roles = "roleCredits" in doc ? credit(doc.roleCredits) : "";
  const href = kind === "work" ? `/work/${doc.slug}` : `/studio/${doc.slug}`;
  return (
    <Piece
      chapter={chapter}
      chapterName={chapterName}
      head={<Head client={client} project={project} desc={subtitleOf(doc as WorkDoc)} />}
      figs={<PieceFig doc={doc} eager={eager} />}
    >
      {lead ? <p className={rest ? "lead" : undefined}>{lead}</p> : null}
      {rest ? <p>{rest}</p> : null}
      <Credit roles={roles} />
      {link ? (
        <div className="links">
          <More href={href}>Open the project</More>
        </div>
      ) : null}
    </Piece>
  );
}

/** Links to the item on its player's own site (YouTube, Vimeo, Spotify). */
export function ElsewhereLink({ doc }: { doc: Doc }) {
  const e = primaryEmbed(doc.media);
  if (!e) return null;
  return <More href={e.href} external>{e.kind === "spotify" ? "Listen on Spotify" : `Watch on ${embedSiteName(e.kind)}`}</More>;
}
