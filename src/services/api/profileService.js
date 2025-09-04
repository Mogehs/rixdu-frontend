import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/profiles`;

// Create axios instance with common configuration
const profileApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Add token to requests
profileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
profileApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Profile API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Profile API Services
export const profileService = {
  // Get complete profile (includes personal, job, and public data)
  getCompleteProfile: async () => {
    const response = await profileApi.get('/me');

    return response.data;
  },

  // Get job profile specifically
  getJobProfile: async (userId = null) => {
    const url = userId ? `/job/${userId}` : '/job';
    const response = await profileApi.get(url);
    return response.data;
  },

  // Get public profile
  getPublicProfile: async (userId) => {
    const response = await profileApi.get(`/public/${userId}`);
    return response.data;
  },

  // Get professional profile
  getProfessionalProfile: async (userId = null) => {
    const url = userId ? `/professional/${userId}` : '/professional';
    const response = await profileApi.get(url);
    return response.data;
  },

  // Update personal profile
  updatePersonalProfile: async (profileData) => {
    const formData = new FormData();

    // Add text fields
    if (profileData.bio !== undefined) {
      formData.append('bio', profileData.bio || '');
    }
    if (profileData.dateOfBirth) {
      formData.append('dateOfBirth', profileData.dateOfBirth);
    }
    if (profileData.gender) {
      formData.append('gender', profileData.gender);
    }

    // Add location fields
    if (profileData.location) {
      Object.keys(profileData.location).forEach((key) => {
        if (profileData.location[key] !== undefined) {
          formData.append(`location[${key}]`, profileData.location[key] || '');
        }
      });
    }

    // Handle legacy zipCode field (map to location.zipCode)
    if (profileData.zipCode !== undefined) {
      formData.append('location[zipCode]', profileData.zipCode || '');
    }

    // Add languages - backend expects multiple language fields or array
    if (profileData.languages) {
      const languageArray = Array.isArray(profileData.languages)
        ? profileData.languages
        : profileData.languages
            .split(',')
            .map((lang) => lang.trim())
            .filter((lang) => lang);

      languageArray.forEach((lang) => {
        formData.append('languages', lang);
      });
    }

    // Add avatar file
    if (profileData.avatar && profileData.avatar instanceof File) {
      formData.append('avatar', profileData.avatar);
    }

    // Add email and phone updates if provided
    if (profileData.profileEmail) {
      formData.append('profileEmail', profileData.profileEmail);
    }
    if (profileData.profilePhoneNumber) {
      formData.append('profilePhoneNumber', profileData.profilePhoneNumber);
    }

    formData.append('visaStatus', profileData.visaStatus || '');

    // Debug what's in the FormData before sending
    for (let [key, value] of formData.entries()) {
    }

    const response = await profileApi.put('/personal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update job profile
  updateJobProfile: async (jobData) => {
    const response = await profileApi.put('/job', jobData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Upload resume
  uploadResume: async (resumeFile) => {
    // Validate we have a proper file object
    if (!(resumeFile instanceof File)) {
      console.error('Invalid resumeFile object:', resumeFile);
      throw new Error('Invalid file object provided for resume upload');
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await profileApi.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Resume upload API error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        responseData: error.response?.data,
      });
      throw error;
    }
  },

  // Favorites management
  addToFavorites: async (listingId) => {
    const response = await profileApi.post('/favorites', { listingId });
    return response.data;
  },

  removeFromFavorites: async (listingId) => {
    const response = await profileApi.delete(`/favorites/${listingId}`);
    return response.data;
  },

  getUserFavorites: async () => {
    const response = await profileApi.get('/favorites');
    return response.data;
  },

  // Search profiles by skills
  searchProfilesBySkills: async (skills) => {
    const skillsQuery = Array.isArray(skills) ? skills.join(',') : skills;
    const response = await profileApi.get(
      `/search?skills=${encodeURIComponent(skillsQuery)}`
    );
    return response.data;
  },
};

export default profileService;
