import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  draftData: null,
  isLoading: false,
  error: null,
  isDraftSaved: false,
};

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    // Save draft to Redux state only (no localStorage)
    saveDraft: (state, action) => {
      state.draftData = action.payload;
      state.isDraftSaved = true;
      state.error = null;
      console.log("Draft saved to Redux state:", action.payload);
    },

    // Load draft from Redux state
    loadDraft: (state) => {
      // Just return the current state - no async needed
      return state;
    },

    // Clear draft from Redux state
    clearDraft: (state) => {
      state.draftData = null;
      state.isDraftSaved = false;
      state.error = null;
      console.log("Draft cleared from Redux state");
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { saveDraft, loadDraft, clearDraft, setError, clearError } = draftSlice.actions;

// Selectors
export const selectDraftData = (state) => state.draft.draftData;
export const selectDraftLoading = (state) => state.draft.isLoading;
export const selectDraftError = (state) => state.draft.error;
export const selectIsDraftSaved = (state) => state.draft.isDraftSaved;

export default draftSlice.reducer;
