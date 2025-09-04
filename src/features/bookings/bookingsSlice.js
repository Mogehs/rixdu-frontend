import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/bookings`;

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
      `Bookings API Request: [${config.method?.toUpperCase()}] ${
        config.baseURL
      }${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Bookings Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Bookings API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `Bookings Response Error: [${error.response?.status || "Unknown"}] ${
        error.config?.url || "Unknown URL"
      }`
    );
    return Promise.reject(error);
  }
);

// Create a booking
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/", bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create booking" }
      );
    }
  }
);

// Get all bookings
export const getBookings = createAsyncThunk(
  "bookings/getBookings",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.status) params.append("status", filters.status);
      if (filters.listingId) params.append("listingId", filters.listingId);
      if (filters.providerId) params.append("providerId", filters.providerId);
      if (filters.customerId) params.append("customerId", filters.customerId);
      if (filters.date) params.append("date", filters.date);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await axiosInstance.get(`/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch bookings" }
      );
    }
  }
);

// Get single booking by ID
export const getBooking = createAsyncThunk(
  "bookings/getBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch booking" }
      );
    }
  }
);

// Update booking
export const updateBooking = createAsyncThunk(
  "bookings/updateBooking",
  async ({ bookingId, bookingData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/${bookingId}`, bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update booking" }
      );
    }
  }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/${bookingId}/cancel`);
      return { ...response.data, cancelledId: bookingId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to cancel booking" }
      );
    }
  }
);

// Get user's bookings
export const getUserBookings = createAsyncThunk(
  "bookings/getUserBookings",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await axiosInstance.get(`/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user bookings" }
      );
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/${bookingId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update booking status" }
      );
    }
  }
);

