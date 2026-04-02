import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from "@payloadcms/richtext-lexical/react";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
});

interface RichTextProps {
  data: unknown;
  className?: string;
}

export function RichText({ data, className }: RichTextProps) {
  if (!data) return null;

  return (
    <div className={className ?? "prose prose-lg max-w-none text-gray-700 leading-relaxed"}>
      <PayloadRichText
        data={data}
        converters={converters}
      />
    </div>
  );
}
