import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/stores`;

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
      `Store API Request: [${config.method.toUpperCase()}] ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("Store API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Store API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error("Store API Response Error:", error);
    return Promise.reject(error);
  }
);

// Async thunks for store operations
export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  async ({ level, root } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (level !== undefined && level !== null) {
        params.append("level", level);
      }

      if (root !== undefined && root !== null) {
        params.append("root", root);
      }

      const url = params.toString() ? `/?${params.toString()}` : "/";
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stores"
      );
    }
  }
);

export const getStores = createAsyncThunk(
  "stores/getStores",
  async ({ level, root } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (level !== undefined && level !== null) {
        params.append("level", level);
      }

      if (root !== undefined && root !== null) {
        params.append("root", root);
      }

      const url = params.toString() ? `/?${params.toString()}` : "/";
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stores"
      );
    }
  }
);

export const fetchStoreById = createAsyncThunk(
  "stores/fetchStoreById",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${storeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch store"
      );
    }
  }
);

export const createStore = createAsyncThunk(
  "stores/createStore",
  async (storeData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", storeData.name);
      if (storeData.icon) {
        formData.append("icon", storeData.icon);
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create store"
      );
    }
  }
);

export const updateStore = createAsyncThunk(
  "stores/updateStore",
  async ({ storeId, storeData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", storeData.name);
      if (storeData.icon) {
        formData.append("icon", storeData.icon);
      }

      const response = await axios.put(`${API_URL}/${storeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update store"
      );
    }
  }
);

export const deleteStore = createAsyncThunk(
  "stores/deleteStore",
  async (storeId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/${storeId}`);
      return storeId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete store"
      );
    }
  }
);

// Initial state
const initialState = {
  stores: [],
  navbarStores: [],
  currentStore: null,
  loading: false,
  error: null,
  success: false,
};

// Store slice
const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload;
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) // Get stores
      .addCase(getStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loading = false;
        state.navbarStores = action.payload.data || [];
        state.error = null;
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch store by ID
      .addCase(fetchStoreById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStore = action.payload.data;
        state.error = null;
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create store
      .addCase(createStore.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores.push(action.payload.data);
        state.navbarStores.push(action.payload.data);
        state.success = true;
        state.error = null;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update store
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stores.findIndex(
          (store) => store._id === action.payload.data._id
        );
        if (index !== -1) {
          state.stores[index] = action.payload.data;
        }
        if (
          state.currentStore &&
          state.currentStore._id === action.payload.data._id
        ) {
          state.currentStore = action.payload.data;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete store
      .addCase(deleteStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = state.stores.filter(
          (store) => store._id !== action.payload
        );
        if (state.currentStore && state.currentStore._id === action.payload) {
          state.currentStore = null;
        }
        state.error = null;
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentStore, clearCurrentStore } =
  storesSlice.actions;
export default storesSlice.reducer;
