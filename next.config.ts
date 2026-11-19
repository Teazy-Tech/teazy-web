import type { NextConfig } from "next";

/**
 * Legacy (Vite app) URLs → new routes, so bookmarks and links shared on
 * WhatsApp keep working after the cut-over. Temporary (307) until the
 * rollback window closes (OPS-06); then they can become permanent.
 */
const LEGACY_REDIRECTS: [source: string, destination: string][] = [
  ["/app", "/lessons"],
  ["/app/quiz", "/quizzes"],
  ["/quiz", "/quizzes"],
  ["/app/worksheet", "/worksheets"],
  ["/app/slides", "/slides"],
  ["/app/video", "/videos"],
  ["/app/higher-ed/slides", "/slides?for=higher-ed"],
  ["/app/higher-ed/rubric", "/rubrics?for=higher-ed"],
  ["/app/writing", "/assessment"],
  ["/writing", "/assessment"],
  ["/app/marker", "/assessment"],
  ["/marker", "/assessment"],
  ["/app/writing/bulk", "/assessment/bulk"],
  ["/app/writing/batches", "/assessment/batches"],
  ["/app/writing/batches/:id", "/assessment/batches/:id"],
  ["/app/workspace", "/workspace"],
  ["/dashboard/usage", "/account"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /auth?mode=signup opened sign-in in legacy (F-33); send it to sign-up.
      {
        source: "/auth",
        has: [{ type: "query", key: "mode", value: "signup" }],
        destination: "/sign-up",
        permanent: false,
      },
      { source: "/auth", destination: "/sign-in", permanent: false },
      ...LEGACY_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: false,
      })),
    ];
  },
  // All project docs live in README.md; don't let `next dev` create AGENTS.md.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
