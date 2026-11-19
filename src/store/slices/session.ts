import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Who is signed in, as reported by Supabase Auth. Identity only: the plan,
 * usage and profile are server data and come from RTK Query (`GET /me`,
 * `GET /subscription`), never from this slice.
 */
export interface SessionUser {
  id: string;
  email: string | null;
}

export type SessionStatus = "unknown" | "signedOut" | "signedIn";

export interface SessionState {
  /** "unknown" until the auth client has reported the first session. */
  status: SessionStatus;
  user: SessionUser | null;
}

const initialState: SessionState = { status: "unknown", user: null };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<SessionUser>) {
      state.status = "signedIn";
      state.user = action.payload;
    },
    signedOut(state) {
      state.status = "signedOut";
      state.user = null;
    },
  },
  selectors: {
    selectSessionStatus: (state) => state.status,
    selectSessionUser: (state) => state.user,
    selectIsSignedIn: (state) => state.status === "signedIn",
  },
});

export const { signedIn, signedOut } = sessionSlice.actions;
export const { selectSessionStatus, selectSessionUser, selectIsSignedIn } = sessionSlice.selectors;
