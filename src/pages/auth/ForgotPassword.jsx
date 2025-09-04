import React, { useState } from 'react';
import { Logo } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../../features/auth/authSlice';
import { useAuthState } from '../../hooks/useAuthState';

const ForgotPassword = () => {
  const [forgotMethod, setForgotMethod] = useState('email');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using the custom hook for safe auth state access
  const { loading, error } = useAuthState();

  const handleMethodChange = (method) => {
    setForgotMethod(method);
    setContactInfo('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (forgotMethod === 'email') {
      if (!contactInfo.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!contactInfo.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10,15}$/.test(contactInfo)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {};
    if (forgotMethod === 'email') {
      payload.email = contactInfo;
    } else {
      payload.phoneNumber = contactInfo;
    }

    try {
      const resultAction = await dispatch(forgotPassword(payload));
      if (forgotPassword.fulfilled.match(resultAction)) {
        // Store contact info in session storage for reset password page
        sessionStorage.setItem('resetContactInfo', contactInfo);
        sessionStorage.setItem('resetMethod', forgotMethod);

        setSubmitted(true);

        // Redirect to reset password page after a delay
        setTimeout(() => {
          navigate('/auth/reset-password');
        }, 3000);
      }
    } catch (err) {
      console.error('Forgot password request failed:', err);
    }
  };

  return (
    <div className='section-container max-w-[550px] mx-auto mt-10 p-10 bg-white rounded-lg shadow-lg'>
      <div className='flex justify-center mb-6'>
        <Link to='/'>
          <img src={Logo} alt='Website Logo' className='h-20 w-20' />
        </Link>
      </div>
      <h2 className='section-heading text-3xl font-bold mb-6 text-center'>
        Forgot Password
      </h2>

      {submitted ? (
        <div className='text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-green-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M5 13l4 4L19 7'
              ></path>
            </svg>
          </div>
          <p className='mb-4 text-gray-600'>
            We've sent a password reset code to your {forgotMethod}.
          </p>
          <p className='mb-8 text-gray-600'>
            You'll be redirected to the reset password page shortly...
          </p>
        </div>
      ) : (
        <>
          <p className='mb-8 text-gray-600 text-center'>
            Enter your registered email or phone number to receive a password
            reset code.
          </p>

          <div className='flex mb-6'>
            <button
              type='button'
              onClick={() => handleMethodChange('email')}
              className={`flex-1 py-2 text-center font-medium ${
                forgotMethod === 'email'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 border-b border-gray-300'
              }`}
            >
              Email
            </button>
            <button
              type='button'
              onClick={() => handleMethodChange('phone')}
              className={`flex-1 py-2 text-center font-medium ${
                forgotMethod === 'phone'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 border-b border-gray-300'
              }`}
            >
              Phone Number
            </button>
          </div>

          <form className='space-y-6' onSubmit={handleSubmit}>
            {forgotMethod === 'email' ? (
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-dark mb-2'
                >
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                  placeholder='Enter your email'
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                />
                {errors.email && (
                  <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-dark mb-2'
                >
                  Phone Number
                </label>
                <input
                  type='tel'
                  id='phone'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                  placeholder='Enter your phone number'
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                />
                {errors.phone && (
                  <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>
                )}
              </div>
            )}

            {error && (
              <p className='text-red-500 text-sm text-center'>{error}</p>
            )}

            <button
              type='submit'
              className='w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300'
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </>
      )}

      <p className='mt-8 text-center text-gray-600'>
        Remember your password?{' '}
        <Link to='/auth/login' className='text-blue-500 hover:underline'>
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
