import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';

// Import the new unified profile system
import { useProfile } from '../../hooks/useProfile';

// Legacy imports - keeping for backward compatibility
import personalProfileReducer, {
  getCompleteProfile,
  updatePersonalProfile,
  updateLocationData,
  clearErrors,
  clearUpdateSuccess,
  resetPersonalProfile,
} from './personalProfileSlice';

import jobProfileReducer, {
  getJobProfile,
  updateJobProfileSection,
  updateBasicUserInfo,
  uploadResume,
  clearErrors as clearJobErrors,
  clearUpdateSuccess as clearJobUpdateSuccess,
  clearUploadSuccess as clearJobUploadSuccess,
  resetJobProfile,
} from './jobProfileSlice';

// Export the new unified hook as the primary export
export { useProfile };

// Custom hook for personal profile management
export const usePersonalProfile = () => {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);
  const {
    profile,
    personalProfile,
    loading,
    updateLoading,
    error,
    updateError,
    updateSuccess,
  } = useSelector((state) => state.personalProfile);

  // Auto-fetch profile data only once on hook initialization
  useEffect(() => {
    if (!hasInitialized.current && !profile && !loading) {
      hasInitialized.current = true;
      dispatch(getCompleteProfile());
    }
  }, [dispatch]); // Only depend on dispatch which is stable

  const updateProfile = (profileData) => {
    return dispatch(updatePersonalProfile(profileData));
  };

  const updateLocation = (locationData) => {
    return dispatch(updateLocationData(locationData));
  };

  const fetchProfile = () => {
    return dispatch(getCompleteProfile());
  };

  const clearProfileErrors = () => {
    dispatch(clearErrors());
  };

  const clearUpdateSuccessFlag = () => {
    dispatch(clearUpdateSuccess());
  };

  const resetProfile = () => {
    hasInitialized.current = false; // Reset initialization flag
    dispatch(resetPersonalProfile());
  };

  return {
    // Data
    profile,
    personalProfile,
    user: profile?.user || null,

    // Loading states
    loading,
    updateLoading,

    // Error states
    error,
    updateError,
    updateSuccess,

    // Actions
    updateProfile,
    updateLocation,
    fetchProfile,
    clearProfileErrors,
    clearUpdateSuccessFlag,
    resetProfile,
  };
};

// Custom hook for job profile management
export const useJobProfile = () => {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);
  const {
    profile,
    jobProfile,
    loading,
    updateLoading,
    uploadLoading,
    error,
    updateError,
    uploadError,
    updateSuccess,
    uploadSuccess,
  } = useSelector((state) => state.jobProfile);

  // Auto-fetch job profile data only once on hook initialization
  useEffect(() => {
    if (!hasInitialized.current && !profile && !loading) {
      hasInitialized.current = true;
      dispatch(getJobProfile());
    }
  }, [dispatch]); // Only depend on dispatch which is stable

  const updateJobSection = (sectionData) => {
    return dispatch(updateJobProfileSection(sectionData));
  };

  const updateBasicInfo = (basicInfoData) => {
    return dispatch(updateBasicUserInfo(basicInfoData));
  };

  const uploadResumeFile = (resumeFile) => {
    return dispatch(uploadResume(resumeFile));
  };

  const fetchJobProfile = () => {
    return dispatch(getJobProfile());
  };

  const clearJobProfileErrors = () => {
    dispatch(clearJobErrors());
  };

  const clearJobUpdateSuccessFlag = () => {
    dispatch(clearJobUpdateSuccess());
  };

  const clearJobUploadSuccessFlag = () => {
    dispatch(clearJobUploadSuccess());
  };

  const resetJobProfileData = () => {
    hasInitialized.current = false; // Reset initialization flag
    dispatch(resetJobProfile());
  };

  return {
    // Data
    profile,
    jobProfile,
    user: profile?.user || null,
    personalData: profile?.personal || null,

    // Loading states
    loading,
    updateLoading,
    uploadLoading,

    // Error states
    error,
    updateError,
    uploadError,
    updateSuccess,
    uploadSuccess,

    // Actions
    updateJobSection,
    updateBasicInfo,
    uploadResumeFile,
    fetchJobProfile,
    clearJobProfileErrors,
    clearJobUpdateSuccessFlag,
    clearJobUploadSuccessFlag,
    resetJobProfileData,
  };
};

// Export reducers and actions
export {
  personalProfileReducer,
  getCompleteProfile,
  updatePersonalProfile,
  updateLocationData,
  clearErrors,
  clearUpdateSuccess,
  resetPersonalProfile,
};

export {
  jobProfileReducer,
  getJobProfile,
  updateJobProfileSection,
  updateBasicUserInfo,
  uploadResume,
  clearJobErrors,
  clearJobUpdateSuccess,
  clearJobUploadSuccess,
  resetJobProfile,
};

export default personalProfileReducer;
