import { NextResponse, type NextRequest } from "next/server";
import { authRedirect } from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before every page request: refreshes the Supabase session cookie and
 * redirects signed-out visitors away from personal pages (see lib/auth/routes).
 * Tool pages stay open; they gate the action with the auth-gate modal instead.
 */
export async function proxy(request: NextRequest) {
  const { response, signedIn } = await updateSession(request);
  const target = authRedirect(request.nextUrl.pathname, request.nextUrl.search, signedIn);
  if (!target) return response;

  const redirect = NextResponse.redirect(new URL(target, request.url));
  // Keep any refreshed session cookies on the redirect.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export const config = {
  matcher: [
    // Everything except static assets, image optimisation and files with an extension.
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
