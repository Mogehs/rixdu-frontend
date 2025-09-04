import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/listings`;

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
      `API Request: [${config.method?.toUpperCase()}] ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response: [${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `Response Error: [${error.response?.status || "Unknown"}] ${
        error.config?.url || "Unknown URL"
      }`
    );
    return Promise.reject(error);
  }
);

// Create a new listing
export const createListing = createAsyncThunk(
  "listings/createListing",
  async (listingData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append basic listing data
      if (listingData.storeId) {
        formData.append("storeId", listingData.storeId);
      }
      formData.append("categoryId", listingData.categoryId);

      // Append city field
      if (listingData.city) {
        formData.append("city", listingData.city);
      }

      // Append dynamic field values as individual form fields
      if (listingData.values && typeof listingData.values === "object") {
        // Convert values object to individual form fields
        Object.entries(listingData.values).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "object") {
              // For complex objects like location, stringify them
              formData.append(`values[${key}]`, JSON.stringify(value));
            } else if (Array.isArray(value)) {
              // For arrays, append each item
              value.forEach((item, index) => {
                formData.append(`values[${key}][${index}]`, item);
              });
            } else {
              formData.append(`values[${key}]`, value);
            }
          }
        });
      }

      // Append files with field names if any
      if (listingData.files && Object.keys(listingData.files).length > 0) {
        // Create a mapping of file indices to field names
        const fileFieldMapping = {};
        let fileIndex = 0;

        Object.entries(listingData.files).forEach(([fieldName, files]) => {
          files.forEach((file) => {
            formData.append("files", file);
            fileFieldMapping[fileIndex] = fieldName;
            fileIndex++;
          });
        });

        // Send the field mapping so backend knows which file belongs to which field
        formData.append("fileFieldMapping", JSON.stringify(fileFieldMapping));
      }

      const response = await axiosInstance.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create listing" }
      );
    }
  }
);

// Get all listings with filters
export const getListings = createAsyncThunk(
  "listings/getListings",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.storeId) params.append("storeId", filters.storeId);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.order) params.append("order", filters.order);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.fields) params.append("fields", filters.fields);

      // Add dynamic field filters
      if (filters.values) {
        Object.entries(filters.values).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle range filters
            params.append(`values[${key}]`, JSON.stringify(value));
          } else {
            params.append(`values[${key}]`, value);
          }
        });
      }

      const response = await axiosInstance.get(`/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch listings" }
      );
    }
  }
);

// Get single listing by ID
export const getListing = createAsyncThunk(
  "listings/getListing",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${listingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch listing" }
      );
    }
  }
);

// Update listing
export const updateListing = createAsyncThunk(
  "listings/updateListing",
  async ({ listingId, listingData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append basic listing data
      if (listingData.storeId) {
        formData.append("storeId", listingData.storeId);
      }
      if (listingData.categoryId) {
        formData.append("categoryId", listingData.categoryId);
      }

      // Append city field
      if (listingData.city) {
        formData.append("city", listingData.city);
      }

      // Append dynamic field values as individual form fields
      if (listingData.values && typeof listingData.values === "object") {
        Object.entries(listingData.values).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (
              typeof value === "object" &&
              !Array.isArray(value) &&
              !(value instanceof File)
            ) {
              // For location objects, send as nested FormData fields instead of stringifying
              if (value.coordinates && value.address !== undefined) {
                // This is a location object
                formData.append(`values[${key}][address]`, value.address || "");
                if (
                  value.coordinates.lat !== undefined &&
                  value.coordinates.lat !== null
                ) {
                  formData.append(
                    `values[${key}][coordinates][lat]`,
                    value.coordinates.lat
                  );
                }
                if (
                  value.coordinates.lng !== undefined &&
                  value.coordinates.lng !== null
                ) {
                  formData.append(
                    `values[${key}][coordinates][lng]`,
                    value.coordinates.lng
                  );
                }
                if (value.locationName) {
                  formData.append(
                    `values[${key}][locationName]`,
                    value.locationName
                  );
                }
              } else {
                // For other complex objects, stringify them
                formData.append(`values[${key}]`, JSON.stringify(value));
              }
            } else if (Array.isArray(value)) {
              // For arrays, append each item
              value.forEach((item, index) => {
                formData.append(`values[${key}][${index}]`, item);
              });
            } else {
              formData.append(`values[${key}]`, value);
            }
          }
        });
      }

      // Append new files if any
      if (listingData.files && Object.keys(listingData.files).length > 0) {
        const fileFieldMapping = {};
        let fileIndex = 0;

        Object.entries(listingData.files).forEach(([fieldName, files]) => {
          files.forEach((file) => {
            formData.append("files", file);
            fileFieldMapping[fileIndex] = fieldName;
            fileIndex++;
          });
        });

        formData.append("fileFieldMapping", JSON.stringify(fileFieldMapping));
      }

      // Add a list of retained files (files that were not removed)
      if (listingData.retainedFiles) {
        formData.append(
          "retainedFiles",
          JSON.stringify(listingData.retainedFiles)
        );
      }

      const response = await axiosInstance.put(`/${listingId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update listing" }
      );
    }
  }
);

