import { describe, expect, it } from "vitest";
import { apiErrorMessage, toApiError } from "./apiError";

describe("toApiError", () => {
  it("reads the API's error envelope", () => {
    expect(
      toApiError({
        status: 429,
        data: { error: { code: "QUOTA_EXCEEDED", message: "You've used all 10 lesson notes." } },
      }),
    ).toMatchObject({
      status: 429,
      code: "QUOTA_EXCEEDED",
      message: "You've used all 10 lesson notes.",
    });
  });

  it("maps anything else to NETWORK_ERROR or UNKNOWN, never to raw text", () => {
    expect(toApiError({ status: "FETCH_ERROR", error: "TypeError: x" }).code).toBe("NETWORK_ERROR");
    expect(toApiError({ status: "TIMEOUT_ERROR", error: "timeout" }).code).toBe("NETWORK_ERROR");
    expect(
      toApiError({ status: "PARSING_ERROR", originalStatus: 502, data: "<html>", error: "x" }),
    ).toMatchObject({ status: 502, code: "UNKNOWN", message: null });
    expect(toApiError({ status: 500, data: { message: "stack trace" } })).toMatchObject({
      code: "UNKNOWN",
      message: null,
    });
  });
});

describe("apiErrorMessage", () => {
  it("words transport and auth errors on the frontend", () => {
    expect(apiErrorMessage({ status: null, code: "NETWORK_ERROR", message: null })).toMatch(
      /internet connection/,
    );
    expect(apiErrorMessage({ status: 401, code: "UNAUTHENTICATED", message: "jwt expired" })).toBe(
      "Please sign in again to continue.",
    );
  });

  it("uses the API's teacher-facing message for business errors", () => {
    expect(
      apiErrorMessage({
        status: 429,
        code: "QUOTA_EXCEEDED",
        message: "You've used all 10 lesson notes this month.",
      }),
    ).toBe("You've used all 10 lesson notes this month.");
  });

  it("falls back to a generic message", () => {
    expect(apiErrorMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
    expect(apiErrorMessage({ status: 500, code: "UNKNOWN", message: null })).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
