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

export function RichText({ data, className }: RichTextProps) {
  if (!data) return null;

  return (
    <div className={className ?? "prose prose-invert prose-lg max-w-none text-light-200 leading-relaxed"}>
      <PayloadRichText
        data={data as SerializedEditorState}
        converters={converters}
      />
    </div>
  );
}
