import path from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  /**
   * `next dev` and `next build` must never share an output directory: a
   * build run while the dev server is up has its pages swept out from under
   * it ("Cannot find module for page: /privacy"), and one that lands on top
   * of dev's output leaves a half-production, half-development tree that
   * answers every request with a 500.
   *
   * So the DEV SERVER is the one that moves, to `.next-dev`, and every build
   * keeps Next's own `.next`. It has to be this way round: a static export
   * (NEXT_OUTPUT=export) always builds in `.next` — given another distDir,
   * Next takes it for the export's destination and builds in `.next` anyway
   * (hasCustomExportOutput) — so `.next` can never be the dev server's.
   * NEXT_DIST_DIR still overrides, as the deploy script does (.next-deploy).
   */
  distDir:
    process.env.NEXT_DIST_DIR ||
    (phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next"),
  /**
   * THE HOSTING BUILD. `NEXT_OUTPUT=standalone` produces a self-contained
   * server — its own server.js and only the node_modules it actually uses —
   * which is what a GoDaddy / cPanel "Setup Node.js App" runs. Everyday dev
   * and build leave it unset. See scripts/package-deploy.py.
   *
   * The tracing root is pinned to this folder: left to guess, Next walks up
   * looking for a lockfile and can nest the server a directory deeper.
   */
  /*
   * THE STATIC BUILD. `NEXT_OUTPUT=export` writes the whole site as plain
   * files into out/ — index.html, privacy/index.html, terms/index.html and
   * the assets — for hosting that serves files and runs nothing: cPanel's
   * public_html. Every page here is static, so nothing is lost. Each page
   * gets a folder of its own (trailingSlash), so Apache answers /privacy
   * without rewrite rules. See scripts/export-static.py.
   */
  output:
    process.env.NEXT_OUTPUT === "standalone"
      ? "standalone"
      : process.env.NEXT_OUTPUT === "export"
        ? "export"
        : undefined,
  trailingSlash: process.env.NEXT_OUTPUT === "export",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
    /* On shared hosting the image optimiser is a liability: it needs the
       `sharp` binary built for the host's exact Linux, and burns the CPU
       allowance resizing on demand. The source art is already web-sized
       (24 files, 4.7 MB, lazy-loaded), so the hosting build serves it as it
       is. Dev keeps the optimiser. */
    unoptimized:
      process.env.NEXT_IMAGES_UNOPTIMIZED === "1" ||
      process.env.NEXT_OUTPUT === "export",
  },
  experimental: {
    // inline the small global stylesheet: one less render-blocking round trip
    inlineCss: true,
  },
});

export default nextConfig;
