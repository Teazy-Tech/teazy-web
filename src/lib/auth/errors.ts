/**
 * Teacher-friendly messages for Supabase Auth errors, chosen by error code.
 * Raw provider messages are never shown (frontend finding F-22).
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "That email and password don't match. Check them and try again.",
  email_not_confirmed: "Please confirm your email first. We sent you a link when you signed up.",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  email_exists: "An account with this email already exists. Sign in instead.",
  weak_password: "Choose a stronger password that meets every rule below.",
  same_password: "Your new password must be different from your old one.",
  over_request_rate_limit: "Too many attempts. Please wait a minute and try again.",
  over_email_send_rate_limit:
    "We've sent several emails already. Please wait a few minutes and try again.",
  signup_disabled: "New sign-ups are paused right now. Please try again later.",
  email_address_invalid: "Enter a valid email address.",
  session_not_found: "Your reset link has expired. Request a new one.",
  flow_state_expired: "That link has expired. Please request a new one.",
};

const NETWORK = "We couldn't reach Teazy. Check your internet connection and try again.";
const FALLBACK = "Something went wrong. Please try again.";

export function authErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) return FALLBACK;
  const e = error as { code?: unknown; status?: unknown; name?: unknown };
  if (typeof e.code === "string" && MESSAGES[e.code]) return MESSAGES[e.code];
  if (e.name === "AuthRetryableFetchError" || e.status === 0 || error instanceof TypeError)
    return NETWORK;
  return FALLBACK;
}
