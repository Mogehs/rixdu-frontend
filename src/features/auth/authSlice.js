import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response logging
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      `Response Error: [${error.response?.status || 'Unknown'}] ${
        error.config?.url || 'Unknown URL'
      }`
    );
    return Promise.reject(error);
  }
);

// Add token to requests that require authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// auth0 login
export const auth0Login = createAsyncThunk(
  'auth/auth0Login',
  async (accessToken, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth0', {
        accessToken,
      });

      const { user, token } = response.data;

      if (!token || typeof token !== 'string') {
        console.warn('No valid token received from backend');
      }

      return { user, token };
    } catch (error) {
      console.error('Auth0 login failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const message =
        error.response?.data?.message || error.message || 'Auth0 login failed';
      return rejectWithValue(message);
    }
  }
);

// Send verification code
export const sendVerification = createAsyncThunk(
  'auth/sendVerification',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/send-verification', userData);

      return response.data;
    } catch (error) {
      console.error('SendVerification API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to send verification code. Please try again.'
      );
    }
  }
);

// Resend verification code
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/resend-verification',
        userData
      );

      return response.data;
    } catch (error) {
      console.error('ResendVerification API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to resend verification code. Please try again.'
      );
    }
  }
);

// Register new user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/register', userData);

      return response.data;
    } catch (error) {
      console.error('Registration API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        validationErrors: error.response?.data?.errors,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/login', credentials);

      const { token, user } = response.data;

      return { token, user };
    } catch (error) {
      console.error('Login API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        needsVerification: error.response?.data?.needsVerification,
      });

      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/me');

      return response.data.data;
    } catch (error) {
      console.error('GetCurrentUser API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user data.'
      );
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/forgot-password', userData);

      return response.data;
    } catch (error) {
      console.error('ForgotPassword API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to process forgot password request.'
      );
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reset-password', userData);

      return response.data;
    } catch (error) {
      console.error('ResetPassword API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Password reset failed. Please try again.'
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/change-password',
        passwordData
      );

      return response.data;
    } catch (error) {
      console.error('ChangePassword API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password.'
      );
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/logout');

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return response.data;
    } catch (error) {
      console.error('Logout API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(error.response?.data?.message || 'Logout failed.');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  verificationSent: false,
  registrationSuccess: false,
  passwordResetSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearErrors: (state) => {
      state.error = null;
    },
    clearAuthState: (state) => {
      state.verificationSent = false;
      state.registrationSuccess = false;
      state.passwordResetSuccess = false;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Auth0 login
    builder
      .addCase(auth0Login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(auth0Login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        // Persist both token and user data to localStorage consistently
        if (action.payload.token && typeof action.payload.token === 'string') {
          localStorage.setItem('token', action.payload.token);
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(auth0Login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send verification
      .addCase(sendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVerification.fulfilled, (state) => {
        state.loading = false;
        state.verificationSent = true;
        state.error = null;
      })
      .addCase(sendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resend verification
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        // Persist both token and user data to localStorage consistently
        if (action.payload.token && typeof action.payload.token === 'string') {
          localStorage.setItem('token', action.payload.token);
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;

        // Persist user data to localStorage consistently
        if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  clearErrors,
  clearAuthState,
  setUser,
  setToken,
  setAuthenticated,
} = authSlice.actions;
export default authSlice.reducer;
