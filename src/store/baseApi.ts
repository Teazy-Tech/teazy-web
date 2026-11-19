import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/lib/env";
import { getAccessToken, refreshAccessToken } from "@/lib/supabase/token";
import { toApiError, type ApiError } from "./apiError";

/** Network failures and gateway errors are worth retrying; anything else is an answer. */
const RETRYABLE_STATUS = new Set<unknown>(["FETCH_ERROR", "TIMEOUT_ERROR", 502, 503, 504]);
export const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

const rawBaseQuery = fetchBaseQuery({ baseUrl: env.NEXT_PUBLIC_API_URL, timeout: 30_000 });

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Base query for every API call (README §4, "State"):
 *
 * - **Token:** attaches the Supabase access token; on a 401 it refreshes the
 *   session once and retries.
 * - **Errors:** turns the API error envelope into an `ApiError` with a `code`.
 * - **Idempotency:** every non-GET request carries an `Idempotency-Key`
 *   (the caller's, or a new one). The API requires and replays it on
 *   payment and generation POSTs (API-04), which makes the retries below
 *   safe. To make a teacher's "Try again" safe too, pass the same key again.
 * - **Retry:** network failures and 502/503/504 are retried twice with
 *   backoff, reusing the same key.
 *
 * Success bodies are returned as sent (`{ data, meta? }`), so they match the
 * types generated from `openapi.json`. Lesson streaming (SSE) doesn't go
 * through RTK Query (D4).
 */
export const teazyBaseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  const request: FetchArgs = typeof args === "string" ? { url: args } : args;
  const method = (request.method ?? "GET").toUpperCase();
  const headers = new Headers(request.headers as HeadersInit | undefined);
  if (method !== "GET" && method !== "HEAD" && !headers.has("Idempotency-Key")) {
    headers.set("Idempotency-Key", crypto.randomUUID());
  }

  let token = await getAccessToken();
  let refreshed = false;
  let retries = 0;

  for (;;) {
    const attemptHeaders = new Headers(headers);
    if (token) attemptHeaders.set("Authorization", `Bearer ${token}`);
    const result = await rawBaseQuery({ ...request, headers: attemptHeaders }, api, extraOptions);
    if (!result.error) return { data: result.data, meta: result.meta };

    if (result.error.status === 401 && token && !refreshed) {
      refreshed = true;
      token = await refreshAccessToken();
      if (token) continue;
    }
    if (RETRYABLE_STATUS.has(result.error.status) && retries < MAX_RETRIES && !api.signal.aborted) {
      retries += 1;
      await wait(RETRY_DELAY_MS * 2 ** (retries - 1));
      continue;
    }
    return { error: toApiError(result.error), meta: result.meta };
  }
};

/**
 * The one RTK Query API. `pnpm codegen` writes `src/store/generated/api.ts`,
 * which injects every endpoint from the contract into it. Features add cache
 * tags and small transforms with `api.enhanceEndpoints` in `<name>.api.ts`.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: teazyBaseQuery,
  // Teachers on patchy mobile data: refetch what is on screen when the connection returns.
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
