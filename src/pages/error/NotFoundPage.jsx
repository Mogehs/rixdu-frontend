import React from 'react';
import { Link } from 'react-router-dom';
import { notFoundImage } from '../../assets';
const NotFoundPage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-white text-center p-6'>
      <h1 className='text-4xl md:text-6xl font-semibold text-[var(--color-primary)]'>
        404
      </h1>
      <p className='text-2xl md:text-3xl  text-[var(--color-headings)] mt-4 mb-8'>
        Oops, Page not found
      </p>
      <div className='my-8'>
        <img
          src={notFoundImage}
          alt='Page Not Found Illustration'
          className='max-w-xs md:max-w-lg mx-auto'
        />
      </div>
      <Link
        to='/'
        className='bg-primary text-white rounded-lg px-6 py-3 text-lg'
      >
        Back to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
