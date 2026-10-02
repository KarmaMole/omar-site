import { Source_Serif_4 } from "next/font/google";

/**
 * Source Serif 4 for editorial typography. Apply via `.className`; the site
 * layout does not load it, so pages without serif text never download it.
 *
 * Google serves one variable file for this family, so every page that uses
 * it shares (and preloads) the same file.
 */
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
});
