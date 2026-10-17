import type { ProjectDoc, WorkDoc } from "@/lib/payload/types";
import { Credit, Fig, Head, More, Piece } from "./parts";
import {
  coverOf, credit, embedSiteName, headOf, plainText, primaryEmbed, ratioOf, sentences, srcOf, subtitleOf,
} from "@/lib/deck";

type Doc = WorkDoc | ProjectDoc;

/** The picture (or loop) of a piece, wired to its player when it has one. */
export function PieceFig({ doc, eager, href, openAudio }: { doc: Doc; eager?: boolean; href?: string; openAudio?: boolean }) {
  const cover = coverOf(doc);
  const embed = primaryEmbed(doc.media);
  /* On a piece's own page, an album or track opens on its player (tracklist and all), with no click to load it. */
  if (openAudio && !href && embed && (embed.kind === "spotify" || embed.kind === "soundcloud")) {
    return <Fig ratio={ratioOf(cover, 1)} frame={embed.src} alt={doc.title} />;
  }
  return (
    <Fig
      ratio={ratioOf(cover)}
      src={srcOf(cover)}
      alt={cover?.alt || doc.title}
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