// Get provider's bookings
export const getProviderBookings = createAsyncThunk(
  "bookings/getProviderBookings",
  async ({ filters = {}, doctorId }, { rejectWithValue }) => {
    console.log("Doctor ID:", doctorId);

    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.date) params.append("date", filters.date);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await axiosInstance.get(
        `/doctor/${doctorId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch provider bookings" }
      );
    }
  }
);

// Get available time slots for a doctor on a specific date
export const getAvailableSlots = createAsyncThunk(
  "bookings/getAvailableSlots",
  async ({ listingId, doctorId, date }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/available-slots?listingId=${listingId}&doctorId=${doctorId}&date=${date}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch available slots" }
      );
    }
  }
);

// Check date availability for multiple dates (to show in calendar)
export const checkDateAvailability = createAsyncThunk(
  "bookings/checkDateAvailability",
  async ({ doctorId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/check-availability?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to check date availability" }
      );
    }
  }
);

// Initial state
const initialState = {
  bookings: [],
  userBookings: [],
  providerBookings: [],
  currentBooking: null,
  availableSlots: [],
  allSlots: [],
  dateAvailability: {},
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  loading: false,
  loadingSlots: false,
  checkingAvailability: false,
  creating: false,
  updating: false,
  cancelling: false,
  error: null,
  validationErrors: [],
};

// Bookings slice
const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = [];
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
      state.allSlots = [];
    },
    clearDateAvailability: (state) => {
      state.dateAvailability = {};
    },
    resetBookings: () => {
      return initialState;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.bookings.unshift(action.payload.data);
        state.userBookings.unshift(action.payload.data);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to create booking";
        state.validationErrors = action.payload?.errors || [];
      })

      // Get bookings
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalCount = action.payload.count;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch bookings";
      })

      // Get single booking
      .addCase(getBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.data;
      })
      .addCase(getBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch booking";
      })

      // Update booking
      .addCase(updateBooking.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.updating = false;
        const updatedBooking = action.payload.data;

        // Update in bookings array
        const bookingIndex = state.bookings.findIndex(
          (booking) => booking._id === updatedBooking._id
        );
        if (bookingIndex !== -1) {
          state.bookings[bookingIndex] = updatedBooking;
        }

        // Update in user bookings array
        const userBookingIndex = state.userBookings.findIndex(
          (booking) => booking._id === updatedBooking._id
        );
        if (userBookingIndex !== -1) {
          state.userBookings[userBookingIndex] = updatedBooking;
        }

        // Update current booking
        if (
          state.currentBooking &&
          state.currentBooking._id === updatedBooking._id
        ) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update booking";
        state.validationErrors = action.payload?.errors || [];
      })

      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.cancelling = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelling = false;
        const cancelledId = action.payload.cancelledId;

        // Update booking status in arrays
        const updateBookingStatus = (booking) => {
          if (booking._id === cancelledId) {
            return { ...booking, status: "cancelled" };
          }
          return booking;
        };

        state.bookings = state.bookings.map(updateBookingStatus);
        state.userBookings = state.userBookings.map(updateBookingStatus);
        state.providerBookings =
          state.providerBookings.map(updateBookingStatus);

        // Update current booking
        if (state.currentBooking && state.currentBooking._id === cancelledId) {
          state.currentBooking = {
            ...state.currentBooking,
            status: "cancelled",
          };
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload?.message || "Failed to cancel booking";
      })

      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload.data;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch user bookings";
      })

      // Get provider bookings
      .addCase(getProviderBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProviderBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.providerBookings = action.payload.data;
      })
      .addCase(getProviderBookings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch provider bookings";
      })

      // Get available slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loadingSlots = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loadingSlots = false;
        state.availableSlots = action.payload.data;
        state.allSlots = action.payload.allSlots || [];
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loadingSlots = false;
        state.error =
          action.payload?.message || "Failed to fetch available slots";
      })

      // Check date availability
      .addCase(checkDateAvailability.pending, (state) => {
        state.checkingAvailability = true;
        state.error = null;
      })
      .addCase(checkDateAvailability.fulfilled, (state, action) => {
        state.checkingAvailability = false;
        state.dateAvailability = action.payload.data;
      })
      .addCase(checkDateAvailability.rejected, (state, action) => {
        state.checkingAvailability = false;
        state.error =
          action.payload?.message || "Failed to check date availability";
      })

      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.updating = false;
        const updatedBooking = action.payload.data;

        // Update in all booking arrays
        const updateBookingInArray = (bookingsArray) => {
          const index = bookingsArray.findIndex(
            (booking) => booking._id === updatedBooking._id
          );
          if (index !== -1) {
            bookingsArray[index] = updatedBooking;
          }
        };

        updateBookingInArray(state.bookings);
        updateBookingInArray(state.userBookings);
        updateBookingInArray(state.providerBookings);

        // Update current booking
        if (
          state.currentBooking &&
          state.currentBooking._id === updatedBooking._id
        ) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message || "Failed to update booking status";
      });
  },
});

// Export actions
export const {
  clearError,
  clearCurrentBooking,
  clearAvailableSlots,
  clearDateAvailability,
  resetBookings,
  setCurrentPage,
} = bookingsSlice.actions;

// Export selectors
export const selectBookings = (state) => state.bookings.bookings;
export const selectUserBookings = (state) => state.bookings.userBookings;
export const selectProviderBookings = (state) =>
  state.bookings.providerBookings;
export const selectCurrentBooking = (state) => state.bookings.currentBooking;
export const selectAvailableSlots = (state) => state.bookings.availableSlots;
export const selectAllSlots = (state) => state.bookings.allSlots;
export const selectDateAvailability = (state) =>
  state.bookings.dateAvailability;
export const selectBookingsLoading = (state) => state.bookings.loading;
export const selectSlotsLoading = (state) => state.bookings.loadingSlots;
export const selectCheckingAvailability = (state) =>
  state.bookings.checkingAvailability;
export const selectCreatingBooking = (state) => state.bookings.creating;
export const selectUpdatingBooking = (state) => state.bookings.updating;
export const selectCancellingBooking = (state) => state.bookings.cancelling;
export const selectBookingsError = (state) => state.bookings.error;
export const selectValidationErrors = (state) =>
  state.bookings.validationErrors;
export const selectTotalPages = (state) => state.bookings.totalPages;
export const selectCurrentPage = (state) => state.bookings.currentPage;
export const selectTotalCount = (state) => state.bookings.totalCount;

// Export reducer
export default bookingsSlice.reducer;
