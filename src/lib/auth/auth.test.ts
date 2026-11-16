import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./errors";
import { isStrongPassword, passwordChecks } from "./password";

describe("password rules", () => {
  it("matches the legacy five checks", () => {
    expect(passwordChecks("abc")).toEqual({
      length: false,
      upper: false,
      lower: true,
      number: false,
      symbol: false,
    });
    expect(isStrongPassword("Teach3r!x")).toBe(true);
    expect(isStrongPassword("Teacher123")).toBe(false);
  });
});

describe("authErrorMessage", () => {
  it("maps known codes and never leaks raw messages", () => {
    expect(
      authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" }),
    ).toMatch(/don't match/);
    expect(authErrorMessage({ code: "something_new", message: "pg error at line 4" })).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("explains network failures", () => {
    expect(authErrorMessage({ name: "AuthRetryableFetchError", status: 0 })).toMatch(
      /internet connection/,
    );
  });
});
