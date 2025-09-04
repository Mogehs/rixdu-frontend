import React from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { contactUsBanner } from '../../assets';

const ContactUsPage = () => {
  return (
    <div className='bg-white text-gray-800 font-base'>
      <div className='relative bg-gray-900 text-white py-32 text-center'>
        <img
          src={contactUsBanner}
          alt='Contact us background'
          className='absolute inset-0 w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-black opacity-60'></div>
        <div className='relative z-20'>
          <h1 className='text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold'>
            Contact Us
          </h1>
          <p className='text-xl mt-4 max-w-2xl mx-auto'>
            Connect With Us – Your Questions Matter, and We're Here to Provide
            Solutions
          </p>
        </div>
      </div>

      <div className='section-container mb-16'>
        <div className='mb-16'>
          <h2 className='section-heading text-left text-[var(--color-headings)] '>
            Get in touch
          </h2>
          <div className='grid md:grid-cols-3 gap-8 text-center'>
            <div className='flex flex-col items-center p-6'>
              <div className='bg-blue-100 p-4 rounded-full mb-4'>
                <FiMail size={32} className='text-[var(--color-primary)]' />
              </div>
              <h3 className='text-xl font-semibold text-[var(--color-headings)]'>
                Email:
              </h3>
              <p className='text-gray-600'>rixdu12@gmail.com</p>
            </div>
            <div className='flex flex-col items-center p-6'>
              <div className='bg-blue-100 p-4 rounded-full mb-4'>
                <FiPhone size={32} className='text-[var(--color-primary)]' />
              </div>
              <h3 className='text-xl font-semibold text-[var(--color-headings)]'>
                Phone No:
              </h3>
              <p className='text-gray-600'>123-456-789</p>
            </div>
            <div className='flex flex-col items-center p-6'>
              <div className='bg-blue-100 p-4 rounded-full mb-4'>
                <FiMapPin size={32} className='text-[var(--color-primary)]' />
              </div>
              <h3 className='text-xl font-semibold text-[var(--color-headings)]'>
                Location
              </h3>
              <p className='text-gray-600'>
                1234 Market Street, Downtown City, State, 56789
              </p>
            </div>
          </div>
        </div>

        <div className='mx-auto'>
          <h2 className='section-heading text-left text-[var(--color-headings)] '>
            Send Message
          </h2>
          <form className='space-y-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-lg font-medium text-gray-700 mb-1'
                >
                  Name:
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  className='w-full p-3 border-b border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-blue-100 focus:shadow-lg focus:shadow-light-blue-500/50'
                />
              </div>
              <div>
                <label
                  htmlFor='email'
                  className='block text-lg font-medium text-gray-700 mb-1'
                >
                  Email:
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  className='w-full p-3 border-b border-[var(--color-border)]  focus:outline-none focus:ring-1 focus:ring-blue-100 focus:shadow-lg focus:shadow-light-blue-500/50'
                />
              </div>
            </div>
            <div>
              <label
                htmlFor='phone'
                className='block text-lg font-medium text-gray-700 mb-1'
              >
                Phone No:
              </label>
              <input
                type='tel'
                id='phone'
                name='phone'
                className='w-full p-3 border-b border-[var(--color-border)]  focus:outline-none focus:ring-1 focus:ring-blue-100 focus:shadow-lg focus:shadow-light-blue-500/50'
              />
            </div>
            <div>
              <label
                htmlFor='message'
                className='block text-lg font-medium text-gray-700 mb-1'
              >
                Message
              </label>
              <textarea
                id='message'
                name='message'
                rows='5'
                className='w-full p-3 border-b border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-blue-100 focus:shadow-lg focus:shadow-light-blue-500/50'
              ></textarea>
            </div>
            <div className='text-center'>
              <button
                type='submit'
                className=' px-16 py-3 rounded-lg bg-primary text-white'
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
