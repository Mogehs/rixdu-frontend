import React from 'react';

const MapFallback = ({ errorType = 'missing-key' }) => {
  const errorMessages = {
    'missing-key': {
      title: 'API Key Required',
      message: 'Please add your Google Maps API key to continue.',
      instructions: 'Check the documentation for setup instructions.',
    },
    'load-error': {
      title: 'Map Loading Failed',
      message: "We couldn't load the map correctly.",
      instructions: 'This might be due to network issues or API restrictions.',
    },
    default: {
      title: 'Map Unavailable',
      message: 'The map is currently unavailable.',
      instructions: 'Please try again later.',
    },
  };

  const error = errorMessages[errorType] || errorMessages.default;

  return (
    <div className='flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg p-6 text-center'>
      <div className='w-16 h-16 mb-4 text-gray-400'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
          />
        </svg>
      </div>
      <h3 className='text-lg font-semibold text-gray-700 mb-1'>
        {error.title}
      </h3>
      <p className='text-gray-600 mb-2'>{error.message}</p>
      <p className='text-sm text-gray-500'>{error.instructions}</p>
    </div>
  );
};

export default MapFallback;
