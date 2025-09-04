import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPlus, FaEdit } from 'react-icons/fa';
import { AddressIcon, noAddres } from '../../assets';
import { useProfile } from '../../hooks/useProfile';

const NoAddressesView = ({ onAdd }) => (
  <div className='flex flex-col  w-full pt-10'>
    <div className='flex flex-col gap-2'>
      <p>Add your work office and home address</p>
      <button
        className='bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 inline-flex items-center gap-2 w-fit'
        onClick={onAdd}
      >
        Add Address
      </button>
    </div>
    <div className='flex flex-col gap-2 items-center'>
      <img src={noAddres} alt='no address' className='w-120' />
      <p className='text-lg'>
        It looks like you haven't added any addresses yet
      </p>
      <p className='text-sm text-gray-500 max-w-90 text-center'>
        Saved locations make planning and navigating easier for you
      </p>
    </div>
  </div>
);

const AddressCard = ({ location, onEdit, loading }) => (
  <div className='bg-gray-100 p-6 rounded-lg shadow-sm mb-6'>
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center'>
        <img src={AddressIcon} alt='Address Icon' className='w-8 h-8 mr-3' />
        <h3 className='text-lg font-semibold text-gray-800'>Primary Address</h3>
      </div>
    </div>
    <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mb-6'>
      <span className='font-medium'>Neighborhood:</span>
      <span>{location?.neighborhood || 'Not specified'}</span>
      <span className='font-medium'>Building or Street name:</span>
      <span>{location?.building || 'Not specified'}</span>
      <span className='font-medium'>Apartment or Villa number:</span>
      <span>{location?.appartment || 'Not specified'}</span>
      <span className='font-medium'>Country:</span>
      <span>{location?.country || 'Not specified'}</span>
      <span className='font-medium'>Zip Code:</span>
      <span>{location?.zipCode || 'Not specified'}</span>
    </div>
    <div className='flex justify-left'>
      <button
        onClick={onEdit}
        disabled={loading}
        className='flex items-center space-x-2 bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed'
      >
        <FaEdit size={14} />
        <span>Edit Address</span>
      </button>
    </div>
  </div>
);

const ProfileAddressPage = () => {
  const {
    personal: personalProfile,
    loading,
    updateLoading,
    error,
    updateError,
    updateSuccess,
    clearErrors: clearProfileErrors,
    clearSuccess: clearUpdateSuccessFlag,
  } = useProfile();

  const navigate = useNavigate();

  // Handle success message
  useEffect(() => {
    if (updateSuccess) {
      // Clear success flag after showing it
      setTimeout(() => {
        clearUpdateSuccessFlag();
      }, 3000);
    }
  }, [updateSuccess, clearUpdateSuccessFlag]);

  const location = personalProfile?.location;
  const hasLocationData =
    location &&
    (location.neighborhood ||
      location.building ||
      location.appartment ||
      location.country ||
      location.zipCode);

  const handleAddAddress = () => {
    navigate('/dashboard/my-profile/address/add');
  };

  const handleEditAddress = () => {
    navigate('/dashboard/my-profile/address/add');
  };

  if (loading) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg text-gray-500'>
            Loading address information...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>My Address</h2>

      {/* Success Message */}
      {updateSuccess && (
        <div className='mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg'>
          Address updated successfully!
        </div>
      )}

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

      {!hasLocationData ? (
        <NoAddressesView onAdd={handleAddAddress} />
      ) : (
        <div>
          <AddressCard
            location={location}
            onEdit={handleEditAddress}
            loading={updateLoading}
          />
          {/* <div className='mt-6 flex justify-center w-full'>
            <button
              onClick={handleEditAddress}
              className='bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 inline-flex items-center gap-2'
            >
              <FaEdit />
              Update Address
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ProfileAddressPage;
