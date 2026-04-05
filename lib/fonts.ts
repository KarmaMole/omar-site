import { Source_Serif_4 } from "next/font/google";

/**
 * Single canonical instance of Source_Serif_4 for editorial typography.
 * Import as { sourceSerif } and apply via sourceSerif.className.
 *
 * The site layout separately instantiates Source_Serif_4 with a `variable`
 * key for the `--font-serif` CSS variable. Consumers that need the className
 * on a specific element (headings, editorial body) should use this export
 * so Next.js deduplicates the font file requests.
 */
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
});
