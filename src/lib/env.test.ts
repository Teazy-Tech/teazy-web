import { describe, expect, it } from "vitest";
import { isSupabaseConfigured, parsePublicEnv, supabaseEnv } from "./env";

describe("parsePublicEnv", () => {
  it("applies local defaults when nothing is set", () => {
    const env = parsePublicEnv({});
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_API_URL).toBe("http://localhost:4000/api/v1");
    expect(isSupabaseConfigured(env)).toBe(false);
  });

  it("treats blank values as unset", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "  " });
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeUndefined();
  });

  it("rejects a malformed URL with the variable name in the message", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_API_URL: "not a url" })).toThrow(
      /NEXT_PUBLIC_API_URL/,
    );
  });
});

describe("supabaseEnv", () => {
  it("throws a setup hint when keys are missing", () => {
    expect(() => supabaseEnv(parsePublicEnv({}))).toThrow(/\.env\.local/);
  });

  it("returns the configured values", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    });
    expect(supabaseEnv(env)).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });
});
