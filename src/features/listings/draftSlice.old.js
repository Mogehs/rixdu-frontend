import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Save draft to localStorage and Redux
export const saveDraft = createAsyncThunk(
  "draft/saveDraft",
  async (draftData, { rejectWithValue }) => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem("listingDraft", JSON.stringify(draftData));
      return draftData;
    } catch (error) {
      console.error("Error saving draft:", error);
      return rejectWithValue({ message: "Failed to save draft" });
    }
  }
);

// Load draft from localStorage
export const loadDraft = createAsyncThunk(
  "draft/loadDraft",
  async (_, { rejectWithValue }) => {
    try {
      const draftData = localStorage.getItem("listingDraft");
      if (draftData) {
        return JSON.parse(draftData);
      }
      return null;
    } catch (error) {
      console.error("Error loading draft:", error);
      return rejectWithValue({ message: "Failed to load draft" });
    }
  }
);

// Clear draft from localStorage and Redux
export const clearDraft = createAsyncThunk(
  "draft/clearDraft",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("listingDraft");
      return null;
    } catch (error) {
      console.error("Error clearing draft:", error);
      return rejectWithValue({ message: "Failed to clear draft" });
    }
  }
);

// Initial state
const initialState = {
  draftData: null,
  loading: false,
  error: null,
  isDraftSaved: false,
};

// Draft slice
const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateDraftField: (state, action) => {
      const { field, value } = action.payload;
      if (state.draftData) {
        state.draftData[field] = value;
      }
    },
    setDraftSaved: (state, action) => {
      state.isDraftSaved = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save draft
      .addCase(saveDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.draftData = action.payload;
        state.isDraftSaved = true;
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to save draft";
      })

      // Load draft
      .addCase(loadDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.draftData = action.payload;
        state.isDraftSaved = !!action.payload;
      })
      .addCase(loadDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load draft";
      })

      // Clear draft
      .addCase(clearDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearDraft.fulfilled, (state) => {
        state.loading = false;
        state.draftData = null;
        state.isDraftSaved = false;
      })
      .addCase(clearDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to clear draft";
      });
  },
});

// Export actions
export const { clearError, updateDraftField, setDraftSaved } = draftSlice.actions;

// Export selectors
export const selectDraftData = (state) => state.draft.draftData;
export const selectDraftLoading = (state) => state.draft.loading;
export const selectDraftError = (state) => state.draft.error;
export const selectIsDraftSaved = (state) => state.draft.isDraftSaved;

// Export reducer
export default draftSlice.reducer;
