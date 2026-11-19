import { describe, expect, it } from "vitest";
import {
  activeHref,
  ALL_TOOLS,
  ASSESS_TOOLS,
  bottomBarItems,
  navGroups,
  PERSONAL_ITEMS,
} from "./nav";

describe("nav registry", () => {
  it("gives every place a unique id and href", () => {
    const items = [...ALL_TOOLS, ...PERSONAL_ITEMS];
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length);
  });

  it("shows personal pages only to signed-in teachers (F-29)", () => {
    const labels = (signedIn: boolean) =>
      navGroups(signedIn).flatMap((g) => g.items.map((i) => i.id));
    expect(labels(false)).not.toContain("workspace");
    expect(labels(true)).toEqual(expect.arrayContaining(["dashboard", "workspace", "account"]));
    // Every tool is listed either way.
    for (const signedIn of [false, true]) {
      expect(labels(signedIn)).toEqual(expect.arrayContaining(ALL_TOOLS.map((t) => t.id)));
    }
  });

  it("keeps the bottom bar to four slots, with the workspace only when signed in", () => {
    expect(bottomBarItems(false)).toHaveLength(4);
    expect(bottomBarItems(true)).toHaveLength(4);
    expect(bottomBarItems(false).map((i) => i.id)).not.toContain("workspace");
    expect(bottomBarItems(true).map((i) => i.id)).toContain("workspace");
  });
});

describe("activeHref", () => {
  it("picks the longest matching path", () => {
    expect(activeHref("/assessment/bulk", ASSESS_TOOLS)).toBe("/assessment/bulk");
    expect(activeHref("/assessment", ASSESS_TOOLS)).toBe("/assessment");
    expect(activeHref("/assessment/batches/42", ASSESS_TOOLS)).toBe("/assessment");
  });

  it("does not match a path that only shares a prefix", () => {
    expect(activeHref("/lessons-archive", ALL_TOOLS)).toBeNull();
    expect(activeHref("/", ALL_TOOLS)).toBeNull();
  });
});
