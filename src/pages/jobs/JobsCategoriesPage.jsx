import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { JobCard } from "../../components/jobs";
import {
  FaBriefcase,
  FaGraduationCap,
  FaLaptop,
  FaBullhorn,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";
import { jobsFilterOptions } from "../../data/jobsFilterData";
import {
  getJobListings,
  selectJobListings,
  selectJobListingsLoading,
  selectListingsError,
} from "../../features/listings/listingsSlice";

const JobsCategoriesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux selectors
  const jobsFromAPI = useSelector(selectJobListings);
  const loadingJobs = useSelector(selectJobListingsLoading);
  const error = useSelector(selectListingsError);

  // State for dropdowns
  const [cityDropdown, setCityDropdown] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [remoteJobDropdown, setRemoteJobDropdown] = useState(false);
  const [employmentTypeDropdown, setEmploymentTypeDropdown] = useState(false);
  const [adsPostDropdown, setAdsPostDropdown] = useState(false);

  // Selected values state
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRemoteJob, setSelectedRemoteJob] = useState("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");
  const [selectedAdsPost, setSelectedAdsPost] = useState("all");
  const [selectedEducation, setSelectedEducation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedSalary, setSelectedSalary] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  // Additional dropdown states
  const [educationDropdown, setEducationDropdown] = useState(false);
  const [experienceDropdown, setExperienceDropdown] = useState(false);
  const [salaryDropdown, setSalaryDropdown] = useState(false);
  const [industryDropdown, setIndustryDropdown] = useState(false);

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Items per page

  // Initial load - call API with category if available
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const apiParams = { limit: 100 };

    // If category is provided in URL, pass it to backend for filtering
    if (categoryParam) {
      apiParams.categoryId = categoryParam;
    }

    dispatch(getJobListings(apiParams));
  }, [dispatch, searchParams]);

  // Handle URL parameters for category, qualification, job type, search, experience, location, employment type, and additional params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const qualificationParam = searchParams.get("qualification");
    const jobTypeParam = searchParams.get("jobtype");
    const searchParam = searchParams.get("search") || searchParams.get("query");
    const experienceParam = searchParams.get("experience");
    const locationParam =
      searchParams.get("location") || searchParams.get("city");
    const employmentTypeParam =
      searchParams.get("employmenttype") ||
      searchParams.get("type") ||
      searchParams.get("filter");
    const purposeParam = searchParams.get("purpose");
    const industryParam = searchParams.get("industry");
    const salaryParam = searchParams.get("salary");

    if (categoryParam) {
      setCategorySearch(categoryParam);
    }

    if (qualificationParam) {
      // Set the education filter based on URL parameter
      console.log("Qualification parameter found in URL:", qualificationParam);
      // Map qualification slugs to education values
      const qualificationMap = {
        "high-school-secondary": "high-school",
        "high-school": "high-school",
        diploma: "diploma",
        "bachelors-degree": "bachelors",
        bachelors: "bachelors",
        "masters-degree": "masters",
        masters: "masters",
        phd: "phd",
        // Add more mappings as needed
      };
      const mappedQualification = qualificationMap[qualificationParam] || "all";
      setSelectedEducation(mappedQualification);
    }

    if (jobTypeParam) {
      // Set the education filter based on job type parameter (same mapping)
      console.log("Job type parameter found in URL:", jobTypeParam);
      const jobTypeMap = {
        "high-school-secondary": "high-school",
        "high-school": "high-school",
        diploma: "diploma",
        "bachelors-degree": "bachelors",
        bachelors: "bachelors",
        "masters-degree": "masters",
        masters: "masters",
        phd: "phd",
        // Add more mappings as needed
      };
      const mappedJobType = jobTypeMap[jobTypeParam] || "all";
      setSelectedEducation(mappedJobType);
    }

    if (experienceParam) {
      // Set the experience filter based on URL parameter
      console.log("Experience parameter found in URL:", experienceParam);
      // Map experience slugs to experience values
      const experienceMap = {
        "no-experience": "0",
        "0-years": "0",
        "1-2-years": "1-2",
        "3-5-years": "3-5",
        "5-10-years": "5-10",
        "10-plus-years": "10+",
        "10-years": "10+",
        entry: "0",
        junior: "1-2",
        mid: "3-5",
        senior: "5-10",
        lead: "10+",
        // Add more mappings as needed
      };
      const mappedExperience =
        experienceMap[experienceParam] || experienceParam;
      if (mappedExperience && mappedExperience !== "all") {
        setSelectedExperience(mappedExperience);
      }
    }

    if (locationParam) {
      // Set the city filter based on URL parameter
      console.log("Location parameter found in URL:", locationParam);
      // Map location slugs to city values
      const locationMap = {
        "abu-dhabi": "abu-dhabi",
        dubai: "dubai",
        sharjah: "sharjah",
        ajman: "ajman",
        "ras-al-khaimah": "ras-al-khaimah",
        fujairah: "fujairah",
        "umm-al-quwain": "umm-al-quwain",
        // Add more city mappings as needed
      };
      const mappedLocation = locationMap[locationParam] || locationParam;
      if (mappedLocation && mappedLocation !== "all") {
        setSelectedCity(mappedLocation);
      }
    }

    if (employmentTypeParam) {
      // Set the employment type filter based on URL parameter
      console.log(
        "Employment type parameter found in URL:",
        employmentTypeParam
      );
      // Map employment type slugs to employment type values
      const employmentTypeMap = {
        "full-time": "full-time",
        "part-time": "part-time",
        contract: "contract",
        freelance: "freelance",
        internship: "internship",
        temporary: "temporary",
        // Add more mappings as needed
      };
      const mappedEmploymentType =
        employmentTypeMap[employmentTypeParam] || employmentTypeParam;
      if (mappedEmploymentType && mappedEmploymentType !== "all") {
        setSelectedEmploymentType(mappedEmploymentType);
      }
    }

    if (searchParam) {
      // Set the search term based on URL parameter
      console.log("Search parameter found in URL:", searchParam);
      setSearchTerm(decodeURIComponent(searchParam));
    }

    // Handle purpose parameter (for job finding vs other purposes)
    if (purposeParam) {
      console.log("Purpose parameter found in URL:", purposeParam);
      // If purpose is "find jobs" or similar, we can use this for filtering or analytics
      // For now, we'll log it and could add additional logic if needed
    }

    // Handle industry parameter (separate from category)
    if (industryParam) {
      console.log("Industry parameter found in URL:", industryParam);
      // Map industry parameter to industry filter state
      const industryMap = {
        technology: "technology",
        tech: "technology",
        healthcare: "healthcare",
        finance: "finance",
        education: "education",
        retail: "retail",
        construction: "construction",
        hospitality: "hospitality",
        marketing: "marketing",
        sales: "sales",
        automotive: "automotive",
        manufacturing: "manufacturing",
        // Add more industry mappings as needed
      };
      const mappedIndustry =
        industryMap[industryParam.toLowerCase()] || industryParam;
      setSelectedIndustry(mappedIndustry);
    }

    // Handle salary parameter
    if (salaryParam) {
      console.log("Salary parameter found in URL:", salaryParam);
      // Map salary ranges to standardized values
      const salaryMap = {
        "under-2k": "under-2k",
        "2k-3k": "2k-3k",
        "3k-5k": "3k-5k",
        "5k-8k": "5k-8k",
        "8k-12k": "8k-12k",
        "12k-plus": "12k-plus",
        "above-12k": "12k-plus",
        // Add more salary mappings as needed
      };
      const mappedSalary = salaryMap[salaryParam.toLowerCase()] || salaryParam;
      setSelectedSalary(mappedSalary);
    }
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    selectedCity,
    selectedEducation,
    selectedExperience,
    selectedEmploymentType,
    selectedRemoteJob,
    selectedSalary,
    selectedIndustry,
    categorySearch,
    roleSearch,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCity("all");
    setSelectedRemoteJob("all");
    setSelectedEmploymentType("all");
    setSelectedAdsPost("all");
    setSelectedEducation("all");
    setSelectedExperience("all");
    setSelectedSalary("all");
    setSelectedIndustry("all");
    setSearchTerm("");
    setCategorySearch("");
    setRoleSearch("");
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalFilteredPages) {
      setPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle retry - reload data from API with current category
  const handleRetry = () => {
    const categoryParam = searchParams.get("category");
    const apiParams = { limit: 100 };

    // If category is provided in URL, pass it to backend for filtering
    if (categoryParam) {
      apiParams.categoryId = categoryParam;
    }

    dispatch(getJobListings(apiParams));
  };

  // Local filtering function - filter Redux state data
  const getFilteredJobs = () => {
    if (!jobsFromAPI || jobsFromAPI.length === 0) {
      return [];
    }

    let filteredJobs = [...jobsFromAPI];

    // Filter by search term (title search)
    if (searchTerm.trim()) {
      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const title = values.title || values["job title"] || "";
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filter by role search
    if (roleSearch.trim()) {
      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const title = values.title || values["job title"] || "";
        return title.toLowerCase().includes(roleSearch.toLowerCase());
      });
    }

    // Filter by city
    if (selectedCity !== "all") {
      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const location =
          typeof values.location === "object"
            ? values.location.address
            : values.location || "";
        return location.toLowerCase().includes(selectedCity.toLowerCase());
      });
    }

    // Filter by education
    if (selectedEducation !== "all") {
      const educationMap = {
        "high-school": "high school",
        diploma: "diploma",
        bachelors: "bachelor",
        masters: "master",
        phd: "phd",
      };
      const educationFilter =
        educationMap[selectedEducation] || selectedEducation;

      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const education = values.education || "";
        return education.toLowerCase().includes(educationFilter.toLowerCase());
      });
    }

    // Filter by experience
    if (selectedExperience !== "all") {
      const experienceMap = {
        0: "no experience",
        "1-2": "1-2",
        "3-5": "3-5",
        "5-10": "5-10",
        "10+": "10+",
      };
      const experienceFilter =
        experienceMap[selectedExperience] || selectedExperience;

      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const experience = values.experience || "";
        return experience
          .toLowerCase()
          .includes(experienceFilter.toLowerCase());
      });
    }

    // Filter by employment type
    if (selectedEmploymentType !== "all") {
      const timeMap = {
        "full-time": "full time",
        "part-time": "part time",
        contract: "contract",
        freelance: "freelance",
      };
      const timeFilter =
        timeMap[selectedEmploymentType] || selectedEmploymentType;

      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const time = values.time || values["job type"] || "";
        return time.toLowerCase().includes(timeFilter.toLowerCase());
      });
    }

    // Filter by salary
    if (selectedSalary !== "all") {
      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const salary = values.salary || "";

        // Extract numeric salary for comparison
        const salaryNumber = parseInt(salary.replace(/[^\d]/g, "")) || 0;

        switch (selectedSalary) {
          case "under-2k":
            return salaryNumber < 2000;
          case "2k-3k":
            return salaryNumber >= 2000 && salaryNumber < 3000;
          case "3k-5k":
            return salaryNumber >= 3000 && salaryNumber < 5000;
          case "5k-8k":
            return salaryNumber >= 5000 && salaryNumber < 8000;
          case "8k-12k":
            return salaryNumber >= 8000 && salaryNumber < 12000;
          case "12k-plus":
            return salaryNumber >= 12000;
          default:
            return true;
        }
      });
    }

    // Filter by industry
    if (selectedIndustry !== "all") {
      filteredJobs = filteredJobs.filter((job) => {
        const values = job.values || {};
        const jobTitle = values.title || values["job title"] || "";
        const jobDescription = values.description || "";
        const company = values["company name"] || values.company || "";

        // Search for industry keywords in title, description, or company
        const searchableText =
          `${jobTitle} ${jobDescription} ${company}`.toLowerCase();
        return searchableText.includes(selectedIndustry.toLowerCase());
      });
    }

    // Note: Category filtering is now handled on the backend
    // The categorySearch is kept for local search within already filtered results
    // Only apply local category search if no category parameter in URL
    const categoryParam = searchParams.get("category");
    if (categorySearch.trim() && !categoryParam) {
      filteredJobs = filteredJobs.filter((job) => {
        const categoryName = job.categoryId?.name || "";
        const categorySlug = categoryName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const searchTerm = categorySearch.toLowerCase().trim();

        // Match by category name or slug (for URL parameters)
        return (
          categoryName.toLowerCase().includes(searchTerm) ||
          categorySlug.includes(searchTerm) ||
          searchTerm.includes(categoryName.toLowerCase()) ||
          searchTerm.includes(categorySlug)
        );
      });
    }

    return filteredJobs;
  };

  // Get filtered jobs and apply pagination
  const filteredJobs = getFilteredJobs();
  const totalFilteredJobs = filteredJobs.length;
  const totalFilteredPages = Math.ceil(totalFilteredJobs / limit);

  // Reset page if current page exceeds total pages
  if (page > totalFilteredPages && totalFilteredPages > 0) {
    setPage(1);
  }

  // Apply pagination to filtered jobs
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Transform API data to match the expected format for JobCard
  const transformJobData = (apiJob) => {
    const values = apiJob.values || {};
    return {
      id: apiJob._id,
      title: values.title || values["job title"] || "Job Title Not Available",
      company:
        values["company name"] || values.company || "Company Not Specified",
      location:
        typeof values.location === "object"
          ? values.location.address
          : values.location || "Location not specified",
      salary: values.salary || "Salary not disclosed",
      time: values.time || values["job type"] || "Not specified",
      experience: values.experience || "Not specified",
      postedTime: apiJob.createdAt
        ? new Date(apiJob.createdAt).toLocaleDateString()
        : "Recently",
      type: values["employment type"] || values.time || "Full-time",
      gender: values.gender || "Not specified",
      img: values.files
        ? values.files.url || values.files.public_id
        : undefined, // Don't pass "No Image Available" string
      education: values.education || "Not specified",
      benefits: values.benefits || "Not specified",
      language: values.language || "Not specified",
      nationality: values.nationality || "Not specified",
      description: values.description || "No description available",
    };
  };

  // Use locally filtered and paginated data
  console.log("Filtered jobs:", filteredJobs.length);
  console.log("Paginated jobs:", paginatedJobs.length);
  const displayJobs =
    paginatedJobs.length > 0 ? paginatedJobs.map(transformJobData) : [];
  console.log("Display jobs:", displayJobs.length);
  // Dropdown options data
  const dropdownOptions = jobsFilterOptions;

  // Generic dropdown render function
  const renderDropdown = (
    isOpen,
    options,
    onToggle,
    selectedValue,
    onSelect
  ) => {
    if (!isOpen) return null;

    return (
      <div className="mt-3 space-y-1 ml-4">
        {options.map((option) => (
          <div
            key={option.value}
            className={`py-3 px-4 mx-1 rounded-lg cursor-pointer transition-colors  ${
              selectedValue === option.value
                ? "bg-[#E6EEFA] text-gray-700 font-medium"
                : "bg-gray-100 hover:bg-[#E6EEFA] text-gray-700"
            }`}
            onClick={() => {
              onSelect(option.value);
              onToggle(false);
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    );
  };

  // Helper function to get selected label
  const getSelectedLabel = (options, selectedValue) => {
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    return selectedOption ? selectedOption.label : options[0].label;
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50">
      {/* Mobile Filter Button */}
      <div className="lg:hidden bg-white p-4 border-b border-gray-200">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </button>
      </div>

      {/* Left Filter Section */}
      <div
        className={`
        ${mobileFiltersOpen ? "block" : "hidden"} lg:block
        w-full lg:w-80 bg-white lg:mt-4 p-4 lg:p-6 
        lg:border-r lg:border-t border-gray-400 shadow-sm lg:rounded-tr-2xl
        ${mobileFiltersOpen ? "fixed inset-0 z-50 overflow-y-auto" : ""}
      `}
      >
        {/* Mobile Close Button */}
        {mobileFiltersOpen && (
          <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        {/* Job Filters Header */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Job Filters</h2>
        </div>
        {/* City Filter */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => setCityDropdown(!cityDropdown)}
          >
            <div className="flex items-center gap-3">
              <MdLocationCity className="text-blue-400 text-xl" />
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(dropdownOptions.city, selectedCity)}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-blue-400 transition-transform ${
                cityDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {renderDropdown(
            cityDropdown,
            dropdownOptions.city,
            setCityDropdown,
            selectedCity,
            setSelectedCity
          )}
        </div>
        {/* Education */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setEducationDropdown(!educationDropdown)}
          >
            <div className="flex items-center gap-3">
              <FaGraduationCap className="text-gray-600 text-xl" />
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(dropdownOptions.education, selectedEducation)}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                educationDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            educationDropdown,
            dropdownOptions.education,
            setEducationDropdown,
            selectedEducation,
            setSelectedEducation
          )}
        </div>
        {/* Experience */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setExperienceDropdown(!experienceDropdown)}
          >
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-gray-600 text-xl" />
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(
                  dropdownOptions.experience,
                  selectedExperience
                )}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                experienceDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            experienceDropdown,
            dropdownOptions.experience,
            setExperienceDropdown,
            selectedExperience,
            setSelectedExperience
          )}
        </div>
        {/* Salary */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setSalaryDropdown(!salaryDropdown)}
          >
            <div className="flex items-center gap-3">
              <svg
                className="text-gray-600 text-xl w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(dropdownOptions.salary, selectedSalary)}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                salaryDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            salaryDropdown,
            dropdownOptions.salary,
            setSalaryDropdown,
            selectedSalary,
            setSelectedSalary
          )}
        </div>
        {/* Industry */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setIndustryDropdown(!industryDropdown)}
          >
            <div className="flex items-center gap-3">
              <svg
                className="text-gray-600 text-xl w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zm7-13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V2zm2 2v1h1V4h-1zm-4 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H9a1 1 0 01-1-1V8zm2 2v1h1v-1h-1zm2-2a1 1 0 011-1h3a1 1 0 011 1v7a1 1 0 01-1 1h-3a1 1 0 01-1-1V8zm2 2v3h1v-3h-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(dropdownOptions.industry, selectedIndustry)}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                industryDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            industryDropdown,
            dropdownOptions.industry,
            setIndustryDropdown,
            selectedIndustry,
            setSelectedIndustry
          )}
        </div>
        {/* Remote Job */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setRemoteJobDropdown(!remoteJobDropdown)}
          >
            <div className="flex items-center gap-3">
              <FaLaptop className="text-gray-600 text-xl" />
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(dropdownOptions.remoteJob, selectedRemoteJob)}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                remoteJobDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            remoteJobDropdown,
            dropdownOptions.remoteJob,
            setRemoteJobDropdown,
            selectedRemoteJob,
            setSelectedRemoteJob
          )}
        </div>
        {/* Employment Type */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setEmploymentTypeDropdown(!employmentTypeDropdown)}
          >
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-gray-600 text-xl" />
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(
                  dropdownOptions.employmentType,
                  selectedEmploymentType
                )}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                employmentTypeDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            employmentTypeDropdown,
            dropdownOptions.employmentType,
            setEmploymentTypeDropdown,
            selectedEmploymentType,
            setSelectedEmploymentType
          )}
        </div>
        {/* Ads Post */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setAdsPostDropdown(!adsPostDropdown)}
          >
            <div className="flex items-center gap-3">
              <FaBullhorn className="text-gray-600 text-xl" />
              <span className="font-semibold text-gray-800">
                {getSelectedLabel(dropdownOptions.adsPost, selectedAdsPost)}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-600 transition-transform ${
                adsPostDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {renderDropdown(
            adsPostDropdown,
            dropdownOptions.adsPost,
            setAdsPostDropdown,
            selectedAdsPost,
            setSelectedAdsPost
          )}
        </div>
        {/* Category */}
        <div className="mb-5">
          <p className="text-sm font-semibold mb-3 text-gray-800">Category</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full p-4 pl-12 bg-gray-50 border-1 border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-500 "
            />
            <FaSearch className="h-4 w-4 absolute left-4 top-4.5 text-gray-400" />
          </div>
        </div>
        {/* Role */}
        <div className="mb-8">
          <p className="text-sm font-semibold mb-3 text-gray-800">Role</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full p-4 pl-12 bg-gray-50 border-1 border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-500"
            />
            <FaSearch className="h-4 w-4 absolute left-4 top-4.5 text-gray-400" />
          </div>
        </div>
        {/* Filter Buttons */}
        <div className="flex gap-4">
          <button
            className="flex-1 py-3 text-gray-700 rounded-xl font-semibold bg-[#E5E5E5] hover:bg-[#d6d6d6] transition-colors"
            onClick={() => {
              clearAllFilters();
              mobileFiltersOpen && setMobileFiltersOpen(false);
            }}
          >
            Clear
          </button>
          <button
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition-colors shadow-lg"
            onClick={() => mobileFiltersOpen && setMobileFiltersOpen(false)}
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Right Jobs Section */}
      <div className="flex-1 p-4 lg:p-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 capitalize">
          {(() => {
            // Build dynamic title based on active filters from URL and state
            const titleParts = [];

            // Check for search term
            if (searchParams.get("search") && searchTerm) {
              return `Search Results for "${searchTerm}"`;
            }

            // Check for category
            if (categorySearch) {
              titleParts.push(categorySearch);
            }

            // Check for experience from URL or state
            if (
              searchParams.get("experience") ||
              selectedExperience !== "all"
            ) {
              const experienceLabel = getSelectedLabel(
                dropdownOptions.experience,
                selectedExperience
              );
              if (experienceLabel !== "All Experience") {
                titleParts.push(experienceLabel);
              }
            }

            // Check for location from URL or state
            if (
              searchParams.get("location") ||
              searchParams.get("city") ||
              selectedCity !== "all"
            ) {
              const cityLabel = getSelectedLabel(
                dropdownOptions.city,
                selectedCity
              );
              if (cityLabel !== "All Cities") {
                titleParts.push(`in ${cityLabel}`);
              }
            }

            // Check for employment type from URL or state
            if (
              searchParams.get("employmenttype") ||
              searchParams.get("type") ||
              selectedEmploymentType !== "all"
            ) {
              const typeLabel = getSelectedLabel(
                dropdownOptions.employmentType,
                selectedEmploymentType
              );
              if (typeLabel !== "All Types") {
                titleParts.push(typeLabel);
              }
            }

            // Check for education/qualification from URL or state
            if (
              searchParams.get("qualification") ||
              searchParams.get("jobtype") ||
              selectedEducation !== "all"
            ) {
              const educationLabel = getSelectedLabel(
                dropdownOptions.education,
                selectedEducation
              );
              if (educationLabel !== "All Education") {
                titleParts.push(educationLabel);
              }
            }

            // Check for salary from URL or state
            if (searchParams.get("salary") || selectedSalary !== "all") {
              const salaryLabel = getSelectedLabel(
                dropdownOptions.salary,
                selectedSalary
              );
              if (salaryLabel !== "All Salaries") {
                titleParts.push(salaryLabel);
              }
            }

            // Check for industry from URL or state
            if (searchParams.get("industry") || selectedIndustry !== "all") {
              const industryLabel = getSelectedLabel(
                dropdownOptions.industry,
                selectedIndustry
              );
              if (industryLabel !== "All Industries") {
                titleParts.push(`${industryLabel} Industry`);
              }
            }

            // Build final title
            if (titleParts.length > 0) {
              return `${titleParts.join(" ")} Jobs`;
            }

            return "All Jobs";
          })()}
        </h1>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row mb-4 lg:mb-6 gap-2">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-md transition-colors"
            disabled={loadingJobs}
          >
            {loadingJobs ? "Searching..." : "Search"}
          </button>
          <button
            className="px-5 py-2  bg-[#E5E5E5] hover:bg-[#d6d6d6] transition-colors text-gray-700 rounded-md"
            onClick={clearAllFilters}
            disabled={loadingJobs}
          >
            Clear Filter
          </button>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {loadingJobs ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading jobs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load jobs</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                disabled={loadingJobs}
              >
                {loadingJobs ? "Retrying..." : "Retry"}
              </button>
            </div>
          ) : displayJobs.length > 0 ? (
            displayJobs.map((job) => (
              <JobCard key={job.id} job={job} detailUrlPrefix="/jobs/detail/" />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No jobs found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loadingJobs && filteredJobs.length > 0 && totalFilteredPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className={`p-2 rounded-md ${
                page <= 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronLeft />
            </button>

            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalFilteredPages))].map((_, index) => {
                let pageNumber;
                if (totalFilteredPages <= 5) {
                  pageNumber = index + 1;
                } else if (page <= 3) {
                  pageNumber = index + 1;
                } else if (page >= totalFilteredPages - 2) {
                  pageNumber = totalFilteredPages - 4 + index;
                } else {
                  pageNumber = page - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 rounded-md ${
                      page === pageNumber
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalFilteredPages}
              className={`p-2 rounded-md ${
                page >= totalFilteredPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        )}

        {/* Results Info */}
        {!loadingJobs && totalFilteredJobs > 0 && (
          <div className="text-center mt-4 text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalFilteredJobs)} of {totalFilteredJobs}{" "}
            jobs
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsCategoriesPage;