// Delete listing
export const deleteListing = createAsyncThunk(
  "listings/deleteListing",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/${listingId}`);
      return { ...response.data, deletedId: listingId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete listing" }
      );
    }
  }
);

// Get user's listings
export const getUserListings = createAsyncThunk(
  "listings/getUserListings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user listings" }
      );
    }
  }
);

// Search listings
export const searchListings = createAsyncThunk(
  "listings/searchListings",
  async (searchParams, { rejectWithValue }) => {
    try {
      const { storeSlug, categorySlug, values, ...otherParams } = searchParams;
      // Build the URL path based on provided slugs
      let searchPath = "/search";

      if (storeSlug && categorySlug) {
        searchPath = `/search/${storeSlug}/${categorySlug}`;
      } else if (storeSlug) {
        searchPath = `/search/${storeSlug}`;
      }

      const params = new URLSearchParams();

      // Add basic search parameters (excluding slugs since they're in the path)
      Object.entries(otherParams).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          key !== "storeSlug" &&
          key !== "categorySlug"
        ) {
          params.append(key, value);
        }
      });

      // Handle values filter object properly
      if (values && typeof values === "object") {
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "object" && value !== null) {
              // Handle range filters (price, date ranges, etc.)
              params.append(`values[${key}]`, JSON.stringify(value));
            } else {
              params.append(`values[${key}]`, value);
            }
          }
        });
      }

      const queryString = params.toString();
      const fullPath = queryString
        ? `${searchPath}?${queryString}`
        : searchPath;
      const response = await axiosInstance.get(fullPath);
      return response.data;
    } catch (error) {
      console.error("Search listings error:", error);
      return rejectWithValue(
        error.response?.data || { message: "Failed to search listings" }
      );
    }
  }
);

// Get job listings
export const getJobListings = createAsyncThunk(
  "listings/getJobListings",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.order) params.append("order", filters.order);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.fields) params.append("fields", filters.fields);

      // Add common search/filter params
      if (filters.q) params.append("q", filters.q);
      if (filters.service) params.append("service", filters.service);
      if (filters.location) params.append("location", filters.location);
      if (filters.rating) params.append("rating", filters.rating);

      // Add dynamic field filters
      if (filters.values) {
        Object.entries(filters.values).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle range filters
            params.append(`values[${key}]`, JSON.stringify(value));
          } else {
            params.append(`values[${key}]`, value);
          }
        });
      }

      const response = await axiosInstance.get(`/jobs?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch job listings" }
      );
    }
  }
);

