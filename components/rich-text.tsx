import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from "@payloadcms/richtext-lexical/react";
import sanitizeHtml from "sanitize-html";
import MediaEmbedComponent from "@/components/media-embed";
import { matchEmbedUrl } from "@/lib/parse-embeds";

// Flatten a lexical node subtree to its concatenated text content.
// Walks children recursively so a link node wrapping the URL is still picked up.
function flattenText(nodes: unknown[]): string {
  let out = "";
  for (const n of nodes) {
    if (!n || typeof n !== "object") continue;
    const node = n as { text?: unknown; children?: unknown };
    if (typeof node.text === "string") out += node.text;
    if (Array.isArray(node.children)) out += flattenText(node.children);
  }
  return out;
}

const EMBED_PARAGRAPH_RE = /^\[(https?:\/\/[^\s\]]+)\]$/;

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => {
    const children = node.children ?? [];
    const flat = flattenText(children as unknown[]).trim();

    if (flat === "---") {
      return (
        <p className="text-center text-light-300 tracking-[0.5em] my-8 select-none" aria-hidden="true">
          · · ·
        </p>
      );
    }

    const embedMatch = flat.match(EMBED_PARAGRAPH_RE);
    if (embedMatch) {
      const embed = matchEmbedUrl(embedMatch[1]);
      if (embed) {
        return (
          <div className="not-prose my-8">
            <MediaEmbedComponent embed={embed} />
          </div>
        );
      }
    }

    return <p>{nodesToJSX({ nodes: children })}</p>;
  },
});

interface RichTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: SerializedEditorState | any;
  className?: string;
}

function isValidLexicalData(data: unknown): data is SerializedEditorState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!d.root || typeof d.root !== "object") return false;
  const root = d.root as Record<string, unknown>;
  return root.type === "root" && Array.isArray(root.children);
}

export function RichText({ data, className }: RichTextProps) {
  if (!data) return null;

  if (!isValidLexicalData(data)) {
    // Fallback for malformed or non-Lexical data
    if (typeof data === "string") {
      const cleanHtml = sanitizeHtml(data, {
        allowedTags: [
          "p", "h1", "h2", "h3", "h4", "h5", "h6",
          "a", "ul", "ol", "li", "strong", "em", "br", "blockquote", "img",
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
          img: ["src", "alt", "width", "height"],
        },
      });
      return (
        <div
          className={className ?? "prose prose-invert prose-lg max-w-none text-light-200 leading-relaxed"}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    }
    return null;
  }

  try {
    return (
      <div className={className ?? "prose prose-invert prose-lg max-w-none text-light-200 leading-relaxed"}>
        <PayloadRichText
          data={data}
          converters={converters}
        />
      </div>
    );
  } catch {
    return null;
  }
}
