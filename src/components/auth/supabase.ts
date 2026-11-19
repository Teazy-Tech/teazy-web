import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { getBrowserSupabase } from "@/lib/supabase/client";

export const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up in this environment yet (Supabase keys are missing from .env.local).";

/** The browser auth client, or null when this environment has no Supabase keys. */
export function authClient(): SupabaseClient | null {
  return isSupabaseConfigured() ? getBrowserSupabase() : null;
}

/** Absolute URL of the OAuth / email-link callback, continuing to `next`. */
export function callbackUrl(next: string): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
