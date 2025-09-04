import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/profiles`;
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Add request/response logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      `Job Profile API Request: [${config.method.toUpperCase()}] ${
        config.baseURL
      }${config.url}`
    );
    return config;
  },
  (error) => {
    console.error('Job Profile Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Job Profile API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `Job Profile Response Error: [${error.response?.status || 'Unknown'}] ${
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

// Get job profile
export const getJobProfile = createAsyncThunk(
  'jobProfile/getJobProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Prevent multiple concurrent calls
      const currentState = getState().jobProfile;
      if (currentState.loading) {
        console.log(' GetJobProfile already in progress, skipping...');
        // Return fulfilled with current data instead of rejecting
        return currentState.profile;
      }

      // Debounce mechanism - prevent requests within 2 seconds of each other
      const now = Date.now();
      const timeSinceLastFetch = now - currentState.lastFetchTime;
      if (timeSinceLastFetch < 2000) {
        console.log(
          `GetJobProfile debounced, ${2000 - timeSinceLastFetch}ms remaining`
        );
        // Return fulfilled with current data instead of rejecting
        return currentState.profile;
      }

      console.log('📋 GetJobProfile API call initiated');

      const response = await axiosInstance.get('/job');

      console.log('GetJobProfile API response:', {
        success: response.data.success,
        hasJobProfile: !!response.data.data?.jobProfile,
        hasUserData: !!response.data.data?.user,
        hasAvatar: !!response.data.data?.personal?.avatar,
      });

      return response.data.data;
    } catch (error) {
      console.error('GetJobProfile API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch job profile data.'
      );
    }
  }
);

