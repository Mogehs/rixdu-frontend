// Safe auth state helper
import { useSelector } from 'react-redux';

export const useAuthState = () => {
  // Only select the auth slice instead of the entire state
  const authState = useSelector((state) => state?.auth) || {};
  return {
    loading: authState.loading || false,
    error: authState.error || null,
    user: authState.user || null,
    token: authState.token || null,
    isAuthenticated: authState.isAuthenticated || false,
    verificationSent: authState.verificationSent || false,
    registrationSuccess: authState.registrationSuccess || false,
    passwordResetSuccess: authState.passwordResetSuccess || false,
    authState,
  };
};
