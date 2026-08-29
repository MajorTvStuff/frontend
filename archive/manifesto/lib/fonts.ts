import localFont from "next/font/local";

/**
 * Archivo Variable [wdth 62-125, wght 100-900] — UI, labels, and the
 * condensed display voice. Preloaded: on screen from the first paint.
 */
export const grotesk = localFont({
  src: "../fonts/archivo-var.woff2",
  display: "swap",
  preload: true,
  variable: "--font-grotesk",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

/**
 * Newsreader Variable — the manifesto's editorial serif (word-flow lines,
 * company prose, founder story). Unlike the archive build, this site's
 * intro IS serif typography, so the face must be there for the first
 * animated line: preloaded + swap, with a Times-adjusted fallback so any
 * late swap lands on matched metrics (no reflow). The intro's first line
 * appears 0.6s in, which the ~110KB preload comfortably beats on
 * broadband and most 4G.
 */
export const serif = localFont({
  src: [
    { path: "../fonts/newsreader-var.woff2", style: "normal" },
    { path: "../fonts/newsreader-var-italic.woff2", style: "italic" },
  ],
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-serif-text",
  weight: "200 800",
});
