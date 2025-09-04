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
      `Profile API Request: [${config.method.toUpperCase()}] ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error('Profile Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Profile API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `Profile Response Error: [${error.response?.status || 'Unknown'}] ${
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

// Get complete profile
export const getCompleteProfile = createAsyncThunk(
  'profile/getCompleteProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Prevent multiple concurrent calls
      const currentState = getState().personalProfile;
      if (currentState.loading) {
        console.log('⏳ GetCompleteProfile already in progress, skipping...');
        // Return fulfilled with current data instead of rejecting
        return currentState.profile;
      }

      // Debounce mechanism - prevent requests within 2 seconds of each other
      const now = Date.now();
      const timeSinceLastFetch = now - currentState.lastFetchTime;
      if (timeSinceLastFetch < 2000) {
        console.log(
          `⏰ GetCompleteProfile debounced, ${
            2000 - timeSinceLastFetch
          }ms remaining`
        );
        // Return fulfilled with current data instead of rejecting
        return currentState.profile;
      }

      console.log('📋 GetCompleteProfile API call initiated');

      const response = await axiosInstance.get('/me');

      console.log('GetCompleteProfile API response:', {
        success: response.data.success,
        hasPersonalData: !!response.data.data?.personal,
        hasJobProfile: !!response.data.data?.jobProfile,
        hasAvatar: !!response.data.data?.personal?.avatar,
      });

      return response.data.data;
    } catch (error) {
      console.error('GetCompleteProfile API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
      });

      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile data.'
      );
    }
  }
);

// Update location data specifically
export const updateLocationData = createAsyncThunk(
  'profile/updateLocationData',
  async (locationData, { rejectWithValue }) => {
    try {
      console.log('📍 UpdateLocationData API call initiated with:', {
        hasNeighborhood: !!locationData.neighborhood,
        hasBuilding: !!locationData.building,
        hasApartment: !!locationData.apartment,
        hasCountry: !!locationData.country,
        hasZipCode: !!locationData.zipCode,
      });

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add location fields
      if (locationData.neighborhood) {
        formData.append('location[neighborhood]', locationData.neighborhood);
      }
      if (locationData.building) {
        formData.append('location[building]', locationData.building);
      }
      if (locationData.apartment) {
        formData.append('location[appartment]', locationData.apartment); // Note: backend uses 'appartment'
      }
      if (locationData.country) {
        formData.append('location[country]', locationData.country);
      }
      if (locationData.zipCode) {
        formData.append('location[zipCode]', locationData.zipCode);
      }

      // Log FormData contents for debugging
      console.log('Location FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axiosInstance.put('/personal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('UpdateLocationData API response:', {
        success: response.data.success,
        hasLocation: !!response.data.data?.location,
        locationFields: response.data.data?.location
          ? Object.keys(response.data.data.location)
          : [],
      });

      return response.data.data;
    } catch (error) {
      console.error('UpdateLocationData API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
        validationErrors: error.response?.data?.errors,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update location data. Please try again.'
      );
    }
  }
);

// Update personal profile
export const updatePersonalProfile = createAsyncThunk(
  'profile/updatePersonalProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('📝 UpdatePersonalProfile API call initiated with:', {
        hasBio: !!profileData.bio,
        hasDateOfBirth: !!profileData.dateOfBirth,
        hasGender: !!profileData.gender,
        hasZipCode: !!profileData.zipCode,
        hasNeighborhood: !!profileData.neighborhood,
        hasBuilding: !!profileData.building,
        hasApartment: !!profileData.apartment,
        hasCountry: !!profileData.country,
        hasLanguages: !!profileData.languages,
        languages: profileData.languages, // Log actual languages value
        hasVisaStatus: !!profileData.visaStatus,
        visaStatus: profileData.visaStatus,
        hasAvatar: !!profileData.avatar,
        avatarType: profileData.avatar ? typeof profileData.avatar : null,
      });

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add text fields
      if (profileData.bio !== undefined) {
        formData.append('bio', profileData.bio);
      }
      if (profileData.dateOfBirth) {
        // Ensure date is in ISO format for consistency
        try {
          const date = new Date(profileData.dateOfBirth);
          if (!isNaN(date.getTime())) {
            const isoDate = date.toISOString();
            formData.append('dateOfBirth', isoDate);
            console.log('Date of birth formatted:', {
              original: profileData.dateOfBirth,
              formatted: isoDate,
            });
          } else {
            console.warn(
              'Invalid date format ignored:',
              profileData.dateOfBirth
            );
          }
        } catch (dateError) {
          console.error('Date formatting error:', dateError);
          // Send the original value as fallback
          formData.append('dateOfBirth', profileData.dateOfBirth);
        }
      }
      if (profileData.gender) {
        formData.append('gender', profileData.gender);
      }
      // Handle location data
      if (profileData.zipCode) {
        formData.append('location[zipCode]', profileData.zipCode);
      }
      if (profileData.neighborhood) {
        formData.append('location[neighborhood]', profileData.neighborhood);
      }
      if (profileData.building) {
        formData.append('location[building]', profileData.building);
      }
      if (profileData.apartment) {
        formData.append('location[appartment]', profileData.apartment); // Note: backend uses 'appartment'
      }
      if (profileData.country) {
        formData.append('location[country]', profileData.country);
      }
      // Always include visa status in form data, even if empty string
      // Explicitly add visa status field regardless of whether it's defined or not
      // This ensures it's always included in the request
      formData.append('visaStatus', profileData.visaStatus || '');

      // Add email and phone number if provided
      if (profileData.profileEmail !== undefined) {
        console.log(
          'Adding profileEmail to form data:',
          profileData.profileEmail
        );
        formData.append('profileEmail', profileData.profileEmail);
      }

      if (profileData.profilePhoneNumber !== undefined) {
        console.log(
          'Adding profilePhoneNumber to form data:',
          profileData.profilePhoneNumber
        );
        formData.append('profilePhoneNumber', profileData.profilePhoneNumber);
      }

      // Ensure the field exists by checking it directly
      console.log('CRITICAL: Adding visa status to form data:', {
        originalValue: profileData.visaStatus,
        valueToSend: profileData.visaStatus || '',
        type: typeof (profileData.visaStatus || ''),
        formDataKeys: Array.from(formData.keys()),
      });

      // Add it again with different method as a backup
      formData.set('visaStatus', profileData.visaStatus || '');

      // Double check that the form data includes visa status
      let hasVisaStatus = false;
      for (let [key, value] of formData.entries()) {
        if (key === 'visaStatus') {
          hasVisaStatus = true;
          console.log('Confirmed visaStatus exists in form data:', value);
          break;
        }
      }
      if (!hasVisaStatus) {
        console.warn('visaStatus not found in form data, adding it again');
        formData.append('visaStatus', '');
      }
      // Enhanced languages handling
      let languagesArray = [];

      if (profileData.languages) {
        if (Array.isArray(profileData.languages)) {
          languagesArray = profileData.languages;
        } else if (typeof profileData.languages === 'string') {
          languagesArray = profileData.languages
            .split(',')
            .map((lang) => lang.trim())
            .filter((lang) => lang !== '');
        }
      }

      // Instead of using languages[] which can be problematic,
      // convert to JSON string and send as a single field
      formData.append('languages', JSON.stringify(languagesArray));

      // Log the languages being sent
      console.log('Languages being sent:', {
        original: profileData.languages,
        processed: languagesArray,
        asJSON: JSON.stringify(languagesArray),
      });

      // Add avatar file if provided
      if (profileData.avatar && profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      console.log('Original visaStatus value:', profileData.visaStatus);
      console.log('visaStatus type:', typeof profileData.visaStatus);

      // Check if visaStatus is in the form data
      let hasVisaStatusField = false;
      let formDataEntries = [];
      for (let [key, value] of formData.entries()) {
        formDataEntries.push(`${key}: ${value}`);
        console.log(
          `${key}:`,
          value instanceof File ? `File: ${value.name}` : value
        );
        if (key === 'visaStatus') {
          hasVisaStatusField = true;
        }
      }

      // CRITICAL FIX: If visaStatus is missing, try a different approach
      if (!hasVisaStatusField) {
        console.error(
          'CRITICAL: visaStatus missing from FormData, using alternate method'
        );
        // Create a new request body with explicit visa status
        const requestBody = {
          ...Object.fromEntries(formData.entries()),
          visaStatus: profileData.visaStatus || '',
        };

        console.log('Using plain object with visaStatus:', requestBody);

        const response = await axiosInstance.put('/personal', requestBody);
        return response.data.data;
      }

      const response = await axiosInstance.put('/personal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('UpdatePersonalProfile API response:', {
        success: response.data.success,
        hasAvatar: !!response.data.data?.avatar,
        avatarUrl: response.data.data?.avatar,
        languages: response.data.data?.languages, // Log languages from response
        visaStatus: response.data.data?.visaStatus, // Log visa status from response
        hasVisaStatus: !!response.data.data?.visaStatus,
        updatedFields: Object.keys(response.data.data || {}),
        fullResponse: response.data.data, // Log full response data
      });

      return response.data.data;
    } catch (error) {
      console.error('UpdatePersonalProfile API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Unknown error',
        error: error.message,
        validationErrors: error.response?.data?.errors,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update personal profile. Please try again.'
      );
    }
  }
);

