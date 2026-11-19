import { describe, expect, it } from "vitest";
import { CURRICULA_FIXTURE } from "@/test/fixtures/curricula";
import { classToLevel, findCurriculum, subjectsForClass } from "./curriculum";

describe("curriculum helpers", () => {
  it("maps class labels to school levels", () => {
    expect(classToLevel("Primary 4")).toBe("primary");
    expect(classToLevel("JSS 2")).toBe("junior");
    expect(classToLevel("SS 2")).toBe("senior");
    expect(classToLevel("SHS 1")).toBe("senior");
    expect(classToLevel("Grade 8")).toBe("junior");
    expect(classToLevel("Grade 11")).toBe("senior");
    expect(classToLevel("Year 3")).toBeNull();
  });

  it("filters subjects by class level", () => {
    const nigeria = findCurriculum(CURRICULA_FIXTURE, "nigeria-nerdc")!;
    const senior = subjectsForClass(nigeria, "SS 2").map((s) => s.id);
    expect(senior).toEqual(["mathematics", "physics", "chemistry"]);
    expect(subjectsForClass(nigeria, null)).toHaveLength(nigeria.subjects.length);
  });

  it("finds nothing for an unknown or empty id", () => {
    expect(findCurriculum(CURRICULA_FIXTURE, "atlantis")).toBeUndefined();
    expect(findCurriculum(CURRICULA_FIXTURE, null)).toBeUndefined();
  });
});
