import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/workspace", "/account", "/admin", "/auth/"],
    },
    sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
