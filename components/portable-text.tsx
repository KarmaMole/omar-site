import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-3xl mt-12 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl mt-10 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl mt-8 mb-2">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-brick pl-6 italic my-6">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="text-brick underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <figure className="my-8">
        <div className="bg-gray-100 w-full aspect-video flex items-center justify-center text-gray-400 text-sm rounded">
          {value?.alt ?? "Image"}
        </div>
        {value?.alt && (
          <figcaption className="mt-2 text-sm text-gray-500 text-center">
            {value.alt}
          </figcaption>
        )}
      </figure>
    ),
  },
};

interface PortableTextRendererProps {
  value: PortableTextBlock[];
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />;
}
