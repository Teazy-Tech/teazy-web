import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/env";

/**
 * Refreshes the Supabase session cookie on each request and reports whether a
 * teacher is signed in. Used only by `src/proxy.ts`.
 *
 * `getClaims()` verifies the JWT, so a forged cookie doesn't count as signed
 * in. This is still only an optimistic check for routing; the API verifies the
 * token again on every request.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; signedIn: boolean }> {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return { response, signedIn: false };

  const { url, publishableKey } = supabaseEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  try {
    const { data } = await supabase.auth.getClaims();
    return { response, signedIn: Boolean(data?.claims?.sub) };
  } catch {
    // Auth server unreachable: treat as signed out rather than failing the page.
    return { response, signedIn: false };
  }
}
