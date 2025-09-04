import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaChevronRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import * as assets from "../../assets";
import JobProviderIcon from "../../assets/icons/job-provider.svg";

import {
  getJobListings,
  selectJobListings,
  selectJobListingsLoading,
} from "../../features/listings/listingsSlice";
import { jobsData } from "../../data/jobsData";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to JobsCategoriesPage with search parameter
      navigate(
        `/jobs/categories?search=${encodeURIComponent(searchTerm.trim())}`
      );
    } else {
      // Navigate to JobsCategoriesPage without search parameter
      navigate("/jobs/categories");
    }
  };

  return (
    <div
      className="relative pt-6 md:pt-1 overflow-hidden mx-0  max-h-[65vh]"
      style={{
        backgroundImage: `url(${assets.JobsHeroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8  max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between ">
          <div className="md:w-1/2 lg:w-5/12 z-10 mb-6 md:mb-0 ">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-1 leading-tight">
              Careers Simplified,
            </h1>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 leading-tight">
              Opportunities Amplified
            </h1>

            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search skills, company or titles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-4 px-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaSearch />
              </button>
            </form>
          </div>
          <div className="md:w-1/2 lg:w-6/12 flex justify-center items-center">
            <img
              src={assets.JobsHeroImage}
              alt="Job Search Illustration"
              className="w-full max-w-sm md:max-w-md lg:max-w-lg object-contain z-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Popular Job Card Component - Optimized for API data only
const PopularJobCard = ({ job }) => {
  // Extract values from API data with flexible field handling
  const getFieldValue = (
    possibleFieldNames,
    defaultValue = "Not specified"
  ) => {
    // Try each possible field name in order
    for (const fieldName of possibleFieldNames) {
      if (job.values[fieldName] !== undefined) {
        return job.values[fieldName];
      }
    }
    return defaultValue;
  };

  // Get title - most likely to be "title"
  const title = job.values.title || "Job Title Not Specified";

  // Try different possible field names for company name
  const companyName = getFieldValue(
    ["company name", "company", "employer", "organization"],
    "Company Not Specified"
  );

  // Try different possible field names for job type
  const jobType = getFieldValue([
    "job type",
    "type",
    "time",
    "employment type",
    "position type",
  ]);

  // Get salary - handle various formats
  const salary = getFieldValue(
    ["salary", "compensation", "pay"],
    "Salary not disclosed"
  );

  // Handle location object or string
  let location = "Location not specified";
  if (job.values.location) {
    location =
      typeof job.values.location === "object" && job.values.location.address
        ? job.values.location.address
        : job.values.location.toString();
  } else {
    location = getFieldValue(
      ["address", "work location", "job location"],
      "Location not specified"
    );
  }

  // Get image URL
  const icon = job.values.files?.url || JobProviderIcon;

  return (
    <Link
      to={`/jobs/detail/${job.slug || job.id}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4"
    >
      <div className="flex items-start mb-4">
        <img
          src={icon}
          alt="Job Provider Icon"
          className="w-12 h-12 mr-3 object-contain"
        />
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{companyName}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <img
            src={assets.moneyIcon}
            alt="Money Icon"
            className="w-4 h-4 mr-2"
          />
          <span>{salary}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <img
            src={assets.clockIcon}
            alt="Clock Icon"
            className="w-4 h-4 mr-2"
          />
          <span>{jobType || "Not specified"}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <img
            src={assets.locationIcon}
            alt="Location Icon"
            className="w-4 h-4 mr-2"
          />
          <span>{location}</span>
        </div>
      </div>
    </Link>
  );
};

// Category Card Component - Updated for dynamic API data
const CategoryCard = ({ category, isApiData = false }) => {
  if (isApiData) {
    // Handle API category data
    return (
      <Link
        to={`/jobs/categories?category=${category.slug}`}
        className="relative rounded-4xl overflow-hidden h-80 group shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600"
      >
        {category.icon ? (
          <img
            src={category.icon}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-6xl font-bold opacity-20">
              {category.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
          <h3 className="text-xl font-bold mb-1">{category.name}</h3>
          <p className="text-sm font-medium">{category.count} jobs available</p>
        </div>
      </Link>
    );
  }

  // Handle static data (fallback)
  return (
    <Link
      to={`/jobs/categories?category=${category.slug}`}
      className="relative rounded-4xl overflow-hidden h-80 group shadow-md hover:shadow-lg transition-all duration-300"
    >
      <img
        src={category.image}
        alt={category.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
        <h3 className="text-xl font-bold mb-1">{category.title}</h3>
        <p className="text-sm font-medium">{category.count}</p>
      </div>
    </Link>
  );
};

// Generic Grid Section Component
const GridSection = ({ title, items, paramType = "qualification" }) => (
  <div className="section-container py-16">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader title={title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <QualificationCard key={index} item={item} paramType={paramType} />
        ))}
      </div>
    </div>
  </div>
);

// Updated Qualification/Type Card Component
const QualificationCard = ({ item, paramType = "qualification" }) => (
  <Link
    to={`/jobs/categories?${paramType}=${item.slug}`}
    className="flex items-center p-6 bg-white rounded-xl border border-blue-100 
    hover:border-blue-300 hover:scale-[1.01] hover:shadow-lg 
    transform transition-all duration-300 ease-in-out group"
  >
    <div
      className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0 
    group-hover:bg-blue-50 transition-colors duration-300"
    >
      <img
        src={item.icon}
        alt={item.title}
        className="w-8 h-8 group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors duration-300">
        {item.title}
      </h3>
      <p className="text-gray-500 font-medium group-hover:text-gray-900 transition-colors duration-300">
        {item.count}
      </p>
    </div>
  </Link>
);

// Section Header Component
const SectionHeader = ({ title, viewAllLink, showViewAll = false }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">
      {title}
    </h2>
    {showViewAll && (
      <Link
        to={viewAllLink}
        className="text-blue-600 flex items-center hover:underline font-medium"
      >
        View all categories <FaChevronRight className="ml-1 h-3 w-3" />
      </Link>
    )}
  </div>
);

const JobsMainPage = () => {
  const dispatch = useDispatch();
  const jobListings = useSelector(selectJobListings);
  const isLoading = useSelector(selectJobListingsLoading);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    // Fetch latest job listings with enough to fill the grid nicely
    dispatch(
      getJobListings({
        limit: 50,
        sort: "createdAt",
        order: "desc",
      })
    )
      .unwrap()
      .catch((error) => {
        console.error("Error fetching job listings:", error);
        setError(error?.message || "Failed to load job listings");
      });
  }, [dispatch]);

  // Extract and process categories from job listings
  const processCategories = () => {
    if (!jobListings || jobListings.length === 0) {
      return [];
    }

    // Create a map to count jobs per category
    const categoryMap = new Map();

    jobListings.forEach((job) => {
      if (job.categoryId && job.categoryId.name) {
        const categoryId = job.categoryId._id || job.categoryId.id;
        const categoryName = job.categoryId.name;
        const categoryIcon = job.categoryId.icon?.url;

        if (categoryMap.has(categoryId)) {
          categoryMap.get(categoryId).count += 1;
        } else {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: categoryName,
            icon: categoryIcon,
            count: 1,
            slug: categoryName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          });
        }
      }
    });

    // Convert map to array and sort by job count (descending)
    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 categories
  };

  const dynamicCategories = processCategories();

  return (
    <div className="w-full">
      <HeroSection />

      <div className="">
        {/* Popular Jobs Section */}
        <div className="section-container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <SectionHeader title="Popular Jobs" />
            {jobListings && jobListings.length > 0 && (
              <Link
                to="/jobs/categories"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mt-2 sm:mt-0"
              >
                View all jobs <FaChevronRight className="ml-1 h-3 w-3" />
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading state - show 4 skeleton loaders
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
                  >
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-md mr-3"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
            ) : jobListings && jobListings.length > 0 ? (
              // Show API data
              jobListings.map((job) => (
                <PopularJobCard key={job._id} job={job} />
              ))
            ) : (
              // No jobs found state
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No job listings found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are currently no job listings available. Please check
                  back later or explore our other categories.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Jobs by Categories */}
        <div className="bg-blue-50 py-16">
          <div className="section-container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Jobs by categories"
              viewAllLink="/jobs/categories"
              showViewAll={true}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading
                ? // Loading state for categories
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="relative rounded-4xl overflow-hidden h-80 bg-gray-200 animate-pulse"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-400 via-gray-300 to-transparent flex flex-col justify-end p-5">
                          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                : dynamicCategories && dynamicCategories.length > 0
                ? // Show API categories
                  dynamicCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      isApiData={true}
                    />
                  ))
                : // Fallback to static data
                  jobsData.jobCategories.map((category, index) => (
                    <CategoryCard
                      key={index}
                      category={category}
                      isApiData={false}
                    />
                  ))}
            </div>
          </div>
        </div>

        {/* Jobs By Qualification Section */}
        <GridSection
          title="Jobs By qualification in All UAE"
          items={jobsData.qualificationJobs}
          paramType="qualification"
        />

        {/* Jobs By Type Section */}
        {/* <div className="bg-gray-50">
          <GridSection
            title="Jobs By Type in All UAE"
            items={jobsData.jobTypes}
            paramType="jobtype"
          />
        </div> */}
      </div>
    </div>
  );
};

export default JobsMainPage;
