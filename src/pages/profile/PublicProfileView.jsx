import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPublicProfile } from "../../features/profile/publicProfileSlice";
import { samWilson, add1 } from "../../assets";

const PublicProfileView = () => {
  const [activeTab, setActiveTab] = useState("ads");
  const [selectedAdCategoryFilter, setSelectedAdCategoryFilter] =
    useState("all");
  const [openAdCategoryDropdown, setOpenAdCategoryDropdown] = useState(false);

  const { id: userIdFromParams } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get public profile data from Redux store
  const publicProfile = useSelector((state) => state.publicProfile.data);
  const { loading, error } = useSelector((state) => state.publicProfile);

  // Extract data from public profile
  const ads = useMemo(
    () => publicProfile?.public?.ads || [],
    [publicProfile?.public?.ads]
  );
  const ratings = publicProfile?.public?.ratings || [];
  const jobPosts = publicProfile?.public?.jobPosts || [];

  // Extract unique categories from ads for filtering
  const adCategories = useMemo(() => {
    const categories = ads
      .map((ad) => ad?.categoryId)
      .filter((category) => category && category.name)
      .reduce((unique, category) => {
        if (!unique.find((c) => c._id === category._id)) {
          unique.push(category);
        }
        return unique;
      }, []);
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }, [ads]);

  // Filter ads based on selected category
  const filteredAds = useMemo(() => {
    if (selectedAdCategoryFilter === "all") {
      return ads;
    }
    return ads.filter((ad) => ad?.categoryId?._id === selectedAdCategoryFilter);
  }, [ads, selectedAdCategoryFilter]);

  // Calculate average rating
  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, rating) => sum + (rating.stars || 0), 0) /
          ratings.length
        ).toFixed(1)
      : 0;

  // Get user display data
  const displayUser = publicProfile?.user;
  const displayName = displayUser?.name || "User";
  const displayAvatar = publicProfile?.personal?.avatar || samWilson;
  const displayBio = publicProfile?.personal?.bio || "No bio available";
  const memberSince = publicProfile?.createdAt;

  useEffect(() => {
    let targetUserId = userIdFromParams;

    // If no userId in URL params, check localStorage
    if (!targetUserId) {
      targetUserId = localStorage.getItem("publicProfile");
    }

    // If we have a userId, fetch the profile
    if (targetUserId) {
      dispatch(getPublicProfile(targetUserId));
    } else {
      // If no userId available, show error or redirect
      console.warn("No user ID provided for public profile view");
    }
  }, [dispatch, userIdFromParams]);

  // Handle dropdown close on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openAdCategoryDropdown &&
        !event.target.closest(".ad-category-dropdown")
      ) {
        setOpenAdCategoryDropdown(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (openAdCategoryDropdown) setOpenAdCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [openAdCategoryDropdown]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="animate-pulse space-y-6">
              {/* Profile Header Skeleton */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-6">
                    <div className="h-12 w-16 bg-gray-200 rounded"></div>
                    <div className="h-12 w-16 bg-gray-200 rounded"></div>
                    <div className="h-12 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs Skeleton */}
          <div className="bg-white rounded-xl shadow-sm mt-6 p-6">
            <div className="flex space-x-4 mb-6">
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-xl h-64 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5C3.462 16.333 4.422 18 5.982 18z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to Load Profile
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no profile data
  if (!publicProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-2 lg:px-4 py-3">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4 mb-3 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-300">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = samWilson;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed max-w-2xl">
                {displayBio}
              </p>

              {/* Stats Grid */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="text-center bg-blue-50 rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="font-bold text-lg text-blue-600">
                    {selectedAdCategoryFilter === "all"
                      ? ads.length
                      : filteredAds.length}
                  </div>
                  <div className="text-xs text-gray-600">Ads</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="font-bold text-lg text-green-600">
                    {jobPosts.length}
                  </div>
                  <div className="text-xs text-gray-600">Jobs</div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="font-bold text-lg text-yellow-600">
                    {ratings.length}
                  </div>
                  <div className="text-xs text-gray-600">Reviews</div>
                </div>
                {ratings.length > 0 && (
                  <div className="text-center bg-orange-50 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="flex items-center justify-center gap-1">
                      <div className="font-bold text-lg text-orange-600">
                        {averageRating}
                      </div>
                      <svg
                        className="w-3 h-3 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                )}
                {memberSince && (
                  <div className="text-center bg-purple-50 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="font-bold text-lg text-purple-600">
                      {new Date(memberSince).getFullYear()}
                    </div>
                    <div className="text-xs text-gray-600">Since</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-3 px-6 font-medium text-base transition-colors ${
                activeTab === "ads"
                  ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("ads")}
            >
              Ads (
              {selectedAdCategoryFilter === "all"
                ? ads.length
                : filteredAds.length}
              )
            </button>

            <button
              className={`py-3 px-6 font-medium text-base transition-colors ${
                activeTab === "jobPosts"
                  ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("jobPosts")}
            >
              Job Posts ({jobPosts.length})
            </button>

            <button
              className={`py-3 px-6 font-medium text-base transition-colors ${
                activeTab === "ratings"
                  ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("ratings")}
            >
              Ratings ({ratings.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {activeTab === "ads" && (
            <div className="p-4 lg:p-6">
              {/* Category Filter Dropdown */}
              {adCategories.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Filter by Category
                        </h3>
                        <p className="text-sm text-gray-500">
                          Browse ads by specific categories
                        </p>
                      </div>
                      {selectedAdCategoryFilter !== "all" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Filtered
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative min-w-[250px] ad-category-dropdown">
                        <button
                          onClick={() =>
                            setOpenAdCategoryDropdown(!openAdCategoryDropdown)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm flex items-center justify-between hover:border-gray-400 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            {selectedAdCategoryFilter === "all" ? (
                              <>
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    All Categories
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ads.length} ads
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {adCategories.find(
                                      (cat) =>
                                        cat._id === selectedAdCategoryFilter
                                    )?.name || "Category"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {filteredAds.length} ads
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              openAdCategoryDropdown ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {openAdCategoryDropdown && (
                          <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto">
                            <div className="py-2">
                              <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                                Filter Options
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedAdCategoryFilter("all");
                                  setOpenAdCategoryDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-4 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                  selectedAdCategoryFilter === "all"
                                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    All Categories
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ads.length} total ads
                                  </div>
                                </div>
                                {selectedAdCategoryFilter === "all" && (
                                  <svg
                                    className="w-5 h-5 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </button>

                              {adCategories.map((category) => {
                                const categoryAdCount = ads.filter(
                                  (ad) => ad?.categoryId?._id === category._id
                                ).length;
                                return (
                                  <button
                                    key={category._id}
                                    onClick={() => {
                                      setSelectedAdCategoryFilter(category._id);
                                      setOpenAdCategoryDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-4 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                      selectedAdCategoryFilter === category._id
                                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {category.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {categoryAdCount} ad
                                        {categoryAdCount !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                    {selectedAdCategoryFilter ===
                                      category._id && (
                                      <svg
                                        className="w-5 h-5 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      {selectedAdCategoryFilter !== "all" && (
                        <button
                          onClick={() => setSelectedAdCategoryFilter("all")}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                          title="Clear filter"
                        >
                          <svg
                            className="w-4 h-4"
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
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {filteredAds.map((ad) => {
                    const listingTitle =
                      ad?.values?.get?.("title") ||
                      ad?.values?.title ||
                      "No Title";
                    const listingDescription =
                      ad?.values?.get?.("description") ||
                      ad?.values?.description ||
                      "";
                    const listingPrice =
                      ad?.values?.get?.("price") ||
                      ad?.values?.price ||
                      ad?.values?.fee ||
                      "Price not available";
                    const listingImage =
                      ad?.values?.files?.[0]?.url ||
                      ad?.values?.files?.url ||
                      ad?.values?.picture?.url ||
                      ad?.values?.pictures?.[0]?.url ||
                      add1;

                    return (
                      <div
                        key={ad?._id || ad?.id}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() =>
                          navigate(
                            ad?.vehiclesService
                              ? `/garage/service/${ad.slug}`
                              : `/ad/${ad.slug}`
                          )
                        }
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={listingImage}
                            alt={listingTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = add1;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                              {ad?.categoryId?.name || "General"}
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="text-white text-sm font-semibold bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                              {typeof listingPrice === "number"
                                ? `AED ${listingPrice.toLocaleString()}`
                                : listingPrice}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
                            {listingTitle}
                          </h3>
                          {listingDescription && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                              {listingDescription}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {ad?.createdAt && (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(ad.createdAt).toLocaleDateString()}
                              </span>
                            )}
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                              View Details
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  {selectedAdCategoryFilter === "all" ? (
                    <>
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h.01"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No Ads Available
                      </h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto">
                        This user hasn't posted any ads yet. Check back later
                        for new listings!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                        <svg
                          className="w-12 h-12 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No Ads in This Category
                      </h3>
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-blue-700">
                          {adCategories.find(
                            (cat) => cat._id === selectedAdCategoryFilter
                          )?.name || "Category"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                        This user doesn't have any ads in this category yet. Try
                        browsing other categories.
                      </p>
                      <button
                        onClick={() => setSelectedAdCategoryFilter("all")}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        View All Categories
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "jobPosts" && (
            <div className="p-4 lg:p-6">
              {jobPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {jobPosts.map((jobPost) => {
                    const jobTitle =
                      jobPost?.values?.get?.("title") ||
                      jobPost?.values?.title ||
                      "No Title";
                    const jobDescription =
                      jobPost?.values?.get?.("description") ||
                      jobPost?.values?.description ||
                      "";
                    const jobSalary =
                      jobPost?.values?.get?.("salary") ||
                      jobPost?.values?.salary ||
                      jobPost?.values?.get?.("price") ||
                      jobPost?.values?.price ||
                      "Salary not specified";
                    const jobImage =
                      jobPost?.values?.files?.[0]?.url ||
                      jobPost?.values?.files?.url ||
                      add1;

                    return (
                      <div
                        key={jobPost?._id || jobPost?.id}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-green-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => navigate(`/jobs/detail/${jobPost.slug}`)}
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={jobImage}
                            alt={jobTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = add1;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-green-500/95 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                              Job Opportunity
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="text-white text-sm font-semibold bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                              {typeof jobSalary === "number"
                                ? `AED ${jobSalary.toLocaleString()}`
                                : jobSalary}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors text-sm">
                            {jobTitle}
                          </h3>
                          {jobDescription && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                              {jobDescription}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {jobPost?.createdAt && (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(
                                  jobPost.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
                              Apply Now
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-12 h-12 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Job Posts Available
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    This user hasn't posted any job opportunities yet. Check
                    back later for new openings!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="p-4 lg:p-6">
              {ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating?._id || rating?.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(rating?.reviewer?.name || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {rating?.reviewer?.name || "Anonymous"}
                            </h4>
                            {rating?.createdAt && (
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  rating.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < (rating?.stars || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {rating?.stars || 0}/5
                            </span>
                          </div>

                          {(rating?.fastReplies ||
                            rating?.fairPrice ||
                            rating?.onTime) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {rating?.fastReplies && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Fast Replies
                                </span>
                              )}
                              {rating?.fairPrice && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Fair Price
                                </span>
                              )}
                              {rating?.onTime && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  On Time
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-gray-700 leading-relaxed">
                            {rating?.message || "No comment provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-500">
                    This user hasn't received any reviews yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfileView;
