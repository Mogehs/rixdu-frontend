import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiMapPin,
  FiDollarSign,
  FiHome,
  FiTag,
  FiRefreshCw,
  FiSquare,
} from "react-icons/fi";
import { AdCard } from "../../components/common";
import {
  searchListings,
  getListings,
} from "../../features/listings/listingsSlice";
import {
  toggleFavorite,
  getFavorites,
} from "../../features/profile/publicProfileSlice";

// Applied Filters Display Component
const AppliedFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  const filterEntries = Object.entries(filters).filter(
    ([, value]) => value && value !== "" && value !== "All"
  );

  if (filterEntries.length === 0) return null;

  const getFilterLabel = (key) => {
    const labels = {
      query: "Search",
      category: "Category",
      purpose: "Purpose",
      filter: "Type",
      emirate: "Emirate",
      location: "Location",
      city: "City",
      minPrice: "Min Price",
      maxPrice: "Max Price",
      beds: "Beds",
      baths: "Baths",
      propertyType: "Property Type",
    };
    return labels[key] || key;
  };

  const getFilterIcon = (key) => {
    const icons = {
      query: <FiSearch className="w-3 h-3" />,
      location: <FiMapPin className="w-3 h-3" />,
      emirate: <FiMapPin className="w-3 h-3" />,
      city: <FiMapPin className="w-3 h-3" />,
      minPrice: <FiDollarSign className="w-3 h-3" />,
      maxPrice: <FiDollarSign className="w-3 h-3" />,
      beds: <FiSquare className="w-3 h-3" />,
      baths: <FiSquare className="w-3 h-3" />,
      propertyType: <FiHome className="w-3 h-3" />,
      filter: <FiTag className="w-3 h-3" />,
    };
    return icons[key] || <FiFilter className="w-3 h-3" />;
  };

  const formatValue = (key, value) => {
    if (key === "minPrice" || key === "maxPrice") {
      return `AED ${parseInt(value).toLocaleString()}`;
    }
    if (key === "beds" || key === "baths") {
      return `${value} ${key === "beds" ? "bed" : "bath"}${
        value !== "1" ? "s" : ""
      }`;
    }
    return value;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mr-3">
          <FiFilter className="w-4 h-4" />
          Applied Filters:
        </div>

        <div className="flex flex-wrap gap-2 flex-1">
          {filterEntries.map(([key, value]) => (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {getFilterIcon(key)}
              <span className="text-xs font-medium text-gray-600">
                {getFilterLabel(key)}:
              </span>
              <span className="font-semibold">{formatValue(key, value)}</span>
              <button
                onClick={() => onRemoveFilter(key)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${getFilterLabel(key)} filter`}
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-lg transition-colors"
        >
          <FiX className="w-4 h-4" />
          Clear All
        </button>
      </div>
    </div>
  );
};

// Mobile Filter Panel Component
const MobileFilterPanel = ({
  showMobileFilters,
  filterModalRef,
  toggleMobileFilters,
  resetAllFilters,
  activeTab,
  handleTabChange,
  bedCount,
  decrementBed,
  incrementBed,
  bathCount,
  decrementBath,
  incrementBath,
  location,
  setLocation,
  locationInputRef,
  activePropertyTab,
  handlePropertyTabChange,
  selectedPropertyType,
  setSelectedPropertyType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  if (!showMobileFilters) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 md:hidden"
      onClick={toggleMobileFilters}
    >
      <div
        ref={filterModalRef}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-lg transform transition-transform duration-300 max-h-[90vh] overflow-y-auto hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex gap-4">
            <button
              className="text-primary text-sm font-medium"
              onClick={resetAllFilters}
            >
              Reset All
            </button>
            <button onClick={toggleMobileFilters} className="text-gray-400">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-5">
            {/* Purpose Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Purpose
              </h3>
              <div className="flex overflow-hidden h-12 border border-gray-200 rounded-lg">
                <button
                  className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors ${
                    activeTab === "Buy"
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("Buy")}
                >
                  Buy
                </button>
                <button
                  className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors ${
                    activeTab === "Rent"
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("Rent")}
                >
                  Rent
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Location
              </h3>
              <div className="relative h-12">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch className="w-5 h-5" />
                </div>
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Enter Location"
                  className="h-full w-full rounded-lg border border-gray-200 pl-10 pr-8 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {location && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setLocation("")}
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Beds & Bath */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Beds & Bath
              </h3>
              <div className="flex h-12 gap-3">
                <div className="flex items-center w-1/2 rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors">
                  <span className="pl-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                    Beds
                  </span>
                  <div className="flex items-center ml-auto h-full">
                    <button
                      className="w-10 h-full flex items-center justify-center text-gray-500 transition-colors"
                      onClick={decrementBed}
                      aria-label="Decrease beds"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {bedCount}
                    </span>
                    <button
                      className="w-10 h-full flex items-center justify-center text-gray-500 transition-colors"
                      onClick={incrementBed}
                      aria-label="Increase beds"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center w-1/2 rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors">
                  <span className="pl-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                    Bath
                  </span>
                  <div className="flex items-center ml-auto h-full">
                    <button
                      className="w-10 h-full flex items-center justify-center text-gray-500 transition-colors"
                      onClick={decrementBath}
                      aria-label="Decrease baths"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {bathCount}
                    </span>
                    <button
                      className="w-10 h-full flex items-center justify-center text-gray-500 transition-colors"
                      onClick={incrementBath}
                      aria-label="Increase baths"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Property Type
              </h3>
              <div className="flex mb-3 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activePropertyTab === "Residential"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handlePropertyTabChange("Residential")}
                >
                  Residential
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activePropertyTab === "Commercial"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handlePropertyTabChange("Commercial")}
                >
                  Commercial
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter property type"
                  className="w-full h-12 text-sm rounded-lg border border-gray-200 px-3 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price</h3>
              <div className="flex h-12 items-center gap-2">
                <select
                  className="w-[48%] h-full text-sm rounded-lg border border-gray-200 px-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                >
                  <option value="">Min Price</option>
                  <option value="10000">AED 10,000</option>
                  <option value="25000">AED 25,000</option>
                  <option value="50000">AED 50,000</option>
                  <option value="75000">AED 75,000</option>
                  <option value="100000">AED 100,000</option>
                  <option value="150000">AED 150,000</option>
                  <option value="200000">AED 200,000</option>
                  <option value="300000">AED 300,000</option>
                  <option value="500000">AED 500,000</option>
                  <option value="750000">AED 750,000</option>
                  <option value="1000000">AED 1,000,000</option>
                  <option value="1500000">AED 1,500,000</option>
                  <option value="2000000">AED 2,000,000</option>
                  <option value="3000000">AED 3,000,000</option>
                  <option value="5000000">AED 5,000,000</option>
                </select>
                <select
                  className="w-[48%] h-full text-sm rounded-lg border border-gray-200 px-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">Max Price</option>
                  <option value="25000">AED 25,000</option>
                  <option value="50000">AED 50,000</option>
                  <option value="75000">AED 75,000</option>
                  <option value="100000">AED 100,000</option>
                  <option value="150000">AED 150,000</option>
                  <option value="200000">AED 200,000</option>
                  <option value="300000">AED 300,000</option>
                  <option value="500000">AED 500,000</option>
                  <option value="750000">AED 750,000</option>
                  <option value="1000000">AED 1,000,000</option>
                  <option value="1500000">AED 1,500,000</option>
                  <option value="2000000">AED 2,000,000</option>
                  <option value="3000000">AED 3,000,000</option>
                  <option value="5000000">AED 5,000,000</option>
                  <option value="10000000">AED 10,000,000</option>
                </select>
              </div>
            </div>
          </div>

          {/* Apply Button */}
        </div>
      </div>
    </div>
  );
};

// Desktop Filters Component
const DesktopFilters = ({
  activeTab,
  handleTabChange,
  location,
  setLocation,
  locationInputRef,
  bedCount,
  bathCount,
  decrementBed,
  incrementBed,
  decrementBath,
  incrementBath,
  showPropertyDropdown,
  togglePropertyDropdown,
  selectedPropertyType,
  setSelectedPropertyType,
  setShowPropertyDropdown,
  activePropertyTab,
  handlePropertyTabChange,
  closePropertyDropdown,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  focusLocationInput,
}) => (
  <div className="hidden md:block bg-white rounded-2xl shadow-sm p-5 mb-8">
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-lg font-medium">Filters</h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Purpose Filter */}
      <div className="flex flex-col">
        <div
          className="border border-gray-200 rounded-lg p-2 mb-2 w-full cursor-pointer"
          onClick={() => {
            handleTabChange(activeTab === "Buy" ? "Rent" : "Buy");
          }}
        >
          <label className="block text-sm font-medium text-gray-700 cursor-pointer">
            Purpose
          </label>
        </div>
        <div className="flex overflow-hidden h-10">
          <button
            className={`flex-1 flex items-center justify-center text-sm font-medium rounded-l-lg transition-colors ${
              activeTab === "Buy"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleTabChange("Buy")}
          >
            Buy
          </button>
          <button
            className={`flex-1 flex items-center justify-center text-sm font-medium rounded-r-lg transition-colors ${
              activeTab === "Rent"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleTabChange("Rent")}
          >
            Rent
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col">
        <div
          className="border border-gray-200 rounded-lg p-2 mb-2 cursor-pointer"
          onClick={focusLocationInput}
        >
          <label className="block text-sm font-medium text-gray-700 cursor-pointer">
            Location
          </label>
        </div>
        <div className="relative h-10">
          <input
            ref={locationInputRef}
            type="text"
            placeholder="Enter Location"
            className="h-full w-full rounded-lg border border-gray-200 px-3 pr-8 text-sm bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {location && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setLocation("")}
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Beds & Bath */}
      <div className="flex flex-col">
        <div className="border border-gray-200 rounded-lg p-2 mb-2 cursor-pointer">
          <label className="block text-sm font-medium text-gray-700 cursor-pointer">
            Beds & Bath
          </label>
        </div>
        <div className="flex h-10 gap-2">
          <div className="flex items-center w-1/2 rounded-lg border border-gray-200 bg-[#F5F5F5] hover:border-gray-300 transition-colors">
            <span className="pl-2 text-xs font-medium text-gray-700 whitespace-nowrap">
              Beds
            </span>
            <div className="flex items-center ml-auto h-full">
              <button
                className="min-w-[22px] w-6 h-full flex items-center justify-center text-gray-500 transition-colors"
                onClick={decrementBed}
                aria-label="Decrease beds"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-[16px] w-4 text-center text-xs font-medium">
                {bedCount}
              </span>
              <button
                className="min-w-[22px] w-6 h-full flex items-center justify-center text-gray-500 transition-colors"
                onClick={incrementBed}
                aria-label="Increase beds"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center w-1/2 rounded-lg border border-gray-200 bg-[#F5F5F5] hover:border-gray-300 transition-colors">
            <span className="pl-2 text-xs font-medium text-gray-700 whitespace-nowrap">
              Bath
            </span>
            <div className="flex items-center ml-auto h-full">
              <button
                className="min-w-[22px] w-6 h-full flex items-center justify-center text-gray-500 transition-colors"
                onClick={decrementBath}
                aria-label="Decrease baths"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-[16px] w-4 text-center text-xs font-medium">
                {bathCount}
              </span>
              <button
                className="min-w-[22px] w-6 h-full flex items-center justify-center text-gray-500 transition-colors"
                onClick={incrementBath}
                aria-label="Increase baths"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="flex flex-col relative property-dropdown-container">
        <div
          className="border border-gray-200 rounded-lg p-2 mb-2 cursor-pointer"
          onClick={togglePropertyDropdown}
        >
          <label className="block text-sm font-medium text-gray-700 cursor-pointer">
            Property Type
          </label>
        </div>
        <div
          className="h-10 flex items-center justify-between px-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors bg-[#F5F5F5]"
          onClick={togglePropertyDropdown}
        >
          <input
            type="text"
            placeholder="Enter property type"
            className="w-full h-full text-sm bg-transparent outline-none"
            value={selectedPropertyType}
            onChange={(e) => setSelectedPropertyType(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <FiChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
              showPropertyDropdown ? "transform rotate-180" : ""
            }`}
          />
        </div>

        {/* Property Type Dropdown */}
        {showPropertyDropdown && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activePropertyTab === "Residential"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handlePropertyTabChange("Residential")}
              >
                Residential
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activePropertyTab === "Commercial"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handlePropertyTabChange("Commercial")}
              >
                Commercial
              </button>
            </div>
            <div className="flex border-t border-gray-200 p-2">
              <button
                className="flex-1 py-1.5 text-sm font-medium bg-gray-100 rounded-md mr-1 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setSelectedPropertyType("");
                  setShowPropertyDropdown(false);
                }}
              >
                Clear
              </button>
              <button
                className="flex-1 py-1.5 text-sm font-medium bg-primary text-white rounded-md ml-1 hover:bg-secondary transition-colors"
                onClick={closePropertyDropdown}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="flex flex-col">
        <div className="border border-gray-200 rounded-lg p-2 mb-2 cursor-pointer">
          <label className="block text-sm font-medium text-gray-700 cursor-pointer">
            Price
          </label>
        </div>
        <div className="flex h-10 items-center gap-1">
          <select
            className="w-[48%] h-full text-xs rounded-lg border border-gray-200 px-2 bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          >
            <option value="">Min (AED)</option>
            <option value="10000">10K</option>
            <option value="25000">25K</option>
            <option value="50000">50K</option>
            <option value="75000">75K</option>
            <option value="100000">100K</option>
            <option value="150000">150K</option>
            <option value="200000">200K</option>
            <option value="300000">300K</option>
            <option value="500000">500K</option>
            <option value="750000">750K</option>
            <option value="1000000">1M</option>
            <option value="1500000">1.5M</option>
            <option value="2000000">2M</option>
            <option value="3000000">3M</option>
            <option value="5000000">5M</option>
          </select>
          <select
            className="w-[48%] h-full text-xs rounded-lg border border-gray-200 px-2 bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          >
            <option value="">Max (AED)</option>
            <option value="25000">25K</option>
            <option value="50000">50K</option>
            <option value="75000">75K</option>
            <option value="100000">100K</option>
            <option value="150000">150K</option>
            <option value="200000">200K</option>
            <option value="300000">300K</option>
            <option value="500000">500K</option>
            <option value="750000">750K</option>
            <option value="1000000">1M</option>
            <option value="1500000">1.5M</option>
            <option value="2000000">2M</option>
            <option value="3000000">3M</option>
            <option value="5000000">5M</option>
            <option value="10000000">10M</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// Sorting Section Component
const SortingSection = ({ pageTitle, activeSort, handleSortChange }) => (
  <div className="mb-6">
    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
      {pageTitle}
    </h1>

    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center border border-gray-300 rounded-md p-1.5 bg-white shadow-sm">
        <FiFilter className="w-4 h-4 text-gray-500 mr-1" />
        <span className="text-sm font-medium">Sort</span>
      </div>

      <button
        className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
          activeSort === "Popular"
            ? "bg-primary text-white shadow-sm"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => handleSortChange("Popular")}
      >
        Popular
      </button>

      <button
        className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
          activeSort === "Lowest Starting Price"
            ? "bg-primary text-white shadow-sm"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => handleSortChange("Lowest Starting Price")}
      >
        Lowest Starting Price
      </button>

      <button
        className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
          activeSort === "Highest Starting Price"
            ? "bg-primary text-white shadow-sm"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => handleSortChange("Highest Starting Price")}
      >
        Highest Starting Price
      </button>
    </div>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center mt-12 mb-8">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            currentPage === 1 || loading
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          <FiChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span key={index} className="px-3 py-2 text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  currentPage === page
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            currentPage === totalPages || loading
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          Next
          <FiChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

