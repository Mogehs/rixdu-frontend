import React, { useState } from 'react';
import { categoriesCardsData } from '../../data/data';
import { useNavigate } from 'react-router-dom';
import JobsModal from '../../components/JobsModal';
import {} from '../../assets';

const CategoriesCards = () => {
  const navigate = useNavigate();
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);

  const handleCategoryClick = (categoryName) => {
    if (categoryName.toLowerCase() === 'jobs') {
      setIsJobsModalOpen(true);
    } else {
      navigate('/all-listings');
    }
  };

  return (
    <>
      <div className='section-container'>
        <div className='grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {categoriesCardsData.map((category, index) => {
            return (
              <button
                onClick={() => handleCategoryClick(category.name)}
                className='group'
                key={index}
              >
                <div className='relative h-40 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl rounded-xl'>
                  <div
                    className='flex items-center justify-center rounded-xl h-full overflow-hidden p-4'
                    style={{
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <h3 className='text-2xl md:text-2xl font-bold text-white z-[100] capitalize text-center transition-all duration-300 transform group-hover:scale-110'>
                      {category.name}
                    </h3>
                  </div>

                  <div className='absolute top-0 left-0 w-[100%] h-[100%] bg-black/50 rounded-xl overflow-hidden transition-all duration-300 group-hover:bg-black/40'></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <JobsModal
        isOpen={isJobsModalOpen}
        onClose={() => setIsJobsModalOpen(false)}
      />
    </>
  );
};

export default CategoriesCards;
