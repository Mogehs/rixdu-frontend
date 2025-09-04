import React from 'react';
import {
  PlayStoreBlackBg,
  AppStoreBlackBg,
  appPromoLeft,
  appPromoRight,
  qrCodeImage, // ← Add this image to your assets folder
} from '../../assets';

const AppPromo = () => {
  return (
    <section className='section-container py-6 md:py-12 lg:py-12'>
      {/* Heading - Mobile Optimized */}
      <h2 className='section-heading text-center mb-32'>
        Download the Rixdu App – Buy, Sell & Rent Smarter
      </h2>

      {/* Promo Card - Mobile First Design */}
      <div className='relative bg-blue-50 rounded-2xl mx-4 sm:mx-6 md:mx-8 lg:mx-0 lg:rounded-3xl px-3 sm:px-4 md:px-8 pt-16  overflow-visible'>
        {/* Mobile Layout (Stacked) */}
        <div className='block lg:hidden'>
          <div className='flex flex-col items-center gap-4 sm:gap-6'>
            {/* Center Content First on Mobile */}
            <div className='text-center px-2'>
              <p className='text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-4 sm:mb-6'>
                Your Marketplace, Now in Your Pocket
              </p>

              {/* Mobile Buttons Layout */}
              <div className='flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 mb-4'>
                <a
                  href='#'
                  className='transition-all duration-300 hover:scale-105'
                >
                  <img
                    src={PlayStoreBlackBg}
                    alt='Get it on Google Play'
                    className='h-10 sm:h-12 w-auto'
                  />
                </a>
                <a
                  href='#'
                  className='transition-all duration-300 hover:scale-105'
                >
                  <img
                    src={AppStoreBlackBg}
                    alt='Download on App Store'
                    className='h-10 sm:h-12 w-auto'
                  />
                </a>
              </div>

              {/* QR Code on Mobile */}
              <div className='flex flex-col items-center gap-2'>
                <img
                  src={qrCodeImage}
                  alt='Rixdu QR Code'
                  className='w-16 sm:w-20 h-auto'
                />
                <p className='text-primary font-medium text-xs sm:text-sm'>
                  Scan to Install Rixdu
                </p>
              </div>
            </div>

            {/* Phone Images Side by Side on Mobile */}
            <div className='flex items-end justify-center gap-4 sm:gap-6 mt-2'>
              <img
                src={appPromoLeft}
                alt='Rixdu App Left Preview'
                className='w-24 sm:w-32 md:w-40 h-auto'
              />
              <img
                src={appPromoRight}
                alt='Rixdu App Right Preview'
                className='w-24 sm:w-32 md:w-40 h-auto'
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout (Horizontal with Popping Phones) */}
        <div className='hidden lg:flex relative overflow-visible items-center justify-between gap-8 xl:gap-12 '>
          {/* Left Phone - Pops more from top, touches bottom */}
          <div className='absolute left-0 top-[-120px] -bottom-0 flex items-end justify-center '>
            <img
              src={appPromoLeft}
              alt='Rixdu App Left Preview'
              className='w-64 xl:w-68 h-full object-contain'
            />
          </div>

          {/* Center Content */}
          <div
            className='flex flex-col items-center justify-center gap-6 xl:gap-8 text-center flex-1 max-w-lg xl:max-w-xl mx-auto z-[1] 
          pb-6'
          >
            <p className='text-lg xl:text-xl font-semibold text-gray-800 leading-tight'>
              Your Marketplace, Now in Your Pocket
            </p>
            <div className='flex items-center justify-center gap-6 xl:gap-8'>
              <a
                href='#'
                className='transition-all duration-300 hover:scale-105 flex-shrink-0'
              >
                <img
                  src={PlayStoreBlackBg}
                  alt='Get it on Google Play'
                  className='h-14 xl:h-16 w-auto'
                />
              </a>
              <div className='flex flex-col items-center gap-2 flex-shrink-0'>
                <img
                  src={qrCodeImage}
                  alt='Rixdu QR Code'
                  className='w-24 xl:w-28 h-auto'
                />
                <p className='text-primary font-medium text-sm whitespace-nowrap'>
                  Scan to Install Rixdu
                </p>
              </div>
              <a
                href='#'
                className='transition-all duration-300 hover:scale-105 flex-shrink-0'
              >
                <img
                  src={AppStoreBlackBg}
                  alt='Download on App Store'
                  className='h-14 xl:h-16 w-auto'
                />
              </a>
            </div>
          </div>

          {/* Right Phone - Pops more from top, touches bottom */}
          <div className='absolute right-0 top-[-130px] -bottom-0 flex items-end justify-center'>
            <img
              src={appPromoRight}
              alt='Rixdu App Right Preview'
              className='w-64 xl:w-68 h-full object-contain'
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromo;