// Property Grid Component
const PropertyGrid = ({
  propertyListings,
  loading,
  error,
  hasActiveFilters = false,
  favoriteItems = [],
  onToggleFavorite,
  isProcessingFavorite,
  onClearFilters,
}) => {
  if (loading && propertyListings.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Listings
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (propertyListings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No listings found
          </h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results."
              : "No listings are available at the moment."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiX className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {propertyListings.map((item, index) => (
        <AdCard
          key={item._id || index}
          item={item}
          index={index}
          passedFavorites={favoriteItems}
          onToggleFavorite={onToggleFavorite}
          isProcessingFavorite={isProcessingFavorite}
          showFavourite={true}
        />
      ))}
    </div>
  );
};

// Main CategoryListingPage Component
const CategoryListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Redux state
  const {
    searchResults: listings,
    loading,
    error,
    totalPages,
    currentPage,
    totalCount,
  } = useSelector((state) => state.listings);

  // Get favorites from Redux state
  const { favorites } = useSelector((state) => state.publicProfile);
  const favoriteItems = favorites?.data || [];
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);

  // Filter states
  const [activeTab, setActiveTab] = useState("");
  const [location, setLocation] = useState("");
  const [bedCount, setBedCount] = useState(0);
  const [bathCount, setBathCount] = useState(0);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeSort, setActiveSort] = useState("");
  const [pageTitle, setPageTitle] = useState("All Listings");

  // UI states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [activePropertyTab, setActivePropertyTab] = useState("Residential");

  // Refs
  const locationInputRef = useRef(null);
  const filterModalRef = useRef(null);
  const hasInitialized = useRef(false);
  const searchTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const isUpdatingFromUrl = useRef(false);
  const isClearingFilters = useRef(false);
  const isAutoApplying = useRef(false);

  // Applied filters from URL
  const [appliedFilters, setAppliedFilters] = useState({});

  // Update URL parameters
  const updateUrlParams = useCallback(
    (newFilters) => {
      const params = new URLSearchParams(searchParams);

      // Remove existing filter params
      Object.keys(appliedFilters).forEach((key) => {
        params.delete(key);
      });

      // Add new filter params
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "" && value !== "All") {
          params.set(key, value);
        }
      });

      setSearchParams(params);
    },
    [searchParams, appliedFilters, setSearchParams]
  );

  // Apply filters function
  const applyFilters = useCallback(() => {
    // Don't proceed if we're currently updating from URL to prevent loops
    if (isUpdatingFromUrl.current) {
      return;
    }

    const newFilters = {
      ...appliedFilters,
      purpose: activeTab.toLowerCase(),
      location: location || undefined,
      beds: bedCount > 0 ? bedCount.toString() : undefined,
      baths: bathCount > 0 ? bathCount.toString() : undefined,
      propertyType: selectedPropertyType || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: activeSort || undefined,
    };

    // Remove undefined values
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] === undefined || newFilters[key] === "") {
        delete newFilters[key];
      }
    });

    setAppliedFilters(newFilters);
    updateUrlParams(newFilters);

    // Note: We don't call dispatch here because updateUrlParams will trigger
    // the useEffect which will handle the API call to avoid duplicate calls
    setShowMobileFilters(false);
  }, [
    appliedFilters,
    activeTab,
    location,
    bedCount,
    bathCount,
    selectedPropertyType,
    minPrice,
    maxPrice,
    activeSort,
    updateUrlParams,
    setShowMobileFilters,
  ]);

  // Auto-apply filters when state changes (except when updating from URL or clearing filters)
  useEffect(() => {
    // Skip auto-apply if we're updating from URL, clearing filters, or already auto-applying
    if (
      isUpdatingFromUrl.current ||
      isClearingFilters.current ||
      isAutoApplying.current
    ) {
      return;
    }

    // Skip if component hasn't been initialized yet
    if (!hasInitialized.current) {
      return;
    }

    // Build current filter state
    const currentFilters = {
      purpose: activeTab.toLowerCase(),
      location: location || undefined,
      beds: bedCount > 0 ? bedCount.toString() : undefined,
      baths: bathCount > 0 ? bathCount.toString() : undefined,
      propertyType: selectedPropertyType || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    };

    // Remove undefined values for comparison
    Object.keys(currentFilters).forEach((key) => {
      if (currentFilters[key] === undefined || currentFilters[key] === "") {
        delete currentFilters[key];
      }
    });

    // Check if filters have actually changed
    const filtersChanged =
      JSON.stringify(appliedFilters) !== JSON.stringify(currentFilters);
    if (!filtersChanged) {
      return; // No need to apply if filters haven't changed
    }

    // Clear any existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set a new timeout to apply filters after 800ms of inactivity
    filterTimeoutRef.current = setTimeout(() => {
      isAutoApplying.current = true;
      applyFilters();
      // Reset flag after a short delay
      setTimeout(() => {
        isAutoApplying.current = false;
      }, 100);
    }, 800);

    // Cleanup function
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [
    activeTab,
    location,
    bedCount,
    bathCount,
    selectedPropertyType,
    minPrice,
    maxPrice,
    appliedFilters,
    applyFilters,
  ]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters = {};

    // Extract all filter parameters from URL
    const params = [
      "query",
      "category",
      "purpose",
      "filter",
      "emirate",
      "location",
      "city",
      "minPrice",
      "maxPrice",
      "beds",
      "baths",
      "propertyType",
      "sort",
      "page",
    ];

    params.forEach((param) => {
      const value = searchParams.get(param);
      if (value && value !== "") {
        urlFilters[param] = value;
      }
    });

    // Only update appliedFilters if they're actually different
    const filtersChanged =
      JSON.stringify(appliedFilters) !== JSON.stringify(urlFilters);
    if (filtersChanged) {
      isUpdatingFromUrl.current = true;
      setAppliedFilters(urlFilters);
    }

    // Set individual filter states from URL - with explicit defaults when parameters are missing
    setActiveTab(
      urlFilters.purpose ? (urlFilters.purpose === "buy" ? "Buy" : "Rent") : ""
    );
    setLocation(
      urlFilters.location || urlFilters.city || urlFilters.emirate || ""
    );
    setBedCount(urlFilters.beds ? parseInt(urlFilters.beds) || 0 : 0);
    setBathCount(urlFilters.baths ? parseInt(urlFilters.baths) || 0 : 0);
    setSelectedPropertyType(urlFilters.propertyType || "");
    setMinPrice(urlFilters.minPrice || "");
    setMaxPrice(urlFilters.maxPrice || "");
    setActiveSort(urlFilters.sort || "");

    // Set page title based on category
    if (urlFilters.category) {
      setPageTitle(`${urlFilters.category} Listings`);
    } else {
      setPageTitle("All Listings");
    }

    // Fetch listings with filters only once or when URL changes
    const fetchData = async () => {
      // Skip if we're currently clearing filters to prevent duplicate API calls
      if (isClearingFilters.current) {
        return;
      }

      if (!hasInitialized.current || Object.keys(urlFilters).length > 0) {
        hasInitialized.current = true;
        try {
          await dispatch(
            searchListings({
              ...urlFilters,
              page: urlFilters.page || 1,
              limit: 20,
            })
          );
        } catch (error) {
          console.error("Error fetching listings:", error);
        } finally {
          // Reset the flag after API call
          isUpdatingFromUrl.current = false;
        }
      } else {
        // Reset the flag even if we don't make an API call
        isUpdatingFromUrl.current = false;
      }
    };

    fetchData();
  }, [searchParams, dispatch, appliedFilters]);

  // Skip auto-apply for now to prevent infinite loops
  // We'll rely on manual filter application instead

  // Cleanup timeouts on unmount
  useEffect(() => {
    const currentSearchTimeout = searchTimeoutRef;
    const currentFilterTimeout = filterTimeoutRef;

    return () => {
      if (currentSearchTimeout.current) {
        clearTimeout(currentSearchTimeout.current);
      }
      if (currentFilterTimeout.current) {
        clearTimeout(currentFilterTimeout.current);
      }
    };
  }, []);

  // Remove individual filter
  const handleRemoveFilter = (filterKey) => {
    // Set flag to prevent useEffect from making another API call
    isClearingFilters.current = true;

    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];

    // Reset UI state
    switch (filterKey) {
      case "purpose":
        setActiveTab("");
        break;
      case "location":
      case "city":
      case "emirate":
        setLocation("");
        break;
      case "beds":
        setBedCount(0);
        break;
      case "baths":
        setBathCount(0);
        break;
      case "propertyType":
        setSelectedPropertyType("");
        break;
      case "minPrice":
        setMinPrice("");
        break;
      case "maxPrice":
        setMaxPrice("");
        break;
    }

    setAppliedFilters(newFilters);
    updateUrlParams(newFilters);

    // Directly call API with remaining filters or getListings if no filters remain
    if (Object.keys(newFilters).length === 0) {
      // No filters remain, fetch all listings without any filters
      dispatch(getListings({ page: 1, limit: 20 })).finally(() => {
        // Reset flag after API call completes
        isClearingFilters.current = false;
      });
    } else {
      // Some filters remain, use searchListings
      dispatch(searchListings({ ...newFilters, page: 1, limit: 20 })).finally(
        () => {
          // Reset flag after API call completes
          isClearingFilters.current = false;
        }
      );
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    // Set flag to prevent useEffect from making another API call
    isClearingFilters.current = true;

    // Clear all UI states
    setAppliedFilters({});
    setActiveTab("");
    setLocation("");
    setBedCount(0);
    setBathCount(0);
    setSelectedPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setActiveSort("");
    setActivePropertyTab("Residential");

    // Close any open dropdowns/modals
    setShowMobileFilters(false);
    setShowPropertyDropdown(false);

    // Clear location input field
    if (locationInputRef.current) {
      locationInputRef.current.value = "";
    }

    // Keep only essential params like category if needed
    const params = new URLSearchParams();
    const category = searchParams.get("category");
    if (category) {
      params.set("category", category);
    }
    // Note: We explicitly do NOT keep query, search, or any other filter parameters

    setSearchParams(params);

    // Directly call getListings API to fetch all listings without any filters
    // Using getListings instead of searchListings to avoid any filter parameters
    dispatch(getListings({ page: 1, limit: 20 })).finally(() => {
      // Reset flag after API call completes
      isClearingFilters.current = false;
    });
  };

  // Filter change handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSortChange = (sort) => {
    setActiveSort(sort);
    const newFilters = { ...appliedFilters, sort };
    setAppliedFilters(newFilters);
    updateUrlParams(newFilters);
    // Note: We don't call debouncedSearch here because updateUrlParams will trigger
    // the useEffect which will handle the API call to avoid duplicate calls
  };

  // Pagination
  const handlePageChange = (page) => {
    const newFilters = { ...appliedFilters, page: page.toString() };
    setAppliedFilters(newFilters);
    updateUrlParams(newFilters);
    // Note: We don't call dispatch here because updateUrlParams will trigger
    // the useEffect which will handle the API call to avoid duplicate calls
  };

  // Utility functions
  const incrementBed = () => {
    setBedCount((prev) => Math.min(prev + 1, 10));
  };

  const decrementBed = () => {
    setBedCount((prev) => Math.max(prev - 1, 0));
  };

  const incrementBath = () => {
    setBathCount((prev) => Math.min(prev + 1, 10));
  };

  const decrementBath = () => {
    setBathCount((prev) => Math.max(prev - 1, 0));
  };

  const toggleMobileFilters = () => setShowMobileFilters(!showMobileFilters);
  const togglePropertyDropdown = () =>
    setShowPropertyDropdown(!showPropertyDropdown);
  const closePropertyDropdown = () => setShowPropertyDropdown(false);
  const focusLocationInput = () => locationInputRef.current?.focus();

  const handlePropertyTabChange = (tab) => setActivePropertyTab(tab);

  const resetAllFilters = () => {
    handleClearAllFilters();
    setShowMobileFilters(false);
  };

  // Favorites handlers
  const handleToggleFavorite = async (itemId) => {
    if (isProcessingFavorite)
      return Promise.reject(new Error("Already processing"));

    try {
      setIsProcessingFavorite(true);
      const result = await dispatch(toggleFavorite(itemId)).unwrap();
      return result; // Return the result for AdCard to use
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error; // Re-throw for AdCard to handle
    } finally {
      setIsProcessingFavorite(false);
    }
  };

  // Load favorites on component mount
  useEffect(() => {
    if (!favorites?.data?.length) {
      dispatch(getFavorites());
    }
  }, [dispatch, favorites?.data?.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Applied Filters */}
        <AppliedFilters
          filters={appliedFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={toggleMobileFilters}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-5 h-5" />
            Filters
            {Object.keys(appliedFilters).length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {Object.keys(appliedFilters).length}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Filters */}
        <DesktopFilters
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          location={location}
          setLocation={setLocation}
          locationInputRef={locationInputRef}
          bedCount={bedCount}
          bathCount={bathCount}
          decrementBed={decrementBed}
          incrementBed={incrementBed}
          decrementBath={decrementBath}
          incrementBath={incrementBath}
          showPropertyDropdown={showPropertyDropdown}
          togglePropertyDropdown={togglePropertyDropdown}
          selectedPropertyType={selectedPropertyType}
          setSelectedPropertyType={setSelectedPropertyType}
          setShowPropertyDropdown={setShowPropertyDropdown}
          activePropertyTab={activePropertyTab}
          handlePropertyTabChange={handlePropertyTabChange}
          closePropertyDropdown={closePropertyDropdown}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          focusLocationInput={focusLocationInput}
        />

        {/* Mobile Filters Modal */}
        <MobileFilterPanel
          showMobileFilters={showMobileFilters}
          filterModalRef={filterModalRef}
          toggleMobileFilters={toggleMobileFilters}
          resetAllFilters={resetAllFilters}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          bedCount={bedCount}
          decrementBed={decrementBed}
          incrementBed={incrementBed}
          bathCount={bathCount}
          decrementBath={decrementBath}
          incrementBath={incrementBath}
          location={location}
          setLocation={setLocation}
          locationInputRef={locationInputRef}
          activePropertyTab={activePropertyTab}
          handlePropertyTabChange={handlePropertyTabChange}
          selectedPropertyType={selectedPropertyType}
          setSelectedPropertyType={setSelectedPropertyType}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />

        {/* Sorting Section */}
        <SortingSection
          pageTitle={pageTitle}
          activeSort={activeSort}
          handleSortChange={handleSortChange}
        />

        {/* Results Summary */}
        {!loading && listings && (
          <div className="mb-6 text-sm text-gray-600">
            {totalCount > 0 ? (
              <span>
                Showing {listings.length} of {totalCount} results
                {appliedFilters.query && (
                  <span className="ml-1">
                    for "<strong>{appliedFilters.query}</strong>"
                  </span>
                )}
              </span>
            ) : (
              <span>No results found</span>
            )}
          </div>
        )}

        {/* Property Grid */}
        <PropertyGrid
          propertyListings={listings || []}
          loading={loading}
          error={error}
          hasActiveFilters={Object.keys(appliedFilters).length > 0}
          favoriteItems={favoriteItems}
          onToggleFavorite={handleToggleFavorite}
          isProcessingFavorite={isProcessingFavorite}
          onClearFilters={handleClearAllFilters}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage || 1}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryListingPage;