// Get healthcare listings
export const getHealthcareListings = createAsyncThunk(
  "listings/getHealthcareListings",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.order) params.append("order", filters.order);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.fields) params.append("fields", filters.fields);

      // Add dynamic field filters
      if (filters.values) {
        Object.entries(filters.values).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle range filters
            params.append(`values[${key}]`, JSON.stringify(value));
          } else {
            params.append(`values[${key}]`, value);
          }
        });
      }

      const response = await axiosInstance.get(
        `/healthcare?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch healthcare listings"
      );
    }
  }
);

export const getHealthcareListingsByCategory = createAsyncThunk(
  "listings/getHealthcareListingsByCategory",
  async ({ categorySlug, ...filters }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.order) params.append("order", filters.order);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.fields) params.append("fields", filters.fields);

      // Add dynamic field filters
      if (filters.values) {
        Object.entries(filters.values).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle range filters
            params.append(`values[${key}]`, JSON.stringify(value));
          } else {
            params.append(`values[${key}]`, value);
          }
        });
      }

      const response = await axiosInstance.get(
        `/healthcare/category/${categorySlug}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch healthcare listings by category"
      );
    }
  }
);

export const getListingsByCity = createAsyncThunk(
  "listings/getListingsByCity",
  async (
    { city, categoryId, storeId, page = 1, limit = 20 },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("city", city);
      if (categoryId) params.append("categoryId", categoryId);
      if (storeId) params.append("storeId", storeId);
      params.append("page", page);
      params.append("limit", limit);
      const response = await axiosInstance.get(
        `/by-city/listing?${params.toString()}`
      );
      return response.data;
    } catch (err) {
      console.error("API Error - Error fetching listings by city:", err);
      console.error("API Error - Response data:", err.response?.data);
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch listings by city" }
      );
    }
  }
);

// Get listings by store slug or ID
export const getListingsByStore = createAsyncThunk(
  "listings/getListingsByStore",
  async (
    {
      storeSlugOrId,
      categoryId,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
      fields,
      values = {},
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (categoryId) params.append("categoryId", categoryId);
      if (sort) params.append("sort", sort);
      if (order) params.append("order", order);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (fields) params.append("fields", fields);

      // Add dynamic field filters
      if (values && typeof values === "object") {
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "object" && value !== null) {
              // Handle range filters
              params.append(`values[${key}]`, JSON.stringify(value));
            } else {
              params.append(`values[${key}]`, value);
            }
          }
        });
      }

      const response = await axiosInstance.get(
        `/store/${storeSlugOrId}?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("API Error - Error fetching listings by store:", error);
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch listings by store" }
      );
    }
  }
);

// Get vehicle listings
export const getVehicleListings = createAsyncThunk(
  "listings/getVehicleListings",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "values" && typeof value === "object") {
            // Handle nested values object
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (
                nestedValue !== undefined &&
                nestedValue !== null &&
                nestedValue !== ""
              ) {
                params.append(`values[${nestedKey}]`, nestedValue);
              }
            });
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axiosInstance.get(
        `/vehicles?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch vehicle listings" }
      );
    }
  }
);

// Get advanced vehicle listings
export const getVehicleListingsAdvanced = createAsyncThunk(
  "listings/getVehicleListingsAdvanced",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add all filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "object") {
            // Handle range filters like {min: 1000, max: 5000}
            if (value.min !== undefined || value.max !== undefined) {
              if (value.min !== undefined)
                params.append(`${key}Min`, value.min);
              if (value.max !== undefined)
                params.append(`${key}Max`, value.max);
            } else {
              // Handle other object filters
              params.append(key, JSON.stringify(value));
            }
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axiosInstance.get(
        `/vehicles/advanced?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch advanced vehicle listings",
        }
      );
    }
  }
);

// Get vehicle filter options
export const getVehicleFilterOptions = createAsyncThunk(
  "listings/getVehicleFilterOptions",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (filters.categoryId) {
        params.append("categoryId", filters.categoryId);
      }
      if (filters.categorySlug) {
        params.append("categorySlug", filters.categorySlug);
      }

      const response = await axiosInstance.get(
        `/vehicles/filter-options?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch vehicle filter options",
        }
      );
    }
  }
);

// Initial state
const initialState = {
  listings: [],
  cityListings: [],
  currentListing: null,
  storeListings: [1, 2, 3, 4],
  userListings: [],
  jobListings: [],
  healthcareListings: [],
  vehicleListings: [],
  vehicleFilterOptions: null, // Add this for filter options
  searchResults: [],
  currentCategory: null, // For storing category info when filtering by category
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  loading: false,
  loadingJobs: false,
  loadingHealthcare: false,
  loadingVehicles: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  error: null,
  validationErrors: [],
};

