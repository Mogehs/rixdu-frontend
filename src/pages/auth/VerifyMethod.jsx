import React, { useState } from 'react';
import { Logo } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { sendVerification } from '../../features/auth/authSlice';
import { useAuthState } from '../../hooks/useAuthState';

const VerifyMethod = () => {
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [contactInfo, setContactInfo] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using the custom hook for safe auth state access
  const { loading, error } = useAuthState();

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!contactInfo.trim()) {
      newErrors[verificationMethod] = `${
        verificationMethod === 'email' ? 'Email' : 'Phone number'
      } is required`;
    } else if (
      verificationMethod === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo)
    ) {
      newErrors.email = 'Please enter a valid email address';
    } else if (
      verificationMethod === 'phone' &&
      !/^[0-9]{10,15}$/.test(contactInfo)
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = { name };

    if (verificationMethod === 'email') {
      payload.email = contactInfo;
    } else {
      payload.phoneNumber = contactInfo;
    }

    try {
      const resultAction = await dispatch(sendVerification(payload));
      if (sendVerification.fulfilled.match(resultAction)) {
        // Store the contact info and method in sessionStorage for the next step
        sessionStorage.setItem('verificationMethod', verificationMethod);
        sessionStorage.setItem('contactInfo', contactInfo);
        sessionStorage.setItem('name', name);

        // Navigate to OTP verification page
        navigate('/auth/verify-otp');
      }
    } catch (err) {
      console.error('Verification failed:', err);
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
        Verify Your Account
      </h2>
      <p className='mb-8 text-gray-600 text-center'>
        Choose how you'd like to receive your verification code
      </p>

      <form className='space-y-6' onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-dark mb-2'
          >
            Full Name
          </label>
          <input
            type='text'
            id='name'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Enter your full name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && (
            <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
          )}
        </div>

        <div className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center'>
              <input
                type='radio'
                id='email'
                name='verificationMethod'
                value='email'
                checked={verificationMethod === 'email'}
                onChange={() => setVerificationMethod('email')}
                className='mr-2'
              />
              <label htmlFor='email' className='text-sm font-medium text-dark'>
                Email
              </label>
            </div>

            <div className='flex items-center'>
              <input
                type='radio'
                id='phone'
                name='verificationMethod'
                value='phone'
                checked={verificationMethod === 'phone'}
                onChange={() => setVerificationMethod('phone')}
                className='mr-2'
              />
              <label htmlFor='phone' className='text-sm font-medium text-dark'>
                Phone Number
              </label>
            </div>
          </div>

          {verificationMethod === 'email' ? (
            <div>
              <label
                htmlFor='email-input'
                className='block text-sm font-medium text-dark mb-2'
              >
                Email Address
              </label>
              <input
                type='email'
                id='email-input'
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
                htmlFor='phone-input'
                className='block text-sm font-medium text-dark mb-2'
              >
                Phone Number
              </label>
              <input
                type='tel'
                id='phone-input'
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
        </div>

        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

        <button
          type='submit'
          className='w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300'
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
    </div>
  );
};

export default VerifyMethod;
