import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Absolute URLs so Google can resolve them (F-68). Public pages only.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  return ["/", "/k12", "/higher-ed", "/pricing"].map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
