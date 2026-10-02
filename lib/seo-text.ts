/**
 * Helpers for deriving meta descriptions from CMS content.
 * Pure functions, safe for server and client.
 */

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "listitem",
  "quote",
  "linebreak",
  "tab",
]);

function walk(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { text?: unknown; type?: unknown; children?: unknown };
  let out = "";
  if (typeof n.text === "string") out += n.text;
  if (Array.isArray(n.children)) out += n.children.map(walk).join("");
  if (typeof n.type === "string" && BLOCK_TYPES.has(n.type)) out += " ";
  return out;
}

/** Flattens a Lexical editor state to plain text. Returns "" for anything else. */
export function lexicalToPlainText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const root = (data as { root?: unknown }).root;
  if (!root) return "";
  return walk(root)
    .replace(/\[https?:\/\/[^\]\s]+\]/g, " ") // inline embed markers
    .replace(/\s+/g, " ")
    .trim();
}

/** Em-dashes are banned in site copy; swap for a comma. */
export function stripEmDashes(text: string): string {
  return text.replace(/\s*\u2014\s*/g, ", ");
}

/** Trims to at most `max` characters at a word boundary, adding an ellipsis when cut. */
export function truncateAtWord(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : clean.slice(0, max);
  return `${cut.replace(/[\s,;:.\-]+$/, "")}\u2026`;
}

/**
 * Builds a meta description: first ~155 chars of the rich text at a word
 * boundary, or `fallback` when there is no usable text.
 */
export function describeFromRichText(
  data: unknown,
  fallback: string,
  max = 155
): string {
  const text = stripEmDashes(lexicalToPlainText(data));
  return text.length >= 40 ? truncateAtWord(text, max) : stripEmDashes(fallback);
}
