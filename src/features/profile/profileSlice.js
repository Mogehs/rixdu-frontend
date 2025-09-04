import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { profileService } from "../../services/api/profileService";

// Add debouncing and request tracking
let activeRequest = null;
const DEBOUNCE_TIME = 2000; // 2 seconds

// Get complete profile with request deduplication
export const getCompleteProfile = createAsyncThunk(
  "profile/getCompleteProfile",
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { forceRefresh = false } = options;
      const state = getState().profile;
      const now = Date.now();

      // If force refresh is requested, bypass all caching and proceed directly to API call
      if (forceRefresh) {
        activeRequest = null; // Clear any existing request

        const response = await profileService.getCompleteProfile();

        return response.data;
      }

      // Prevent duplicate requests (only if not force refreshing)
      if (activeRequest) {
        return activeRequest;
      }

      // Debounce requests - prevent requests within 2 seconds of each other (only if not force refreshing)
      if (state.lastFetchTime && now - state.lastFetchTime < DEBOUNCE_TIME) {
        return state.profileData;
      }

      // If already loading, return current data to prevent loops (only if not force refreshing)
      if (state.loading) {
        return state.profileData;
      }

      // Create and track the request
      activeRequest = profileService
        .getCompleteProfile()
        .then((response) => {
          activeRequest = null;
          return response.data;
        })
        .catch((error) => {
          activeRequest = null;
          throw error;
        });

      const result = await activeRequest;
      return result;
    } catch (error) {
      console.error("❌ Profile API error:", error);
      activeRequest = null;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile data."
      );
    }
  }
);

// Update personal profile and refetch complete data
export const updatePersonalProfile = createAsyncThunk(
  "profile/updatePersonalProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // Make sure visa status is included
      const enhancedProfileData = {
        ...profileData,
        visaStatus:
          profileData.visaStatus !== undefined ? profileData.visaStatus : "",
      };

      await profileService.updatePersonalProfile(enhancedProfileData);

      // After successful update, fetch the complete profile to get updated data
      const completeProfile = await profileService.getCompleteProfile();

      // Check if visa status is in the response

      return completeProfile.data;
    } catch (error) {
      console.error("❌ Personal profile update error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile."
      );
    }
  }
);

// Update job profile and refetch complete data
export const updateJobProfile = createAsyncThunk(
  "profile/updateJobProfile",
  async (jobData, { rejectWithValue }) => {
    try {
      await profileService.updateJobProfile(jobData);
      // After successful update, fetch the complete profile to get updated data
      const completeProfile = await profileService.getCompleteProfile();
      return completeProfile.data;
    } catch (error) {
      console.error("❌ Job profile update error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update job profile."
      );
    }
  }
);

// Upload resume
export const uploadResume = createAsyncThunk(
  "profile/uploadResume",
  async (resumeFile, { rejectWithValue }) => {
    try {
      if (!resumeFile) {
        return rejectWithValue(
          "No file selected. Please select a resume file."
        );
      }

      // Validate file size (5MB max)
      if (resumeFile.size > 5 * 1024 * 1024) {
        return rejectWithValue(
          "File size exceeds 5MB limit. Please upload a smaller file."
        );
      }

      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(resumeFile.type)) {
        console.warn(
          `Invalid file type: ${
            resumeFile.type
          }. Expected one of: ${validTypes.join(", ")}`
        );
        // Still proceed as mime types can be inconsistent
      }

      const response = await profileService.uploadResume(resumeFile);

      // After successful upload, fetch the complete profile to get updated data
      const completeProfile = await profileService.getCompleteProfile();
      return completeProfile.data;
    } catch (error) {
      console.error("❌ Resume upload error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to upload resume. Please try again."
      );
    }
  }
);

// Favorites management
export const addToFavorites = createAsyncThunk(
  "profile/addToFavorites",
  async (listingId, { rejectWithValue }) => {
    try {
      await profileService.addToFavorites(listingId);
      return listingId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to favorites."
      );
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  "profile/removeFromFavorites",
  async (listingId, { rejectWithValue }) => {
    try {
      await profileService.removeFromFavorites(listingId);
      return listingId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from favorites."
      );
    }
  }
);

