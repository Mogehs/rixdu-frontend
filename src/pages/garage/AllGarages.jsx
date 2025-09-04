import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getVehicleListings,
  getVehicleListingsAdvanced,
  getVehicleFilterOptions,
  selectVehicleListings,
  selectVehicleListingsLoading,
} from "../../features/listings/listingsSlice";
import { Search, MapPin, ChevronDown, Filter, X } from "lucide-react";
import { useSearchParams } from "react-router";
import GarageServiceCard from "../../components/common/GarageServiceCard";

const AllGarages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("All Services");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchParams] = useSearchParams();
  const { navbarStores: stores } = useSelector((state) => state.adminStores);

  // Get individual query params
  const categoryId = searchParams.get("category");

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({
    brand: "",
    model: "",
    year: { min: "", max: "" },
    price: { min: "", max: "" },
    mileage: { min: "", max: "" },
    fuelType: "",
    transmission: "",
    color: "",
    condition: "",
  });

  const dispatch = useDispatch();
  const vehicleState = useSelector(selectVehicleListings);
  const loadingVehicles = useSelector(selectVehicleListingsLoading);
  const mounted = useRef(false);

  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [error, setError] = useState(null);

  const serviceOptions = stores
    .map((store) => (store.name == "Vehicles" ? store.categories : []))
    .flat();

  const locationOptions = [
    "All Locations",
    "Dubai",
    "Sharjah",
    "Ras Al Khaimah",
    "Abu Dhabi",
    "Ajman",
    "Fujairah",
    "Umm Al-Quwain",
  ];

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setError(null); // Clear any previous errors when filters change
  }, [debouncedSearch, selectedService, selectedLocation, advancedFilters]);

  // Fetch filter options on mount
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      try {
        dispatch(getVehicleFilterOptions({ categoryId })).catch((err) => {
          console.error("Error fetching filter options:", err);
          setError("Failed to load filter options");
        });
      } catch (err) {
        console.error("Error dispatching filter options:", err);
        setError("Failed to load filter options");
      }
    }
  }, [dispatch, categoryId]);

  // Fetch vehicle listings
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }

    try {
      const params = {
        page,
        limit,
      };

      if (debouncedSearch) params.search = debouncedSearch;

      // category handling
      if (selectedService && selectedService !== "All Services") {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(selectedService);
        if (isObjectId) {
          params.categoryId = selectedService;
        } else {
          params.categorySlug = selectedService
            .toLowerCase()
            .replace(/\s+/g, "-"); // slugify for backend
        }
      }

      if (selectedLocation && selectedLocation !== "All Locations") {
        params.city = selectedLocation;
      }

      // Add advanced filters
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (value && typeof value === "object" && (value.min || value.max)) {
          if (value.min) params[`${key}Min`] = value.min;
          if (value.max) params[`${key}Max`] = value.max;
        } else if (value && typeof value === "string" && value.trim()) {
          params[key] = value.trim();
        }
      });

      // Use advanced API if advanced filters are applied
      const hasAdvancedFilters = Object.values(advancedFilters).some(
        (value) =>
          (typeof value === "object" && (value.min || value.max)) ||
          (typeof value === "string" && value.trim())
      );

      if (hasAdvancedFilters) {
        dispatch(getVehicleListingsAdvanced(params)).catch((err) => {
          console.error("Error fetching advanced vehicle listings:", err);
          setError("Failed to load vehicle listings");
        });
      } else {
        // Add categoryId to params if it exists
        if (categoryId) {
          params.categoryId = categoryId;
        }
        dispatch(getVehicleListings(params)).catch((err) => {
          console.error("Error fetching vehicle listings:", err);
          setError("Failed to load vehicle listings");
        });
      }
    } catch (err) {
      console.error("Error in vehicle listings effect:", err);
      setError("Failed to load vehicle listings");
    }
  }, [
    dispatch,
    page,
    limit,
    debouncedSearch,
    selectedService,
    selectedLocation,
    categoryId,
    advancedFilters,
  ]);

  // Dropdown component
  const CustomDropdown = ({
    value,
    options,
    onChange,
    placeholder = "Select option",
    isOpen,
    setIsOpen,
    icon,
  }) => {
    const IconComp = icon || ChevronDown;

    return (
      <div className="relative text-sm">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-200 rounded-full bg-white text-left 
                   focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all 
                   duration-150 hover:border-gray-300 flex items-center justify-between group"
        >
          <span
            className={`truncate ${
              value === placeholder || value?.includes("All")
                ? "text-gray-500 font-normal"
                : "text-gray-900 font-medium"
            }`}
            style={{ maxWidth: "85%" }}
          >
            {value}
          </span>
          <IconComp
            className={`w-4 h-4 text-gray-400 transition-transform duration-150 
                      group-hover:text-gray-600 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute z-20 w-full mt-1 bg-white border border-gray-200 
                       rounded-lg shadow-lg max-h-52 overflow-y-auto text-sm scrollbar-hide"
            >
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left transition-colors duration-150 flex items-center justify-between
                  ${
                    value === option
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } 
                  ${index === 0 ? "rounded-t-lg" : ""} 
                  ${index === options.length - 1 ? "rounded-b-lg" : ""}`}
                >
                  <span className="truncate">{option}</span>
                  {value === option && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Advanced Filter Input Component
  const FilterInput = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
  }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === "range" ? (
        <div className="flex gap-2">
          <input
            type="number"
            value={value.min || ""}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
            placeholder="Min"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm"
          />
          <input
            type="number"
            value={value.max || ""}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
            placeholder="Max"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm"
          />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm"
        />
      )}
    </div>
  );

  const activeList =
    vehicleState?.data || vehicleState?.listings || vehicleState || [];

  const pagination = (() => {
    const state = vehicleState;
    if (!state) return null;
    if (state.pagination) return state.pagination;
    if (state.data?.pagination) return state.data.pagination;
    if (state.totalPages || state.currentPage) {
      return {
        pages: state.totalPages || state.pages,
        current: state.currentPage || state.page,
      };
    }
    return null;
  })();

  const totalCount = (() => {
    if (Array.isArray(vehicleState?.data)) return vehicleState.data.length;
    if (vehicleState?.count) return vehicleState.count;
    return activeList?.length || 0;
  })();

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    const pages = (pagination?.pages ?? Math.ceil(totalCount / limit)) || 1;
    if (page < pages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600/95 to-indigo-700/95 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-semibold">
              Trusted Local Services — Fast bookings
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl mx-auto mt-2">
              Browse nearby professionals, compare ratings and book with ease.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-full p-1.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services, providers or location"
                    className="w-full pl-10 pr-20 py-1.5 border border-gray-100 rounded-full focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-gray-900 text-sm bg-transparent"
                  />

                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDebouncedSearch(searchQuery.trim())}
                      className="hidden md:inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition"
                    >
                      Search
                    </button>

                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="text-gray-400 hover:text-gray-600 text-sm px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="w-32">
                  <CustomDropdown
                    value={selectedService}
                    options={[
                      "All Services",
                      ...serviceOptions.map((service) => service.name),
                    ]}
                    onChange={setSelectedService}
                    placeholder="All Services"
                    isOpen={serviceDropdownOpen}
                    setIsOpen={setServiceDropdownOpen}
                  />
                </div>

                <div className="w-32">
                  <CustomDropdown
                    value={selectedLocation}
                    options={locationOptions}
                    onChange={setSelectedLocation}
                    placeholder="All Locations"
                    isOpen={locationDropdownOpen}
                    setIsOpen={setLocationDropdownOpen}
                    icon={MapPin}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {totalCount} Services Found
          </h2>
        </div>

        {loadingVehicles ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading services...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-sm text-gray-600 mt-2">
                Please try again later or adjust your search criteria.
              </p>
            </div>
            <button
              onClick={() => {
                setError(null);
                // Retry the current request
                const params = { page, limit };
                if (debouncedSearch) params.search = debouncedSearch;
                if (selectedService && selectedService !== "All Services") {
                  const isObjectId = /^[0-9a-fA-F]{24}$/.test(selectedService);
                  if (isObjectId) {
                    params.categoryId = selectedService;
                  } else {
                    params.categorySlug = selectedService
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                  }
                }
                if (selectedLocation && selectedLocation !== "All Locations") {
                  params.city = selectedLocation;
                }
                if (categoryId) {
                  params.categoryId = categoryId;
                }

                const hasAdvancedFilters = Object.values(advancedFilters).some(
                  (value) =>
                    (typeof value === "object" && (value.min || value.max)) ||
                    (typeof value === "string" && value.trim())
                );

                if (hasAdvancedFilters) {
                  dispatch(getVehicleListingsAdvanced(params));
                } else {
                  dispatch(getVehicleListings(params));
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : activeList.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeList.map((item, index) => (
                <div key={item._id || item.id || index}>
                  <GarageServiceCard item={item} index={index} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={handlePrev}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>

              <div className="px-4 py-2">
                Page {pagination?.current ?? page} of{" "}
                {pagination?.pages ??
                  Math.max(1, Math.ceil(totalCount / limit))}
              </div>

              <button
                onClick={handleNext}
                disabled={
                  (pagination?.pages && page >= pagination.pages) ||
                  (pagination == null && page * limit >= totalCount)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllGarages;