// Listings slice
const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = [];
    },
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    resetListings: () => {
      return initialState;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create listing
      .addCase(createListing.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.creating = false;
        state.listings.unshift(action.payload.data);
        state.userListings.unshift(action.payload.data);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to create listing";
        state.validationErrors = action.payload?.errors || [];
      })

      // Get listings
      .addCase(getListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.data;
        state.searchResults = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalCount = action.payload.count;
      })
      .addCase(getListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch listings";
      })

      // Get single listing
      .addCase(getListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getListing.fulfilled, (state, action) => {
        state.loading = false;
        state.currentListing = action.payload.data;
      })
      .addCase(getListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch listing";
      })

      // Update listing
      .addCase(updateListing.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.updating = false;
        const updatedListing = action.payload.data;

        // Update in listings array
        const listingIndex = state.listings.findIndex(
          (listing) => listing._id === updatedListing._id
        );
        if (listingIndex !== -1) {
          state.listings[listingIndex] = updatedListing;
        }

        // Update in user listings array
        const userListingIndex = state.userListings.findIndex(
          (listing) => listing._id === updatedListing._id
        );
        if (userListingIndex !== -1) {
          state.userListings[userListingIndex] = updatedListing;
        }

        // Update current listing
        if (
          state.currentListing &&
          state.currentListing._id === updatedListing._id
        ) {
          state.currentListing = updatedListing;
        }
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update listing";
        state.validationErrors = action.payload?.errors || [];
      })

      // Delete listing
      .addCase(deleteListing.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload.deletedId;

        // Remove from listings array
        state.listings = state.listings.filter(
          (listing) => listing._id !== deletedId
        );

        // Remove from user listings array
        state.userListings = state.userListings.filter(
          (listing) => listing._id !== deletedId
        );

        // Clear current listing if it was deleted
        if (state.currentListing && state.currentListing._id === deletedId) {
          state.currentListing = null;
        }
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message || "Failed to delete listing";
      })

      // Get user listings
      .addCase(getUserListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserListings.fulfilled, (state, action) => {
        state.loading = false;
        state.userListings = action.payload.data;
      })
      .addCase(getUserListings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch user listings";
      })

      // Search listings
      .addCase(searchListings.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchListings.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchListings.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload?.message || "Failed to search listings";
      })

      // Get job listings
      .addCase(getJobListings.pending, (state) => {
        state.loadingJobs = true;
        state.error = null;
      })
      .addCase(getJobListings.fulfilled, (state, action) => {
        state.loadingJobs = false;
        state.jobListings = action.payload.data;
        // Only update pagination if we're on the jobs page
        if (action.meta.arg && action.meta.arg.updatePagination) {
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.totalCount = action.payload.count;
        }
      })
      .addCase(getJobListings.rejected, (state, action) => {
        state.loadingJobs = false;
        state.error = action.payload?.message || "Failed to fetch job listings";
      })

      // Get healthcare listings
      .addCase(getHealthcareListings.pending, (state) => {
        state.loadingHealthcare = true;
        state.error = null;
      })
      .addCase(getHealthcareListings.fulfilled, (state, action) => {
        state.loadingHealthcare = false;
        state.healthcareListings = action.payload.data;
        // Only update pagination if we're on the healthcare page
        if (action.meta.arg && action.meta.arg.updatePagination) {
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.totalCount = action.payload.count;
        }
      })
      .addCase(getHealthcareListings.rejected, (state, action) => {
        state.loadingHealthcare = false;
        state.error =
          action.payload?.message || "Failed to fetch healthcare listings";
      })

      // Get healthcare listings by category
      .addCase(getHealthcareListingsByCategory.pending, (state) => {
        state.loadingHealthcare = true;
        state.error = null;
      })
      .addCase(getHealthcareListingsByCategory.fulfilled, (state, action) => {
        state.loadingHealthcare = false;
        state.healthcareListings = action.payload.data;
        state.currentCategory = action.payload.category; // Store category info
        // Only update pagination if we're on the healthcare page
        if (action.meta.arg && action.meta.arg.updatePagination !== false) {
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.totalCount = action.payload.count;
        }
      })
      .addCase(getHealthcareListingsByCategory.rejected, (state, action) => {
        state.loadingHealthcare = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch healthcare listings by category";
      })

      // Get listings by city
      .addCase(getListingsByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getListingsByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cityListings = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalCount = action.payload.count;
      })
      .addCase(getListingsByCity.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch listings by city";
      })

      // Get listings by store slug or ID
      .addCase(getListingsByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getListingsByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.storeListings = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalCount = action.payload.count;
      })
      .addCase(getListingsByStore.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch listings by store";
      })

      // Get vehicle listings
      .addCase(getVehicleListings.pending, (state) => {
        state.loadingVehicles = true;
        state.error = null;
      })
      .addCase(getVehicleListings.fulfilled, (state, action) => {
        state.loadingVehicles = false;
        state.vehicleListings = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalCount = action.payload.count;
      })
      .addCase(getVehicleListings.rejected, (state, action) => {
        state.loadingVehicles = false;
        state.error =
          action.payload?.message || "Failed to fetch vehicle listings";
      })

      // Get advanced vehicle listings
      .addCase(getVehicleListingsAdvanced.pending, (state) => {
        state.loadingVehicles = true;
        state.error = null;
      })
      .addCase(getVehicleListingsAdvanced.fulfilled, (state, action) => {
        state.loadingVehicles = false;
        state.vehicleListings = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalCount = action.payload.count;
      })
      .addCase(getVehicleListingsAdvanced.rejected, (state, action) => {
        state.loadingVehicles = false;
        state.error =
          action.payload?.message ||
          "Failed to fetch advanced vehicle listings";
      })

      // Get vehicle filter options
      .addCase(getVehicleFilterOptions.pending, (state) => {
        state.loadingVehicles = true;
        state.error = null;
      })
      .addCase(getVehicleFilterOptions.fulfilled, (state, action) => {
        state.loadingVehicles = false;
        state.vehicleFilterOptions = action.payload.data; // Store filter options
      })
      .addCase(getVehicleFilterOptions.rejected, (state, action) => {
        state.loadingVehicles = false;
        state.error =
          action.payload?.message || "Failed to fetch vehicle filter options";
      });
  },
});

