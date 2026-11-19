import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Error codes from the API's catalogue (teazy-api `core/errors.ts`, README
 * "API conventions"), plus two produced here: NETWORK_ERROR (no response)
 * and UNKNOWN (a response that isn't the error envelope).
 */
export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "PROVIDER_UNAVAILABLE"
  | "UNREADABLE_UPLOAD"
  | "PAYMENT_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN"
  // Codes added to the catalogue later still type-check; handle them by name.
  | (string & {});

/** What every RTK Query hook returns as `error`. Branch on `code`, never on `message`. */
export interface ApiError {
  status: number | null;
  code: ApiErrorCode;
  /** The API's teacher-facing message, when it sent one. */
  message: string | null;
  /** Field errors for VALIDATION_FAILED, quota numbers for QUOTA_EXCEEDED, ... */
  details?: Record<string, unknown>;
  requestId?: string;
}

interface ErrorEnvelope {
  error: { code: string; message?: string; details?: Record<string, unknown>; requestId?: string };
}

function isEnvelope(body: unknown): body is ErrorEnvelope {
  if (typeof body !== "object" || body === null || !("error" in body)) return false;
  const error = (body as { error: unknown }).error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

/** Turns a fetchBaseQuery failure into an ApiError. */
export function toApiError(error: FetchBaseQueryError): ApiError {
  if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    return { status: null, code: "NETWORK_ERROR", message: null };
  }
  if (error.status === "PARSING_ERROR") {
    return { status: error.originalStatus, code: "UNKNOWN", message: null };
  }
  if (error.status === "CUSTOM_ERROR") {
    return { status: null, code: "UNKNOWN", message: null };
  }
  if (isEnvelope(error.data)) {
    const { code, message, details, requestId } = error.data.error;
    return { status: error.status, code, message: message ?? null, details, requestId };
  }
  return { status: error.status, code: "UNKNOWN", message: null };
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "code" in value && "status" in value;
}

/**
 * Codes the frontend words itself. For the rest, the API's message is
 * written for teachers by its errorHandler (internals are never sent), e.g.
 * "You've used all 10 lesson notes this month."
 */
const MESSAGES: Partial<Record<string, string>> = {
  NETWORK_ERROR: "We couldn't reach Teazy. Check your internet connection and try again.",
  UNAUTHENTICATED: "Please sign in again to continue.",
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "We couldn't find that. It may have been deleted.",
  RATE_LIMITED: "That was a lot of requests at once. Please wait a moment and try again.",
  PROVIDER_UNAVAILABLE: "The AI service is busy right now. Please try again in a minute.",
};

const FALLBACK = "Something went wrong. Please try again.";

/** The message to show a teacher for any error from an API hook. */
export function apiErrorMessage(error: unknown): string {
  if (!isApiError(error)) return FALLBACK;
  return MESSAGES[error.code] ?? error.message ?? FALLBACK;
}
