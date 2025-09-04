import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';

const ProfileAddressAddPage = () => {
  const navigate = useNavigate();
  const {
    personal: personalProfile,
    loading,
    updateLoading,
    error,
    updateError,
    updateSuccess,
    updateProfile,
    forceRefreshProfile,
    clearErrors: clearProfileErrors,
  } = useProfile();

  const mountedRef = useRef(false);
  const [formData, setFormData] = useState({
    neighborhood: '',
    building: '',
    apartment: '',
    country: '',
    zipCode: '',
  });

  // Force refresh profile data on component mount to ensure fresh data
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log(
        '🔄 ProfileAddressAddPage mounted - force refreshing profile data'
      );
      forceRefreshProfile().catch((error) => {
        console.error('Failed to force refresh profile on mount:', error);
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [forceRefreshProfile]);

  // Pre-fill form with existing data
  useEffect(() => {
    if (personalProfile?.location) {
      const location = personalProfile.location;
      setFormData({
        neighborhood: location.neighborhood || '',
        building: location.building || '',
        apartment: location.appartment || '', // Note: backend uses 'appartment'
        country: location.country || '',
        zipCode: location.zipCode || '',
      });
    }
  }, [personalProfile]);

  // Handle success and redirect
  useEffect(() => {
    if (updateSuccess) {
      navigate('/dashboard/my-profile/address');
    }
  }, [updateSuccess, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    try {
      await updateProfile({
        location: {
          neighborhood: formData.neighborhood,
          building: formData.building,
          appartment: formData.apartment, // Note: backend uses 'appartment'
          country: formData.country,
          zipCode: formData.zipCode,
        },
      });
      // Navigation is handled in useEffect when updateSuccess changes
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const inputStyle =
    'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200';

  if (loading) {
    return (
      <div className='p-6 bg-white rounded-lg shadow-md'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg text-gray-500'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>
        {personalProfile?.location?.neighborhood
          ? 'Update Address'
          : 'Add Address'}
      </h2>

      {/* Error Messages */}
      {(error || updateError) && (
        <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
          <p>{error || updateError}</p>
          <button
            onClick={clearProfileErrors}
            className='mt-2 text-sm underline hover:no-underline'
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSaveAddress}>
        <div className='mb-4'>
          <label
            htmlFor='neighborhood'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Neighborhood
          </label>
          <input
            type='text'
            id='neighborhood'
            name='neighborhood'
            value={formData.neighborhood}
            onChange={handleInputChange}
            className={inputStyle}
            placeholder='Enter neighborhood'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='building'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Building or Street Name
          </label>
          <input
            type='text'
            id='building'
            name='building'
            value={formData.building}
            onChange={handleInputChange}
            className={inputStyle}
            placeholder='Enter building or street name'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='apartment'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Apartment or Villa Number
          </label>
          <input
            type='text'
            id='apartment'
            name='apartment'
            value={formData.apartment}
            onChange={handleInputChange}
            className={inputStyle}
            placeholder='Enter apartment or villa number'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='country'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Country
          </label>
          <input
            type='text'
            id='country'
            name='country'
            value={formData.country}
            onChange={handleInputChange}
            className={inputStyle}
            placeholder='Enter country'
          />
        </div>

        <div className='mb-6'>
          <label
            htmlFor='zipCode'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Zip Code
          </label>
          <input
            type='text'
            id='zipCode'
            name='zipCode'
            value={formData.zipCode}
            onChange={handleInputChange}
            className={inputStyle}
            placeholder='Enter zip code'
          />
        </div>

        <div className='flex gap-4 justify-center'>
          <button
            type='button'
            onClick={() => navigate('/dashboard/my-profile/address')}
            className='bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={updateLoading}
            className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-10 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {updateLoading ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileAddressAddPage;
