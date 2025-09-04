import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL - adjust this to match your backend server
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/listings`;

// Async thunk to fetch listings from Node.js backend
export const fetchCategoryListings = createAsyncThunk(
  "categoryListing/fetchCategoryListings",
  async ({ categoryId, ...params } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.categorySlug)
        queryParams.append("categorySlug", params.categorySlug);
      if (categoryId) queryParams.append("categoryId", categoryId);
      if (params.storeId) queryParams.append("storeId", params.storeId);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.order) queryParams.append("order", params.order);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.fields) queryParams.append("fields", params.fields);

      // Handle values filters
      if (params.values) {
        Object.entries(params.values).forEach(([key, value]) => {
          if (typeof value === "object") {
            queryParams.append(`values[${key}]`, JSON.stringify(value));
          } else {
            queryParams.append(`values[${key}]`, value);
          }
        });
      }

      const response = await axios.get(
        `${API_BASE_URL}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category listings:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to search listings
export const searchCategoryListings = createAsyncThunk(
  "categoryListing/searchCategoryListings",
  async ({ categoryId, values, ...params } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (categoryId) queryParams.append("categoryId", categoryId);
      if (params.storeId) queryParams.append("storeId", params.storeId);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.order) queryParams.append("order", params.order);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Handle search values
      if (values) {
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === "object") {
            queryParams.append(`values[${key}]`, JSON.stringify(value));
          } else {
            queryParams.append(`values[${key}]`, value);
          }
        });
      }

      const response = await axios.get(
        `${API_BASE_URL}/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching category listings:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to fetch a single listing
export const fetchSingleListing = createAsyncThunk(
  "categoryListing/fetchSingleListing",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${listingId}`);
      return response.data; // Return the full response data which contains { success: true, data: {...} }
    } catch (error) {
      console.error("Error fetching single listing:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchListingsByCategorySlug = createAsyncThunk(
  "categoryListing/fetchListingsByCategorySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/category/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listings by category slug:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const categoryListingSlice = createSlice({
  name: "categoryListing",
  initialState: {
    listings: [],
    currentListing: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
    count: 0,
    searchResults: [],
    searchLoading: false,
    searchError: null,
  },
  reducers: {
    clearListings: (state) => {
      state.listings = [];
      state.error = null;
    },
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch category listings
      .addCase(fetchCategoryListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.data || [];
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.count = action.payload.count || 0;
      })
      .addCase(fetchCategoryListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.listings = [];
      })
      // Search category listings
      .addCase(searchCategoryListings.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCategoryListings.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data || [];
      })
      .addCase(searchCategoryListings.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
        state.searchResults = [];
      })
      // Fetch single listing
      .addCase(fetchSingleListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleListing.fulfilled, (state, action) => {
        state.loading = false;
        state.currentListing = action.payload;
      })
      .addCase(fetchSingleListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentListing = null;
      });
    // Fetch listings by category slug
    builder
      .addCase(fetchListingsByCategorySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListingsByCategorySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.data || [];
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.count = action.payload.count || 0;
      })
      .addCase(fetchListingsByCategorySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.listings = [];
      });
  },
});

export const {
  clearListings,
  clearCurrentListing,
  clearSearchResults,
  setCurrentPage,
} = categoryListingSlice.actions;

export default categoryListingSlice.reducer;
