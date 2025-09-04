// Auth0ProviderWithHistory.jsx
import React, { useEffect, useRef } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { auth0Login } from './features/auth/authSlice';

const InnerAuthHandler = () => {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const { isAuthenticated: reduxIsAuthenticated, token: reduxToken, loading } = useSelector((state) => state.auth);
  const hasProcessedAuth = useRef(false);

  useEffect(() => {
    // Reset the flag when user logs out
    if (!isAuthenticated) {
      hasProcessedAuth.current = false;
      return;
    }

    // Don't process if still loading Auth0, not authenticated, already processed, or Redux shows we're already authenticated
    if (isLoading || !isAuthenticated || hasProcessedAuth.current || (reduxIsAuthenticated && reduxToken) || loading) {
      return;
    }

    // Set flag to prevent duplicate calls
    hasProcessedAuth.current = true;

    (async () => {
      try {
        const accessToken = await getAccessTokenSilently({
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'read:current_user',
        });

        // Dispatch the auth0Login thunk
        const resultAction = await dispatch(auth0Login(accessToken));

        if (auth0Login.rejected.match(resultAction)) {
          console.error('Auth0 login failed via Redux:', resultAction.payload);
          // Reset flag on failure so it can retry if needed
          hasProcessedAuth.current = false;
        }
      } catch (e) {
        console.error('Silent token fetch failed:', e);
        // Reset flag on failure so it can retry if needed
        hasProcessedAuth.current = false;
      }
    })();
  }, [isLoading, isAuthenticated, reduxIsAuthenticated, reduxToken, loading, getAccessTokenSilently, dispatch]);

  return null;
};

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      audience={audience}
      onRedirectCallback={onRedirectCallback}
    >
      <InnerAuthHandler />
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
