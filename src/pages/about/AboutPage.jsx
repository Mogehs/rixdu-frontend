import React from 'react';
import * as assets from '../../assets';
import { aboutPageCategories } from '../../data/aboutData';

// Use imported categories data
const categories = aboutPageCategories;

const AboutUs = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Main Content */}
      <main className='flex-grow'>
        {/* Hero Section with Illustration */}
        <section className='bg-white pt-8 pb-12 overflow-hidden relative'>
          <div className='container mx-auto px-4 text-center relative z-10'>
            <div className='max-w-3xl mx-auto'>
              <img
                src={assets.aboutUsBanner}
                alt='Team Illustration'
                className='mx-auto mb-8 w-full max-w-lg'
              />
              <h1 className='text-4xl font-bold mb-4'>About Us</h1>
              <p className='text-gray-700 text-lg mb-8 max-w-2xl mx-auto'>
                Welcome to Rixdu, your ultimate marketplace for buying, selling,
                and renting everything you need—all in one place! Whether it's
                finding your dream home, selling your car, landing your next
                job, or hiring the right talent, Rixdu connects people
                seamlessly to opportunities.
              </p>
              <div className='border-t border-gray-300 max-w-3xl mx-auto'></div>
            </div>
          </div>
          <div className='absolute h-[55%] md:h-[63%] lg:h-[65%] w-[95vw] md:w-[60vw] lg:w-[50vw] rounded-br-[200px] lg:rounded-br-[250px] bg-blue-100 top-0 left-0 z-0'></div>
        </section>

        {/* Categories Section */}
        <section className='py-12'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold mb-10 text-center'>
              Our platform offers a seamless experience across diverse
              categories:
            </h2>

            <div className='space-y-8 max-w-4xl mx-auto'>
              {categories.map((category, index) => (
                <div key={index} className='flex items-start'>
                  <div className='flex-shrink-0 mr-4'>
                    <div className='bg-blue-100 p-3 rounded-lg'>
                      <img
                        src={category.iconPath}
                        alt={category.title}
                        className='w-10 h-10'
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold mb-1'>
                      {category.title}
                    </h3>
                    <p className='text-gray-700'>{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs;