export const getUserFavorites = createAsyncThunk(
  "profile/getUserFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getUserFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch favorites."
      );
    }
  }
);

const initialState = {
  // Complete profile data from backend
  profileData: null,

  // Derived data for easy access
  user: null, // user info (name, email, phone, etc.)
  personal: null, // personal profile data
  jobProfile: null, // job profile data
  public: null, // public profile data
  favorites: null, // favorites data

  // Loading states
  loading: false,
  updateLoading: false,
  uploadLoading: false,

  // Error states
  error: null,
  updateError: null,
  uploadError: null,

  // Success flags
  updateSuccess: false,
  uploadSuccess: false,

  // Cache management
  lastFetchTime: 0,
  isInitialized: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.uploadError = null;
    },
    clearSuccessFlags: (state) => {
      state.updateSuccess = false;
      state.uploadSuccess = false;
    },
    resetProfile: () => {
      // Reset active request when profile is reset
      activeRequest = null;
      return { ...initialState };
    },
    // Add action to manually set initialized state
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    // Action to clear profile state on logout
    clearProfileOnLogout: () => {
      activeRequest = null;
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get complete profile
      .addCase(getCompleteProfile.pending, (state) => {
        // Only set loading if not already loading to prevent state thrashing
        if (!state.loading) {
          state.loading = true;
          state.error = null;
        }
      })
      .addCase(getCompleteProfile.fulfilled, (state, action) => {
        state.loading = false;

        // Only update if we have actual data
        if (action.payload) {
          state.profileData = action.payload;

          // Extract and organize data for easy access
          state.user = action.payload.user || null;
          state.personal = action.payload.personal || null;
          state.jobProfile = action.payload.jobProfile || null;
          state.public = action.payload.public || null;
          state.favorites = action.payload.favorites || null;

          state.lastFetchTime = Date.now();
          state.isInitialized = true;
        }

        state.error = null;
      })
      .addCase(getCompleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't reset isInitialized on error, keep the existing state
      })

      // Update personal profile
      .addCase(updatePersonalProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updatePersonalProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;

        // Update the complete profile data
        if (action.payload) {
          state.profileData = action.payload;
          state.user = action.payload.user || null;
          state.personal = action.payload.personal || null;
          state.jobProfile = action.payload.jobProfile || null;
          state.public = action.payload.public || null;
          state.favorites = action.payload.favorites || null;
          state.lastFetchTime = Date.now();
        }

        state.updateError = null;
      })
      .addCase(updatePersonalProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update job profile
      .addCase(updateJobProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateJobProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;

        // Update the complete profile data
        if (action.payload) {
          state.profileData = action.payload;
          state.user = action.payload.user || null;
          state.personal = action.payload.personal || null;
          state.jobProfile = action.payload.jobProfile || null;
          state.public = action.payload.public || null;
          state.favorites = action.payload.favorites || null;
          state.lastFetchTime = Date.now();
        }

        state.updateError = null;
      })
      .addCase(updateJobProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Upload resume
      .addCase(uploadResume.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;

        // Update the complete profile data
        if (action.payload) {
          state.profileData = action.payload;
          state.user = action.payload.user || null;
          state.personal = action.payload.personal || null;
          state.jobProfile = action.payload.jobProfile || null;
          state.public = action.payload.public || null;
          state.favorites = action.payload.favorites || null;
          state.lastFetchTime = Date.now();
        }

        state.uploadError = null;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
        state.uploadSuccess = false;
      })

      // Get user favorites
      .addCase(getUserFavorites.fulfilled, (state, action) => {
        if (action.payload) {
          state.favorites = action.payload;
        }
      });
  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  resetProfile,
  setInitialized,
  clearProfileOnLogout,
} = profileSlice.actions;

// Selectors
export const selectProfile = (state) => state.profile;
export const selectProfileData = (state) => state.profile.profileData;
export const selectUser = (state) => state.profile.user;
export const selectPersonalProfile = (state) => state.profile.personal;
export const selectJobProfile = (state) => state.profile.jobProfile;
export const selectPublicProfile = (state) => state.profile.public;
export const selectFavorites = (state) => state.profile.favorites;

export default profileSlice.reducer;
