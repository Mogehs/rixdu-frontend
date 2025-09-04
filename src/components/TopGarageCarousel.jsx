import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import TopGarageCardList from './TopGarageCardList';
import { GrFormNextLink, GrFormPreviousLink } from 'react-icons/gr';

const TopGarageCarousel = ({ garages }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className='relative'>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-8 py-4'>
          <TopGarageCardList garages={garages} />
        </div>
      </div>
      {/* Carousel Controls */}
      <div className='w-full flex justify-start items-center gap-4 mt-8'>
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className={`w-12 h-12 rounded-full border-2 border-[#1A253C] bg-white text-[#1A253C] flex items-center justify-center transition-colors ${
            prevBtnDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#EAF6FF]'
          }`}
          aria-label='Previous'
        >
          <GrFormPreviousLink size={24} />
        </button>
        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className={`w-12 h-12 rounded-full border-2 border-[#1A253C] bg-white text-[#1A253C] flex items-center justify-center transition-colors ${
            nextBtnDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#EAF6FF]'
          }`}
          aria-label='Next'
        >
          <GrFormNextLink size={24} />
        </button>
      </div>
    </div>
  );
};

export default TopGarageCarousel;
