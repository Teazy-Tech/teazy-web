import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/env";

/**
 * Supabase client for the browser. Auth only: sign-in, sign-up, password
 * reset, Google OAuth and reading the access token for API calls. Never query
 * tables with it; all data goes through teazy-api.
 */
export function getBrowserSupabase(): SupabaseClient {
  const { url, publishableKey } = supabaseEnv();
  // createBrowserClient returns the same instance on every call in the browser.
  return createBrowserClient(url, publishableKey);
}
