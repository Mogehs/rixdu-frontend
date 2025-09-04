import React, { useState, useEffect } from 'react';

const InputField = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  onBlur,
  required,
}) => (
  <div className='mb-4'>
    <label
      htmlFor={id}
      className='block text-sm font-medium text-gray-700 mb-2'
    >
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={name || id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`w-full p-3 border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
    />
    {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
  </div>
);

const EditProfileForm = ({ currentUser, onSave, onClose }) => {
  const [formData, setFormData] = useState(currentUser);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(currentUser);
  }, [currentUser]);

  // Format and validate phone number
  const formatPhoneNumber = (number) => {
    if (!number) return '';
    // Remove all non-digit characters except +
    const cleanedNumber = number.replace(/[^\d+]/g, '');
    // Handle international format
    if (cleanedNumber.startsWith('00')) {
      return '+' + cleanedNumber.substring(2);
    }
    if (!cleanedNumber.startsWith('+') && cleanedNumber.length > 10) {
      return '+' + cleanedNumber;
    }
    return cleanedNumber;
  };

  const validatePhoneNumber = (number) => {
    if (!number) return true; // Empty is valid
    const formattedNumber = formatPhoneNumber(number);
    // Basic phone validation - at least 7 digits (including country code)
    return /^[+]?[\d]{7,}$/.test(formattedNumber);
  };

  // Email validation using regex
  const validateEmail = (email) => {
    if (!email) return true; // Empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone if provided
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number with country code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone numbers
    if (name === 'phone') {
      // Allow entry of digits, +, spaces, hyphens, and parentheses
      const sanitizedValue = value.replace(/[^\d+\s()\-]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));

      // Clear error if field becomes valid
      if (validatePhoneNumber(sanitizedValue)) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    } else if (name === 'email') {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error if field becomes valid
      if (validateEmail(value)) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    } else {
      // Standard handling for other fields
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validate on blur
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Please enter a valid email address',
        }));
      }
    } else if (name === 'phone' && value) {
      if (!validatePhoneNumber(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Please enter a valid phone number with country code',
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for the API
      const formattedData = {
        // Map fields to their API-expected names
        fullName: formData.name,
        profileEmail: formData.email,
        profilePhoneNumber: formData.phone
          ? formatPhoneNumber(formData.phone)
          : '',
        visaStatus: formData.visaStatus || '',
        dateOfBirth: formData.dob || '',
        gender: formData.gender || '',
      };

      console.log('Saving profile with formatted data:', formattedData);
      await onSave(formattedData);
    } catch (error) {
      console.error('Error saving profile data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        id='name'
        label='Full Name'
        placeholder='E.g., Sam Wilson'
        value={formData.name || ''}
        onChange={handleChange}
      />
      <InputField
        id='email'
        label='Email Address'
        type='email'
        placeholder='your.email@example.com'
        value={formData.email || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
      />
      <InputField
        id='phone'
        label='Phone Number'
        type='tel'
        placeholder='+0123456789'
        value={formData.phone || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.phone}
      />
      <InputField
        id='visaStatus'
        label='Visa Status'
        placeholder='E.g., Permanent Resident'
        value={formData.visaStatus || ''}
        onChange={handleChange}
      />
      <InputField
        id='dob'
        label='Date of Birth'
        type='date'
        value={formData.dob ? formData.dob.substring(0, 10) : ''}
        onChange={handleChange}
      />
      <div className='mb-4'>
        <label
          htmlFor='gender'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Gender
        </label>
        <select
          id='gender'
          name='gender'
          value={formData.gender || ''}
          onChange={handleChange}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
        >
          <option value=''>Select gender</option>
          <option value='Male'>Male</option>
          <option value='Female'>Female</option>
          <option value='Other'>Other</option>
          <option value='Prefer not to say'>Prefer not to say</option>
        </select>
      </div>
      <div className='flex justify-end items-center gap-3 mt-6'>
        <button
          type='button'
          onClick={onClose}
          className='py-2 px-5 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-medium'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className='py-2 px-5 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors font-medium disabled:opacity-50'
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
