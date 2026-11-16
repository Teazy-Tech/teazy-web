import type { Curriculum } from "@/lib/curriculum";

/**
 * Small, hand-written curricula for tests. The real lists come from
 * `GET /curricula` (API-06). These cover the cases the UI must handle:
 * "Class" vs "Grade" wording, level-specific subjects, and a curriculum
 * with a single class (WAEC).
 */
export const CURRICULA_FIXTURE: Curriculum[] = [
  {
    id: "nigeria-nerdc",
    label: "Nigeria (NERDC)",
    country: "Nigeria",
    classTerm: "Class",
    classes: ["Primary 1", "Primary 6", "JSS 1", "JSS 3", "SS 1", "SS 2", "SS 3"],
    subjects: [
      { id: "mathematics", label: "Mathematics" },
      { id: "basic-science", label: "Basic Science", levels: ["primary", "junior"] },
      { id: "physics", label: "Physics", levels: ["senior"] },
      { id: "chemistry", label: "Chemistry", levels: ["senior"] },
    ],
  },
  {
    id: "waec",
    label: "WAEC",
    country: "Nigeria / West Africa",
    classTerm: "Class",
    classes: ["SS 3"],
    subjects: [
      { id: "physics", label: "Physics", levels: ["senior"] },
      { id: "chemistry", label: "Chemistry", levels: ["senior"] },
    ],
  },
  {
    id: "kenya-cbc",
    label: "Kenya CBC",
    country: "Kenya",
    classTerm: "Grade",
    classes: ["Grade 1", "Grade 6", "Grade 7", "Grade 9", "Grade 10", "Grade 12"],
    subjects: [
      { id: "mathematics", label: "Mathematics" },
      { id: "kiswahili", label: "Kiswahili" },
    ],
  },
  {
    id: "ghana",
    label: "Ghana Curriculum",
    country: "Ghana",
    classTerm: "Class",
    classes: ["Primary 1", "JHS 1", "SHS 1", "SHS 3"],
    subjects: [
      { id: "mathematics", label: "Mathematics" },
      { id: "science", label: "Science" },
    ],
  },
];
