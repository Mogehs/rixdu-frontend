import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useEmblaCarousel from "embla-carousel-react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { fetchCategories } from "../../features/admin/categoriesSlice";
import { getListings } from "../../features/listings";
import { AdCard } from "../../components/common";

const CategoryPage = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    speed: 10,
    dragFree: true,
  });

  const scrollPrev = () => {
    emblaApi && emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi && emblaApi.scrollNext();
  };

  const dispatch = useDispatch();
  const { name: slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isListingsLoading, setIsListingsLoading] = useState(true);

  const { categories, isLoading: isCategoriesLoading } = useSelector(
    (state) => state.adminCategories
  );

  const { listings, isLoading: isListingsDataLoading } = useSelector(
    (state) => state.listings
  );
  useEffect(() => {
    if (slug) {
      dispatch(fetchCategories({ storeId: slug }));
      dispatch(getListings({ storeId: slug }));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    setIsLoading(isCategoriesLoading);
  }, [isCategoriesLoading]);

  useEffect(() => {
    setIsListingsLoading(isListingsDataLoading);
  }, [isListingsDataLoading]);

  // Find the store name for display (capitalize and replace hyphens)
  const displayName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "";

  return (
    <section className="section-container my-8">
      <div className="rounded-3xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white capitalize mb-4">
          {displayName} Categories
        </h1>
      </div>

      <div className="mt-8">
        <h1 className="section-heading">Browse Categories</h1>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-8">No categories found</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 my-0 mx-auto">
            {categories.map((category, index) => (
              <div
                key={category._id || index}
                className="bg-white shadow-lg rounded-xl px-3 sm:px-4 py-3 hover:shadow-xl transition-shadow"
              >
                <Link
                  to={`/all-listings?store=${slug}&category=${category.slug}`}
                  className="text-dark cursor-pointer h-25 flex rounded-xl items-center justify-center text-xs sm:text-sm md:text-base flex-col gap-2"
                >
                  {category.icon?.url && (
                    <img
                      src={category.icon.url}
                      alt={category.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <span className="text-center">{category.name}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mt-10 md:mt-12">
        <h1 className="section-heading">Most related ads</h1>

        <div className="w-full mb-3 flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="p-2 bg-white shadow-md rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Previous"
            >
              <FaChevronLeft className="text-primary" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2 bg-white shadow-md rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Next"
            >
              <FaChevronRight className="text-primary" />
            </button>
          </div>
        </div>

        <div className="relative w-full">
          {isListingsLoading ? (
            <div className="text-center py-8">Loading ads...</div>
          ) : !listings || listings.length === 0 ? (
            <div className="text-center py-8">No ads found</div>
          ) : (
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {listings.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex-none w-[85%] sm:w-[45%] md:w-[32%] lg:w-[24%]"
                  >
                    <AdCard item={item} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
