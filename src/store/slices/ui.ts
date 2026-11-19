import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * App-wide UI state that more than one page needs. Only one app-level modal is
 * open at a time; dialogs local to one component keep their own React state.
 */
export type AppModal = "authGate" | "upgrade" | "checkout" | "buyPack";

export interface UiState {
  openModal: AppModal | null;
  /** Phone navigation drawer. */
  mobileNavOpen: boolean;
}

const initialState: UiState = { openModal: null, mobileNavOpen: false };

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    modalOpened(state, action: PayloadAction<AppModal>) {
      state.openModal = action.payload;
      state.mobileNavOpen = false;
    },
    /** Closes the given modal, or whichever is open when called without one. */
    modalClosed(state, action: PayloadAction<AppModal | undefined>) {
      if (action.payload === undefined || state.openModal === action.payload) {
        state.openModal = null;
      }
    },
    mobileNavToggled(state, action: PayloadAction<boolean | undefined>) {
      state.mobileNavOpen = action.payload ?? !state.mobileNavOpen;
    },
  },
  selectors: {
    selectOpenModal: (state) => state.openModal,
    selectIsModalOpen: (state, modal: AppModal) => state.openModal === modal,
    selectMobileNavOpen: (state) => state.mobileNavOpen,
  },
});

export const { modalOpened, modalClosed, mobileNavToggled } = uiSlice.actions;
export const { selectOpenModal, selectIsModalOpen, selectMobileNavOpen } = uiSlice.selectors;
