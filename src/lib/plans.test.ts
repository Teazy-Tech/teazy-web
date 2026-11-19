import { describe, expect, it } from "vitest";
import { currencyFromLocales, PLANS, planById } from "./plans";

describe("plans", () => {
  it("uses one plan vocabulary", () => {
    expect(PLANS.map((p) => p.name)).toEqual(["Free", "Teazy AI Pro", "Assessment Pro"]);
    expect(planById("pro").name).toBe("Assessment Pro");
  });

  it("prices every plan in naira, cedi and shilling", () => {
    for (const plan of PLANS) {
      expect(Object.keys(plan.price).sort()).toEqual(["GHS", "KES", "NGN"]);
    }
  });

  it.each([
    [["en-KE"], "KES"],
    [["sw"], "KES"],
    [["en-GH"], "GHS"],
    [["en-NG"], "NGN"],
    [["en-GB", "en-GH"], "GHS"],
    [["fr-FR"], "NGN"],
    [[], "NGN"],
  ] as const)("picks the currency for %j", (locales, expected) => {
    expect(currencyFromLocales(locales)).toBe(expected);
  });
});
