import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Heart, Share2 } from "lucide-react";
import * as assets from "../../assets";
import ApplyJobModal from "../../components/ApplyJobModal";
import {
  getListing,
  selectListingsLoading,
} from "../../features/listings/listingsSlice";
import {
  toggleFavorite,
  getFavorites,
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
} from "../../features/profile/publicProfileSlice";
import useProfile from "../../hooks/useProfile";
import { useApplications } from "../../hooks/useApplications";

const JobDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const { currentListing: jobData } = useSelector((state) => state.listings);
  const isLoading = useSelector(selectListingsLoading);

  // Favorites state
  const favorites = useSelector(selectFavorites);
  const favoritesLoading = useSelector(selectFavoritesLoading);
  const favoritesError = useSelector(selectFavoritesError);
  const authUser = useSelector((state) => state.auth?.user);

  // Use the useProfile hook to get job profile data
  const {
    profileData: jobProfileData,
    jobProfile,
    personal: personalData,
    loading: jobProfileLoading,
    forceRefreshProfile,
  } = useProfile();

  console.log("Job Profile Data............ :", jobProfile);

  // Use the useApplications hook for job application functionality
  const {
    createAutoApplication,
    submitLoading,
    submitSuccess,
    submitError,
    clearAllErrors,
    clearAllSuccess,
  } = useApplications();

  useEffect(() => {
    if (id) {
      // Fetch job listing data
      dispatch(getListing(id))
        .unwrap()
        .catch((error) => {
          console.error("Error fetching job details:", error);
          setError(error?.message || "Failed to load job details");
        });

      // Fetch job profile data for auto-apply functionality using the hook
      forceRefreshProfile().catch((error) => {
        console.error("Error fetching profile data:", error);
      });
    } else {
      navigate("/jobs");
    }
  }, [id, dispatch, navigate, forceRefreshProfile]);

  // Fetch user's favorites on component mount
  useEffect(() => {
    if (authUser?.id || authUser?._id) {
      dispatch(getFavorites());
    }
  }, [dispatch, authUser?.id, authUser?._id]);

  // Check if current job is in favorites
  const isJobFavorite = useMemo(() => {
    if (!jobData?._id || !favorites) return false;
    return favorites.some(
      (fav) =>
        (typeof fav === "string" ? fav : fav._id || fav.toString()) ===
        jobData._id
    );
  }, [favorites, jobData?._id]);

  // Handle application success/error states
  useEffect(() => {
    if (submitSuccess) {
      console.log("Application submitted successfully!");

      // Display success using toast notification
      toast.success(
        "Application submitted successfully! We'll be in touch soon.",
        {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Clear success flag after showing toast
      setTimeout(() => {
        clearAllSuccess();
      }, 3000);
    }
  }, [submitSuccess, clearAllSuccess]);

  useEffect(() => {
    if (submitError) {
      console.error("Application submission error:", submitError);

      // Show user-friendly error message
      let errorMessage = "We couldn't submit your application.";

      // Check for specific error conditions
      if (submitError.includes("already applied")) {
        errorMessage = "You've already applied for this position.";
      } else if (submitError.includes("resume")) {
        errorMessage = "Please add a resume to your profile before applying.";
      } else if (submitError.includes("validation")) {
        errorMessage =
          "Please complete your profile information before applying.";
      }

      // Display error using toast notification
      toast.error(`Application Error: ${errorMessage}`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Clear error after showing toast
      setTimeout(() => {
        clearAllErrors();
      }, 5000);
    }
  }, [submitError, clearAllErrors]);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!jobData?._id) return;

    try {
      await dispatch(toggleFavorite(jobData._id)).unwrap();
      toast.success(
        isJobFavorite ? "Job removed from favorites" : "Job added to favorites",
        {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorites", {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  const handleAutoApply = async () => {
    // Check if we have job profile data and essential profile components
    if (!jobProfileData || !jobProfile) {
      console.error("Missing job profile data");
      toast.warning(
        <div>
          Please complete your profile before applying
          <button
            onClick={() => navigate("/profile/job")}
            className="ml-2 bg-blue-600 text-white px-2 py-1 text-xs rounded"
          >
            Complete Profile
          </button>
        </div>,
        {
          position: "bottom-left",
          autoClose: 5000,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }

    // Validate resume is available (critical for auto-apply)
    if (!jobProfile.resume) {
      console.error("Resume is required for auto-apply");
      toast.warning(
        <div>
          Please add a resume to your profile before applying
          <button
            onClick={() => navigate("/profile/job")}
            className="ml-2 bg-blue-600 text-white px-2 py-1 text-xs rounded"
          >
            Add Resume
          </button>
        </div>,
        {
          position: "bottom-left",
          autoClose: 5000,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }

    try {
      // Prepare application data with job details
      const jobDetails = {
        title: job?.title,
        company: job?.company,
        location: job?.location,
        salary: job?.salary,
        jobType: job?.time,
      };

      console.log("Auto-applying with job profile data:", {
        profileAvailable: !!jobProfileData,
        jobProfileAvailable: !!jobProfile,
        personalDataAvailable: !!personalData,
        resumeAvailable: !!jobProfile.resume,
      });

      // Use the createAutoApplication function from useApplications hook
      const application = await createAutoApplication(id, {
        profileData: jobProfileData,
        jobProfile: jobProfile,
        personalData: personalData?.personal || personalData || {},
        jobDetails: jobDetails,
      });

      console.log("Auto-apply job application successful:", {
        applicationId: application._id,
        jobId: id,
        jobTitle: job?.title,
        company: job?.company,
        status: application.status,
      });

      // Close the modal if open
      setApplyModalOpen(false);

      // Success tracking handled by the useEffect that watches submitSuccess
    } catch (error) {
      console.error("Auto-apply failed:", error);

      // Let the error handling be managed only by the useEffect that watches submitError
      // This prevents duplicate error messages
    }
  };

  // Extract job details from API data
  const extractJobDetails = () => {
    if (!jobData) return null;

    const job = jobData;
    const values = job.values || {};

    return {
      id: job._id,
      title: values.title || "Job Title Not Available",
      company:
        values["company name"] || values.company || "Company Not Specified",
      logo: values.files?.url || assets.companyLogo,
      salary: values.salary || "Salary not disclosed",
      time: values.time || values["job type"] || "Not specified",
      location:
        typeof values.location === "object"
          ? values.location.address
          : values.location || "Location not specified",
      gender: values.gender || "Not specified",
      experience: values.experience || "Not specified",
      education: values.education || "Not specified",
      description: values.description || "No description available",
      // Other fields might be available based on job data
    };
  };

  const job = extractJobDetails();

  // Handle share functionality
  const handleShare = async () => {
    const jobUrl = window.location.href;
    const shareData = {
      title: `${job?.title} at ${job?.company}`,
      text: `Check out this job opportunity: ${job?.title} at ${job?.company}`,
      url: jobUrl,
    };

    try {
      // Check if the Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Job shared successfully!", {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(jobUrl);
        toast.success("Job link copied to clipboard!", {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error sharing job:", error);
      // Additional fallback: try to copy to clipboard even if share failed
      try {
        await navigator.clipboard.writeText(jobUrl);
        toast.success("Job link copied to clipboard!", {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        toast.error("Unable to share job. Please copy the URL manually.", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  // Handle loading and error states
  if (isLoading || submitLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-5xl mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Failed to Load Job Details
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-gray-500 text-5xl mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The job listing you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 ">
      {/* Toast notifications will appear from the ToastContainer in App.jsx */}

      {/* Error Display */}
      {favoritesError && (
        <div className="section-container mb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-700 text-sm">
            {typeof favoritesError === "string"
              ? favoritesError
              : favoritesError?.message || "Failed to update favorites"}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="section-container">
        {/* Job Card */}
        <div className="bg-white rounded-lg  p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6 flex-1">
              {/* Company Logo */}
              <div className="">
                <div className="text-2xl font-bold text-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={job.logo}
                    alt="company logo"
                    className="w-30 h-30 rounded-lg overflow-hidden object-contain"
                  />
                </div>
              </div>

              {/* Job Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-0 md:mb-2">
                  {job.title}
                </h1>
                <p className="text-gray-600 md:mb-4">{job.company}</p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoritesLoading}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                      isJobFavorite
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-600"
                    } ${
                      favoritesLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    title={
                      isJobFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isJobFavorite ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border-2 bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-600 transition-all duration-200"
                    title="Share this job"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex-shrink-0 lg:ml-6">
              <button
                className={`w-full lg:w-auto px-8 py-3 rounded-lg font-medium transition-colors ${
                  submitLoading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-primary hover:bg-blue-500 text-white"
                }`}
                onClick={() => setApplyModalOpen(true)}
                disabled={submitLoading}
              >
                {submitLoading ? "Submitting..." : "Apply Now"}
              </button>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 gap-6 mt-8 pt-8 justify-start">
            {/* Salary */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-white shadow-md rounded-lg flex items-center justify-center">
                <img src={assets.moneyIcon} alt="salary" className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Salary</div>
                <div className="text-sm text-gray-600">{job.salary}</div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-white shadow-md rounded-lg flex items-center justify-center">
                <img src={assets.clockIcon} alt="time" className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Time</div>
                <div className="text-sm text-gray-600">{job.time}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-white shadow-md rounded-lg flex items-center justify-center">
                <img
                  src={assets.locationIcon}
                  alt="location"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Location
                </div>
                <div className="text-sm text-gray-600">{job.location}</div>
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-white shadow-md rounded-lg flex items-center justify-center">
                <img src={assets.GenderIcon} alt="gender" className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Gender</div>
                <div className="text-sm text-gray-600">{job.gender}</div>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-white shadow-md rounded-lg flex items-center justify-center">
                <img
                  src={assets.ExperienceIcon}
                  alt="experience"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Experience
                </div>
                <div className="text-sm text-gray-600">{job.experience}</div>
              </div>
            </div>

            {/* Education */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-white shadow-md rounded-lg flex items-center justify-center">
                <img
                  src={assets.EductionIcon}
                  alt="education"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Education
                </div>
                <div className="text-sm text-gray-600">{job.education}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider before Job Detail Section */}
        <div className="border-t border-gray-400 my-8"></div>

        {/* Job Detail Section */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Job Detail</h2>

          <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>

          {/* WhatsApp contact - only show if present */}
          {jobData?.data?.values?.whatsappContact && (
            <div className="mb-8">
              <p className="text-gray-700">
                Applicant who is interested send your CV on WhatsApp to{" "}
                <span className="font-medium text-blue-600">
                  {jobData.values.whatsappContact}
                </span>
              </p>
            </div>
          )}

          {/* Additional Details - Dynamic rendering based on available fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="my-5 font-semibold">Other Details</h2>
              {jobData?.values &&
                Object.entries(jobData?.values)
                  .filter(
                    ([key]) =>
                      ![
                        "title",
                        "description",
                        "salary",
                        "time",
                        "location",
                        "gender",
                        "experience",
                        "education",
                        "files",
                        "company name",
                      ].includes(key)
                  )

                  .map(([key, value]) => (
                    <div className="mb-4" key={key}>
                      <span className="font-medium text-gray-800 capitalize">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, function (str) {
                            return str.toUpperCase();
                          })}
                        :
                      </span>
                      <span className="ml-2 text-gray-700">
                        {value.toString()}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Divider at the end of the page */}
        <div className="border-t border-gray-400 my-8"></div>
      </main>
      {jobData && (
        <ApplyJobModal
          isOpen={isApplyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          jobId={id}
          jobTitle={job.title}
          companyName={job.company}
          onAutoApply={handleAutoApply}
          jobProfileData={jobProfileData}
          jobProfile={jobProfile}
          personalData={personalData}
          jobProfileLoading={jobProfileLoading}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
