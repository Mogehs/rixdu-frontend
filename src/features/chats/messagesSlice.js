import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/messages`;
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add request/response logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      `Messages API Request: [${config.method.toUpperCase()}] ${
        config.baseURL
      }${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Messages Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Messages API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `Messages Response Error: [${error.response?.status || "Unknown"}] ${
        error.config?.url || "Unknown URL"
      }`
    );
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get messages for a specific chat
export const getChatMessages = createAsyncThunk(
  "messages/getChatMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      console.log("GetChatMessages API call initiated with:", {
        chatId,
      });

      const response = await axiosInstance.get(`?chatId=${chatId}`);

      console.log("GetChatMessages API response:", response.data);

      return response.data;
    } catch (error) {
      console.error("GetChatMessages API error:", {
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to get chat messages."
      );
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  error: null,
  currentChatId: null,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentChatId = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    resetMessages: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Get chat messages
    builder
      .addCase(getChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentChatId,
  clearMessages,
  addMessage,
  setMessages,
  resetMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
