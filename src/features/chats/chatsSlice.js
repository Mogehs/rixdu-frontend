import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/chats`;
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add request/response logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      `Chat API Request: [${config.method.toUpperCase()}] ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("Chat Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Chat API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `Chat Response Error: [${error.response?.status || "Unknown"}] ${
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

// Get User Chats
export const getUserChats = createAsyncThunk(
  "chats/getUserChats",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("GetUserChats API call initiated for userId:", userId);

      const response = await axiosInstance.get(`/${userId}`);

      console.log("GetUserChats API response:", {
        response: response.data,
      });

      return response.data;
    } catch (error) {
      console.error("GetUserChats API error:", {
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user chats."
      );
    }
  }
);

// Get or create single chat
export const getOrCreateChat = createAsyncThunk(
  "chats/getOrCreateChat",
  async ({ listingId, senderId, receiverId, type }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/", {
        listingId,
        senderId,
        receiverId,
        type,
      });

      return response.data;
    } catch (error) {
      console.error("getOrCreateChat API error:", {
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to get or create chat."
      );
    }
  }
);

// Get chat messages
export const getChatMessages = createAsyncThunk(
  "chats/getChatMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      console.log("GetChatMessages API call initiated with:", {
        chatId,
      });

      const response = await axiosInstance.get(`/messages/${chatId}`);

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

// Send message
export const sendMessage = createAsyncThunk(
  "chats/sendMessage",
  async ({ chatId, message, senderId }, { rejectWithValue }) => {
    try {
      console.log("SendMessage API call initiated with:", {
        chatId,
        message,
        senderId,
      });

      const response = await axiosInstance.post("/messages", {
        chatId,
        message,
        senderId,
      });

      console.log("SendMessage API response:", response.data);

      return response.data;
    } catch (error) {
      console.error("SendMessage API error:", {
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to send message."
      );
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  "chats/markMessagesAsRead",
  async ({ chatId, userId }, { rejectWithValue }) => {
    try {
      console.log("MarkMessagesAsRead API call initiated with:", {
        chatId,
        userId,
      });

      const response = await axiosInstance.put(`/messages/read`, {
        chatId,
        userId,
      });

      console.log("MarkMessagesAsRead API response:", response.data);

      return response.data;
    } catch (error) {
      console.error("MarkMessagesAsRead API error:", {
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to mark messages as read."
      );
    }
  }
);

// Get chat by ID
export const getChatById = createAsyncThunk(
  "chats/getChatById",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/chat/${chatId}`);

      return response.data;
    } catch (error) {
      console.error("GetChatById API error:", {
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat details."
      );
    }
  }
);

const initialState = {
  userChats: [],
  currentChat: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  sendingMessage: false,
  error: null,
  messagesError: null,
  sendMessageError: null,
  success: false,
  unreadCount: 0,
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.messagesError = null;
      state.sendMessageError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    resetChats: (state) => {
      state.userChats = [];
      state.currentChat = null;
      state.messages = [];
      state.loading = false;
      state.messagesLoading = false;
      state.sendingMessage = false;
      state.error = null;
      state.messagesError = null;
      state.sendMessageError = null;
      state.success = false;
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Get user chats
    builder
      .addCase(getUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserChats.fulfilled, (state, action) => {
        state.loading = false;
        state.userChats = action.payload;
        state.error = null;
      })
      .addCase(getUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get or create chat
      .addCase(getOrCreateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
        // Add to user chats if not already present
        const existingChatIndex = state.userChats.findIndex(
          (chat) => chat._id === action.payload._id
        );
        if (existingChatIndex === -1) {
          state.userChats.push(action.payload);
        } else {
          state.userChats[existingChatIndex] = action.payload;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(getOrCreateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get chat messages
      .addCase(getChatMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
        state.messagesError = null;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.sendMessageError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        // Add the new message to the messages array
        state.messages.push(action.payload);
        state.sendMessageError = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.sendMessageError = action.payload;
      })

      // Mark messages as read
      .addCase(markMessagesAsRead.pending, () => {
        // Don't show loading for this action
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        // Update the messages read status
        state.messages.forEach((message) => {
          if (message.chatId === action.payload.chatId) {
            message.isRead = true;
          }
        });
        // Update unread count
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        console.error("Failed to mark messages as read:", action.payload);
      })

      // Get chat by ID
      .addCase(getChatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
        state.error = null;
      })
      .addCase(getChatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearErrors,
  clearSuccess,
  setCurrentChat,
  clearCurrentChat,
  addMessage,
  updateUnreadCount,
  resetChats,
} = chatsSlice.actions;

export default chatsSlice.reducer;
