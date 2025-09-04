import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineUsers } from 'react-icons/hi2';
import { cities } from '../../data';

const EnhancedEmirates = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.city-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-slide-up');
                card.classList.remove('opacity-0', 'translate-y-8');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // User location obtained
          alert('Location detected! We can help you find listings nearby.');
        },
        (error) => {
          console.error('Location error:', error);
          alert('Please enable location access for better recommendations.');
        }
      );
    }
  };

  return (
    <section className='section-container' ref={sectionRef}>
      <div className='text-center mb-12'>
        <h1 className='section-heading bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
          Which City Awaits Your Discovery
        </h1>
        <p className='text-gray-600 text-lg mb-6 max-w-2xl mx-auto'>
          Explore UAE's vibrant emirates and find amazing deals in your favorite
          destinations
        </p>

        <button
          onClick={handleLocationClick}
          className='btn-primary bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary transform hover:scale-105 transition-all duration-300'
        >
          <HiOutlineMapPin className='w-5 h-5' />
          Use My Location
        </button>
      </div>

      {/* Responsive Grid Layout */}
      <div className='grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 lg:grid-cols-12 grid-rows-auto sm:grid-rows-9 md:grid-rows-7 lg:grid-rows-4 gap-4 h-auto sm:h-[900px] md:h-[700px] lg:h-[500px]'>
        {cities.map((city, index) => {
          // Define responsive grid positions for each city
          const mobilePositions = [
            '', // Stack naturally on mobile
            '',
            '',
            '',
            '',
            '',
            '',
          ];

          const tabletPositions = [
            'sm:col-span-4 sm:row-span-3', // Position 1 - Top left
            'sm:col-span-4 sm:row-span-3 sm:col-start-5', // Position 3 - Top center
            'sm:col-span-4 sm:row-span-3 sm:col-start-9', // Position 4 - Top right
            'sm:col-span-4 sm:row-span-3 sm:row-start-4', // Position 9 - Middle left
            'sm:col-span-4 sm:row-span-3 sm:col-start-5 sm:row-start-4', // Position 10 - Middle center
            'sm:col-span-4 sm:row-span-3 sm:col-start-9 sm:row-start-4', // Position 11 - Middle right
            'sm:col-span-4 sm:row-span-3 sm:row-start-7', // Position 12 - Bottom left
          ];

          const mediumPositions = [
            'md:col-span-4 md:row-span-4', // Position 1 - Top left
            'md:col-span-4 md:row-span-2 md:col-start-5', // Position 3 - Top center
            'md:col-span-4 md:row-span-4 md:col-start-9', // Position 5 - Top right
            'md:col-span-4 md:row-span-3 md:col-start-1 md:row-start-5', // Position 6 - Bottom left
            'md:col-span-4 md:row-span-3 md:col-start-9 md:row-start-5', // Position 8 - Bottom right
            'md:col-span-4 md:row-span-3 md:col-start-5 md:row-start-3', // Position 10 - Center
            'md:col-span-4 md:row-span-2 md:col-start-5 md:row-start-6', // Position 11 - Bottom center
          ];

          const largePositions = [
            'lg:col-span-2 lg:row-span-2', // Position 1 - Top left small
            'lg:col-span-4 lg:row-span-4 lg:col-start-5 lg:row-start-1', // Position 3 - Center large
            'lg:col-span-4 lg:row-span-2 lg:col-start-1 lg:row-start-3', // Position 4 - Bottom left
            'lg:col-span-2 lg:row-span-2 lg:col-start-3 lg:row-start-1', // Position 5 - Top center-left
            'lg:col-span-4 lg:row-span-2 lg:col-start-9 lg:row-start-1', // Position 11 - Top right
            'lg:col-span-2 lg:row-span-2 lg:col-start-9 lg:row-start-3', // Position 12 - Bottom center-right
            'lg:col-span-2 lg:row-span-2 lg:col-start-11 lg:row-start-3', // Position 13 - Bottom right
          ];

          const gridPosition =
            `${mobilePositions[index]} ${tabletPositions[index]} ${mediumPositions[index]} ${largePositions[index]}`.trim();

          return (
            <div
              key={index}
              className={`city-card group relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 translate-y-8 min-h-[200px] sm:min-h-[180px] md:min-h-[150px] lg:min-h-[120px] ${gridPosition}`}
              style={{
                backgroundImage: `url(${city.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Hover Effect Overlay - moved before content so it doesn't block clicks */}
              <div className='absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>

              {/* Gradient Overlay */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-500 pointer-events-none'></div>

              {/* Content */}
              <div className='absolute inset-0 p-6 flex flex-col justify-end z-10'>
                {/* Users Badge */}
                <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-20'>
                  <HiOutlineUsers className='w-4 h-4 text-primary' />
                  <span className='text-sm font-semibold text-gray-800'>
                    {city.users}
                  </span>
                </div>

                {/* City Info */}
                <div className='text-white space-y-2 z-20 relative'>
                  <div className='space-y-1'>
                    <h3 className='text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors duration-300'>
                      {city.city}
                    </h3>
                    <p className='text-sm opacity-90'>{city.landmark}</p>
                    <p className='text-xs opacity-75 line-clamp-2'>
                      {city.description}
                    </p>
                  </div>

                  <Link
                    to={city.link}
                    className='inline-flex items-center gap-2 bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform group-hover:scale-105 w-fit z-30 relative'
                  >
                    Explore Now
                    <HiOutlineMapPin className='w-4 h-4' />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EnhancedEmirates;
