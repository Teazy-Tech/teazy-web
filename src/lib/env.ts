import { z } from "zod";

/**
 * Typed, validated environment variables.
 *
 * Only NEXT_PUBLIC_* values reach the browser, and Next.js inlines them only
 * when they are read as literal `process.env.NEXT_PUBLIC_X` expressions, so
 * each one is listed by name below (no dynamic access).
 *
 * Supabase values are optional here so that CI can build without secrets;
 * auth code calls `supabaseEnv()`, which fails with a clear message instead.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000/api/v1"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/** Treats empty strings (as in an untouched .env.local) as "not set". */
function blankToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

export function parsePublicEnv(raw: Record<string, string | undefined>): PublicEnv {
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, blankToUndefined(value)]),
  );
  const result = publicEnvSchema.safeParse(cleaned);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables (see .env.example):\n${problems}`);
  }
  return result.data;
}

export const env: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

/** Supabase settings for the auth clients. Throws if they are not configured. */
export function supabaseEnv(source: PublicEnv = env): { url: string; publishableKey: string } {
  const url = source.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (values in the team password manager).",
    );
  }
  return { url, publishableKey };
}

/** True when Supabase keys are present (lets UI show a setup notice instead of crashing). */
export function isSupabaseConfigured(source: PublicEnv = env): boolean {
  return Boolean(source.NEXT_PUBLIC_SUPABASE_URL && source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
