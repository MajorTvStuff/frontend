import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// written once at build time — a static export (public_html) requires it
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
