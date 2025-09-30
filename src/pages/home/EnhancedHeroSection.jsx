import React, { useState } from "react";
import { homePageHeroBg } from "../../assets";
import { HiOutlineLocationMarker, HiOutlineChatAlt2 } from "react-icons/hi";
import { Button, CustomDropdown } from "../../components/common";
import { heroCategories, categoryContent } from "../../data";
import { useNavigate } from "react-router-dom";

const EnhancedHeroSection = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Properties");
  const [activeSearchTab, setActiveSearchTab] = useState("buy");
  const [activeFilter, setActiveFilter] = useState("All");
  const [dropdownValues, setDropdownValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const currentContent = categoryContent[selectedCategory];

    // Check if search/location is required and filled
    if (!search.trim()) {
      errors.search = "Location is required";
    }

    // Check if any filter is selected (not "All")
    if (activeFilter === "All") {
      errors.filter = "Please select a specific filter option";
    }

    // Check required dropdown fields
    currentContent.dropdowns.forEach((dropdown) => {
      if (
        dropdown.required &&
        (!dropdownValues[dropdown.name] ||
          dropdownValues[dropdown.name] === "" ||
          dropdownValues[dropdown.name] === "any")
      ) {
        errors[dropdown.name] = `${dropdown.placeholder} is required`;
      }
    });

    return errors;
  };

  const handleSearchButton = (e) => {
    e.preventDefault();
    setShowValidation(true);

    const errors = validateForm();
    setValidationErrors(errors);

    // If there are validation errors, don't proceed with search
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Build query parameters for filters
    const queryParams = new URLSearchParams();

    // Add search query
    queryParams.set("query", search.trim());

    // Add category
    // queryParams.set("category", selectedCategory);

    // Add search tab (buy/rent etc.)
    queryParams.set("purpose", activeSearchTab);

    // Add active filter
    if (activeFilter !== "All") {
      queryParams.set("filter", activeFilter);
    }

    // Add dropdown values
    Object.entries(dropdownValues).forEach(([key, value]) => {
      if (value && value !== "") {
        queryParams.set(key, value);
      }
    });

    // Navigate based on category
    if (selectedCategory === "Jobs") {
      navigate(`/jobs/categories?${queryParams.toString()}`);
    } else {
      navigate(`/all-listings?${queryParams.toString()}`);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setActiveFilter("All");
    setDropdownValues({});
    setValidationErrors({});
    setShowValidation(false);
  };

  const handleDropdownChange = (name, value) => {
    setDropdownValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation when user makes a selection
    if (showValidation) {
      setShowValidation(false);
      setValidationErrors({});
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Clear validation when user starts typing
    if (showValidation) {
      setShowValidation(false);
      setValidationErrors({});
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // Clear validation when user selects a filter
    if (showValidation) {
      setShowValidation(false);
      setValidationErrors({});
    }
  };

  const currentContent = categoryContent[selectedCategory];

  return (
    <section
      className="w-[98%] mx-auto my-4 text-white py-10 px-4 relative rounded-2xl flex flex-col items-center justify-center gap-5 min-h-[450px]"
      style={{
        backgroundImage: `url(${homePageHeroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>

      {/* Main Centered Content */}
      <div className="relative z-10 text-center w-full max-w-6xl mx-auto">
        {/* Hero Text - Made Smaller */}
        <div className="mb-6">
          <h1 className="section-heading text-white text-center">
            {currentContent.title}
          </h1>
          <p className="text-base md:text-lg font-light opacity-90">
            {currentContent.subtitle}
          </p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-5 shadow-lg w-full max-w-fit mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 pb-1">
            {heroCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-5xl mx-auto">
          {/* Search Tabs (Buy/Rent etc.) */}
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {currentContent.searchTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSearchTab(tab.toLowerCase())}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm ${
                    activeSearchTab === tab.toLowerCase()
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Location Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLocationMarker className="h-4 w-4 text-gray-400" />
              </div>
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Enter location *"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-800 focus:border-primary transition-all duration-300 text-sm"
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearchButton}
              variant="primary"
              size="md"
              className="px-6"
            >
              Search
            </Button>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2 items-center mb-6">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {currentContent.filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all duration-300 text-xs ${
                    activeFilter === filter
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Custom Dropdown Filters */}
            {currentContent.dropdowns.map((dropdown) => (
              <div key={dropdown.name} className="relative">
                <CustomDropdown
                  options={dropdown.options}
                  value={dropdownValues[dropdown.name]}
                  onChange={(value) =>
                    handleDropdownChange(dropdown.name, value)
                  }
                  placeholder={`${dropdown.placeholder}${
                    dropdown.required ? " *" : ""
                  }`}
                  size="sm"
                  className="min-w-[120px]"
                />
              </div>
            ))}
          </div>

          {/* Validation Message */}
          {showValidation && Object.keys(validationErrors).length > 0 && (
            <div className="flex items-center justify-center pt-2 pb-1">
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Please complete all required fields to search
                </span>
              </div>
            </div>
          )}

          {/* AI Suggestion Row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <HiOutlineChatAlt2 className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs">
                Need help finding {selectedCategory.toLowerCase()}? Chat with
                our AI Assistant
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<HiOutlineChatAlt2 className="h-3 w-3" />}
              className="text-xs"
            >
              AI Chat
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;
