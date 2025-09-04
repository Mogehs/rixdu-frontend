import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`;

const axiosInstance = axios.create({ baseURL: API_URL });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.page) qs.append("page", params.page);
      if (params.limit) qs.append("limit", params.limit);
      if (params.unread != null) qs.append("unread", String(params.unread));
      if (params.storeId) qs.append("storeId", params.storeId);
      const query = qs.toString();
      const res = await axiosInstance.get(query ? `/?${query}` : "/");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to load notifications" }
      );
    }
  },
  {
    condition: (params, { getState }) => {
      const state = getState();
      const notif = state?.notifications;
      if (!notif) return true;
      // Skip if already loading
      if (notif.loading) return false;
      // Skip if we already have items and fetched recently (within 30s)
      const now = Date.now();
      if (
        notif.items?.length > 0 &&
        notif.lastFetched &&
        now - notif.lastFetched < 30_000
      ) {
        return false;
      }
      return true;
    },
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch("/mark-all");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to mark as read" }
      );
    }
  }
);

export const toggleNotification = createAsyncThunk(
  "notifications/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/${id}/toggle`);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to toggle notification" }
      );
    }
  }
);

export const deleteNotificationById = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to delete notification" }
      );
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/delete-all");
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to delete all notifications" }
      );
    }
  }
);

export const fetchPreferences = createAsyncThunk(
  "notifications/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/preferences");
      return res.data.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to load preferences" }
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const notif = getState()?.notifications;
      if (!notif) return true;
      // Skip if currently loading preferences
      if (notif.prefLoading) return false;
      // Backoff 60s between attempts if we tried recently
      const now = Date.now();
      if (notif.lastPrefsFetch && now - notif.lastPrefsFetch < 5_000)
        return false;
      return true;
    },
  }
);

export const upsertPreference = createAsyncThunk(
  "notifications/upsertPreference",
  async ({ storeId, channels }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/preferences", {
        storeId,
        channels,
      });
      return res.data.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data || { message: "Failed to save preference" }
      );
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  loaded: false,
  lastFetched: null,
  preferences: [],
  prefLoading: false,
  lastPrefsFetch: null,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.loaded = true;
        state.lastFetched = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load notifications";
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
      })
      .addCase(toggleNotification.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteNotificationById.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      })
      .addCase(fetchPreferences.pending, (state) => {
        state.prefLoading = true;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.prefLoading = false;
        state.preferences = action.payload || [];
        state.lastPrefsFetch = Date.now();
      })
      .addCase(fetchPreferences.rejected, (state) => {
        state.prefLoading = false;
        state.lastPrefsFetch = Date.now();
      })
      .addCase(upsertPreference.fulfilled, (state, action) => {
        const p = action.payload;
        const idx = state.preferences.findIndex(
          (x) => x.storeId === p.storeId || x.storeId?._id === p.storeId
        );
        if (idx !== -1) state.preferences[idx] = p;
        else state.preferences.push(p);
      });
  },
});

export const { addNotification, clearNotificationsError } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
