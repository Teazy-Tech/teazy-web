import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * An action the teacher started while signed out (e.g. "Generate lesson"),
 * kept so it can resume after sign-in with the values they typed. Replaces the
 * legacy sessionStorage `teazy_pending_action` helper.
 *
 * It is mirrored to sessionStorage (see `pendingAction.storage.ts`) because a
 * Google sign-in leaves the page and the Redux store is lost on the redirect.
 * `values` must therefore be plain JSON: no `File` objects. Uploads are
 * re-selected after sign-in.
 */
export type GateFeature =
  | "lesson"
  | "quiz"
  | "worksheet"
  | "slides"
  | "rubric"
  | "simplifier"
  | "assessment"
  | "workspace"
  | "download";

export interface PendingAction {
  feature: GateFeature;
  /** Pathname (with query) to return to after sign-in. */
  path: string;
  /** Re-submit the form automatically once restored. */
  autoSubmit: boolean;
  values: Record<string, unknown>;
  /** Epoch ms; actions older than PENDING_ACTION_TTL_MS are dropped. */
  createdAt: number;
}

export const PENDING_ACTION_TTL_MS = 15 * 60 * 1000;

export interface PendingActionState {
  action: PendingAction | null;
}

const initialState: PendingActionState = { action: null };

export function isPendingActionFresh(action: PendingAction, now: number): boolean {
  return now - action.createdAt <= PENDING_ACTION_TTL_MS && now >= action.createdAt - 60_000;
}

export const pendingActionSlice = createSlice({
  name: "pendingAction",
  initialState,
  reducers: {
    pendingActionSaved: {
      reducer(state, action: PayloadAction<PendingAction>) {
        state.action = action.payload;
      },
      prepare(input: Omit<PendingAction, "createdAt" | "autoSubmit"> & { autoSubmit?: boolean }) {
        return {
          payload: { ...input, autoSubmit: input.autoSubmit ?? false, createdAt: Date.now() },
        };
      },
    },
    /** Puts back an action read from sessionStorage after a full-page redirect. */
    pendingActionRestored(state, action: PayloadAction<PendingAction | null>) {
      state.action = action.payload;
    },
    /** The action was replayed (or abandoned); forget it. */
    pendingActionCleared(state) {
      state.action = null;
    },
  },
  selectors: {
    selectPendingAction: (state) => state.action,
  },
});

export const { pendingActionSaved, pendingActionRestored, pendingActionCleared } =
  pendingActionSlice.actions;
export const { selectPendingAction } = pendingActionSlice.selectors;

/** The pending action for `feature`, if one exists and has not expired. */
export function pendingActionFor(
  action: PendingAction | null,
  feature: GateFeature,
  now: number,
): PendingAction | null {
  if (!action || action.feature !== feature || !isPendingActionFresh(action, now)) return null;
  return action;
}
