import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    /* /image-led is a review variant kept for comparison, not a page of the
       site — it carries robots:noindex too, but a crawler should not spend
       a request finding that out */
    rules: { userAgent: "*", allow: "/", disallow: "/image-led" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
