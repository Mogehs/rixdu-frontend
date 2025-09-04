import React from 'react';
import { useNavigate } from 'react-router-dom';

const cities = [
  { name: 'Dubai', value: 'dubai' },
  { name: 'Abu Dhabi', value: 'abu-dhabi' },
  { name: 'Sharjah', value: 'sharjah' },
  { name: 'Ras Al Khaimah', value: 'ras-al-khaimah' },
  { name: 'Ajman', value: 'ajman' },
  { name: 'Fujairah', value: 'fujairah' },
  { name: 'Umm Al Quwain', value: 'umm-al-quwain' },
  { name: 'Al Ain', value: 'al-ain' },
];

const SelectCityPage = () => {
  const navigate = useNavigate();

  const handleCitySelect = (cityValue) => {
    navigate(`/place-ad/${cityValue}`);
  };

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-semibold mb-2'>Select a City</h1>
        <p className='text-gray-600'>Where should we place your Ad?</p>
      </div>

      <div className='space-y-4'>
        {cities.map((city) => (
          <button
            key={city.value}
            onClick={() => handleCitySelect(city.value)}
            className='w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:border-blue-500 transition-colors'
          >
            <span className='text-lg'>{city.name}</span>
            <svg
              className='w-6 h-6 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectCityPage;
