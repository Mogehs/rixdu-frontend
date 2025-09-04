import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/price-plans`;

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `Price Plan API Request: [${config.method.toUpperCase()}] ${
        config.baseURL
      }${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Price Plan API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Price Plan API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error("Price Plan API Response Error:", error);
    return Promise.reject(error);
  }
);

// Async thunks for price plan operations

// Get all price plans with filtering
export const fetchPricePlans = createAsyncThunk(
  "pricePlans/fetchPricePlans",
  async (
    {
      categoryId,
      storeId,
      planType,
      duration,
      isActive,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId);
      if (storeId) params.append("storeId", storeId);
      if (planType) params.append("planType", planType);
      if (duration) params.append("duration", duration);
      if (isActive) params.append("isActive", isActive);
      params.append("page", page);
      params.append("limit", limit);
      params.append("sort", sort);

      const response = await axiosInstance.get(`?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch price plans"
      );
    }
  }
);

// Get single price plan
export const fetchPricePlan = createAsyncThunk(
  "pricePlans/fetchPricePlan",
  async (planId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${planId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch price plan"
      );
    }
  }
);

// Create price plan
export const createPricePlan = createAsyncThunk(
  "pricePlans/createPricePlan",
  async (planData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/", planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create price plan"
      );
    }
  }
);

// Update price plan
export const updatePricePlan = createAsyncThunk(
  "pricePlans/updatePricePlan",
  async ({ planId, planData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/${planId}`, planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update price plan"
      );
    }
  }
);

// Delete price plan
export const deletePricePlan = createAsyncThunk(
  "pricePlans/deletePricePlan",
  async (planId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/${planId}`);
      return planId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete price plan"
      );
    }
  }
);

// Toggle price plan status
export const togglePricePlanStatus = createAsyncThunk(
  "pricePlans/togglePricePlanStatus",
  async (planId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/${planId}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle price plan status"
      );
    }
  }
);

// Get price plans for category
export const fetchPricePlansForCategory = createAsyncThunk(
  "pricePlans/fetchPricePlansForCategory",
  async ({ categoryId, isActive = true }, { rejectWithValue }) => {
    try {
      const params = isActive !== undefined ? `?isActive=${isActive}` : "";
      const response = await axiosInstance.get(
        `/category/${categoryId}${params}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch price plans for category"
      );
    }
  }
);

// Get price plans for store
export const fetchPricePlansForStore = createAsyncThunk(
  "pricePlans/fetchPricePlansForStore",
  async (
    { storeId, isActive = true, groupByCategory = false },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append("isActive", isActive);
      if (groupByCategory !== undefined)
        params.append("groupByCategory", groupByCategory);

      const response = await axiosInstance.get(
        `/store/${storeId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch price plans for store"
      );
    }
  }
);

// Get price plans by type
export const fetchPricePlansByType = createAsyncThunk(
  "pricePlans/fetchPricePlansByType",
  async (
    { planType, isActive = true, page = 1, limit = 20 },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append("isActive", isActive);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axiosInstance.get(
        `/type/${planType}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch price plans by type"
      );
    }
  }
);

// Bulk create default plans
export const bulkCreateDefaultPlans = createAsyncThunk(
  "pricePlans/bulkCreateDefaultPlans",
  async ({ categoryId, storeId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/bulk-create/${categoryId}`, {
        storeId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create default price plans"
      );
    }
  }
);

// Initial state
const initialState = {
  pricePlans: [],
  currentPricePlan: null,
  categoryPlans: [],
  storePlans: [],
  typePlans: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    pages: 1,
    limit: 20,
    total: 0,
  },
};

// Price plans slice
const pricePlansSlice = createSlice({
  name: "pricePlans",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentPricePlan: (state, action) => {
      state.currentPricePlan = action.payload;
    },
    clearCurrentPricePlan: (state) => {
      state.currentPricePlan = null;
    },
    resetPricePlans: (state) => {
      state.pricePlans = [];
      state.categoryPlans = [];
      state.storePlans = [];
      state.typePlans = [];
      state.currentPricePlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch price plans
      .addCase(fetchPricePlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricePlans.fulfilled, (state, action) => {
        state.loading = false;
        state.pricePlans = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchPricePlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single price plan
      .addCase(fetchPricePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPricePlan = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPricePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create price plan
      .addCase(createPricePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPricePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.pricePlans.unshift(action.payload.data);
        state.success = true;
        state.error = null;
      })
      .addCase(createPricePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update price plan
      .addCase(updatePricePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePricePlan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pricePlans.findIndex(
          (plan) => plan._id === action.payload.data._id
        );
        if (index !== -1) {
          state.pricePlans[index] = action.payload.data;
        }
        if (
          state.currentPricePlan &&
          state.currentPricePlan._id === action.payload.data._id
        ) {
          state.currentPricePlan = action.payload.data;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updatePricePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete price plan
      .addCase(deletePricePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePricePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.pricePlans = state.pricePlans.filter(
          (plan) => plan._id !== action.payload
        );
        if (
          state.currentPricePlan &&
          state.currentPricePlan._id === action.payload
        ) {
          state.currentPricePlan = null;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(deletePricePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle price plan status
      .addCase(togglePricePlanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePricePlanStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pricePlans.findIndex(
          (plan) => plan._id === action.payload.data._id
        );
        if (index !== -1) {
          state.pricePlans[index] = action.payload.data;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(togglePricePlanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch price plans for category
      .addCase(fetchPricePlansForCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricePlansForCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryPlans = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchPricePlansForCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch price plans for store
      .addCase(fetchPricePlansForStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricePlansForStore.fulfilled, (state, action) => {
        state.loading = false;
        state.storePlans = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchPricePlansForStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch price plans by type
      .addCase(fetchPricePlansByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricePlansByType.fulfilled, (state, action) => {
        state.loading = false;
        state.typePlans = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchPricePlansByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk create default plans
      .addCase(bulkCreateDefaultPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkCreateDefaultPlans.fulfilled, (state, action) => {
        state.loading = false;
        // Add newly created plans to the state
        if (action.payload.data?.created) {
          state.pricePlans = [
            ...action.payload.data.created,
            ...state.pricePlans,
          ];
        }
        state.success = true;
        state.error = null;
      })
      .addCase(bulkCreateDefaultPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentPricePlan,
  clearCurrentPricePlan,
  resetPricePlans,
} = pricePlansSlice.actions;

export default pricePlansSlice.reducer;