const initialState = {
  profile: null,
  personalProfile: null,
  loading: false,
  updateLoading: false,
  error: null,
  updateError: null,
  updateSuccess: false,
  lastFetchTime: 0, // Track last fetch time to prevent rapid requests
};

const personalProfileSlice = createSlice({
  name: 'personalProfile',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetPersonalProfile: (state) => {
      state.profile = null;
      state.personalProfile = null;
      state.loading = false;
      state.updateLoading = false;
      state.error = null;
      state.updateError = null;
      state.updateSuccess = false;
      state.lastFetchTime = 0;
    },
  },
  extraReducers: (builder) => {
    // Get complete profile
    builder
      .addCase(getCompleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(getCompleteProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.personalProfile = action.payload?.personal || null;
        state.error = null;
      })
      .addCase(getCompleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update personal profile
      .addCase(updatePersonalProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updatePersonalProfile.fulfilled, (state, action) => {
        state.updateLoading = false;

        // Ensure visa status is preserved in the state
        const payload = {
          ...action.payload,
          // Explicitly include visa status even if it's an empty string
          visaStatus:
            action.payload?.visaStatus !== undefined
              ? action.payload.visaStatus
              : '',
        };

        console.log('Profile update success with data:', {
          hasVisaStatus: 'visaStatus' in payload,
          visaStatus: payload.visaStatus,
          visaStatusType: typeof payload.visaStatus,
        });

        state.personalProfile = payload;

        // Update the complete profile personal section as well
        if (state.profile) {
          state.profile.personal = payload;
        }
        state.updateError = null;
        state.updateSuccess = true;
      })
      .addCase(updatePersonalProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update location data
      .addCase(updateLocationData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateLocationData.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.personalProfile = action.payload;
        // Update the complete profile personal section as well
        if (state.profile) {
          state.profile.personal = action.payload;
        }
        state.updateError = null;
        state.updateSuccess = true;
      })
      .addCase(updateLocationData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearErrors, clearUpdateSuccess, resetPersonalProfile } =
  personalProfileSlice.actions;
export default personalProfileSlice.reducer;
