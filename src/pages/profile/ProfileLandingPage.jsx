import React from 'react';
import { Link } from 'react-router-dom';
import { profileWelcome } from '../../assets';

const ProfileLandingPage = () => {
  return (
    <div className='flex items-center justify-center'>
      <div className='max-w-md w-full px-4 py-8 text-center'>
        <div className='mb-8'>
          <img
            src={profileWelcome}
            alt='Welcome illustration'
            className='w-full mx-auto'
          />
        </div>

        <h1 className='text-2xl font-semibold mb-6'>
          Please Login or Sign Up first to get all functionalities
        </h1>

        <div className='flex flex-col gap-4 max-w-[280px] mx-auto'>
          <Link
            to='/auth/register'
            className='bg-primary text-white px-4 py-2 rounded-md w-full justify-center'
          >
            Sign Up
          </Link>
          <Link
            to='/auth/login'
            className='bg-white text-primary border border-primary px-4 py-2 rounded-md w-full justify-center'
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileLandingPage;
