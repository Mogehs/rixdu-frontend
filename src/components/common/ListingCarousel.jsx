import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import AdCard from "./AdCard";
import AdCardSkeleton from "./AdCardSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { useDispatch, useSelector } from "react-redux";
import {
  getListings,
  getListingsByStore,
  selectListings,
  selectStoreListings,
  selectListingsLoading,
  selectListingsError,
} from "../../features/listings";

const ListingCarousel = ({
  title = "Discover Top Listings in Your Favorite Category",
  stores = [],
  backgroundColor = "bg-white",
  buttonText = "Discover All Projects",
  linkPath = "/emirate",
  showCityFilter = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  specificStore = null, // New prop to specify a particular store
  storeLoading = false, // New prop for store loading state
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedStore, setSelectedStore] = useState({ name: "All", slug: "" });
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const carouselRef = useRef(null);
  const dispatch = useDispatch();

  // Use different selectors based on whether we're fetching for a specific store
  const allListings = useSelector(selectListings);
  const storeSpecificListings = useSelector(selectStoreListings);
  const loading = useSelector(selectListingsLoading);
  const error = useSelector(selectListingsError);

  // Choose the appropriate listings data based on the current selection
  const storeListings = useMemo(() => {
    if (selectedStore.slug !== "" || specificStore) {
      // Use store-specific listings when a store is selected
      return storeSpecificListings;
    } else {
      // Use general listings for "All" stores
      return allListings;
    }
  }, [selectedStore.slug, specificStore, storeSpecificListings, allListings]);

  const filteredListings = useMemo(() => {
    let listings = storeListings || [];

    // Filter out job and health listings
    listings = listings.filter((listing) => {
      const storeName =
        listing.storeId?.name || listing.store?.name || listing.storeName || "";

      if (
        storeName.toLowerCase().includes("job") ||
        storeName.toLowerCase().includes("health")
      ) {
        return false;
      }

      return true;
    });

    return listings;
  }, [storeListings]);

  const storeOptions = useMemo(() => {
    return showCityFilter
      ? [
          { name: "All", value: "All", slug: "" },
          ...stores
            .filter((store) => {
              const storeName = typeof store === "string" ? store : store.name;
              return (
                storeName &&
                !storeName.toLowerCase().includes("job") &&
                !storeName.toLowerCase().includes("health") &&
                !storeName.toLowerCase().includes("vehicle")
              );
            })
            .map((store) => (typeof store === "string" ? store : store)),
        ]
      : [];
  }, [showCityFilter, stores]);

  useEffect(() => {
    if (selectedStore.slug !== "") {
      // Fetch listings for the selected store
      dispatch(getListingsByStore({ storeSlugOrId: selectedStore.slug }));
    } else if (specificStore) {
      // Fetch listings from a specific store (prop-based)
      dispatch(getListingsByStore({ storeSlugOrId: specificStore }));
    } else {
      // Fetch general listings from all stores
      dispatch(getListings({ filters: { limit: 20 } }));
    }
  }, [dispatch, selectedStore.slug, specificStore]);

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
  }, [selectedStore]);

  const handleStoreChange = (storeSlug) => {
    const selectedStoreObj = storeOptions.find(
      (store) => store.slug === storeSlug
    ) || { name: "All", slug: "" };
    setSelectedStore(selectedStoreObj);
  };

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

  return (
    <section className={`section-container ${backgroundColor}`}>
      {/* Header */}
      <h2 className="section-heading">{title}</h2>

      {/* Store Filters */}
      {showCityFilter && storeOptions.length > 1 && (
        <div className="flex justify-center my-6 sm:my-10 md:my-14 lg:my-18 px-4">
          <div className="inline-flex bg-white rounded-full p-1 border border-gray-300 overflow-x-auto max-w-full hide-scrollbar">
            <div className="flex gap-1 px-1 sm:px-0">
              {storeOptions.map((store) => (
                <button
                  key={store.name}
                  onClick={() => handleStoreChange(store.slug)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedStore.slug === store.slug
                      ? "bg-blue-100 text-primary border border-blue-300"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {store.name}
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
          className="overflow-hidden mx-4 sm:mx-6 lg:mx-10 py-2"
          ref={carouselRef}
        >
          {loading || storeLoading ? (
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
          ) : (
            <div
              className="flex transition-transform duration-700 ease-in-out"
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

      {/* View All Button */}
      {buttonText && filteredListings.length > 0 && (
        <div className="text-center mt-8 sm:mt-12 px-4">
          <Link
            to={`${linkPath}/${
              selectedStore.slug === "" ? "classifieds" : selectedStore.slug
            }`}
            className="inline-block px-6 sm:px-8 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            {buttonText}{" "}
            {selectedStore.name === "All" ? "All Stores" : selectedStore.name}
          </Link>
        </div>
      )}

      {/* Empty State */}
      {filteredListings.length === 0 && !(loading || storeLoading) && (
        <EmptyState
          title="No listings found"
          message={`No listings available for ${
            selectedStore.name === "All" ? "any store" : selectedStore.name
          }. Try selecting a different category or check back later.`}
          type="stores"
        />
      )}
    </section>
  );
};

export default ListingCarousel;
