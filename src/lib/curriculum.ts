/**
 * Curriculum types and pure helpers shared by the store and the form kit.
 *
 * The data comes from the API (`GET /curricula`, API-06), one class list per
 * curriculum. When codegen produces the API type, align `Curriculum` with it
 * here, in one place.
 */

export type SchoolLevel = "primary" | "junior" | "senior";

export interface CurriculumSubject {
  id: string;
  label: string;
  /** School levels this subject is taught at. Omitted = all levels. */
  levels?: SchoolLevel[];
}

export interface Curriculum {
  id: string;
  label: string;
  country: string;
  /** Word teachers use for a class in this curriculum: "Class", "Grade", ... */
  classTerm: string;
  /** The one canonical class list for this curriculum (e.g. "SS 2", never "SSS 2"). */
  classes: string[];
  subjects: CurriculumSubject[];
}

export function findCurriculum(curricula: readonly Curriculum[], id: string | null | undefined) {
  return id ? curricula.find((c) => c.id === id) : undefined;
}

/** Maps a class label to a broad school level (ported from legacy `classToLevel`). */
export function classToLevel(classLabel: string | null | undefined): SchoolLevel | null {
  if (!classLabel) return null;
  const c = classLabel.toLowerCase();
  if (/\bprimary\b|\bp\s?\d/.test(c)) return "primary";
  if (/\bjss\b|\bjhs\b/.test(c)) return "junior";
  if (/\bss\b|\bshs\b/.test(c)) return "senior";
  const grade = c.match(/grade\s*(\d+)/);
  if (grade) {
    const n = Number.parseInt(grade[1], 10);
    if (n <= 6) return "primary";
    if (n <= 9) return "junior";
    return "senior";
  }
  return null;
}

/** Subjects of a curriculum taught at the given class; all subjects if the class is unknown. */
export function subjectsForClass(
  curriculum: Curriculum,
  classLabel: string | null | undefined,
): CurriculumSubject[] {
  const level = classToLevel(classLabel);
  if (!level) return curriculum.subjects;
  return curriculum.subjects.filter((s) => !s.levels || s.levels.includes(level));
}
