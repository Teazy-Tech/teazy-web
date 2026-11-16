import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * The teacher's default curriculum, class and subjects. Pre-fills
 * `TeachingContextFields` on every tool so teachers don't re-enter them.
 *
 * It is hydrated from the profile (`GET /me`) after sign-in and saved back
 * with `PATCH /me` (API-06); signed-out visitors keep it for the session only.
 */
export interface TeachingContextState {
  curriculumId: string | null;
  classLevel: string | null;
  subjectIds: string[];
}

const initialState: TeachingContextState = { curriculumId: null, classLevel: null, subjectIds: [] };

export const teachingContextSlice = createSlice({
  name: "teachingContext",
  initialState,
  reducers: {
    /** Replaces the whole context, e.g. when the profile loads. */
    teachingContextHydrated(_state, action: PayloadAction<TeachingContextState>) {
      return {
        curriculumId: action.payload.curriculumId,
        classLevel: action.payload.classLevel,
        subjectIds: [...new Set(action.payload.subjectIds)],
      };
    },
    /** Changing curriculum clears class and subjects: class lists differ per curriculum. */
    curriculumChosen(state, action: PayloadAction<string | null>) {
      if (state.curriculumId === action.payload) return;
      state.curriculumId = action.payload;
      state.classLevel = null;
      state.subjectIds = [];
    },
    classChosen(state, action: PayloadAction<string | null>) {
      state.classLevel = action.payload;
    },
    subjectsChosen(state, action: PayloadAction<string[]>) {
      state.subjectIds = [...new Set(action.payload)];
    },
    teachingContextCleared() {
      return initialState;
    },
  },
  selectors: {
    selectTeachingContext: (state) => state,
    selectCurriculumId: (state) => state.curriculumId,
    selectClassLevel: (state) => state.classLevel,
    selectSubjectIds: (state) => state.subjectIds,
  },
});

export const {
  teachingContextHydrated,
  curriculumChosen,
  classChosen,
  subjectsChosen,
  teachingContextCleared,
} = teachingContextSlice.actions;
export const { selectTeachingContext, selectCurriculumId, selectClassLevel, selectSubjectIds } =
  teachingContextSlice.selectors;
