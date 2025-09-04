import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { JobCard } from "../../components/jobs";
import {
  FaBriefcase,
  FaGraduationCap,
  FaLaptop,
  FaSearch,
} from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";
import { fetchCategoryBySlug } from "../../features/admin/categoriesSlice";
import { useDispatch, useSelector } from "react-redux";
import { jobsFilterOptions } from "../../data/jobsFilterData";
import { fetchListingsByCategorySlug } from "../../features/categoryListing/categoryListingSlice";

const HireTalentDashboard = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { currentCategory: categoryData } = useSelector(
    (state) => state.adminCategories
  );
  const { listings } = useSelector((state) => state.categoryListing);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategoryBySlug({ slug }));
  }, [slug, dispatch]);

  // Load job listings when we're at the deepest level (leaf category)
  useEffect(() => {
    if (categoryData && categoryData.isLeaf) {
      dispatch(fetchListingsByCategorySlug(slug));
    }
  }, [categoryData, slug, dispatch]);

  // Filter states
  const [cityDropdown, setCityDropdown] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [remoteJobDropdown, setRemoteJobDropdown] = useState(false);
  const [employmentTypeDropdown, setEmploymentTypeDropdown] = useState(false);
  const [educationDropdown, setEducationDropdown] = useState(false);
  const [experienceDropdown, setExperienceDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Selected values state
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRemoteJob, setSelectedRemoteJob] = useState("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");
  const [selectedEducation, setSelectedEducation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use filter options from jobsFilterData
  const dropdownOptions = jobsFilterOptions;

  // Client-side filtering function
  const applyFilters = (items) => {
    return items.filter((item) => {
      const values = item;

      // Search term filter - search through all fields dynamically
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();

        // Helper function to get field value by possible field names
        const getFieldValue = (possibleNames) => {
          for (let name of possibleNames) {
            if (values[name]) {
              return typeof values[name] === "object"
                ? values[name].address || JSON.stringify(values[name])
                : String(values[name]);
            }
          }
          return "";
        };

        // Search in title fields
        const titleFields = [
          "title",
          "job title",
          "job_title",
          "position",
          "role",
        ];
        const titleValue = getFieldValue(titleFields).toLowerCase();

        // Search in bio/about fields
        const bioFields = ["bio", "about", "description", "summary"];
        const bioValue = getFieldValue(bioFields).toLowerCase();

        // Search in location fields
        const locationFields = ["location", "city", "address", "place"];
        const locationValue = getFieldValue(locationFields).toLowerCase();

        // Search in skills fields
        const skillsFields = ["skills", "skill", "specialties", "expertise"];
        const skillsValue = getFieldValue(skillsFields).toLowerCase();

        // Search in experience/work history fields
        const experienceFields = [
          "experience",
          "work history",
          "work_history",
          "years of experience",
        ];
        const experienceValue = getFieldValue(experienceFields).toLowerCase();

        // Search in all other string fields as well
        const allFieldsMatch = Object.keys(values).some((key) => {
          const value = values[key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          } else if (typeof value === "object" && value !== null) {
            return JSON.stringify(value).toLowerCase().includes(searchLower);
          }
          return false;
        });

        if (
          !titleValue.includes(searchLower) &&
          !bioValue.includes(searchLower) &&
          !locationValue.includes(searchLower) &&
          !skillsValue.includes(searchLower) &&
          !experienceValue.includes(searchLower) &&
          !allFieldsMatch
        ) {
          return false;
        }
      }

      // City filter - check multiple location field variations
      if (selectedCity !== "all") {
        const locationFields = ["location", "city", "address", "place"];
        const locationValue = locationFields
          .reduce((acc, field) => {
            if (values[field]) {
              const val =
                typeof values[field] === "object"
                  ? values[field].address || JSON.stringify(values[field])
                  : String(values[field]);
              return acc + " " + val;
            }
            return acc;
          }, "")
          .toLowerCase();

        if (!locationValue.includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Education filter - check multiple education field variations
      if (selectedEducation !== "all") {
        const educationFields = [
          "education",
          "degree",
          "qualification",
          "qualifications",
          "education level",
          "education_level",
        ];
        const educationValue = educationFields
          .reduce((acc, field) => {
            if (values[field]) {
              return acc + " " + String(values[field]);
            }
            return acc;
          }, "")
          .toLowerCase();

        if (!educationValue.includes(selectedEducation.toLowerCase())) {
          return false;
        }
      }

      // Experience filter - check multiple experience field variations
      if (selectedExperience !== "all") {
        const experienceFields = [
          "experience",
          "years of experience",
          "years_of_experience",
          "work experience",
          "work_experience",
          "work history",
          "work_history",
          "exp",
        ];
        const experienceValue = experienceFields
          .reduce((acc, field) => {
            if (values[field]) {
              return acc + " " + String(values[field]);
            }
            return acc;
          }, "")
          .toLowerCase();

        if (!experienceValue.includes(selectedExperience.toLowerCase())) {
          return false;
        }
      }

      // Employment type filter - check availability and type field variations
      if (selectedEmploymentType !== "all") {
        const typeFields = [
          "availability",
          "type",
          "employment type",
          "employment_type",
          "job type",
          "job_type",
          "work type",
          "work_type",
          "time",
        ];
        const typeValue = typeFields
          .reduce((acc, field) => {
            if (values[field]) {
              return acc + " " + String(values[field]);
            }
            return acc;
          }, "")
          .toLowerCase();

        if (!typeValue.includes(selectedEmploymentType.toLowerCase())) {
          return false;
        }
      }

      // Remote job filter - check multiple field variations for remote work indicators
      if (selectedRemoteJob !== "all") {
        const locationFields = ["location", "city", "address", "place"];
        const typeFields = [
          "type",
          "employment type",
          "employment_type",
          "job type",
          "job_type",
          "work type",
          "work_type",
          "time",
        ];
        const remoteFields = [
          "remote",
          "remote work",
          "remote_work",
          "work from home",
          "wfh",
        ];

        const allRelevantFields = [
          ...locationFields,
          ...typeFields,
          ...remoteFields,
        ];
        const combinedValue = allRelevantFields
          .reduce((acc, field) => {
            if (values[field]) {
              const val =
                typeof values[field] === "object"
                  ? values[field].address || JSON.stringify(values[field])
                  : String(values[field]);
              return acc + " " + val;
            }
            return acc;
          }, "")
          .toLowerCase();

        if (selectedRemoteJob === "remote") {
          if (
            !combinedValue.includes("remote") &&
            !combinedValue.includes("wfh") &&
            !combinedValue.includes("work from home")
          ) {
            return false;
          }
        } else if (selectedRemoteJob === "on-site") {
          if (
            combinedValue.includes("remote") ||
            combinedValue.includes("wfh") ||
            combinedValue.includes("work from home")
          ) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Pagination function
  const paginateItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getCurrentItems = () => {
    if (!categoryData) {
      return { items: [], type: "loading", totalItems: 0, totalPages: 0 };
    }

    if (categoryData.isLeaf) {
      // Transform listings to match JobCard component format
      const transformedJobs =
        listings?.map((listing) => {
          const values = listing.values || {};

          // Helper function to get field value by checking multiple possible field names
          const getFieldValue = (
            possibleNames,
            defaultValue = "Not specified"
          ) => {
            for (let name of possibleNames) {
              if (values[name]) {
                // Handle different data types
                if (typeof values[name] === "object") {
                  // For location objects
                  if (values[name].address) {
                    return values[name].address;
                  }
                  // For file objects
                  if (values[name].url) {
                    return values[name].url;
                  }
                  return JSON.stringify(values[name]);
                }
                // For array strings like skills
                if (
                  typeof values[name] === "string" &&
                  values[name].startsWith("[")
                ) {
                  try {
                    const parsed = JSON.parse(values[name]);
                    return Array.isArray(parsed)
                      ? parsed.join(", ")
                      : values[name];
                  } catch {
                    return values[name];
                  }
                }
                return String(values[name]);
              }
            }
            return defaultValue;
          };

          // Map based on the actual data structure provided
          const title = getFieldValue(
            ["title", "job title", "job_title", "position", "role"],
            "Title Not Available"
          );

          // For job seekers, we might not need company, but keeping it for compatibility
          const company = getFieldValue(
            [
              "company",
              "company name",
              "company_name",
              "employer",
              "organization",
              "bio", // Using bio as fallback for job seekers
            ],
            values.bio ? values.bio.substring(0, 50) + "..." : "Professional"
          );

          // Location handling
          const location = getFieldValue(
            ["location", "city", "address", "place"],
            "Location not specified"
          );

          // Rate/Salary handling
          const salary = getFieldValue(
            [
              "rate-range",
              "rate_range",
              "salary",
              "pay",
              "wage",
              "compensation",
              "package",
            ],
            "Rate not disclosed"
          );

          // Experience handling
          const experience = getFieldValue(
            [
              "experience",
              "years of experience",
              "years_of_experience",
              "work experience",
              "work_experience",
              "exp",
              "work history",
              "work_history",
            ],
            "Experience not specified"
          );

          // Employment type/availability
          const type = getFieldValue(
            [
              "availability",
              "employment type",
              "employment_type",
              "job type",
              "job_type",
              "work type",
              "work_type",
              "time",
            ],
            "Available"
          );

          // Skills
          const skills = getFieldValue(
            ["skills", "skill", "specialties", "expertise"],
            "Skills not listed"
          );

          // Languages
          const languages = getFieldValue(
            ["languages", "language", "spoken languages"],
            "Not specified"
          );

          // Qualifications/Education
          const education = getFieldValue(
            [
              "qualifications",
              "education",
              "degree",
              "qualification",
              "education level",
              "education_level",
            ],
            "Not specified"
          );

          // Get profile image from resume or other file fields
          const profileImage =
            values.resume?.url ||
            values.profile?.url ||
            values.image?.url ||
            values.photo?.url;

          return {
            id: listing.id || listing._id,
            title,
            company, // Will be hidden in job seeker view anyway
            location,
            salary, // This will show the rate-range
            time: type, // This will show availability
            experience,
            postedTime: listing.createdAt
              ? new Date(listing.createdAt).toLocaleDateString()
              : "Recently",
            type, // Availability
            img: profileImage,

            // Additional fields for detailed view
            skills,
            languages,
            education,
            bio: values.bio || values.about || "No bio available",
            about: values.about || values.bio || "No description available",
            availability: values.availability || "Not specified",
            qualifications: values.qualifications || "Not specified",
            portfolioLink:
              values.portfoliolink || values["portfolio link"] || "",
            socialMediaLink:
              values["social media link"] || values.socialMedia || "",
            references: values.refrences || values.references || "Not provided", // Note: typo in original data
            licenses: values.liscenses || values.licenses || "Not specified", // Note: typo in original data
            workHistory:
              values["work history"] || values.workHistory || "Not provided",

            // Meta fields
            slug: listing.slug,
            storeId: listing.storeId,
            userId: listing.userId,
          };
        }) || [];

      // Apply filters
      const filteredItems = applyFilters(transformedJobs);
      const totalItems = filteredItems.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      // Apply pagination
      const paginatedItems = paginateItems(filteredItems);

      return {
        items: paginatedItems,
        type: "listing",
        totalItems,
        totalPages,
      };
    } else {
      // Show subcategories (children)
      return {
        items: categoryData.childrenData || [],
        type: "category",
        totalItems: categoryData.childrenData?.length || 0,
        totalPages: 1,
      };
    }
  };

  const { items, type, totalItems, totalPages } = getCurrentItems();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCity,
    selectedRemoteJob,
    selectedEmploymentType,
    selectedEducation,
    selectedExperience,
    searchTerm,
  ]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const getTitle = () => {
    if (!categoryData) return "Loading...";
    if (type === "listing") {
      return `Job Seekers in ${categoryData.name}`;
    }
    return categoryData.name || "Browse Categories";
  };

  const clearAllFilters = () => {
    setSelectedCity("all");
    setSelectedRemoteJob("all");
    setSelectedEmploymentType("all");
    setSelectedEducation("all");
    setSelectedExperience("all");
    setSearchTerm("");
    setCurrentPage(1);
    if (mobileFiltersOpen) setMobileFiltersOpen(false);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

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
            className={`py-3 px-4 mx-1 rounded-lg cursor-pointer transition-colors ${
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

  // Helper function to count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCity !== "all") count++;
    if (selectedRemoteJob !== "all") count++;
    if (selectedEmploymentType !== "all") count++;
    if (selectedEducation !== "all") count++;
    if (selectedExperience !== "all") count++;
    if (searchTerm.trim()) count++;
    return count;
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50">
      {type === "listing" ? (
        <>
          {/* Mobile Filter Button */}
          <div className="lg:hidden bg-white p-4 border-b border-gray-200">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-colors relative"
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
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
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

            {/* Profile Setting Header */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Profile Setting
              </h2>
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
                    {getSelectedLabel(
                      dropdownOptions.education,
                      selectedEducation
                    )}
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

            {/* Remote Job */}
            <div className="mb-4">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setRemoteJobDropdown(!remoteJobDropdown)}
              >
                <div className="flex items-center gap-3">
                  <FaLaptop className="text-gray-600 text-xl" />
                  <span className="font-semibold text-gray-800">
                    {getSelectedLabel(
                      dropdownOptions.remoteJob,
                      selectedRemoteJob
                    )}
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
                onClick={() =>
                  setEmploymentTypeDropdown(!employmentTypeDropdown)
                }
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

            {/* Filter Buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 text-gray-700 rounded-xl font-semibold bg-[#E5E5E5] hover:bg-[#d6d6d6] transition-colors"
                onClick={clearAllFilters}
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

          {/* Right Content Section */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeftIcon className="h-5 w-5" onClick={() => navigate(-1)} />
              <span>Back</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">
              {getTitle()}
            </h1>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row mb-4 lg:mb-6 gap-2"
            >
              <input
                type="text"
                placeholder="Search talent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-md transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-5 py-2 bg-[#E5E5E5] hover:bg-[#d6d6d6] transition-colors text-gray-700 rounded-md"
              >
                Clear Filter
              </button>
            </form>

            {/* Active Filters Summary */}
            {type === "listing" && getActiveFiltersCount() > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active filters:
                  </span>
                  {searchTerm.trim() && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCity !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      City:{" "}
                      {getSelectedLabel(dropdownOptions.city, selectedCity)}
                    </span>
                  )}
                  {selectedEducation !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Education:{" "}
                      {getSelectedLabel(
                        dropdownOptions.education,
                        selectedEducation
                      )}
                    </span>
                  )}
                  {selectedExperience !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Experience:{" "}
                      {getSelectedLabel(
                        dropdownOptions.experience,
                        selectedExperience
                      )}
                    </span>
                  )}
                  {selectedEmploymentType !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Type:{" "}
                      {getSelectedLabel(
                        dropdownOptions.employmentType,
                        selectedEmploymentType
                      )}
                    </span>
                  )}
                  {selectedRemoteJob !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Remote:{" "}
                      {getSelectedLabel(
                        dropdownOptions.remoteJob,
                        selectedRemoteJob
                      )}
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {type === "listing" && (
              <div className="mb-4 text-sm text-gray-600">
                Showing{" "}
                {items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} results
              </div>
            )}

            {/* Job Listings */}
            <div className="space-y-4">
              {type === "loading" ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : items.length > 0 ? (
                items.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    detailUrlPrefix="/hire-talent/detail/"
                    isJobSeeker={true}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No jobs found matching your criteria
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {type === "listing" && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
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
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full p-4 lg:p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold mb-8">I'm Hiring</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <button
                key={item._id}
                onClick={() => navigate(`/hire-talent/${item.slug}`)}
                className="bg-white shadow-sm hover:shadow-md p-4 flex items-center justify-between w-full rounded-sm transition-shadow duration-200"
              >
                <span className="text-gray-700 text-base">{item.name}</span>
                <ArrowLeftIcon className="h-5 w-5 text-gray-400 rotate-180" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HireTalentDashboard;
