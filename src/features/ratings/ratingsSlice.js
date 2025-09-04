import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/ratings`;

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log(
      `Ratings API Request: [${config.method?.toUpperCase()}] ${
        config.baseURL
      }${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Ratings Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Ratings API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `Ratings Response Error: [${error.response?.status || "Unknown"}] ${
        error.config?.url || "Unknown URL"
      }`
    );
    return Promise.reject(error);
  }
);

// Create a new rating
export const createRating = createAsyncThunk(
  "ratings/createRating",
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/", ratingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create rating"
      );
    }
  }
);

// Get ratings for a specific user
export const getUserRatings = createAsyncThunk(
  "ratings/getUserRatings",
  async ({ userId, listingId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const path = listingId
        ? `/user/${userId}/${listingId}`
        : `/user/${userId}`;
      const response = await axiosInstance.get(path, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ratings"
      );
    }
  }
);

// Delete a rating
export const deleteRating = createAsyncThunk(
  "ratings/deleteRating",
  async (ratingId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/${ratingId}`);
      return ratingId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete rating"
      );
    }
  }
);

// Initial state
const initialState = {
  ratings: [],
  userRatings: [], // Ratings for a specific user
  averageRating: 0,
  totalRatings: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  creating: false,
  deleting: false,
  error: null,
  validationErrors: [],
  createSuccess: false,
};

// Ratings slice
const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = [];
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    resetRatings: () => {
      return initialState;
    },
    clearUserRatings: (state) => {
      state.userRatings = [];
      state.averageRating = 0;
      state.totalRatings = 0;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create rating
      .addCase(createRating.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.validationErrors = [];
        state.createSuccess = false;
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        state.error = null;
        // Add the new rating to the list if it exists
        if (action.payload.data) {
          state.ratings.unshift(action.payload.data);
        }
      })
      .addCase(createRating.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.createSuccess = false;
        // Handle validation errors
        if (
          action.payload?.includes("required") ||
          action.payload?.includes("validation")
        ) {
          state.validationErrors = [action.payload];
        }
      })

      // Get user ratings
      .addCase(getUserRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        if (action.payload.data) {
          state.userRatings = action.payload.data.ratings || [];
          state.averageRating = action.payload.data.averageRating || 0;
          state.totalRatings = action.payload.data.totalRatings || 0;

          if (action.payload.data.pagination) {
            state.pagination = action.payload.data.pagination;
          }
        }
      })
      .addCase(getUserRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete rating
      .addCase(deleteRating.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.deleting = false;
        state.error = null;
        // Remove the deleted rating from both arrays
        state.ratings = state.ratings.filter(
          (rating) => rating._id !== action.payload
        );
        state.userRatings = state.userRatings.filter(
          (rating) => rating._id !== action.payload
        );
        // Update total count
        if (state.totalRatings > 0) {
          state.totalRatings -= 1;
        }
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  clearCreateSuccess,
  resetRatings,
  clearUserRatings,
} = ratingsSlice.actions;

// Export selectors
export const selectRatings = (state) => state.ratings.ratings;
export const selectUserRatings = (state) => state.ratings.userRatings;
export const selectAverageRating = (state) => state.ratings.averageRating;
export const selectTotalRatings = (state) => state.ratings.totalRatings;
export const selectRatingsPagination = (state) => state.ratings.pagination;
export const selectRatingsLoading = (state) => state.ratings.loading;
export const selectRatingsCreating = (state) => state.ratings.creating;
export const selectRatingsDeleting = (state) => state.ratings.deleting;
export const selectRatingsError = (state) => state.ratings.error;
export const selectRatingsValidationErrors = (state) =>
  state.ratings.validationErrors;
export const selectRatingsCreateSuccess = (state) =>
  state.ratings.createSuccess;

// Export reducer
export default ratingsSlice.reducer;
