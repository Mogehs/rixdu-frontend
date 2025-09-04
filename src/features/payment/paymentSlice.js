import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/payments`;

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
      `Payment API Request: [${config.method.toUpperCase()}] ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("Payment API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Payment API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error("Payment API Response Error:", error);
    return Promise.reject(error);
  }
);

// Async thunks for payment operations

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async ({ planId, listingData, currency = "aed" }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/create-intent", {
        planId,
        listingData,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error("Payment intent creation error:", error);

      // Handle specific error codes
      if (error.response?.status === 429) {
        return rejectWithValue(
          "Too many requests. Please wait a moment and try again."
        );
      }

      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment intent"
      );
    }
  }
);

// Confirm payment
export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async ({ paymentIntentId, files = {} }, { rejectWithValue }) => {
    try {
      // Create FormData to handle files
      const formData = new FormData();
      formData.append("paymentIntentId", paymentIntentId);

      // Add files with field mapping
      const fileFieldMapping = {};
      let fileIndex = 0;

      Object.entries(files).forEach(([fieldName, fieldFiles]) => {
        const filesArray = Array.isArray(fieldFiles)
          ? fieldFiles
          : [fieldFiles];
        filesArray.forEach((file) => {
          if (file instanceof File) {
            formData.append("files", file);
            fileFieldMapping[fileIndex] = fieldName;
            fileIndex++;
          }
        });
      });

      // Add file field mapping if files exist
      if (fileIndex > 0) {
        formData.append("fileFieldMapping", JSON.stringify(fileFieldMapping));
      }

      const response = await axiosInstance.post("/confirm-payment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm payment"
      );
    }
  }
);

// Get payment history
export const getPaymentHistory = createAsyncThunk(
  "payment/getPaymentHistory",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const response = await axiosInstance.get(`/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment history"
      );
    }
  }
);

// Initial state
const initialState = {
  // Payment intent
  paymentIntent: null,
  clientSecret: null,

  // Payment history
  paymentHistory: [],

  // Current payment session
  currentPayment: null,

  // Loading states
  loading: false,
  processingPayment: false,

  // Rate limiting flag
  creatingIntent: false,

  // Error and success states
  error: null,
  success: false,

  // Pagination for payment history
  pagination: {
    page: 1,
    pages: 1,
    limit: 20,
    total: 0,
  },
};

// Payment slice
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
      state.clientSecret = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    resetPayment: (state) => {
      state.paymentIntent = null;
      state.clientSecret = null;
      state.currentPayment = null;
      state.error = null;
      state.success = false;
    },
    setProcessingPayment: (state, action) => {
      state.processingPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.creatingIntent = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.creatingIntent = false;
        state.paymentIntent = action.payload.data;
        state.clientSecret = action.payload.data.clientSecret;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.creatingIntent = false;
        state.error = action.payload;
      })

      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.processingPayment = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.processingPayment = false;
        state.currentPayment = action.payload.data;
        state.success = true;
        state.error = null;
        // Clear payment intent after successful confirmation
        state.paymentIntent = null;
        state.clientSecret = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.processingPayment = false;
        state.error = action.payload;
      })

      // Get payment history
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearPaymentIntent,
  setCurrentPayment,
  clearCurrentPayment,
  resetPayment,
  setProcessingPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
