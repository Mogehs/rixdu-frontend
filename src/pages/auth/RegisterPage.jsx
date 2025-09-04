import React, { useState, useEffect } from 'react';
import { Logo } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../features/auth/authSlice';
import { useAuthState } from '../../hooks/useAuthState';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Using the custom hook for safe auth state access
  const { loading, error, authState } = useAuthState();

  // Retrieve data from session storage
  const contactInfo = sessionStorage.getItem('contactInfo');
  const verificationMethod = sessionStorage.getItem('verificationMethod');
  const name = sessionStorage.getItem('name');
  const verificationCode = sessionStorage.getItem('verificationCode');

  useEffect(() => {
    // Redirect to verification method page if no contact info is found
    if (!contactInfo || !verificationMethod) {
      navigate('/auth/verify-method');
      return;
    }

    // Pre-fill the form with data from session storage
    setFormData((prev) => ({
      ...prev,
      name: name || '',
      verificationCode: verificationCode || '',
    }));
  }, [contactInfo, verificationMethod, name, verificationCode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const registrationData = {
      name: formData.name,
      password: formData.password,
      verificationCode: formData.verificationCode,
    };

    // Add email or phone number based on verification method
    if (verificationMethod === 'email') {
      registrationData.email = contactInfo;
    } else {
      registrationData.phoneNumber = contactInfo;
    }

    try {
      const resultAction = await dispatch(registerUser(registrationData));
      if (registerUser.fulfilled.match(resultAction)) {
        // Registration successful, clear session storage and redirect to login
        sessionStorage.removeItem('contactInfo');
        sessionStorage.removeItem('verificationMethod');
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('verificationCode');

        navigate('/auth/login');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className='section-container max-w-[600px] mx-auto mt-10 p-10 bg-white rounded-lg shadow-lg'>
      <div className='flex justify-center mb-6'>
        <Link to='/'>
          <img src={Logo} alt='Website Logo' className='h-20 w-20' />
        </Link>
      </div>
      <h2 className='section-heading text-3xl font-bold mb-6 text-center'>
        Create Your Account
      </h2>
      <p className='mb-8 text-gray-600 text-center'>
        Complete your registration by filling in the details below.
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
            name='name'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Enter your full name'
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && (
            <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
          )}
        </div>

        {verificationMethod === 'email' ? (
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
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100'
              value={contactInfo || ''}
              disabled
            />
            <p className='text-gray-500 text-xs mt-1'>Verified email address</p>
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
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100'
              value={contactInfo || ''}
              disabled
            />
            <p className='text-gray-500 text-xs mt-1'>Verified phone number</p>
          </div>
        )}

        <div>
          <label
            htmlFor='verificationCode'
            className='block text-sm font-medium text-dark mb-2'
          >
            Verification Code
          </label>
          <input
            type='text'
            id='verificationCode'
            name='verificationCode'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Enter verification code'
            value={formData.verificationCode}
            onChange={handleChange}
            required
          />
          {errors.verificationCode && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.verificationCode}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-dark mb-2'
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            name='password'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Create a password'
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-dark mb-2'
          >
            Confirm Password
          </label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Confirm your password'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

        <button
          type='submit'
          className='w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300'
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>
      <p className='mt-8 text-center text-gray-600'>
        Already have an account?{' '}
        <Link to='/auth/login' className='text-blue-500 hover:underline'>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
