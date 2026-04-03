import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from "@payloadcms/richtext-lexical/react";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
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
      return (
        <div
          className={className ?? "prose prose-invert prose-lg max-w-none text-light-200 leading-relaxed"}
          dangerouslySetInnerHTML={{ __html: data }}
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
