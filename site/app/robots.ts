import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// written once at build time — a static export (public_html) requires it
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
