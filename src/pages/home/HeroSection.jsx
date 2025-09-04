import React, { useState } from 'react';
import { homePageHeroBg } from '../../assets';
import {
  HiOutlineLocationMarker,
  HiOutlineChatAlt2,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { Button, CustomDropdown } from '../../components/common';
import {
  heroCategories,
  categoryContent,
  legacyDropdownOptions,
} from '../../data';

const HeroSection = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Properties');
  const [activeTab, setActiveTab] = useState('buy');
  const [activeFilter, setActiveFilter] = useState('All');
  const [dropdownValues, setDropdownValues] = useState({});

  const handleSearchButton = (e) => {
    e.preventDefault();
    setSearch('');
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setActiveFilter('All');
    setDropdownValues({});
  };

  const handleDropdownChange = (name, value) => {
    setDropdownValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const currentContent = categoryContent[selectedCategory];

  return (
    <section
      className='w-full max-w-[96vw] lg:max-w-7xl mx-auto my-2 sm:my-4 text-white py-4 sm:py-6 md:py-10 px-2 sm:px-4 relative rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-5 min-h-[300px] sm:min-h-[320px] md:min-h-[420px]'
      style={{
        backgroundImage: `url(${homePageHeroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className='absolute inset-0 bg-black/40 rounded-xl sm:rounded-2xl'></div>

      {/* Main Centered Content */}
      <div className='relative z-10 text-center w-full max-w-5xl mx-auto px-1 sm:px-2'>
        {/* Hero Text - Responsive and Compact */}
        <div className='mb-3 sm:mb-4 md:mb-6'>
          <h1 className='text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-1 md:mb-2 leading-tight px-1 sm:px-2'>
            {currentContent.title}
          </h1>
          <p className='text-xs sm:text-sm md:text-base lg:text-lg font-light opacity-90 max-w-2xl mx-auto px-1 sm:px-2'>
            {currentContent.subtitle}
          </p>
        </div>

        {/* Category Navigation Tabs - Two-row layout for mobile */}
        <div className='w-full flex justify-center mb-3 sm:mb-4 md:mb-5 px-1'>
          <div className='bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-1.5 md:p-2 shadow-lg w-full max-w-full'>
            {/* Mobile: Two-row grid layout - Better centered approach */}
            <div className='flex flex-col gap-1 sm:hidden'>
              {/* First row: 3 items */}
              <div className='grid grid-cols-3 gap-1'>
                {heroCategories.slice(0, 3).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-1 py-1 rounded-lg font-medium transition-all duration-300 text-xs ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    <span className='block leading-tight text-center'>
                      {category === 'Cars & Motors' ? (
                        <>
                          Cars &<br />
                          Motors
                        </>
                      ) : (
                        category
                      )}
                    </span>
                  </button>
                ))}
              </div>
              {/* Second row: 2 items centered */}
              <div className='flex gap-1 justify-center'>
                {heroCategories.slice(3).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 text-xs ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tablet and Desktop: Single row layout */}
            <div className='hidden sm:flex gap-1 justify-center'>
              {heroCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className='bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-2xl w-full max-w-4xl mx-auto'>
          {/* Main Search Row */}
          <div className='flex flex-col gap-2 sm:gap-2 md:gap-3 mb-2 sm:mb-3'>
            {/* Buy/Sell Toggle - Full width on mobile */}
            <div className='flex bg-gray-100 rounded-lg p-1 w-full'>
              <button
                type='button'
                onClick={() => setActiveTab('buy')}
                className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition-all duration-300 text-xs sm:text-sm ${
                  activeTab === 'buy'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Buy
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('rent')}
                className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition-all duration-300 text-xs sm:text-sm ${
                  activeTab === 'rent'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Rent
              </button>
            </div>

            {/* Location Input and Search Row */}
            <div className='flex flex-col sm:flex-row gap-2'>
              {/* Location Input */}
              <div className='flex-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <HiOutlineLocationMarker className='h-4 w-4 text-gray-400' />
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Enter location'
                  className='w-full pl-9 pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg outline-none text-gray-800 focus:border-primary transition-all duration-300 text-xs sm:text-sm'
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearchButton}
                variant='primary'
                size='md'
                className='px-4 sm:px-6 w-full sm:w-auto text-xs sm:text-sm'
              >
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters - Completely restructured for mobile */}
          <div className='space-y-2 mb-2 sm:mb-3'>
            {/* Filter Buttons Row */}
            <div className='w-full'>
              <div className='bg-gray-100 rounded-lg p-1 overflow-x-auto hide-scrollbar'>
                <div className='flex gap-0.5 min-w-max'>
                  {currentContent.filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium transition-all duration-300 text-xs whitespace-nowrap flex-shrink-0 ${
                        activeFilter === filter
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dropdowns and CTA Row */}
            <div className='flex flex-col sm:flex-row gap-2 items-stretch'>
              <div className='flex flex-col sm:flex-row gap-2 flex-1'>
                <CustomDropdown
                  options={legacyDropdownOptions.categories}
                  value={dropdownValues.category}
                  onChange={(value) => handleDropdownChange('category', value)}
                  placeholder='All Categories'
                  size='sm'
                  variant='hero'
                  className='w-full sm:min-w-[140px] sm:max-w-[200px]'
                />

                <CustomDropdown
                  options={legacyDropdownOptions.priceRange}
                  value={dropdownValues.priceRange}
                  onChange={(value) =>
                    handleDropdownChange('priceRange', value)
                  }
                  placeholder='Price Range'
                  size='sm'
                  variant='hero'
                  className='w-full sm:min-w-[130px] sm:max-w-[180px]'
                />
              </div>

              <Button
                to='/place-ad/select-category'
                variant='secondary'
                size='sm'
                className='whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm'
              >
                Post Free Ad
              </Button>
            </div>
          </div>

          {/* AI Suggestion Row - Improved mobile responsiveness */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 sm:pt-3 border-t border-gray-100'>
            <div className='flex items-start sm:items-center gap-2 text-gray-600'>
              <div className='w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0'>
                <HiOutlineChatAlt2 className='h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary' />
              </div>
              <span className='text-xs leading-tight'>
                Need help finding {selectedCategory.toLowerCase()}? Chat with
                our AI Assistant
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              icon={<HiOutlineChatAlt2 className='h-2.5 w-2.5 sm:h-3 sm:w-3' />}
              className='text-xs flex-shrink-0 self-start sm:self-auto'
            >
              AI Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Creative CTA Button */}
      <div className='relative z-10'>
        <Button
          variant='outline'
          size='sm'
          icon={<HiOutlineSparkles className='h-3 w-3 sm:h-4 sm:w-4' />}
          iconPosition='left'
          className='border-white/80 text-white hover:bg-white/10 hover:border-white text-xs sm:text-sm'
        >
          <span className='hidden sm:inline'>Discover Rixdu Magic</span>
          <span className='sm:hidden'>Discover Magic</span>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
