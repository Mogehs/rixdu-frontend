import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const AuthLayout = () => {
  return (
    <div className='flex flex-col min-h-screen bg-gray-100'>
      <Header />
      <main className='flex-grow flex items-center justify-center p-4 pt-[140px]'>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
