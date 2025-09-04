import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCompleteProfile,
  updatePersonalProfile,
  updateJobProfile,
  uploadResume,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  clearErrors,
  clearSuccessFlags,
  clearProfileOnLogout,
  selectProfile,
  selectUser,
  selectPersonalProfile,
  selectJobProfile,
  selectPublicProfile,
  selectFavorites,
} from '../features/profile/profileSlice';

export const useProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const { user: authUser } = useSelector((state) => state.auth);

  const {
    profileData,
    loading,
    updateLoading,
    uploadLoading,
    error,
    updateError,
    uploadError,
    updateSuccess,
    uploadSuccess,
    isInitialized,
    lastFetchTime,
  } = profile;

  // Derived selectors
  const user = useSelector(selectUser);
  const personal = useSelector(selectPersonalProfile);
  const jobProfile = useSelector(selectJobProfile);
  const publicProfile = useSelector(selectPublicProfile);
  const favorites = useSelector(selectFavorites);

  // Use ref to track if we've already initiated a fetch to prevent duplicates
  const fetchInitiatedRef = useRef(false);
  const mountedRef = useRef(true);

  // Check if user is authenticated
  const isAuthenticated = Boolean(
    authUser?.token || localStorage.getItem('token')
  );

  // Auto-fetch profile on mount if not initialized and user is authenticated
  useEffect(() => {
    // Only fetch if user is authenticated, not already initialized, not loading, and hasn't been initiated
    if (
      isAuthenticated &&
      !isInitialized &&
      !loading &&
      !fetchInitiatedRef.current
    ) {
      fetchInitiatedRef.current = true;
      console.log('🚀 Initiating profile fetch for authenticated user');
      dispatch(getCompleteProfile()).finally(() => {
        if (mountedRef.current) {
          fetchInitiatedRef.current = false;
        }
      });
    }
  }, [dispatch, isAuthenticated, isInitialized, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Actions with authentication checks
  const fetchProfile = useCallback(() => {
    if (!isAuthenticated) {
      console.warn('⚠️ Cannot fetch profile: User not authenticated');
      return Promise.reject(new Error('User not authenticated'));
    }
    if (fetchInitiatedRef.current) {
      console.log('⏳ Profile fetch already in progress, skipping...');
      return Promise.resolve(profileData);
    }
    fetchInitiatedRef.current = true;
    return dispatch(getCompleteProfile()).finally(() => {
      if (mountedRef.current) {
        fetchInitiatedRef.current = false;
      }
    });
  }, [dispatch, isAuthenticated, profileData]);

  // Force refresh function that bypasses all caching
  const forceRefreshProfile = useCallback(() => {
    if (!isAuthenticated) {
      console.warn('⚠️ Cannot force refresh profile: User not authenticated');
      return Promise.reject(new Error('User not authenticated'));
    }
    console.log('🔄 Force refreshing profile data...');
    fetchInitiatedRef.current = true;
    return dispatch(getCompleteProfile({ forceRefresh: true })).finally(() => {
      if (mountedRef.current) {
        fetchInitiatedRef.current = false;
      }
    });
  }, [dispatch, isAuthenticated]);

  // Enhanced fetch that can force refresh
  const fetchProfileData = useCallback(
    (forceRefresh = false) => {
      if (!isAuthenticated) {
        console.warn('⚠️ Cannot fetch profile: User not authenticated');
        return Promise.reject(new Error('User not authenticated'));
      }

      if (forceRefresh) {
        return forceRefreshProfile();
      }

      return fetchProfile();
    },
    [isAuthenticated, fetchProfile, forceRefreshProfile]
  );

  const updateProfile = useCallback(
    (profileData) => {
      if (!isAuthenticated) {
        console.warn('⚠️ Cannot update profile: User not authenticated');
        return Promise.reject(new Error('User not authenticated'));
      }

      // CRITICAL FIX: Ensure visaStatus is explicitly included
      const enhancedData = {
        ...profileData,
        // If visaStatus is missing but visaStatusField is present, use that
        visaStatus: profileData.visaStatus || profileData.visaStatusField || '',
      };

      console.log('Enhanced profile data in useProfile hook:', {
        originalHadVisaStatus: 'visaStatus' in profileData,
        enhancedHasVisaStatus: 'visaStatus' in enhancedData,
        visaStatus: enhancedData.visaStatus,
        allKeys: Object.keys(enhancedData),
      });

      return dispatch(updatePersonalProfile(enhancedData));
    },
    [dispatch, isAuthenticated]
  );

  const updateJob = useCallback(
    (jobData) => {
      if (!isAuthenticated) {
        console.warn('⚠️ Cannot update job profile: User not authenticated');
        return Promise.reject(new Error('User not authenticated'));
      }
      return dispatch(updateJobProfile(jobData));
    },
    [dispatch, isAuthenticated]
  );

  const handleUploadResume = useCallback(
    (resumeFile) => {
      if (!isAuthenticated) {
        console.warn('⚠️ Cannot upload resume: User not authenticated');
        return Promise.reject(new Error('User not authenticated'));
      }
      return dispatch(uploadResume(resumeFile));
    },
    [dispatch, isAuthenticated]
  );

  const addFavorite = useCallback(
    (listingId) => {
      if (!isAuthenticated) {
        console.warn('⚠️ Cannot add favorite: User not authenticated');
        return Promise.reject(new Error('User not authenticated'));
      }
      return dispatch(addToFavorites(listingId));
    },
    [dispatch, isAuthenticated]
  );

  const removeFavorite = useCallback(
    (listingId) => {
      if (!isAuthenticated) {
        console.warn('⚠️ Cannot remove favorite: User not authenticated');
        return Promise.reject(new Error('User not authenticated'));
      }
      return dispatch(removeFromFavorites(listingId));
    },
    [dispatch, isAuthenticated]
  );

  const fetchFavorites = useCallback(() => {
    if (!isAuthenticated) {
      console.warn('⚠️ Cannot fetch favorites: User not authenticated');
      return Promise.reject(new Error('User not authenticated'));
    }
    return dispatch(getUserFavorites());
  }, [dispatch, isAuthenticated]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessFlags());
  }, [dispatch]);

  const clearProfileStateOnLogout = useCallback(() => {
    console.log('🚪 Clearing profile state on logout');
    dispatch(clearProfileOnLogout());
  }, [dispatch]);

  return {
    // Data
    profileData,
    user,
    personal,
    jobProfile,
    publicProfile,
    favorites,

    // Authentication state
    isAuthenticated,

    // Loading states
    loading,
    updateLoading,
    uploadLoading,

    // Error states
    error,
    updateError,
    uploadError,

    // Success flags
    updateSuccess,
    uploadSuccess,

    // State info
    isInitialized,
    lastFetchTime,

    // Actions
    fetchProfile,
    forceRefreshProfile,
    fetchProfileData,
    updateProfile,
    updateJob,
    uploadResume: handleUploadResume,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    clearErrors: clearAllErrors,
    clearSuccess,
    clearProfileStateOnLogout,
  };
};

export default useProfile;
