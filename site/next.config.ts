import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `next dev` and `next build` share one output directory, and neither
   * tolerates the other's leftovers: a build that lands on top of a running
   * dev server leaves a half-production, half-development `.next`, and the
   * next request dies on "Cannot find module './331.js'" — the runtime and
   * the chunks come from different builders.
   *
   * So anything that is not the everyday `npm run dev` gets its own
   * directory: NEXT_DIST_DIR=.next-verify npm run build. The dev server
   * keeps `.next` to itself.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // inline the small global stylesheet: one less render-blocking round trip
    inlineCss: true,
  },
};

export default nextConfig;
