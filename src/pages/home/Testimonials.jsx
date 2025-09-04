import React, { useState, useEffect } from 'react';
import { HiOutlineStar, HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import { testimonials } from '../../data';

const Testimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const getCategoryColor = (category) => {
    const colors = {
      Property: 'bg-green-100 text-green-800',
      Motors: 'bg-blue-100 text-blue-800',
      Jobs: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section className='section-container'>
      <div className='text-center mb-12'>
        <h2 className='section-heading mb-4'>Success Stories</h2>
        <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
          See how Rixdu has helped thousands of people across UAE achieve their
          goals
        </p>
      </div>

      {/* Main Testimonial Display */}
      <div className='max-w-4xl mx-auto mb-12'>
        <div className='relative bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute top-0 right-0 w-64 h-64 opacity-5'>
            <HiOutlineChatBubbleLeft className='w-full h-full text-primary' />
          </div>

          <div className='relative z-10'>
            {/* Category Badge */}
            <div className='flex justify-center mb-6'>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(
                  testimonials[activeTestimonial].category
                )}`}
              >
                {testimonials[activeTestimonial].category} Success
              </span>
            </div>

            {/* Highlight */}
            <div className='text-center mb-6'>
              <div className='inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full'>
                <div className='w-2 h-2 bg-primary rounded-full animate-pulse'></div>
                <span className='text-primary font-semibold text-lg'>
                  {testimonials[activeTestimonial].highlight}
                </span>
              </div>
            </div>

            {/* Quote */}
            <blockquote className='text-xl md:text-2xl text-gray-800 text-center mb-8 leading-relaxed font-medium'>
              "{testimonials[activeTestimonial].text}"
            </blockquote>

            {/* Author Info */}
            <div className='flex items-center justify-center gap-4'>
              <img
                src={testimonials[activeTestimonial].image}
                alt={testimonials[activeTestimonial].name}
                className='w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg'
              />
              <div className='text-center'>
                <div className='font-semibold text-lg text-gray-800'>
                  {testimonials[activeTestimonial].name}
                </div>
                <div className='text-gray-600'>
                  {testimonials[activeTestimonial].role} •{' '}
                  {testimonials[activeTestimonial].location}
                </div>
                <div className='flex items-center justify-center gap-1 mt-1'>
                  {Array.from(
                    { length: testimonials[activeTestimonial].rating },
                    (_, i) => (
                      <HiOutlineStar
                        key={i}
                        className='w-4 h-4 text-yellow-400 fill-current'
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl p-8 shadow-elegant'>
        <div className='text-center'>
          <div className='text-3xl font-bold text-primary mb-2'>98%</div>
          <div className='text-gray-600 text-sm'>Success Rate</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-primary mb-2'>24hrs</div>
          <div className='text-gray-600 text-sm'>Average Response</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-primary mb-2'>50K+</div>
          <div className='text-gray-600 text-sm'>Happy Customers</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-primary mb-2'>4.9/5</div>
          <div className='text-gray-600 text-sm'>Average Rating</div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
