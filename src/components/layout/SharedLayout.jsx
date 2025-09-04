import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { mobileNavLinks } from '../../data/navigationData';

const SharedLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <header className='bg-blue-600 text-white p-4 shadow-md'>
        <div className='container mx-auto flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Rixdu</h1>{' '}
          <nav className='hidden md:block'>
            <ul className='flex space-x-6'>
              {mobileNavLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => (isActive ? 'font-bold' : '')}
                  >
                    {link.text}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className='flex items-center space-x-4'>
            <NavLink to='/auth/login' className='text-white hover:underline'>
              Login
            </NavLink>
            <NavLink to='/profile/my' className='text-white hover:underline'>
              My Profile
            </NavLink>
          </div>
        </div>{' '}
        <div className='md:hidden mt-4'>
          <nav>
            <ul className='flex flex-wrap gap-4 justify-center'>
              {mobileNavLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => (isActive ? 'font-bold' : '')}
                  >
                    {link.text}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to='/explore'
                  className={({ isActive }) => (isActive ? 'font-bold' : '')}
                >
                  Explore
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className='flex-grow container mx-auto p-4'>
        <Outlet />
      </main>
      <footer className='bg-gray-800 text-white p-6'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <h3 className='text-xl font-bold mb-3'>Rixdu</h3>
              <p className='text-gray-300'>
                Your marketplace for properties, motors, and jobs.
              </p>
            </div>{' '}
            <div>
              <h4 className='font-bold mb-3'>Quick Links</h4>
              <ul className='space-y-2'>
                {footerLinks.quickLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.to}
                      className='text-gray-300 hover:text-white'
                    >
                      {link.text}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-3'>Company</h4>
              <ul className='space-y-2'>
                {footerLinks.companyLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.to}
                      className='text-gray-300 hover:text-white'
                    >
                      {link.text}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-3'>My Account</h4>
              <ul className='space-y-2'>
                {footerLinks.accountLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.to}
                      className='text-gray-300 hover:text-white'
                    >
                      {link.text}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='mt-8 pt-6 border-t border-gray-700 text-center text-gray-400'>
            <p>&copy; {new Date().getFullYear()} Rixdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SharedLayout;
