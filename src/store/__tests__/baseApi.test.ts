import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, refreshAccessToken } from "@/lib/supabase/token";
import { baseApi, MAX_RETRIES, teazyBaseQuery } from "../baseApi";
import { makeStore } from "../makeStore";

vi.mock("@/lib/supabase/token", () => ({
  getAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
}));

const fetchMock = vi.fn<(request: Request) => Promise<Response>>();

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function queryApi(): BaseQueryApi {
  return {
    signal: new AbortController().signal,
    abort: vi.fn(),
    dispatch: vi.fn(),
    getState: vi.fn(),
    extra: undefined,
    endpoint: "test",
    type: "query",
  };
}

const sent = (call: number) => fetchMock.mock.calls[call][0];

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(getAccessToken).mockResolvedValue("token-1");
  vi.mocked(refreshAccessToken).mockResolvedValue("token-2");
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("teazyBaseQuery", () => {
  it("sends the access token and returns the body as the contract describes it", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { id: "l1" } }));
    const result = await teazyBaseQuery("/lessons/l1", queryApi(), {});

    expect(result).toMatchObject({ data: { data: { id: "l1" } } });
    expect(sent(0).url).toBe("http://localhost:4000/api/v1/lessons/l1");
    expect(sent(0).headers.get("Authorization")).toBe("Bearer token-1");
    expect(sent(0).headers.has("Idempotency-Key")).toBe(false);
  });

  it("sends no Authorization header when signed out", async () => {
    vi.mocked(getAccessToken).mockResolvedValueOnce(null);
    fetchMock.mockResolvedValueOnce(json(200, { data: [] }));
    await teazyBaseQuery("/curricula", queryApi(), {});
    expect(sent(0).headers.has("Authorization")).toBe(false);
  });

  it("adds an Idempotency-Key to mutations and keeps the caller's own key", async () => {
    fetchMock.mockImplementation(async () => json(201, { data: {} }));
    await teazyBaseQuery({ url: "/quizzes", method: "POST", body: {} }, queryApi(), {});
    await teazyBaseQuery(
      { url: "/checkouts", method: "POST", body: {}, headers: { "Idempotency-Key": "retry-me" } },
      queryApi(),
      {},
    );
    expect(sent(0).headers.get("Idempotency-Key")).toMatch(/^[0-9a-f-]{36}$/);
    expect(sent(1).headers.get("Idempotency-Key")).toBe("retry-me");
  });

  it("refreshes the session once on 401 and retries with the new token", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { error: { code: "UNAUTHENTICATED" } }))
      .mockResolvedValueOnce(json(200, { data: { ok: true } }));
    const result = await teazyBaseQuery("/me", queryApi(), {});

    expect(result.error).toBeUndefined();
    expect(refreshAccessToken).toHaveBeenCalledOnce();
    expect(sent(1).headers.get("Authorization")).toBe("Bearer token-2");
  });

  it("gives up after one refresh, returning UNAUTHENTICATED", async () => {
    fetchMock.mockImplementation(async () => json(401, { error: { code: "UNAUTHENTICATED" } }));
    const result = await teazyBaseQuery("/me", queryApi(), {});
    expect(result.error).toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("doesn't retry a 401 when the session can't be refreshed", async () => {
    vi.mocked(refreshAccessToken).mockResolvedValueOnce(null);
    fetchMock.mockImplementation(async () => json(401, { error: { code: "UNAUTHENTICATED" } }));
    await teazyBaseQuery("/me", queryApi(), {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries gateway errors with the same Idempotency-Key, then reports the error", async () => {
    fetchMock.mockImplementation(async () =>
      json(503, { error: { code: "PROVIDER_UNAVAILABLE" } }),
    );
    const result = await teazyBaseQuery({ url: "/lessons", method: "POST" }, queryApi(), {});

    expect(fetchMock).toHaveBeenCalledTimes(1 + MAX_RETRIES);
    const keys = fetchMock.mock.calls.map(([request]) => request.headers.get("Idempotency-Key"));
    expect(new Set(keys).size).toBe(1);
    expect(result.error).toMatchObject({ status: 503, code: "PROVIDER_UNAVAILABLE" });
  });

  it("retries network failures and reports NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await teazyBaseQuery("/workspace", queryApi(), {});
    expect(fetchMock).toHaveBeenCalledTimes(1 + MAX_RETRIES);
    expect(result.error).toMatchObject({ status: null, code: "NETWORK_ERROR" });
  });

  it("returns answers like 400 at once, with the envelope's code, message and details", async () => {
    fetchMock.mockResolvedValueOnce(
      json(400, {
        error: {
          code: "VALIDATION_FAILED",
          message: "Check the highlighted fields.",
          details: { topic: "Enter a topic" },
          requestId: "req-9",
        },
      }),
    );
    const result = await teazyBaseQuery({ url: "/lessons", method: "POST" }, queryApi(), {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error).toEqual({
      status: 400,
      code: "VALIDATION_FAILED",
      message: "Check the highlighted fields.",
      details: { topic: "Enter a topic" },
      requestId: "req-9",
    });
  });
});

describe("store wiring", () => {
  it("serves generated endpoints from the store's api cache", async () => {
    const api = baseApi.injectEndpoints({
      endpoints: (build) => ({
        getHealth: build.query<{ data: { status: string } }, void>({ query: () => "/health" }),
      }),
    });
    fetchMock.mockResolvedValueOnce(json(200, { data: { status: "ok" } }));
    const store = makeStore();

    const result = await store.dispatch(api.endpoints.getHealth.initiate());
    expect(result.data).toEqual({ data: { status: "ok" } });
    expect(api.endpoints.getHealth.select()(store.getState()).status).toBe("fulfilled");
  });
});
