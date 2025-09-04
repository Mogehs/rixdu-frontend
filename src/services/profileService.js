// Profile service functions
// These are handled by Redux Toolkit async thunks in the personalProfileSlice
// This file exists for potential future expansion or direct API calls

import {
  getCompleteProfile,
  updatePersonalProfile,
} from '../features/profile/personalProfileSlice';

// Re-export the async thunks for direct usage if needed
export { getCompleteProfile, updatePersonalProfile };

// Helper function to format date for display
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.warn('Invalid date format:', dateString, error.message);
    return '';
  }
};

// Helper function to format date for input field
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date format:', dateString, error.message);
    return '';
  }
};

// Helper function to format languages array
export const formatLanguagesDisplay = (languages) => {
  if (!languages) return '';
  if (Array.isArray(languages)) {
    return languages.join(', ');
  }
  return languages;
};

// Helper function to parse languages string to array
export const parseLanguagesInput = (languagesString) => {
  if (!languagesString) return [];
  return languagesString
    .split(',')
    .map((lang) => lang.trim())
    .filter((lang) => lang.length > 0);
};

// Helper function to format location for display
export const formatLocationDisplay = (location) => {
  if (!location) return 'No address specified';

  const parts = [];

  if (location.neighbourhood || location.neighborhood) {
    parts.push(location.neighbourhood || location.neighborhood);
  }
  if (location.building) {
    parts.push(location.building);
  }
  if (location.appartment) {
    // Note: backend uses 'appartment'
    parts.push(`Apt ${location.appartment}`);
  }
  if (location.country) {
    parts.push(location.country);
  }
  if (location.zipCode) {
    parts.push(location.zipCode);
  }

  return parts.length > 0 ? parts.join(', ') : 'No address specified';
};

// Helper function to check if location data exists
export const hasLocationData = (location) => {
  return (
    location &&
    (location.neighborhood ||
      location.building ||
      location.appartment ||
      location.country ||
      location.zipCode)
  );
};

// Helper function to validate profile form data
export const validateProfileForm = (profileData) => {
  const errors = {};

  if (profileData.dateOfBirth) {
    const birthDate = new Date(profileData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13 || age > 120) {
      errors.dateOfBirth = 'Please enter a valid age between 13 and 120 years';
    }
  }

  if (profileData.bio && profileData.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
