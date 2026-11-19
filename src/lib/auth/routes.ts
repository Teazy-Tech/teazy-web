/**
 * Which routes need a signed-in teacher, and where to send people.
 *
 * Tool pages (lessons, quizzes, worksheets, assessment, ...) stay open to
 * signed-out visitors: they can fill in a form, and the auth-gate modal opens
 * only when they press Generate, then resumes the action after sign-in (the
 * legacy behaviour). Only personal pages redirect to sign-in.
 */
export const PROTECTED_PREFIXES = ["/dashboard", "/workspace", "/account", "/admin"] as const;

/** Sign-in/up pages; signed-in teachers skip straight to `next`. */
export const AUTH_ONLY_FOR_SIGNED_OUT = ["/sign-in", "/sign-up"] as const;

/** Where a teacher lands after signing in with no `next`. */
export const DEFAULT_SIGNED_IN_PATH = "/dashboard";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => matchesPrefix(pathname, p));
}

/**
 * A same-site path to continue to after sign-in. Anything else (absolute
 * URLs, protocol-relative `//evil.example`, backslash tricks) falls back to
 * the default, so `?next=` can never become an open redirect.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = DEFAULT_SIGNED_IN_PATH,
): string {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return fallback;
  }
  if (AUTH_ONLY_FOR_SIGNED_OUT.some((p) => matchesPrefix(value.split(/[?#]/)[0], p)))
    return fallback;
  return value;
}

/** The redirect the proxy should issue, or null to let the request through. */
export function authRedirect(pathname: string, search: string, signedIn: boolean): string | null {
  if (!signedIn && isProtectedPath(pathname)) {
    return `/sign-in?next=${encodeURIComponent(pathname + search)}`;
  }
  if (signedIn && AUTH_ONLY_FOR_SIGNED_OUT.some((p) => matchesPrefix(pathname, p))) {
    return safeNextPath(new URLSearchParams(search).get("next"));
  }
  return null;
}
