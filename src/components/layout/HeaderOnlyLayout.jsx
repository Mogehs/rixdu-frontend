import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const HeaderOnlyLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow pb-10 pt-[120px]'>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderOnlyLayout;
