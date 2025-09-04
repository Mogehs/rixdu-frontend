import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useParams } from "react-router-dom";
import { FiFilter, FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import HeroSection from "./HeroSection.jsx";
import DoctorCard from "./DoctorCard.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import { doctorcardImage } from "../../assets";
import {
  getHealthcareListings,
  getHealthcareListingsByCategory,
  selectHealthcareListings,
  selectHealthcareListingsLoading,
  selectCurrentCategory,
  selectTotalPages,
  selectCurrentPage,
  selectTotalCount,
} from "../../features/listings/listingsSlice";

const ServiceListingPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams(); // Get categorySlug from URL params

  // Redux state
  const healthcareListings = useSelector(selectHealthcareListings);
  const loading = useSelector(selectHealthcareListingsLoading);
  const currentCategory = useSelector(selectCurrentCategory);
  const totalPages = useSelector(selectTotalPages);
  const currentPage = useSelector(selectCurrentPage);
  const totalCount = useSelector(selectTotalCount);

  // Filter states
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchFromHero, setSearchFromHero] = useState("");

  const cities = [
    { value: "all", label: "All Cities" },
    { value: "dubai", label: "Dubai" },
    { value: "abu-dhabi", label: "Abu Dhabi" },
    { value: "sharjah", label: "Sharjah" },
    { value: "ajman", label: "Ajman" },
    { value: "fujairah", label: "Fujairah" },
    { value: "ras-al-khaimah", label: "Ras Al Khaimah" },
    { value: "umm-al-quwain", label: "Umm Al Quwain" },
  ];

  const sortOptions = [
    { value: "latest", label: "Latest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "verified", label: "Verified First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
  ];

  // Reusable dropdown matching AllGarages style. Supports options as {value,label} or simple string array.
  const CustomDropdown = ({
    value,
    options,
    onChange,
    placeholder = "Select option",
    isOpen,
    setIsOpen,
    icon: IconComp,
    hideScrollbar = false,
  }) => {
    const resolvedIcon = IconComp || FiChevronDown;

    const getLabel = (val) => {
      if (!options) return val;
      const opt = options.find((o) =>
        typeof o === "string" ? o === val : o.value === val
      );
      if (opt) return typeof opt === "string" ? opt : opt.label;
      // if value is a label already, return it
      const optByLabel = options.find((o) =>
        typeof o === "string" ? false : o.label === val
      );
      return optByLabel ? optByLabel.label : val;
    };

    return (
      <div className="relative text-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 pr-10 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex items-center justify-between"
        >
          <span
            className={`truncate ${
              getLabel(value)?.includes("All")
                ? "text-gray-500"
                : "text-gray-900 font-medium"
            }`}
          >
            {getLabel(value) || placeholder}
          </span>
          <resolvedIcon
            className={`h-5 w-5 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={`absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto text-sm${
                hideScrollbar ? " scrollbar-hide" : ""
              }`}
            >
              {options.map((opt, idx) => {
                const label = typeof opt === "string" ? opt : opt.label;
                const val = typeof opt === "string" ? opt : opt.value;
                const active = value === val;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(val);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left transition-colors duration-150 flex items-center justify-between ${
                      active
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {active && (
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // Initialize filters from URL params
  useEffect(() => {
    const city = searchParams.get("city") || "all";
    const sort = searchParams.get("sort") || "latest";
    const search = searchParams.get("search") || "";
    const pageParam = parseInt(searchParams.get("page")) || 1;

    setSelectedCity(city);
    setSortBy(sort);
    setSearchFromHero(search);
    setPage(pageParam);
  }, [searchParams]);

  // Build API filters
  const buildApiFilters = useMemo(() => {
    const filters = {
      page,
      limit: 12,
      updatePagination: true,
    };

    // Add search from hero
    if (searchFromHero && searchFromHero.trim()) {
      filters.values = filters.values || {};
      filters.values.search = searchFromHero.trim();
    }

    // Add city filter
    if (selectedCity !== "all") {
      filters.values = filters.values || {};
      filters.values.city = selectedCity;
    }

    // Add sorting
    switch (sortBy) {
      case "oldest":
        filters.sort = "createdAt";
        filters.order = "asc";
        break;
      case "verified":
        filters.sort = "verified";
        filters.order = "desc";
        break;
      case "name-asc":
        filters.sort = "values.name";
        filters.order = "asc";
        break;
      case "name-desc":
        filters.sort = "values.name";
        filters.order = "desc";
        break;
      case "latest":
      default:
        filters.sort = "createdAt";
        filters.order = "desc";
        break;
    }

    return filters;
  }, [page, selectedCity, sortBy, searchFromHero]);

  // Fetch listings when filters change
  useEffect(() => {
    if (categorySlug) {
      // If we have a category slug, fetch listings for that category
      dispatch(
        getHealthcareListingsByCategory({
          categorySlug,
          ...buildApiFilters,
        })
      );
    } else {
      // Otherwise, fetch all healthcare listings
      dispatch(getHealthcareListings(buildApiFilters));
    }
  }, [dispatch, buildApiFilters, categorySlug]);

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.search && newFilters.search.trim()) {
      params.set("search", newFilters.search.trim());
    }
    if (newFilters.city && newFilters.city !== "all") {
      params.set("city", newFilters.city);
    }
    if (newFilters.sort && newFilters.sort !== "latest") {
      params.set("sort", newFilters.sort);
    }
    if (newFilters.page && newFilters.page !== 1) {
      params.set("page", newFilters.page);
    }

    setSearchParams(params);
  };

  // Helper function to get image from listing values
  const getListingImage = (listing) => {
    try {
      const values = listing.values;
      if (!values) return doctorcardImage;

      const imageFields = [
        "image",
        "images",
        "photo",
        "photos",
        "avatar",
        "picture",
        "profile",
      ];

      for (const field of imageFields) {
        const fieldValue = values.get ? values.get(field) : values[field];
        if (fieldValue) {
          if (typeof fieldValue === "string") return fieldValue;
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            return typeof fieldValue[0] === "string"
              ? fieldValue[0]
              : fieldValue[0]?.url || fieldValue[0]?.secure_url;
          }
          if (fieldValue.url) return fieldValue.url;
          if (fieldValue.secure_url) return fieldValue.secure_url;
        }
      }

      return doctorcardImage;
    } catch {
      return doctorcardImage;
    }
  };

  // Helper function to get value from listing
  const getListingValue = (listing, fieldName, fallback = "") => {
    try {
      const values = listing.values;
      if (!values) return fallback;

      const value = values.get ? values.get(fieldName) : values[fieldName];
      return value || fallback;
    } catch {
      return fallback;
    }
  };

  // Helper function to format fee display
  const formatFee = (listing) => {
    try {
      const values = listing.values;
      if (!values) return "Fee varies";

      // Try to get fee from various field names
      const feeFields = ["fee", "minFee", "maxFee", "consultationFee", "price"];
      const fees = {};

      for (const field of feeFields) {
        const fieldValue = values.get ? values.get(field) : values[field];
        if (fieldValue) {
          fees[field] = fieldValue;
        }
      }

      // Handle fee range (minFee - maxFee)
      if (fees.minFee && fees.maxFee) {
        const minFee = parseInt(fees.minFee);
        const maxFee = parseInt(fees.maxFee);
        if (!isNaN(minFee) && !isNaN(maxFee)) {
          return `${minFee} - ${maxFee} AED`;
        }
      }

      // Handle single fee value
      if (fees.fee) {
        const feeValue = parseInt(fees.fee);
        if (!isNaN(feeValue)) {
          return `${feeValue} AED`;
        }
        // Handle string fee values like "250AED-450AED"
        if (typeof fees.fee === "string") {
          const cleanFee = fees.fee.replace(/AED/gi, "").trim();
          if (cleanFee.includes("-")) {
            const [min, max] = cleanFee.split("-").map((f) => f.trim());
            if (min && max) {
              return `${min} - ${max} AED`;
            }
          }
          return fees.fee.includes("AED") ? fees.fee : `${fees.fee} AED`;
        }
      }

      // Handle minFee only
      if (fees.minFee) {
        const minFee = parseInt(fees.minFee);
        if (!isNaN(minFee)) {
          return `From ${minFee} AED`;
        }
      }

      // Handle consultation fee
      if (fees.consultationFee) {
        const consultationFee = parseInt(fees.consultationFee);
        if (!isNaN(consultationFee)) {
          return `${consultationFee} AED`;
        }
      }

      return "Fee varies";
    } catch {
      return "Fee varies";
    }
  };

  // Transform healthcare listings to doctor card format
  const transformedDoctors = useMemo(() => {
    // Debug logging
    console.log("Raw healthcare listings:", healthcareListings);

    return healthcareListings.map((listing) => {
      console.log("Processing listing:", listing);

      const transformed = {
        id: listing._id,
        name:
          getListingValue(listing, "doctorName") ||
          getListingValue(listing, "name") ||
          getListingValue(listing, "title") ||
          "Healthcare Professional",
        image: getListingImage(listing),
        specialty:
          getListingValue(listing, "specialty") ||
          getListingValue(listing, "specialist type") ||
          listing.categoryId?.name ||
          "Healthcare",
        location:
          listing?.values?.location?.address ||
          getListingValue(listing, "city") ||
          listing?.city ||
          "Location not specified",
        experience: getListingValue(listing, "experience", "0"),
        fee: formatFee(listing),
        slug: listing.slug,
        // Badge information from listing model
        isVerified: listing.isVerified || false,
        isFeatured: listing.isFeatured || false,
        isPremium: listing.isPremium || false,
        plan: listing.plan || "free",
        paymentStatus: listing.paymentStatus || "pending",
      };

      console.log("Transformed doctor:", transformed);
      return transformed;
    });
  }, [healthcareListings]);

  // Filter handlers
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setPage(1);
    updateURL({
      search: searchFromHero,
      city,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
    updateURL({
      search: searchFromHero,
      city: selectedCity,
      sort,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURL({
      search: searchFromHero,
      city: selectedCity,
      sort: sortBy,
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSelectedCity("all");
    setSortBy("latest");
    setSearchFromHero("");
    setPage(1);
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchFromHero && searchFromHero.trim()) count++;
    if (selectedCity !== "all") count++;
    return count;
  };

  return (
    <div>
      <HeroSection />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-6 flex-wrap">
            {/* City Filter */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative w-full min-w-[180px]">
                <CustomDropdown
                  value={selectedCity}
                  options={cities}
                  onChange={(val) => handleCityChange(val)}
                  isOpen={cityDropdownOpen}
                  setIsOpen={setCityDropdownOpen}
                  hideScrollbar={true}
                />
              </div>
            </div>

            {/* Sort Filter */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="relative w-full min-w-[180px]">
                <CustomDropdown
                  value={sortBy}
                  options={sortOptions}
                  onChange={(val) => handleSortChange(val)}
                  isOpen={sortDropdownOpen}
                  setIsOpen={setSortDropdownOpen}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-col items-start">
                <label className="block text-sm font-medium text-gray-700 mb-7"></label>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 font-medium rounded-xl border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Clear Filters ({getActiveFiltersCount()})
                </button>
              </div>
            )}
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden flex justify-between items-center">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FiFilter className="h-5 w-5" />
              <span className="font-medium">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-white text-primary text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {currentCategory
                ? currentCategory.name
                : "Healthcare Professionals"}
              {searchFromHero && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - Results for "{searchFromHero}"
                </span>
              )}
            </h1>
            {currentCategory && (
              <p className="text-gray-600 text-sm mb-2">
                {currentCategory.isLeaf
                  ? `Showing listings in ${currentCategory.name}`
                  : `Showing listings in ${currentCategory.name} and its subcategories (${currentCategory.childrenCount} subcategories)`}
              </p>
            )}
            {!loading && (
              <p className="text-gray-600">
                {totalCount > 0
                  ? `Showing ${transformedDoctors.length} of ${totalCount} results`
                  : "No healthcare professionals found"}
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <LoadingState />
          </div>
        )}

        {/* Results Grid */}
        {!loading && transformedDoctors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {transformedDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && transformedDoctors.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Healthcare Professionals Found
            </h3>
            <p className="text-gray-600 mb-4">
              {getActiveFiltersCount() > 0
                ? "Try adjusting your filters or search terms."
                : "No healthcare professionals are available at the moment."}
            </p>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && transformedDoctors.length > 0 && totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-md ${
                      pageNum === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-primary to-secondary rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* City Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800 tracking-wide">
                  SELECT CITY
                </label>
                <div className="relative">
                  <CustomDropdown
                    value={selectedCity}
                    options={cities}
                    onChange={(val) => handleCityChange(val)}
                    isOpen={cityDropdownOpen}
                    setIsOpen={setCityDropdownOpen}
                    hideScrollbar={true}
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800 tracking-wide">
                  SORT BY
                </label>
                <div className="relative">
                  <CustomDropdown
                    value={sortBy}
                    options={sortOptions}
                    onChange={(val) => handleSortChange(val)}
                    isOpen={sortDropdownOpen}
                    setIsOpen={setSortDropdownOpen}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-300 shadow-sm"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transform hover:scale-105 font-semibold transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceListingPage;
