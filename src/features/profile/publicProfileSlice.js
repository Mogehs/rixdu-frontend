// src/features/publicProfile/publicProfileSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import profileService from "../../services/api/profileService";
import { deleteListing } from "../listings/listingsSlice";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/profiles`;
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds
});

// Single request interceptor that handles both logging and authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("PublicProfile Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `PublicProfile API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `PublicProfile Response Error: [${error.response?.status || "Unknown"}] ${
        error.config?.url || "Unknown URL"
      }`
    );

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error("Authentication failed - token may be invalid or expired");
      // Optionally clear token and redirect to login
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Thunk to fetch another user's public profile
export const getPublicProfile = createAsyncThunk(
  "publicProfile/getPublicProfile",
  async (userId, { rejectWithValue }) => {
    try {
      let idToFetch = userId;

      // If no userId is provided, get it from localStorage
      if (!idToFetch) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          idToFetch = user?.id;
        }
      }

      // If there's still no ID, we cannot proceed
      if (!idToFetch) {
        return rejectWithValue("No user ID available to fetch profile.");
      }

      // Use profileService which should also have proper token handling
      const response = await profileService.getPublicProfile(idToFetch);

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching public profile:", error);

      // Better error handling
      let errorMessage = "Failed to fetch public profile.";

      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please login again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Profile not found.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied to this profile.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to add/remove a listing from favorites (toggle)
export const toggleFavorite = createAsyncThunk(
  "publicProfile/toggleFavorite",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/favorites", { listingId });

      return response.data;
    } catch (error) {
      console.error("❌ Error toggling favorite:", error);

      let errorMessage = "Failed to update favorites.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to get user favorites
export const getFavorites = createAsyncThunk(
  "publicProfile/getFavorites",
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId ? `/favorites/${userId}` : "/favorites";

      const response = await axiosInstance.get(url);

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching favorites:", error);

      let errorMessage = "Failed to fetch favorites.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to remove a listing from favorites directly (not toggle)
export const removeFavorite = createAsyncThunk(
  "publicProfile/removeFavorite",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/favorites/${listingId}`);

      return { ...response.data, listingId };
    } catch (error) {
      console.error("❌ Error removing favorite:", error);

      let errorMessage = "Failed to remove from favorites.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastFetchTime: 0,
  favorites: {
    data: [],
    loading: false,
    error: null,
    lastAction: null,
  },
};

const publicProfileSlice = createSlice({
  name: "publicProfile",
  initialState,
  reducers: {
    clearPublicProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.lastFetchTime = 0;
    },
    clearFavorites: (state) => {
      state.favorites = {
        data: [],
        loading: false,
        error: null,
        lastAction: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // getPublicProfile cases
      .addCase(getPublicProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetchTime = Date.now();
      })
      .addCase(getPublicProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // toggleFavorite cases
      .addCase(toggleFavorite.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.lastAction = {
          type: action.payload.status, // 'added' or 'removed'
          listingId: action.payload.listingId,
          timestamp: Date.now(),
        };

        // Update favorites list accordingly
        if (action.payload.status === "added") {
          // Add to favorites if not already there
          const alreadyExists = state.favorites.data.some(
            (item) =>
              item.toString() === action.payload.listingId ||
              item._id === action.payload.listingId
          );

          if (!alreadyExists) {
            state.favorites.data.push(action.payload.listingId);
          }
        } else if (action.payload.status === "removed") {
          // Remove from favorites
          state.favorites.data = state.favorites.data.filter(
            (item) =>
              item.toString() !== action.payload.listingId &&
              item._id !== action.payload.listingId
          );
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })

      // getFavorites cases
      .addCase(getFavorites.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.data = action.payload.data || [];
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })

      // removeFavorite cases
      .addCase(removeFavorite.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.lastAction = {
          type: "removed",
          listingId: action.payload.listingId,
          timestamp: Date.now(),
        };

        // Remove from favorites
        state.favorites.data = state.favorites.data.filter(
          (item) =>
            item.toString() !== action.payload.listingId &&
            item._id !== action.payload.listingId
        );
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })

      // Handle listing deletion from listings slice
      .addCase(deleteListing.fulfilled, (state, action) => {
        const deletedId = action.payload.deletedId;
        // Remove the deleted ad from public profile's ads array
        if (state.data?.public?.ads) {
          state.data.public.ads = state.data.public.ads.filter(
            (ad) => ad._id !== deletedId
          );
        }

        // Remove the deleted job post from public profile's jobPosts array
        if (state.data?.public?.jobPosts) {
          state.data.public.jobPosts = state.data.public.jobPosts.filter(
            (jobPost) => jobPost._id !== deletedId
          );
        }

        // Remove the deleted application from public profile's applications array
        if (state.data?.public?.applications) {
          state.data.public.applications =
            state.data.public.applications.filter(
              (application) => application._id !== deletedId
            );
        }

        // Also remove from favorites if present
        if (state.favorites.data.length > 0) {
          state.favorites.data = state.favorites.data.filter(
            (item) => item.toString() !== deletedId && item._id !== deletedId
          );
        }
      });
  },
});

export const { clearPublicProfile, clearFavorites } =
  publicProfileSlice.actions;

// Selectors
export const selectPublicProfile = (state) => state.publicProfile;
export const selectPublicProfileData = (state) => state.publicProfile.data;
export const selectPublicProfileLoading = (state) =>
  state.publicProfile.loading;
export const selectPublicProfileError = (state) => state.publicProfile.error;
export const selectFavorites = (state) => state.publicProfile.favorites.data;
export const selectFavoritesLoading = (state) =>
  state.publicProfile.favorites.loading;
export const selectFavoritesError = (state) =>
  state.publicProfile.favorites.error;
export const selectFavoritesLastAction = (state) =>
  state.publicProfile.favorites.lastAction;

export default publicProfileSlice.reducer;
