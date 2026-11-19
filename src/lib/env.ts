/**
 * Typed, validated environment variables.
 *
 * Only NEXT_PUBLIC_* values reach the browser, and Next.js inlines them only
 * when they are read as literal `process.env.NEXT_PUBLIC_X` expressions, so
 * each one is listed by name below (no dynamic access).
 *
 * Supabase values are optional here so that CI can build without secrets;
 * auth code calls `supabaseEnv()`, which fails with a clear message instead.
 *
 * Validated by hand rather than with Zod: this module is imported by the
 * store on every page, and four checks aren't worth Zod in first-load JS.
 */
export interface PublicEnv {
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}

const DEFAULTS = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1",
} as const;

const URL_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
] as const;

/** Treats empty strings (as in an untouched .env.local) as "not set". */
function blankToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function parsePublicEnv(raw: Record<string, string | undefined>): PublicEnv {
  const env: PublicEnv = {
    NEXT_PUBLIC_SITE_URL:
      blankToUndefined(raw.NEXT_PUBLIC_SITE_URL) ?? DEFAULTS.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: blankToUndefined(raw.NEXT_PUBLIC_API_URL) ?? DEFAULTS.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: blankToUndefined(raw.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: blankToUndefined(
      raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
  const problems = URL_KEYS.filter((key) => env[key] !== undefined && !isHttpUrl(env[key]!)).map(
    (key) => `  ${key}: must be an http(s) URL`,
  );
  if (problems.length > 0) {
    throw new Error(`Invalid environment variables (see .env.example):\n${problems.join("\n")}`);
  }
  return env;
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
