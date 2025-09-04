import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useAuth = () => {
  // Get auth state from Redux store
  const authState = useSelector((state) => state.auth);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token || authState?.isAuthenticated) {
      setIsLoggedIn(true);
      setUser(authState?.user || null);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [authState]);
  const login = (userData, token) => {
    console.warn('useAuth.login is deprecated. Use Redux actions instead.');
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    console.warn('useAuth.logout is deprecated. Use Redux actions instead.');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  return {
    isLoggedIn,
    user,
    login,
    logout,
  };
};
