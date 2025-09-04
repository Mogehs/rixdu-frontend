import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LoadingScreen = () => (
  <div className='min-h-screen flex items-center justify-center bg-gray-50'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
      <p className='text-gray-600'>Loading.......</p>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!authLoading) {
      setIsChecking(false);
    }
  }, [authLoading]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  const userIsAuthenticated = isAuthenticated || Boolean(token);

  if (!userIsAuthenticated) {
    console.log('🔒 User not authenticated, redirecting to login');
    return <Navigate to='/auth/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
