import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { samWilson, add1 } from "../../assets";
import useProfile from "../../hooks/useProfile";
import { useDispatch, useSelector } from "react-redux";
import { getPublicProfile } from "../../features/profile/publicProfileSlice";
import { deleteListing } from "../../features/listings/listingsSlice";
import { toast } from "react-toastify";
import {
  updateApplicationStatus,
  getUserApplications,
} from "../../features/applications/applicationsSlice";
import { getOrCreateChat } from "../../features/chats/chatsSlice";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PublicProfilePage = () => {
  const [activeTab, setActiveTab] = useState("ads");
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [selectedAdCategoryFilter, setSelectedAdCategoryFilter] =
    useState("all");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [openJobFilterDropdown, setOpenJobFilterDropdown] = useState(false);
  const [openAdCategoryDropdown, setOpenAdCategoryDropdown] = useState(false);
  const [localStatusUpdates, setLocalStatusUpdates] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteListingData, setDeleteListingData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useProfile(); // Keep for fallback display data
  const { id: userIdFromParams } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get public profile data from Redux store
  const publicProfile = useSelector((state) => state.publicProfile.data);
  const { loading, error } = useSelector((state) => state.publicProfile);

  // Get applications data from Redux store
  const applicationsState = useSelector((state) => state.applications);
  const userApplications = applicationsState.userApplications || [];
  // For received applications, we'll use public profile for now but with enhanced API updates
  const applicationsLoading = applicationsState.loading || false;

  // Extract ads, ratings, jobPosts from public profile
  const ads = useMemo(
    () => publicProfile?.public?.ads || [],
    [publicProfile?.public?.ads]
  );
  const ratings = publicProfile?.public?.ratings || [];
  const jobPosts = useMemo(
    () => publicProfile?.public?.jobPosts || [],
    [publicProfile?.public?.jobPosts]
  );

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

  // Get applications from proper APIs
  const applications = userApplications;
  // For received applications, use public profile data with API enhancement
  const receivedApplications =
    publicProfile?.public?.receivedApplications || [];

  const filteredReceivedApplications =
    selectedJobFilter === "all"
      ? receivedApplications
      : receivedApplications.filter((app) => {
          const jobId = app?.job?._id || app?.jobId;
          return jobId === selectedJobFilter;
        });

  useEffect(() => {
    dispatch(getPublicProfile(userIdFromParams)).then(() => {
      // Clear local status updates when fresh data is loaded
      setLocalStatusUpdates({});
    });
  }, [dispatch, userIdFromParams]);

  // Fetch applications when tab changes
  useEffect(() => {
    if (activeTab === "applications") {
      // Fetch user's own applications using proper API
      dispatch(getUserApplications({ page: 1, limit: 50 }));
    }
    // For received applications, we'll rely on public profile data for now
    // since it already includes the aggregated data we need
  }, [dispatch, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openStatusDropdown && !event.target.closest(".status-dropdown")) {
        setOpenStatusDropdown(null);
      }
      if (
        openJobFilterDropdown &&
        !event.target.closest(".job-filter-dropdown")
      ) {
        setOpenJobFilterDropdown(false);
      }
      if (
        openAdCategoryDropdown &&
        !event.target.closest(".ad-category-dropdown")
      ) {
        setOpenAdCategoryDropdown(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (openStatusDropdown) setOpenStatusDropdown(null);
        if (openJobFilterDropdown) setOpenJobFilterDropdown(false);
        if (openAdCategoryDropdown) setOpenAdCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [openStatusDropdown, openJobFilterDropdown, openAdCategoryDropdown]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDelete = (listingId, listingTitle) => {
    setDeleteListingData({ id: listingId, title: listingTitle });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteListingData) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteListing(deleteListingData.id)).unwrap();
      toast.success("Listing deleted successfully!", {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setShowDeleteConfirm(false);
      setDeleteListingData(null);
    } catch (error) {
      console.error("Failed to delete listing:", error);
      toast.error("Failed to delete listing. Please try again.", {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = (listing) => {
    // Navigate to the CreateAdFormPage in edit mode
    navigate(`/edit-listing/${listing.slug}`, {
      state: {
        listingId: listing._id,
        listing: listing,
      },
    });
  };

  const handleStatusUpdate = (applicationId, status) => {
    // Optimistic update - update local state immediately
    setLocalStatusUpdates((prev) => ({
      ...prev,
      [applicationId]: status,
    }));

    // Dispatch the Redux action
    dispatch(updateApplicationStatus({ applicationId, status }))
      .then(() => {
        // Success - the local state is already updated
        toast.success(`Application status updated to ${status}`);
        // Refresh the data to get the latest from server
        dispatch(getPublicProfile(userIdFromParams));
      })
      .catch((error) => {
        // Error - revert the optimistic update
        setLocalStatusUpdates((prev) => {
          const updated = { ...prev };
          delete updated[applicationId];
          return updated;
        });
        toast.error("Failed to update application status");
        console.error("Error updating status:", error);
      });
  };

  // Helper function to get current status (with local updates)
  const getCurrentStatus = (application) => {
    const applicationId = application?._id || application?.id;
    return (
      localStatusUpdates[applicationId] || application?.status || "pending"
    );
  };

  // Handle chat with applicant - similar to TalentDetailPage
  const handleChatWithApplicant = (application) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const currentUserId = user?.id;

    if (!currentUserId) {
      navigate("/auth/login", {
        state: {
          from: `/profile/${userIdFromParams}`,
          message: "Please log in to chat with the applicant",
        },
      });
      return;
    }

    const applicantId =
      application?.applicant?._id || application?.applicant?.id;

    if (!applicantId) {
      toast.error("Unable to start chat. Applicant information not available.");
      return;
    }

    // Don't allow chatting with self
    if (currentUserId === applicantId) {
      toast.info("This is your own application");
      return;
    }

    // Create chat using job listing if available, otherwise use a generic approach
    const listingId = application?.job?._id || application?.jobId;

    dispatch(
      getOrCreateChat({
        listingId: listingId,
        senderId: currentUserId,
        receiverId: applicantId,
        type: "seeker",
      })
    )
      .unwrap()
      .then((chat) => {
        // Navigate using chat slug instead of ID
        navigate(`/chat/${chat.slug}`);
      })
      .catch((error) => {
        console.error("Failed to create or get chat:", error);
        toast.error("Failed to start chat. Please try again.");
      });
  };

  // Get user display data from public profile or fallback to logged-in user
  const displayUser = publicProfile?.user || user;
  const displayName = displayUser?.name || "User";
  const displayAvatar = publicProfile?.personal?.avatar || samWilson;

  if (loading || (activeTab === "applications" && applicationsLoading)) {
    return (
      <div className="bg-white p-1">
        <div className="py-4 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-1">
        <div className="py-4 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-1">
      <div className="py-4 max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Public Profile</h1>

        {/* User Profile Information */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              src={displayAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = samWilson;
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-gray-500 text-sm">
              {publicProfile?.personal?.bio || "No bio available"}
            </p>
            {publicProfile?.createdAt && (
              <p className="text-gray-500 text-sm">
                joined on{" "}
                {new Date(publicProfile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
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
                activeTab === "applications"
                  ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("applications")}
            >
              My Applications ({applications.length})
            </button>
            <button
              className={`py-3 px-6 font-medium text-base transition-colors ${
                activeTab === "receivedApplications"
                  ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("receivedApplications")}
            >
              Received Applications (
              {selectedJobFilter === "all"
                ? receivedApplications.length
                : filteredReceivedApplications.length}
              )
            </button>
            <button
              className={`py-3 px-6 font-medium text-base transition-colors ${
                activeTab === "rating"
                  ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("rating")}
            >
              Rating ({ratings.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "ads" && (
            <>
              {/* Category Filter Dropdown */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                    <span className="text-sm font-medium text-gray-700">
                      Filter by Category:
                    </span>
                    {selectedAdCategoryFilter !== "all" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Filtered
                      </span>
                    )}
                    {adCategories.length === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        No categories
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative min-w-[280px] ad-category-dropdown">
                      <button
                        onClick={() =>
                          setOpenAdCategoryDropdown(!openAdCategoryDropdown)
                        }
                        disabled={adCategories.length === 0}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm flex items-center justify-between disabled:bg-gray-50 disabled:text-gray-400 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {selectedAdCategoryFilter === "all" ? (
                            <>
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
                              <span>All Categories ({ads.length})</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>
                                {adCategories.find(
                                  (cat) => cat._id === selectedAdCategoryFilter
                                )?.name || "Category"}{" "}
                                ({filteredAds.length})
                              </span>
                            </>
                          )}
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
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
                        <div className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto">
                          <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                              Filter Options
                            </div>
                            <button
                              onClick={() => {
                                setSelectedAdCategoryFilter("all");
                                setOpenAdCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                selectedAdCategoryFilter === "all"
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
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
                              <div>
                                <div className="font-medium">
                                  All Categories
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ads.length} total ads
                                </div>
                              </div>
                              {selectedAdCategoryFilter === "all" && (
                                <svg
                                  className="w-4 h-4 text-blue-500 ml-auto"
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

                            {adCategories.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 italic">
                                No categories available
                              </div>
                            ) : (
                              adCategories.map((category) => {
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
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                      selectedAdCategoryFilter === category._id
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
                                        className="w-4 h-4 text-blue-500"
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
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedAdCategoryFilter !== "all" && (
                      <button
                        onClick={() => setSelectedAdCategoryFilter("all")}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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

              {filteredAds?.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredAds.map((ad) => {
                    // Extract data from API listing structure
                    const listingTitle =
                      ad?.values?.get?.("title") ||
                      ad?.values?.title ||
                      ad?.values?.name ||
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
                      ad?.values?.profile?.url ||
                      "/fallback.jpg";

                    return (
                      <div
                        key={ad?._id || ad?.id}
                        className="rounded-3xl overflow-hidden shadow-elegant hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1 w-full max-w-xs mx-auto"
                      >
                        <div
                          className="h-48 overflow-hidden"
                          onClick={() =>
                            navigate(
                              `${
                                ad?.serviceType === "vehicles"
                                  ? `/garage/service/${ad.slug}`
                                  : ad?.serviceType === "healthcare"
                                  ? `/health-care/doctor/${ad.slug}`
                                  : `/ad/${ad.slug}`
                              }`
                            )
                          }
                        >
                          <img
                            src={listingImage}
                            alt={listingTitle}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                            onError={(e) => {
                              e.target.src = add1; // Use one of your existing assets as fallback
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm mb-1 line-clamp-2">
                            {listingTitle}
                          </h3>
                          {listingDescription && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {listingDescription}
                            </p>
                          )}
                          <div className="text-xs text-gray-600">
                            <p className="font-semibold text-[#42a5f5] mt-2">
                              {typeof listingPrice === "number"
                                ? `AED ${listingPrice.toLocaleString()}`
                                : listingPrice}
                            </p>
                            {ad?.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Posted:{" "}
                                {new Date(ad.createdAt).toLocaleDateString()}
                              </p>
                            )}
                            {ad?.categoryId?.name && (
                              <p className="text-xs text-gray-400 mt-1">
                                Category: {ad.categoryId.name}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => handleUpdate(ad)}
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Update
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(ad._id, ad.values.title)
                              }
                              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  {selectedAdCategoryFilter === "all" ? (
                    <>
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <p className="text-lg font-medium">No ads to display</p>
                      <p className="text-sm">
                        You haven't published any ads yet.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-10 h-10 text-blue-500"
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No Ads in This Category
                        </h3>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-blue-700">
                            {adCategories.find(
                              (cat) => cat._id === selectedAdCategoryFilter
                            )?.name || "Category"}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                          You don't have any ads in this category yet. Try
                          selecting a different category or create a new ad.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setSelectedAdCategoryFilter("all")}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                          View All Categories
                        </button>
                        <button
                          onClick={() => navigate("/create-ad")}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Create New Ad
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "jobPosts" && (
            <>
              {jobPosts?.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {jobPosts.map((jobPost) => {
                    // Extract data from API listing structure
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
                      "/fallback.jpg";

                    return (
                      <div
                        key={jobPost?._id || jobPost?.id}
                        className="rounded-3xl overflow-hidden shadow-elegant hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1 w-full max-w-xs mx-auto"
                      >
                        <div
                          className="h-48 overflow-hidden"
                          onClick={() =>
                            navigate(`/jobs/detail/${jobPost.slug}`)
                          }
                        >
                          <img
                            src={jobImage}
                            alt={jobTitle}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                            onError={(e) => {
                              e.target.src = add1;
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm mb-1 line-clamp-2">
                            {jobTitle}
                          </h3>
                          {jobDescription && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {jobDescription}
                            </p>
                          )}
                          <div className="text-xs text-gray-600">
                            <p className="font-semibold text-[#42a5f5] mt-2">
                              {typeof jobSalary === "number"
                                ? `AED ${jobSalary.toLocaleString()}`
                                : jobSalary}
                            </p>
                            {jobPost?.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Posted:{" "}
                                {new Date(
                                  jobPost.createdAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {jobPost?.categoryId?.name && (
                              <p className="text-xs text-gray-400 mt-1">
                                Category: {jobPost.categoryId.name}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => handleUpdate(jobPost)}
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Update
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(jobPost._id, jobPost.values.title)
                              }
                              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <p className="text-lg font-medium">No job posts to display</p>
                  <p className="text-sm">You haven't posted any jobs yet.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "applications" && (
            <>
              {applications?.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      My Job Applications
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Track your job application status and progress
                    </p>
                  </div> */}

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Job Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applied Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((application, index) => {
                          // Extract data from API response structure
                          const jobTitle =
                            application?.job?.values?.title || "Job Position";
                          const companyName =
                            application?.job?.values?.company ||
                            application?.job?.values?.["company name"] ||
                            "Company";
                          const location =
                            application?.job?.values?.location ||
                            "Location not specified";
                          const appliedDate =
                            application?.appliedAt ||
                            application?.createdAt ||
                            new Date().toISOString();
                          const status = application?.status || "pending";
                          const applicationId = application?._id || index;
                          const jobSlug = application?.job?.slug;
                          const salary = application?.job?.values?.salary;

                          // Status styling
                          const getStatusBadge = (status) => {
                            const statusLower = status.toLowerCase();
                            switch (statusLower) {
                              case "pending":
                                return "bg-yellow-100 text-yellow-800 border-yellow-200";
                              case "reviewed":
                                return "bg-blue-100 text-blue-800 border-blue-200";
                              case "shortlisted":
                                return "bg-purple-100 text-purple-800 border-purple-200";
                              case "hired":
                                return "bg-green-100 text-green-800 border-green-200";
                              case "rejected":
                                return "bg-red-100 text-red-800 border-red-200";
                              default:
                                return "bg-gray-100 text-gray-800 border-gray-200";
                            }
                          };

                          return (
                            <tr
                              key={applicationId}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {jobTitle}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {salary
                                    ? typeof salary === "number"
                                      ? `AED ${salary.toLocaleString()}`
                                      : salary
                                    : "Salary not specified"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {companyName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {typeof location === "object"
                                    ? location.address || "Remote"
                                    : location}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                                    status
                                  )}`}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(appliedDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    if (jobSlug) {
                                      navigate(`/jobs/detail/${jobSlug}`);
                                    } else {
                                      navigate(`/jobs/detail/${applicationId}`);
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  View Job
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    <div className="divide-y divide-gray-200">
                      {applications.map((application, index) => {
                        // Extract data from API response structure
                        const jobTitle =
                          application?.job?.values?.title || "Job Position";
                        const companyName =
                          application?.job?.values?.company ||
                          application?.job?.values?.["company name"] ||
                          "Company";
                        const location =
                          application?.job?.values?.location ||
                          "Location not specified";
                        const appliedDate =
                          application?.appliedAt ||
                          application?.createdAt ||
                          new Date().toISOString();
                        const status = application?.status || "pending";
                        const applicationId = application?._id || index;
                        const jobSlug = application?.job?.slug;

                        const getStatusBadge = (status) => {
                          const statusLower = status.toLowerCase();
                          switch (statusLower) {
                            case "pending":
                              return "bg-yellow-100 text-yellow-800 border-yellow-200";
                            case "reviewed":
                              return "bg-blue-100 text-blue-800 border-blue-200";
                            case "shortlisted":
                              return "bg-purple-100 text-purple-800 border-purple-200";
                            case "hired":
                              return "bg-green-100 text-green-800 border-green-200";
                            case "rejected":
                              return "bg-red-100 text-red-800 border-red-200";
                            default:
                              return "bg-gray-100 text-gray-800 border-gray-200";
                          }
                        };

                        return (
                          <div key={applicationId} className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-medium text-gray-900">
                                {jobTitle}
                              </h4>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                                  status
                                )}`}
                              >
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </span>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h.01"
                                  />
                                </svg>
                                <span>{companyName}</span>
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>
                                  {typeof location === "object"
                                    ? location.address || "Remote"
                                    : location}
                                </span>
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6-4h6"
                                  />
                                </svg>
                                <span>
                                  Applied on{" "}
                                  {new Date(appliedDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (jobSlug) {
                                    navigate(`/jobs/detail/${jobSlug}`);
                                  } else {
                                    navigate(`/jobs/detail/${applicationId}`);
                                  }
                                }}
                                className="flex-1 text-center py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                              >
                                View Job
                              </button>
                              {status === "pending" && (
                                <button
                                  onClick={() => {}}
                                  className="py-2 px-4 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 transition-colors"
                                >
                                  Withdraw
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Applications Yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      You haven't applied to any jobs yet. Start exploring job
                      opportunities!
                    </p>
                    <button
                      onClick={() => navigate("/jobs")}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Browse Jobs
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "receivedApplications" && (
            <>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                    <span className="text-sm font-medium text-gray-700">
                      Filter by Job Post:
                    </span>
                    {selectedJobFilter !== "all" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Filtered
                      </span>
                    )}
                    {jobPosts.length === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        No job posts
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative min-w-[280px] job-filter-dropdown">
                      <button
                        onClick={() =>
                          setOpenJobFilterDropdown(!openJobFilterDropdown)
                        }
                        disabled={jobPosts.length === 0}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm flex items-center justify-between disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <div className="flex items-center gap-2">
                          {selectedJobFilter === "all" ? (
                            <>
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
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h.01"
                                />
                              </svg>
                              <span>
                                All Job Posts ({receivedApplications.length})
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>
                                {(() => {
                                  const selectedJob = jobPosts.find(
                                    (job) => job._id === selectedJobFilter
                                  );
                                  const count = receivedApplications.filter(
                                    (app) => {
                                      const jobId = app?.job?._id || app?.jobId;
                                      return jobId === selectedJobFilter;
                                    }
                                  ).length;
                                  return `${
                                    selectedJob?.values?.title ||
                                    selectedJob?.title ||
                                    "Untitled Job"
                                  } (${count})`;
                                })()}
                              </span>
                            </>
                          )}
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            openJobFilterDropdown ? "rotate-180" : ""
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

                      {openJobFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto">
                          <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                              Filter Options
                            </div>
                            <button
                              onClick={() => {
                                setSelectedJobFilter("all");
                                setOpenJobFilterDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                selectedJobFilter === "all"
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
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
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h.01"
                                />
                              </svg>
                              <div>
                                <div className="font-medium">All Job Posts</div>
                                <div className="text-xs text-gray-500">
                                  {receivedApplications.length} total
                                  applications
                                </div>
                              </div>
                              {selectedJobFilter === "all" && (
                                <svg
                                  className="w-4 h-4 text-blue-500 ml-auto"
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

                            {jobPosts.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 italic">
                                No job posts available
                              </div>
                            ) : (
                              jobPosts.map((job) => {
                                const jobApplicationsCount =
                                  receivedApplications.filter((app) => {
                                    const jobId = app?.job?._id || app?.jobId;
                                    return jobId === job._id;
                                  }).length;
                                const isSelected =
                                  selectedJobFilter === job._id;

                                return (
                                  <button
                                    key={job._id}
                                    onClick={() => {
                                      setSelectedJobFilter(job._id);
                                      setOpenJobFilterDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                      isSelected
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        jobApplicationsCount > 0
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    ></div>
                                    <div className="flex-1">
                                      <div className="font-medium truncate">
                                        {job?.values?.title ||
                                          job?.title ||
                                          "Untitled Job"}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {jobApplicationsCount} application
                                        {jobApplicationsCount !== 1 ? "s" : ""}
                                        {job.createdAt &&
                                          ` • Posted ${new Date(
                                            job.createdAt
                                          ).toLocaleDateString()}`}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <svg
                                        className="w-4 h-4 text-blue-500"
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
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedJobFilter !== "all" && (
                      <button
                        onClick={() => setSelectedJobFilter("all")}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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

              {filteredReceivedApplications?.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Applications Received for My Job Posts
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage applications from candidates who applied to your
                      job posts
                    </p>
                  </div> */}
                  {/* Desktop Grid View for Received Applications */}
                  <div className="hidden md:block">
                    <div className="grid gap-4">
                      {filteredReceivedApplications.map(
                        (application, index) => {
                          const applicantName =
                            application?.applicant?.name ||
                            application?.applicantData?.personalInfo
                              ?.fullName ||
                            "Anonymous";
                          const applicantEmail =
                            application?.applicant?.email ||
                            application?.applicantData?.personalInfo?.email ||
                            "";
                          const applicantPhone =
                            application?.applicant?.phoneNumber ||
                            application?.applicantData?.personalInfo?.phone ||
                            "";
                          const jobTitle =
                            application?.job?.values?.title ||
                            application?.jobTitle ||
                            "Job Position";
                          const appliedDate =
                            application?.appliedAt ||
                            application?.createdAt ||
                            new Date().toISOString();
                          const status = getCurrentStatus(application);
                          const experience =
                            application?.applicantData?.experience || [];
                          const applicationId =
                            application?._id || application?.id || index;

                          // Get years of experience
                          const totalExperience =
                            experience.length > 0
                              ? experience
                                  .reduce((total, exp) => {
                                    if (exp.startDate && exp.endDate) {
                                      const years =
                                        (new Date(exp.endDate) -
                                          new Date(exp.startDate)) /
                                        (1000 * 60 * 60 * 24 * 365);
                                      return total + years;
                                    }
                                    return total;
                                  }, 0)
                                  .toFixed(1)
                              : "0";

                          // Status styling
                          const getStatusBadge = (status) => {
                            const statusLower = status.toLowerCase();
                            switch (statusLower) {
                              case "pending":
                                return "bg-yellow-100 text-yellow-800";
                              case "reviewed":
                                return "bg-blue-100 text-blue-800";
                              case "shortlisted":
                                return "bg-purple-100 text-purple-800";
                              case "hired":
                                return "bg-green-100 text-green-800";
                              case "rejected":
                                return "bg-red-100 text-red-800";
                              default:
                                return "bg-gray-100 text-gray-800";
                            }
                          };

                          return (
                            <div
                              key={applicationId}
                              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                {/* Applicant Info */}
                                <div className="flex items-center space-x-4 flex-1">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                      <svg
                                        className="h-6 w-6 text-gray-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                                      {applicantName}
                                    </h4>
                                    <p className="text-sm text-gray-600 truncate">
                                      {applicantEmail}
                                    </p>
                                    {applicantPhone && (
                                      <p className="text-sm text-gray-500">
                                        {applicantPhone}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <span
                                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(
                                    status
                                  )}`}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </span>
                              </div>

                              {/* Job and Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                    Job Position
                                  </p>
                                  <p className="text-sm text-gray-900 font-medium mt-1">
                                    {jobTitle}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                    Applied Date
                                  </p>
                                  <p className="text-sm text-gray-900 mt-1">
                                    {new Date(appliedDate).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                    Experience
                                  </p>
                                  <p className="text-sm text-gray-900 mt-1">
                                    {totalExperience} years
                                  </p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() =>
                                    handleChatWithApplicant(application)
                                  }
                                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none"
                                >
                                  Message
                                </button>
                                {application?.applicantData?.resume?.url && (
                                  <a
                                    href={application.applicantData.resume.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none text-center"
                                  >
                                    View CV
                                  </a>
                                )}
                                <div className="relative z-20 status-dropdown">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenStatusDropdown(
                                        openStatusDropdown === applicationId
                                          ? null
                                          : applicationId
                                      );
                                    }}
                                    className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none flex items-center gap-2 shadow-sm"
                                  >
                                    {status === "pending"
                                      ? "Update Status"
                                      : `Current: ${
                                          status.charAt(0).toUpperCase() +
                                          status.slice(1)
                                        }`}
                                    <svg
                                      className={`w-4 h-4 transition-transform duration-200 ${
                                        openStatusDropdown === applicationId
                                          ? "rotate-0"
                                          : "rotate-180"
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

                                  {openStatusDropdown === applicationId && (
                                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden h-37 overflow-y-auto">
                                      <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 h-5">
                                          Change Status
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "reviewed"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Reviewed
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Application has been reviewed
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "shortlisted"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Shortlisted
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Candidate is promising
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "hired"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Hired
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Candidate was selected
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "rejected"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Rejected
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Application was declined
                                            </div>
                                          </div>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Mobile Card View for Received Applications */}
                  <div className="md:hidden">
                    <div className="divide-y divide-gray-200">
                      {filteredReceivedApplications.map(
                        (application, index) => {
                          const applicantName =
                            application?.applicant?.name ||
                            application?.applicantData?.personalInfo
                              ?.fullName ||
                            "Anonymous";
                          const applicantEmail =
                            application?.applicant?.email ||
                            application?.applicantData?.personalInfo?.email ||
                            "";
                          const applicantPhone =
                            application?.applicant?.phoneNumber ||
                            application?.applicantData?.personalInfo?.phone ||
                            "";
                          const jobTitle =
                            application?.job?.values?.title ||
                            application?.jobTitle ||
                            "Job Position";
                          const appliedDate =
                            application?.appliedAt ||
                            application?.createdAt ||
                            new Date().toISOString();
                          const status = getCurrentStatus(application);
                          const experience =
                            application?.applicantData?.experience || [];
                          const applicationId =
                            application?._id || application?.id || index;

                          const totalExperience =
                            experience.length > 0
                              ? experience
                                  .reduce((total, exp) => {
                                    if (exp.startDate && exp.endDate) {
                                      const years =
                                        (new Date(exp.endDate) -
                                          new Date(exp.startDate)) /
                                        (1000 * 60 * 60 * 24 * 365);
                                      return total + years;
                                    }
                                    return total;
                                  }, 0)
                                  .toFixed(1)
                              : "0";

                          const getStatusBadge = (status) => {
                            const statusLower = status.toLowerCase();
                            switch (statusLower) {
                              case "pending":
                                return "bg-yellow-100 text-yellow-800 border-yellow-200";
                              case "reviewed":
                                return "bg-blue-100 text-blue-800 border-blue-200";
                              case "shortlisted":
                                return "bg-purple-100 text-purple-800 border-purple-200";
                              case "hired":
                                return "bg-green-100 text-green-800 border-green-200";
                              case "rejected":
                                return "bg-red-100 text-red-800 border-red-200";
                              default:
                                return "bg-gray-100 text-gray-800 border-gray-200";
                            }
                          };

                          return (
                            <div key={applicationId} className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    <svg
                                      className="h-6 w-6 text-gray-500"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900">
                                      {applicantName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {applicantEmail}
                                    </p>
                                    {applicantPhone && (
                                      <p className="text-sm text-gray-600">
                                        {applicantPhone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                                    status
                                  )}`}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </span>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                                    />
                                  </svg>
                                  <span>Applied for: {jobTitle}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6-4h6"
                                    />
                                  </svg>
                                  <span>
                                    Applied on{" "}
                                    {new Date(appliedDate).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  <span>
                                    Experience: {totalExperience} years
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() =>
                                    handleChatWithApplicant(application)
                                  }
                                  className="flex-1 min-w-[100px] text-center py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Message
                                </button>
                                {application?.applicantData?.resume?.url && (
                                  <a
                                    href={application.applicantData.resume.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-w-[100px] text-center py-2 px-4 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                                  >
                                    View CV
                                  </a>
                                )}
                                <div className="relative flex-1 min-w-[100px] z-20 status-dropdown">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenStatusDropdown(
                                        openStatusDropdown === applicationId
                                          ? null
                                          : applicationId
                                      );
                                    }}
                                    className="w-full text-center py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    {status === "pending"
                                      ? "Update Status"
                                      : `Current: ${
                                          status.charAt(0).toUpperCase() +
                                          status.slice(1)
                                        }`}
                                    <svg
                                      className={`w-4 h-4 transition-transform duration-200 ${
                                        openStatusDropdown === applicationId
                                          ? "rotate-0"
                                          : "rotate-180"
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

                                  {openStatusDropdown === applicationId && (
                                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                      <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                          Change Status
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "reviewed"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Reviewed
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Application has been reviewed
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "shortlisted"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Shortlisted
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Candidate is promising
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "hired"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Hired
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Candidate was selected
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(
                                              applicationId,
                                              "rejected"
                                            );
                                            setOpenStatusDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                                        >
                                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium">
                                              Rejected
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Application was declined
                                            </div>
                                          </div>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="text-center">
                    {selectedJobFilter === "all" ? (
                      <>
                        <svg
                          className="mx-auto h-16 w-16 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Applications Received
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          You haven't received any job applications yet. Post
                          more jobs to attract candidates!
                        </p>
                        <button
                          onClick={() => navigate("/post-job")}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Post a Job
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-6">
                          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                              className="w-10 h-10 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Applications Yet
                          </h3>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-blue-700">
                              {(() => {
                                const selectedJob = jobPosts.find(
                                  (job) => job._id === selectedJobFilter
                                );
                                return (
                                  selectedJob?.values?.title ||
                                  selectedJob?.title ||
                                  "Selected Job"
                                );
                              })()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                            This job posting hasn't received any applications
                            yet. Don't worry - great opportunities take time to
                            find the right candidates!
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <svg
                              className="w-8 h-8 text-gray-400 mx-auto mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                              />
                            </svg>
                            <p className="text-xs text-gray-600">
                              Share your job post to reach more candidates
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <svg
                              className="w-8 h-8 text-gray-400 mx-auto mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <p className="text-xs text-gray-600">
                              Consider updating job requirements or description
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                          <button
                            onClick={() => {
                              const selectedJob = jobPosts.find(
                                (job) => job._id === selectedJobFilter
                              );
                              if (selectedJob) {
                                navigate(`/edit-listing/${selectedJob.slug}`, {
                                  state: {
                                    listingId: selectedJob._id,
                                    listing: selectedJob,
                                  },
                                });
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Job Post
                          </button>
                          <button
                            onClick={() => setSelectedJobFilter("all")}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
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
                            View All Applications
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "rating" && (
            <>
              {ratings?.length > 0 ? (
                <div className="space-y-4 max-w-3xl">
                  {ratings.map((rating) => (
                    <div
                      key={rating?._id || rating?.id}
                      className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {/* <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={rating?.buyerImage || "/default-avatar.jpg"}
                            alt={rating?.buyerName || "User"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = samWilson;
                            }}
                          />
                        </div> */}
                        <div>
                          <h3 className="font-medium">
                            {rating?.reviewer.name || "Anonymous"}
                          </h3>
                          <p className="text-sm text-gray-500">Customer</p>
                        </div>
                      </div>

                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">
                            {i < (rating?.stars || 0) ? "★" : "☆"}
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          ({rating?.stars || 0}/5)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {rating?.fastReplies && (
                          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border border-gray-200">
                            Fast Replies
                          </span>
                        )}
                        {rating?.fairPrice && (
                          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border border-gray-200">
                            Fair Price
                          </span>
                        )}
                        {rating?.onTime && (
                          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border border-gray-200">
                            On time
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700">
                        {rating?.message || "No comment provided."}
                      </p>

                      {rating?.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <p className="text-lg font-medium">No ratings yet</p>
                  <p className="text-sm">
                    Buyers haven't left any feedback yet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteListingData(null);
        }}
        onConfirm={confirmDelete}
        type="danger"
        title="Delete Listing"
        message={`Are you sure you want to delete "${
          deleteListingData?.title || "this listing"
        }"? This action cannot be undone and the listing will be permanently removed.`}
        confirmText="Delete Listing"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PublicProfilePage;