// Export actions
export const {
  clearError,
  clearCurrentListing,
  clearSearchResults,
  resetListings,
  setCurrentPage,
} = listingsSlice.actions;

// Export selectors
export const selectListings = (state) => state.listings.listings;
export const selectCityListings = (state) => state.listings.cityListings;
export const selectCurrentListing = (state) => state.listings.currentListing;
export const selectStoreListings = (state) => state.listings.storeListings;
export const selectUserListings = (state) => state.listings.userListings;
export const selectJobListings = (state) => state.listings.jobListings;
export const selectHealthcareListings = (state) =>
  state.listings.healthcareListings;
export const selectVehicleListings = (state) => state.listings.vehicleListings;
export const selectVehicleListingsLoading = (state) =>
  state.listings.loadingVehicles;
export const selectCurrentCategory = (state) => state.listings.currentCategory;
export const selectSearchResults = (state) => state.listings.searchResults;
export const selectListingsLoading = (state) => state.listings.loading;
export const selectJobListingsLoading = (state) => state.listings.loadingJobs;
export const selectHealthcareListingsLoading = (state) =>
  state.listings.loadingHealthcare;
export const selectCreatingListing = (state) => state.listings.creating;
export const selectUpdatingListing = (state) => state.listings.updating;
export const selectDeletingListing = (state) => state.listings.deleting;
export const selectSearchingListings = (state) => state.listings.searching;
export const selectListingsError = (state) => state.listings.error;
export const selectValidationErrors = (state) =>
  state.listings.validationErrors;
export const selectTotalPages = (state) => state.listings.totalPages;
export const selectCurrentPage = (state) => state.listings.currentPage;
export const selectTotalCount = (state) => state.listings.totalCount;
export const selectVehicleFilterOptions = (state) =>
  state.listings.vehicleFilterOptions;

// Export reducer
export default listingsSlice.reducer;
