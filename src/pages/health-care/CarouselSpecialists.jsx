import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import DoctorCard from "./DoctorCard";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

const CarouselSpecialists = ({ doctors }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
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
    onSelect(); // set initial state
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative">
      {/* Embla container */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-8">
          {doctors.map((doc, i) => (
            <div
              className="embla__slide min-w-[250px] max-w-[370px] flex-shrink-0"
              key={i}
            >
              <DoctorCard doctor={doc} noShadow={true} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className={`w-12 h-12 rounded-full border border-gray-300 bg-white text-gray-600 flex items-center justify-center transition-colors ${
            prevBtnDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
          }`}
          aria-label="Previous"
        >
          <GrFormPreviousLink size={20} />
        </button>
        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className={`w-12 h-12 rounded-full border border-gray-300 bg-white text-gray-600 flex items-center justify-center transition-colors ${
            nextBtnDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
          }`}
          aria-label="Next"
        >
          <GrFormNextLink size={20} />
        </button>
      </div>
    </div>
  );
};

export default CarouselSpecialists;
