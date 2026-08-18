import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // inline the small global stylesheet: one less render-blocking round trip
    inlineCss: true,
  },
};

export default nextConfig;
