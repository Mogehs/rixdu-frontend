import React from 'react';

const TopGarageCardList = ({ garages }) => (
  <>
    {garages.map((garage, idx) => (
      <div
        key={idx}
        className='embla__slide min-w-[320px] max-w-[370px] flex-shrink-0 rounded-2xl overflow-hidden relative group shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl'
      >
        <div className='relative w-full h-[270px]'>
          <img
            src={garage.img}
            alt={garage.name}
            className='w-full h-full object-cover rounded-2xl'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-2xl transition duration-300 group-hover:from-transparent group-hover:via-transparent'></div>
          <div className='absolute bottom-0 left-0 w-full p-6 text-white'>
            <h4 className='text-2xl font-semibold mb-1 drop-shadow-lg'>
              {garage.name}
            </h4>
            <div className='flex items-center text-gray-200 text-sm mb-1'>
              <span className='mr-2'>{garage.location}</span>
              <span className='flex items-center ml-auto'>
                <span className='text-yellow-400 text-lg mr-1'>★</span>
                {garage.rating}
              </span>
            </div>
            <div className='text-white text-sm font-medium drop-shadow'>
              {garage.service}
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

export default TopGarageCardList;
