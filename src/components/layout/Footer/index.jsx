import React from 'react';
import { Link } from 'react-router-dom';
import {
  footerBg,
  facebookIcon,
  twitterIcon,
  linkedinIcon,
  instagramIcon,
  youtubeIcon,
  getOnPlaystore,
  getOnApplestore,
} from '../../../assets';
import { footerLinks } from '../../../data/navigationData';

// Custom CSS for extra small screens
const xsScreenStyle = `
@media (min-width: 480px) {
  .xs\\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
`;

const Footer = () => {
  // Navigation links data
  const navigationLinks = [
    { name: 'Home', to: '/' },
    { name: 'Listings', to: '/listings' },
    { name: 'About Us', to: '/about-us' },
    { name: 'Contact', to: '/contact' },
    { name: 'FAQ', to: '/faq' },
  ];

  // Category links data
  const categoryLinks = [
    { name: 'Electronics', to: '/category/electronics' },
    { name: 'Real Estate', to: '/category/real-estate' },
    { name: 'Fashion', to: '/category/fashion' },
    { name: 'Services', to: '/category/services' },
    { name: 'Jobs', to: '/category/jobs' },
    { name: 'Pets', to: '/category/pets' },
    { name: 'Vehicles', to: '/category/vehicles' },
    { name: 'Home & Garden', to: '/category/home-garden' },
    { name: 'Collectibles', to: '/category/collectibles' },
  ];

  return (
    <footer
      className='w-full text-white py-4 md:py-6 relative'
      style={{
        backgroundImage: `url(${footerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: xsScreenStyle }} />
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {/* Logo and Tagline */}
        <div className='flex flex-col md:flex-row justify-center md:justify-center items-center gap-3 mb-5 md:mb-8'>
          {/* Logo */}
          <Link to='/' className='inline-block'>
            <img
              src='/rixdu-logo-transparent.png'
              alt='Rixdu'
              className='h-10 md:h-12'
            />
          </Link>

          {/* Tagline */}
          <h2 className='text-base md:text-xl font-medium'>
            Your City. Your Market. Your Rules.
          </h2>
        </div>

        {/* Main footer content */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6'>
          {/* Navigation Section */}
          <div className='col-span-1'>
            <h3 className='text-white text-base md:text-lg font-medium mb-2 md:mb-3'>
              Navigation
            </h3>
            <div className='grid grid-cols-2 xs:grid-cols-1 gap-x-2 gap-y-1.5'>
              {navigationLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className='text-[#CBD5E1] text-xs md:text-sm hover:text-gray-300 transition-colors'
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Explore Categories Section */}
          <div className='col-span-1 md:col-span-2'>
            <h3 className='text-white text-base md:text-lg font-medium mb-2 md:mb-3'>
              Explore Categories
            </h3>
            <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
              {categoryLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className='text-[#CBD5E1] text-xs md:text-sm hover:text-gray-300 transition-colors'
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* App Download Section */}
          <div className='col-span-1'>
            <h3 className='text-white text-base md:text-lg font-medium mb-2 md:mb-3'>
              Get the Rixdu App
            </h3>
            <p className='text-[#CBD5E1] text-xs mb-2 md:mb-3'>
              Buy, Sell & Connect Anytime.
            </p>
            <div className='grid grid-cols-2 md:grid-cols-1 gap-x-2 gap-y-2'>
              <a
                href='https://play.google.com/store'
                target='_blank'
                rel='noopener noreferrer'
                className='transition-transform hover:scale-105'
              >
                <img
                  src={getOnPlaystore}
                  alt='Get on Google Play'
                  className='h-8 md:h-9 w-auto'
                />
              </a>
              <a
                href='https://www.apple.com/app-store/'
                target='_blank'
                rel='noopener noreferrer'
                className='transition-transform hover:scale-105'
              >
                <img
                  src={getOnApplestore}
                  alt='Get on App Store'
                  className='h-8 md:h-9 w-auto'
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className='mt-5 md:mt-8 pt-4 md:pt-5 border-t border-gray-700'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-3'>
            {/* Social Media Icons - Left */}
            <div className='flex items-center gap-2 sm:mb-0'>
              {footerLinks.socialLinks.map((social, index) => {
                // Get the appropriate icon
                let iconSrc;
                switch (social.name.toLowerCase()) {
                  case 'facebook':
                    iconSrc = facebookIcon;
                    break;
                  case 'twitter':
                    iconSrc = twitterIcon;
                    break;
                  case 'linkedin':
                    iconSrc = linkedinIcon;
                    break;
                  case 'instagram':
                    iconSrc = instagramIcon;
                    break;
                  case 'youtube':
                    iconSrc = youtubeIcon;
                    break;
                  default:
                    iconSrc = '';
                }

                return (
                  <a
                    key={index}
                    href={social.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full transition-transform hover:scale-110'
                  >
                    <img
                      src={iconSrc}
                      alt={social.name}
                      className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                    />
                  </a>
                );
              })}
            </div>

            {/* Copyright and Links - Right */}
            <div className='flex flex-col sm:flex-col items-center gap-1.5 sm:gap-2'>
              <div>
                <span className='text-xs text-[#CBD5E1] mt-1 sm:mt-0'>
                  © 2025 Rixdu. All rights reserved.
                </span>
              </div>
              <div className='grid grid-cols-3 xs:flex xs:items-center gap-1.5 sm:gap-2 text-center'>
                <Link
                  to='/privacy-policy'
                  className='text-[#CBD5E1] text-xs hover:text-white'
                >
                  Privacy Policy
                </Link>
                <Link
                  to='/terms'
                  className='text-[#CBD5E1] text-xs hover:text-white border-x border-gray-700 px-1.5'
                >
                  Terms of Use
                </Link>
                <Link
                  to='/support'
                  className='text-[#CBD5E1] text-xs hover:text-white'
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
