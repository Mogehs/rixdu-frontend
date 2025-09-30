import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import {
  AdCard,
  AdCardSkeleton,
  EmptyState,
  ErrorState,
} from "../../components/common";
import { cities } from "../../data/homePageData";
import {
  getListingsByCity,
  selectListingsLoading,
  selectListingsError,
  selectCityListings,
} from "../../features/listings/listingsSlice";

const FeaturedListings = ({
  title = "Featured Listings",
  showCityFilter = true,
  backgroundColor = "",
  autoPlay = true,
  autoPlayInterval = 5000,
  buttonText = "View All Listings in",
  linkPath = "/all-listings",
}) => {
  const dispatch = useDispatch();
  const listings = useSelector(selectCityListings);
  const loading = useSelector(selectListingsLoading);
  const error = useSelector(selectListingsError);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCity, setSelectedCity] = useState("All");
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const carouselRef = useRef(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched && !loading) {
      dispatch(getListingsByCity({ city: "", limit: 20 }));
      setHasFetched(true);
    }
  }, [dispatch, hasFetched, loading]);

  const filteredListings = useMemo(() => {
    let filteredByStore = listings.filter((listing) => {
      const storeName =
        listing.storeId?.name || listing.store?.name || listing.storeName || "";

      if (storeName.toLowerCase().includes("job")) {
        return false;
      }
      return true;
    });

    if (selectedCity === "All") {
      return filteredByStore;
    }

    return filteredByStore.filter((listing) => {
      const listingCity =
        listing.city || listing.values?.city || listing.location || "";
      return listingCity.toLowerCase().includes(selectedCity.toLowerCase());
    });
  }, [listings, selectedCity]);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 640) {
        setItemsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerSlide(3);
      } else {
        setItemsPerSlide(4);
      }
    };

    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);
    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  const totalSlides = Math.ceil(filteredListings.length / itemsPerSlide);

  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCity]);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides, autoPlayInterval]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const cityOptions = showCityFilter
    ? [
        "All",
        ...cities.map((city) => (typeof city === "string" ? city : city.city)),
      ]
    : [];

  return (
    <section className={`section-container`}>
      <h2 className="section-heading">{title}</h2>

      {showCityFilter && cityOptions.length > 1 && (
        <div className="flex justify-center my-6 sm:my-10 md:my-14 lg:my-18 px-4">
          <div className="inline-flex bg-white rounded-full p-1 border border-gray-300 overflow-x-auto max-w-full hide-scrollbar">
            <div className="flex gap-1 px-1 sm:px-0">
              {cityOptions.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCity === city
                      ? "bg-blue-100 text-primary border border-blue-300"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Carousel Container with Blur Effects */}
      <div className="relative">
        {/* Left Blur Effect - Only on larger screens */}
        <div
          className={`hidden lg:block absolute left-0 top-0 bottom-0 w-32 ${
            backgroundColor === "bg-white"
              ? "bg-gradient-to-r from-white to-transparent"
              : "bg-gradient-to-r from-gray-50 to-transparent"
          } z-10 pointer-events-none`}
        />

        {/* Right Blur Effect - Only on larger screens */}
        <div
          className={`hidden lg:block absolute right-0 top-0 bottom-0 w-32 ${
            backgroundColor === "bg-white"
              ? "bg-gradient-to-l from-white to-transparent"
              : "bg-gradient-to-l from-gray-50 to-transparent"
          } z-10 pointer-events-none`}
        />

        {/* Navigation Buttons */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group border border-gray-200/50"
              disabled={currentSlide === 0}
            >
              <HiOutlineChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700 group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group border border-gray-200/50"
              disabled={currentSlide === totalSlides - 1}
            >
              <HiOutlineChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700 group-hover:text-primary transition-colors" />
            </button>
          </>
        )}

        {/* Carousel */}
        <div
          className="overflow-hidden mx-4 sm:mx-6 lg:mx-10"
          ref={carouselRef}
        >
          {loading ? (
            // Loading State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-2">
              {Array.from({ length: itemsPerSlide }, (_, index) => (
                <AdCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            // Error State - Minimal sleek design
            <ErrorState
              variant="minimal"
              title="Unable to load listings"
              message="Something went wrong while loading the content"
            />
          ) : filteredListings.length === 0 ? (
            // Empty State
            <EmptyState
              title="No listings found"
              message={`No listings available for ${selectedCity}. Try selecting a different city or check back later.`}
              type="listings"
            />
          ) : (
            // Actual Carousel Content
            <div
              className="flex transition-transform duration-700 ease-in-out my-2"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }, (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-2">
                    {filteredListings
                      .slice(
                        slideIndex * itemsPerSlide,
                        (slideIndex + 1) * itemsPerSlide
                      )
                      .map((listing, index) => {
                        return (
                          <div
                            key={listing._id || listing.id}
                            className="transform hover:scale-105 transition-all duration-300"
                          >
                            <AdCard
                              item={listing}
                              index={slideIndex * itemsPerSlide + index}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View All Button - only show when we have listings and not loading */}
      {buttonText && !loading && !error && filteredListings.length > 0 && (
        <div className="text-center mt-8 sm:mt-12 px-4">
          <Link
            to={`${linkPath}?${
              selectedCity === "All" ? "" : `city=${selectedCity}`
            }`}
            className="inline-block px-6 sm:px-8 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            {buttonText}{" "}
            {selectedCity === "All" ? "All Categories" : selectedCity}
          </Link>
        </div>
      )}
    </section>
  );
};

export default FeaturedListings;
