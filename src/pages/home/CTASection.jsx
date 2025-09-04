import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { emiratesCategoryCtaBanner } from '../../assets';
import { ctaFeatures } from '../../data';

const CTASection = () => {
  const sectionRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        setScrollY(rate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className='relative w-full overflow-hidden my-16'>
      {/* Full Width Background Container */}
      <div className='relative min-h-[600px] flex items-center justify-center'>
        {/* Parallax Background */}
        <div
          className='absolute inset-0 w-full h-full'
          style={{
            backgroundImage: `url(${emiratesCategoryCtaBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transform: `translateY(${scrollY}px)`,
          }}
        />

        {/* Gradient Overlays */}
        <div className='absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-secondary/90' />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40' />

        {/* Animated Background Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div
            className={`absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full transition-all duration-1000 ${
              isVisible ? 'animate-bounce' : ''
            }`}
          />
          <div
            className={`absolute bottom-20 right-20 w-24 h-24 bg-secondary/20 rounded-full transition-all duration-1000 delay-300 ${
              isVisible ? 'animate-pulse' : ''
            }`}
          />
          <div
            className={`absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full transition-all duration-1000 delay-500 ${
              isVisible ? 'animate-ping' : ''
            }`}
          />
        </div>

        {/* Content Container */}
        <div className='relative z-10 max-w-6xl mx-auto px-4 py-20'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <div
              className={`text-white space-y-8 transition-all duration-1000 ${
                isVisible
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-10 opacity-0'
              }`}
            >
              <div className='space-y-4'>
                <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full'>
                  <HiOutlineSparkles className='w-5 h-5 text-yellow-300' />
                  <span className='text-sm font-semibold'>
                    Most Popular Marketplace
                  </span>
                </div>

                <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
                  Ready to
                  <span className='bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent'>
                    {' '}
                    Transform{' '}
                  </span>
                  Your Business?
                </h2>

                <p className='text-xl md:text-2xl text-white/90 leading-relaxed'>
                  Join over 100,000 satisfied users who have already discovered
                  the power of Rixdu marketplace.
                </p>
              </div>

              {/* Features List */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {ctaFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 transition-all duration-500 delay-${
                      index * 100
                    } ${
                      isVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                    }`}
                  >
                    <HiOutlineCheckCircle className='w-6 h-6 text-green-300 flex-shrink-0' />
                    <span className='text-white/90 font-medium'>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                <Link
                  to='/place-ad/select-category'
                  className='group bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-2xl'
                >
                  Start Selling Now
                  <HiOutlineArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' />
                </Link>

                <Link
                  to='/all-listings'
                  className='group border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2'
                >
                  Browse Listings
                </Link>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div
              className={`space-y-6 transition-all duration-1000 delay-300 ${
                isVisible
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-10 opacity-0'
              }`}
            >
              <div className='bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20'>
                <h3 className='text-white text-2xl font-bold mb-6 text-center'>
                  Why Choose Rixdu?
                </h3>

                <div className='grid grid-cols-2 gap-6'>
                  <div className='text-center'>
                    <div className='text-4xl font-bold text-yellow-300 mb-2'>
                      150K+
                    </div>
                    <div className='text-white/80 text-sm'>Active Listings</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-4xl font-bold text-yellow-300 mb-2'>
                      50K+
                    </div>
                    <div className='text-white/80 text-sm'>Happy Users</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-4xl font-bold text-yellow-300 mb-2'>
                      98%
                    </div>
                    <div className='text-white/80 text-sm'>Success Rate</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-4xl font-bold text-yellow-300 mb-2'>
                      24/7
                    </div>
                    <div className='text-white/80 text-sm'>Support</div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className='bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10'>
                <div className='flex items-center justify-center gap-4 text-white/70 text-sm'>
                  <span>🏆 #1 Marketplace</span>
                  <span>•</span>
                  <span>🛡️ Secure Platform</span>
                  <span>•</span>
                  <span>⚡ Fast Deals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave Effect */}
        <div className='absolute bottom-0 left-0 w-full'>
          <svg viewBox='0 0 1200 120' className='w-full h-auto'>
            <path
              d='M0,96L48,80C96,64,192,32,288,32C384,32,480,64,576,69.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7L1200,64L1200,120L1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z'
              fill='white'
              className='opacity-90'
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
