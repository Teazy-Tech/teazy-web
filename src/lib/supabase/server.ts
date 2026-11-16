import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/env";

/**
 * Supabase client for route handlers and server actions (e.g. the OAuth
 * callback). Create one per request. Auth only, like the browser client.
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const { url, publishableKey } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // proxy refreshes the session cookie instead, so this is safe to ignore.
        }
      },
    },
  });
}
