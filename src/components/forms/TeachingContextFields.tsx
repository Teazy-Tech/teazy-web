"use client";

import { getIn, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { findCurriculum, subjectsForClass, type Curriculum } from "@/lib/curriculum";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTeachingContext, teachingContextHydrated } from "@/store/slices/teachingContext";
import { ComboboxField } from "./ComboboxField";
import { SelectField } from "./SelectField";

export interface TeachingContextFieldNames {
  curriculum: string;
  classLevel: string;
  subject: string;
}

const DEFAULT_NAMES: TeachingContextFieldNames = {
  curriculum: "curriculumId",
  classLevel: "classLevel",
  subject: "subjectId",
};

/**
 * The one curriculum → class → subject block, used unchanged by lessons,
 * quizzes, worksheets, slides, rubrics and assessment.
 *
 * - Each curriculum has exactly one class list (no "SSS 2" vs "SS 2").
 * - Subjects are filtered to the chosen curriculum and class.
 * - Empty fields are pre-filled from the teacher's `teachingContext`, and the
 *   teacher's choice is remembered for the next tool.
 * - A class or subject that doesn't belong to a newly chosen curriculum is cleared.
 *
 * `curricula` comes from `GET /curricula` (API-06) via the generated hook.
 */
export function TeachingContextFields({
  curricula,
  names: nameOverrides,
  subjectMode = "single",
  showSubject = true,
  required = true,
  rememberChoice = true,
}: {
  curricula: readonly Curriculum[];
  names?: Partial<TeachingContextFieldNames>;
  /** "multiple" stores subject ids as string[] (e.g. the profile form). */
  subjectMode?: "single" | "multiple";
  showSubject?: boolean;
  required?: boolean;
  /** Save the choice to `teachingContext` so other tools pre-fill it. */
  rememberChoice?: boolean;
}) {
  const names = { ...DEFAULT_NAMES, ...nameOverrides };
  const { values, setFieldValue } = useFormikContext();
  const saved = useAppSelector(selectTeachingContext);
  const dispatch = useAppDispatch();

  const curriculumId = (getIn(values, names.curriculum) as string | null | undefined) || null;
  const classLevel = (getIn(values, names.classLevel) as string | null | undefined) || null;
  const subjectValue = getIn(values, names.subject) as string | string[] | null | undefined;
  // A string key keeps effect dependencies stable while the array is rebuilt each render.
  const subjectKey = (
    Array.isArray(subjectValue) ? subjectValue : subjectValue ? [subjectValue] : []
  ).join("|");

  const curriculum = findCurriculum(curricula, curriculumId);
  const subjects = curriculum ? subjectsForClass(curriculum, classLevel) : [];

  // Pre-fill once from the saved teaching context, only into empty fields.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || curricula.length === 0) return;
    prefilled.current = true;
    if (curriculumId || !saved.curriculumId) return;
    const savedCurriculum = findCurriculum(curricula, saved.curriculumId);
    if (!savedCurriculum) return;
    void setFieldValue(names.curriculum, savedCurriculum.id);
    if (!classLevel && saved.classLevel && savedCurriculum.classes.includes(saved.classLevel)) {
      void setFieldValue(names.classLevel, saved.classLevel);
    }
    if (showSubject && subjectKey === "" && saved.subjectIds.length > 0) {
      const allowed = new Set(subjectsForClass(savedCurriculum, saved.classLevel).map((x) => x.id));
      const keep = saved.subjectIds.filter((id) => allowed.has(id));
      if (keep.length > 0) {
        void setFieldValue(names.subject, subjectMode === "multiple" ? keep : keep[0]);
      }
    }
  }, [
    curricula,
    curriculumId,
    classLevel,
    subjectKey,
    saved,
    setFieldValue,
    names.curriculum,
    names.classLevel,
    names.subject,
    showSubject,
    subjectMode,
  ]);

  // Keep class and subject consistent with the chosen curriculum.
  useEffect(() => {
    if (!curriculum) return;
    if (classLevel && !curriculum.classes.includes(classLevel)) {
      void setFieldValue(names.classLevel, "");
    } else if (!classLevel && curriculum.classes.length === 1) {
      void setFieldValue(names.classLevel, curriculum.classes[0]);
    }
    if (!showSubject || subjectKey === "") return;
    const current = subjectKey.split("|");
    const allowed = new Set(subjectsForClass(curriculum, classLevel).map((x) => x.id));
    const keep = current.filter((id) => allowed.has(id));
    if (keep.length !== current.length) {
      void setFieldValue(names.subject, subjectMode === "multiple" ? keep : (keep[0] ?? ""));
    }
  }, [
    curriculum,
    classLevel,
    subjectKey,
    setFieldValue,
    names.classLevel,
    names.subject,
    showSubject,
    subjectMode,
  ]);

  // Remember the choice for the next tool.
  useEffect(() => {
    if (!rememberChoice || !prefilled.current || !curriculumId) return;
    const current = subjectKey === "" ? [] : subjectKey.split("|");
    if (
      saved.curriculumId === curriculumId &&
      saved.classLevel === classLevel &&
      (!showSubject || saved.subjectIds.join("|") === subjectKey)
    ) {
      return;
    }
    dispatch(
      teachingContextHydrated({
        curriculumId,
        classLevel,
        subjectIds: showSubject ? current : saved.subjectIds,
      }),
    );
  }, [rememberChoice, curriculumId, classLevel, subjectKey, showSubject, saved, dispatch]);

  const classTerm = curriculum?.classTerm ?? "Class";

  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Curriculum, {classTerm.toLowerCase()} and subject</legend>
      <SelectField
        name={names.curriculum}
        label="Curriculum"
        required={required}
        options={curricula.map((c) => ({ value: c.id, label: c.label }))}
        placeholder="Choose a curriculum"
      />
      <SelectField
        name={names.classLevel}
        label={classTerm}
        required={required}
        disabled={!curriculum}
        description={curriculum ? undefined : "Choose a curriculum first"}
        options={(curriculum?.classes ?? []).map((c) => ({ value: c, label: c }))}
        placeholder={`Choose a ${classTerm.toLowerCase()}`}
      />
      {showSubject ? (
        <ComboboxField
          name={names.subject}
          label={subjectMode === "multiple" ? "Subjects" : "Subject"}
          required={required}
          multiple={subjectMode === "multiple"}
          disabled={!curriculum}
          options={subjects.map((s) => ({ value: s.id, label: s.label }))}
          placeholder={curriculum ? "Search subjects" : "Choose a curriculum first"}
          searchPlaceholder="Type a subject"
          emptyText="No subject found for this class."
          className="sm:col-span-2"
        />
      ) : null}
    </fieldset>
  );
}