// Update job profile section
export const updateJobProfileSection = createAsyncThunk(
  'jobProfile/updateJobProfileSection',
  async (sectionData, { rejectWithValue }) => {
    try {
      console.log('📝 UpdateJobProfileSection API call initiated with:', {
        hasQualifications: !!sectionData.qualifications,
        hasExperience: !!sectionData.experience,
        hasSkills: !!sectionData.skills,
        hasLicenses: !!sectionData.licenses,
        hasPortfolio: !!sectionData.portfolio,
        hasReferences: !!sectionData.references,
        hasDigitalProfile: !!sectionData.digitalProfile,
        dataKeys: Object.keys(sectionData),
      });

      // Prepare JSON payload according to API specification
      const payload = {};

      // Add arrays and objects as native JSON (not stringified)
      if (
        sectionData.qualifications &&
        Array.isArray(sectionData.qualifications)
      ) {
        payload.qualifications = sectionData.qualifications;
      }
      if (sectionData.experience && Array.isArray(sectionData.experience)) {
        payload.experience = sectionData.experience;
      }
      if (sectionData.skills && Array.isArray(sectionData.skills)) {
        payload.skills = sectionData.skills;
      }
      if (sectionData.licenses && Array.isArray(sectionData.licenses)) {
        payload.licenses = sectionData.licenses;
      }
      if (sectionData.references && Array.isArray(sectionData.references)) {
        payload.references = sectionData.references;
      }
      if (sectionData.portfolio && typeof sectionData.portfolio === 'object') {
        payload.portfolio = sectionData.portfolio;
      }
      if (
        sectionData.digitalProfile &&
        typeof sectionData.digitalProfile === 'object'
      ) {
        payload.digitalProfile = sectionData.digitalProfile;
      }

      console.log('Job Profile JSON payload:', payload);

      const response = await axiosInstance.put('/job', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('UpdateJobProfileSection API response:', {
        success: response.data.success,
        updatedFields: Object.keys(response.data.data || {}),
        hasQualifications: !!response.data.data?.qualifications,
        hasExperience: !!response.data.data?.experience,
        hasSkills: !!response.data.data?.skills,
      });

      return response.data.data;
    } catch (error) {
      console.error('UpdateJobProfileSection API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
        validationErrors: error.response?.data?.errors,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update job profile section. Please try again.'
      );
    }
  }
);

// Update basic user info (email, phone, visa status)
export const updateBasicUserInfo = createAsyncThunk(
  'jobProfile/updateBasicUserInfo',
  async (basicInfoData, { rejectWithValue }) => {
    try {
      console.log('👤 UpdateBasicUserInfo API call initiated with:', {
        hasEmail: !!basicInfoData.email,
        hasPhone: !!basicInfoData.phoneNumber,
        hasVisaStatus: !!basicInfoData.visaStatus,
      });

      // Call the user API endpoint for basic info updates
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const userResponse = await axios.put(
        `${API_BASE}/user/profile`,
        basicInfoData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log('UpdateBasicUserInfo API response:', {
        success: userResponse.data.success,
        hasUserData: !!userResponse.data.data,
      });

      return userResponse.data.data;
    } catch (error) {
      console.error('UpdateBasicUserInfo API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update basic info. Please try again.'
      );
    }
  }
);

// Upload resume specifically
export const uploadResume = createAsyncThunk(
  'jobProfile/uploadResume',
  async (resumeFile, { rejectWithValue }) => {
    try {
      console.log('📄 UploadResume API call initiated');

      if (!resumeFile || !(resumeFile instanceof File)) {
        return rejectWithValue('Please select a valid resume file.');
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await axiosInstance.put('/job', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('UploadResume API response:', {
        success: response.data.success,
        hasResumeUrl: !!response.data.data?.resume,
      });

      return response.data.data;
    } catch (error) {
      console.error('UploadResume API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to upload resume. Please try again.'
      );
    }
  }
);

const initialState = {
  profile: null,
  jobProfile: null,
  loading: false,
  updateLoading: false,
  uploadLoading: false,
  error: null,
  updateError: null,
  uploadError: null,
  updateSuccess: false,
  uploadSuccess: false,
  lastFetchTime: 0, // Track last fetch time to prevent rapid requests
};

const jobProfileSlice = createSlice({
  name: 'jobProfile',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.uploadError = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = false;
    },
    resetJobProfile: (state) => {
      state.profile = null;
      state.jobProfile = null;
      state.loading = false;
      state.updateLoading = false;
      state.uploadLoading = false;
      state.error = null;
      state.updateError = null;
      state.uploadError = null;
      state.updateSuccess = false;
      state.uploadSuccess = false;
      state.lastFetchTime = 0;
    },
  },
  extraReducers: (builder) => {
    // Get job profile
    builder
      .addCase(getJobProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(getJobProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.jobProfile = action.payload?.jobProfile || null;
        state.error = null;
      })
      .addCase(getJobProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update job profile section
      .addCase(updateJobProfileSection.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateJobProfileSection.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.jobProfile = action.payload;
        // Update the complete profile job section as well
        if (state.profile) {
          state.profile.jobProfile = action.payload;
        }
        state.updateError = null;
        state.updateSuccess = true;
      })
      .addCase(updateJobProfileSection.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update basic user info
      .addCase(updateBasicUserInfo.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateBasicUserInfo.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update the user data in profile
        if (state.profile?.user) {
          state.profile.user = { ...state.profile.user, ...action.payload };
        }
        state.updateError = null;
        state.updateSuccess = true;
      })
      .addCase(updateBasicUserInfo.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Upload resume
      .addCase(uploadResume.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploadLoading = false;
        // Update the resume in job profile
        if (state.jobProfile) {
          state.jobProfile.resume = action.payload.resume;
        }
        if (state.profile?.jobProfile) {
          state.profile.jobProfile.resume = action.payload.resume;
        }
        state.uploadError = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
        state.uploadSuccess = false;
      });
  },
});

export const {
  clearErrors,
  clearUpdateSuccess,
  clearUploadSuccess,
  resetJobProfile,
} = jobProfileSlice.actions;
export default jobProfileSlice.reducer;
