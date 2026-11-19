import { isSupabaseConfigured } from "@/lib/env";

/**
 * The signed-in teacher's access token for `Authorization: Bearer` on API
 * calls. The Supabase client is imported on first use, so the store (loaded
 * on every page) doesn't carry it in first-load JavaScript.
 */
async function client() {
  if (!isSupabaseConfigured()) return null;
  const { getBrowserSupabase } = await import("./client");
  return getBrowserSupabase();
}

/** Current access token, or null when signed out (Supabase refreshes it in the background). */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Forces a refresh after the API rejected the token; null if the session is gone. */
export async function refreshAccessToken(): Promise<string | null> {
  const supabase = await client();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.refreshSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}
