import React from 'react';
import * as assets from '../../assets';

const residentialImages = [
  assets.popularResedential1,
  assets.popularResedential2,
  assets.popularResedential3,
];

const PopularResidential = () => {
  return (
    <div className=''>
      <div className='relative h-[500px] overflow-hidden '>
        {/* Background images container */}
        <div className='h-full flex gap-4 flex-col md:flex-row'>
          {residentialImages.map((img, index) => {
            return (
              <div key={index} className='flex-1 h-full'>
                <img
                  src={img}
                  alt='Residential Property 1'
                  className='w-full  h-[500px] md:h-full object-cover'
                />
              </div>
            );
          })}
        </div>

        {/* Dark overlay */}
        <div className='absolute inset-0 bg-black opacity-50 z-10'></div>

        {/* Text content */}
        <div className='absolute inset-0 flex flex-col items-center justify-center text-white px-4 z-20'>
          <h2 className='section-heading text-white text-center'>
            Most Popular Residential for Rent, Sell, Buy and Off-Plan
          </h2>
          <div className='w-full max-w-5xl mx-auto bg-white my-6 h-[2px]'></div>
          <h3 className='text-2xl md:text-3xl font-semibold text-center max-w-[90%]'>
            Unlock Your Next Home with Rixdu
          </h3>
        </div>
      </div>
    </div>
  );
};

export default PopularResidential;
