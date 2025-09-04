import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { auth0Login } from '../../features/auth/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated: reduxIsAuthenticated } = useSelector(
    (state) => state.auth
  );

  const {
    isAuthenticated: auth0Authenticated,
    isLoading: auth0Loading,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    const syncAuth0 = async () => {
      // Only sync Auth0 if user is authenticated with Auth0 but not in Redux
      if (auth0Authenticated && !reduxIsAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          await dispatch(auth0Login(accessToken));
        } catch (err) {
          console.error('Error syncing Auth0 with Redux:', err);
        }
      }
    };

    if (!auth0Loading) {
      syncAuth0();
    }
  }, [
    auth0Authenticated,
    auth0Loading,
    reduxIsAuthenticated,
    dispatch,
    getAccessTokenSilently,
  ]);

  return children;
};

export default AuthInitializer;
