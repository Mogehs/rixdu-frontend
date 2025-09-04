import React, { useState, useEffect } from 'react';
import { Logo } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../../features/auth/authSlice';
import { useAuthState } from '../../hooks/useAuthState';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    resetCode: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using the custom hook for safe auth state access
  const { loading, error } = useAuthState();

  const contactInfo = sessionStorage.getItem('resetContactInfo');
  const resetMethod = sessionStorage.getItem('resetMethod');

  useEffect(() => {
    // Redirect to forgot password page if no contact info is found
    if (!contactInfo || !resetMethod) {
      navigate('/auth/forgot-password');
    }
  }, [contactInfo, resetMethod, navigate]);

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

    if (!formData.resetCode.trim()) {
      newErrors.resetCode = 'Reset code is required';
    } else if (formData.resetCode.length !== 6) {
      newErrors.resetCode = 'Reset code must be 6 digits';
    }

    if (!formData.password) {
      newErrors.password = 'New password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const resetData = {
      resetCode: formData.resetCode,
      password: formData.password,
    };

    // Add email or phoneNumber based on reset method
    if (resetMethod === 'email') {
      resetData.email = contactInfo;
    } else {
      resetData.phoneNumber = contactInfo;
    }

    try {
      const resultAction = await dispatch(resetPassword(resetData));
      if (resetPassword.fulfilled.match(resultAction)) {
        // Reset successful, clear session storage and redirect to login
        sessionStorage.removeItem('resetContactInfo');
        sessionStorage.removeItem('resetMethod');

        // Show success message and redirect
        alert(
          'Password reset successful! You can now log in with your new password.'
        );
        navigate('/auth/login');
      }
    } catch (err) {
      console.error('Password reset failed:', err);
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
        Reset Password
      </h2>
      <p className='mb-8 text-gray-600 text-center'>
        Enter the reset code sent to your{' '}
        {resetMethod === 'email' ? 'email' : 'phone'} and create a new password.
      </p>

      <form className='space-y-6' onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor='resetCode'
            className='block text-sm font-medium text-dark mb-2'
          >
            Reset Code
          </label>
          <input
            type='text'
            id='resetCode'
            name='resetCode'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Enter 6-digit reset code'
            value={formData.resetCode}
            onChange={handleChange}
            maxLength={6}
            required
          />
          {errors.resetCode && (
            <p className='text-red-500 text-xs mt-1'>{errors.resetCode}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-dark mb-2'
          >
            New Password
          </label>
          <input
            type='password'
            id='password'
            name='password'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            placeholder='Create new password'
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
          )}
          <p className='text-gray-500 text-xs mt-1'>
            Password must be at least 8 characters long
          </p>
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
            placeholder='Confirm new password'
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
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <p className='mt-8 text-center text-gray-600'>
        Remember your password?{' '}
        <Link to='/auth/login' className='text-blue-500 hover:underline'>
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
