import { describe, expect, it } from "vitest";
import { authRedirect, DEFAULT_SIGNED_IN_PATH, isProtectedPath, safeNextPath } from "./routes";

describe("isProtectedPath", () => {
  it("protects personal pages only", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/workspace/items")).toBe(true);
    expect(isProtectedPath("/account")).toBe(true);
    expect(isProtectedPath("/lessons")).toBe(false);
    expect(isProtectedPath("/dashboards-are-public")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/lessons?topic=x", "/lessons?topic=x"],
    ["%2Fworkspace", "/workspace"],
    [null, DEFAULT_SIGNED_IN_PATH],
    ["https://evil.example", DEFAULT_SIGNED_IN_PATH],
    ["//evil.example", DEFAULT_SIGNED_IN_PATH],
    ["%2F%2Fevil.example", DEFAULT_SIGNED_IN_PATH],
    ["/\\evil.example", DEFAULT_SIGNED_IN_PATH],
    ["javascript:alert(1)", DEFAULT_SIGNED_IN_PATH],
    ["/sign-in?next=/x", DEFAULT_SIGNED_IN_PATH],
  ])("%s -> %s", (raw, expected) => {
    expect(safeNextPath(raw)).toBe(expected);
  });
});

describe("authRedirect", () => {
  it("sends signed-out visitors on personal pages to sign-in with next", () => {
    expect(authRedirect("/workspace", "?kind=quiz", false)).toBe(
      "/sign-in?next=%2Fworkspace%3Fkind%3Dquiz",
    );
  });

  it("lets signed-out visitors use tool pages", () => {
    expect(authRedirect("/lessons", "", false)).toBeNull();
  });

  it("sends signed-in teachers away from sign-in to a safe next", () => {
    expect(authRedirect("/sign-in", "?next=%2Fquizzes", true)).toBe("/quizzes");
    expect(authRedirect("/sign-up", "?next=https://evil.example", true)).toBe(
      DEFAULT_SIGNED_IN_PATH,
    );
  });
});
