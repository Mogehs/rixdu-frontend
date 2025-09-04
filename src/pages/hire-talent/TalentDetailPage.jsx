import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import * as assets from "../../assets";
import {
  QualificationIcon,
  ExperienceIcon,
  SkillsIcon,
  ResumeIcon,
  LicenceIcon,
  PortfolioIcon,
  ReferenceIcon,
  DigitalProfileIcon,
} from "../../assets";
import {
  getListing,
  selectCurrentListing,
  selectListingsLoading,
  selectListingsError,
  clearCurrentListing,
} from "../../features/listings/listingsSlice";
import { getOrCreateChat } from "../../features/chats/chatsSlice";

const TalentDetailPage = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Redux state
  const currentListing = useSelector(selectCurrentListing);
  const loading = useSelector(selectListingsLoading);
  const error = useSelector(selectListingsError);

  // Fetch listing data when component mounts
  useEffect(() => {
    if (slug) {
      dispatch(getListing(slug)); // Backend will handle slug as listingId
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentListing());
    };
  }, [slug, dispatch]);

  // Helper function to safely get field values
  const getFieldValue = (possibleNames, defaultValue = "Not specified") => {
    if (!currentListing?.values) return defaultValue;

    const values = currentListing.values;
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
        if (typeof values[name] === "string" && values[name].startsWith("[")) {
          try {
            const parsed = JSON.parse(values[name]);
            return Array.isArray(parsed) ? parsed : [values[name]];
          } catch {
            return [values[name]];
          }
        }
        return values[name];
      }
    }
    return defaultValue;
  };

  // Handle chat with talent
  const handleChatWithTalent = () => {
    if (currentListing) {
      const currentUserId = user?.id;

      if (!currentUserId) {
        navigate("/auth/login", {
          state: {
            from: `/hire-talent/${slug}`,
            message: "Please log in to chat with the talent",
          },
        });
        return;
      }

      // Don't allow chatting with self
      if (currentUserId === currentListing.userId?._id) {
        toast.info("This is your own listing");
        return;
      }

      dispatch(
        getOrCreateChat({
          listingId: currentListing._id,
          senderId: currentUserId,
          receiverId: currentListing.userId._id,
          type: "hiring",
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
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="section-container">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-gray-600">
              Loading talent details...
            </span>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !currentListing) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="section-container">
          <div
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </div>
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              {error || "Talent profile not found"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Extract data from listing
  const values = currentListing.values || {};
  // Basic info
  const name = getFieldValue(
    ["name", "full name", "full_name"],
    "Professional"
  );
  const title = getFieldValue(
    ["title", "job title", "job_title", "position", "role"],
    "Professional"
  );
  const location = getFieldValue(
    ["location", "city", "address", "place"],
    "Location not specified"
  );
  const about = getFieldValue(
    ["about", "bio", "description", "summary"],
    "No description available"
  );
  const rateRange = getFieldValue(
    ["rate-range", "rate_range", "salary", "rate"],
    "Rate not disclosed"
  );
  const experience = getFieldValue(
    ["experience", "years of experience", "work experience", "work history"],
    "Experience not specified"
  );
  const availability = getFieldValue(
    ["availability", "available", "status"],
    "Not specified"
  );
  const languages = getFieldValue(
    ["languages", "language", "spoken languages"],
    "Not specified"
  );

  // Skills - handle array or string
  let skills = getFieldValue(
    ["skills", "skill", "specialties", "expertise"],
    []
  );
  if (typeof skills === "string") {
    try {
      skills = JSON.parse(skills);
    } catch {
      skills = skills.split(",").map((s) => s.trim());
    }
  }
  if (!Array.isArray(skills)) {
    skills = [skills];
  }

  // Qualifications
  const qualifications = getFieldValue(
    ["qualifications", "qualification", "education", "degree"],
    "Not specified"
  );

  // Work history
  const workHistory = getFieldValue(
    ["work history", "work_history", "employment history"],
    "Not specified"
  );

  // References
  const references = getFieldValue(
    ["refrences", "references", "refs"],
    "Available upon request"
  );

  // Licenses
  const licenses = getFieldValue(
    ["liscenses", "licenses", "certifications"],
    "Not specified"
  );

  // Social media
  const socialMedia = getFieldValue(
    [
      "social media link",
      "socialMedia",
      "social_media",
      "instagram",
      "linkedin",
    ],
    ""
  );
  const portfolioLink = getFieldValue(
    ["portfoliolink", "portfolio link", "portfolio_link", "portfolio"],
    ""
  );

  // Resume
  const resume = values.resume;

  // Profile image
  const profileImage =
    resume?.url ||
    values.profile?.url ||
    values.image?.url ||
    values.photo?.url;

  return (
    <div className="bg-gray-50">
      <main className="section-container">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Image */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-blue-50 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <span className="text-2xl font-bold text-blue-600">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentListing.userId.name}
                </h1>
                <p className="text-lg text-primary font-medium mb-2">{title}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      +{skills.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <img
                    src={assets.locationIcon}
                    alt="location"
                    className="w-4 h-4"
                  />
                  <span>{location}</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="flex-shrink-0 space-y-3">
              <button
                className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium w-full md:w-auto"
                onClick={handleChatWithTalent}
              >
                Chat with Talent
              </button>
              {/* <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium w-full md:w-auto"
                onClick={() => setShowContactInfo(!showContactInfo)}
              >
                {showContactInfo ? "Hide Contact" : "Show Contact"}
              </button>
              {showContactInfo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-800 font-medium">
                    Contact Information
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Available via platform messaging
                  </p>
                  {values.phone && (
                    <p className="text-gray-600 text-sm mt-1">
                      Phone: {values.phone}
                    </p>
                  )}
                  {values.email && (
                    <p className="text-gray-600 text-sm mt-1">
                      Email: {values.email}
                    </p>
                  )}
                </div>
              )} */}
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
            {/* Rate Range */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <img src={assets.moneyIcon} alt="rate" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Rate Range
                </div>
                <div className="text-sm text-gray-600">{rateRange}</div>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <img
                  src={assets.ExperienceIcon}
                  alt="experience"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Experience
                </div>
                <div className="text-sm text-gray-600">{experience}</div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <img
                  src={assets.clockIcon}
                  alt="availability"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Availability
                </div>
                <div className="text-sm text-gray-600">{availability}</div>
              </div>
            </div>

            {/* Languages */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <img
                  src={assets.GenderIcon}
                  alt="languages"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  Languages
                </div>
                <div className="text-sm text-gray-600">
                  {Array.isArray(languages) ? languages.join(", ") : languages}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <img
                    src={DigitalProfileIcon}
                    alt="About"
                    className="w-5 h-5"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">About</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{about}</p>
            </div>

            {/* Qualifications Section */}
            {qualifications !== "Not specified" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img
                      src={QualificationIcon}
                      alt="Qualifications"
                      className="w-5 h-5"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Qualifications
                  </h2>
                </div>
                <div className="border-l-2 border-blue-200 pl-4">
                  <p className="text-gray-700 leading-relaxed">
                    {qualifications}
                  </p>
                </div>
              </div>
            )}

            {/* Work History Section */}
            {workHistory !== "Not specified" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img
                      src={ExperienceIcon}
                      alt="Experience"
                      className="w-5 h-5"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Work History
                  </h2>
                </div>
                <div className="border-l-2 border-blue-200 pl-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {workHistory}
                  </p>
                </div>
              </div>
            )}

            {/* Skills Section */}
            {skills.length > 0 && skills[0] !== "Skills not listed" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img src={SkillsIcon} alt="Skills" className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-8">
            {/* Resume Section */}
            {resume && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img src={ResumeIcon} alt="Resume" className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Resume</h2>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {resume.originalName || "Resume.pdf"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last updated:{" "}
                      {currentListing.updatedAt
                        ? new Date(
                            currentListing.updatedAt
                          ).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-blue-600"
                  >
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Licenses Section */}
            {licenses !== "Not specified" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img src={LicenceIcon} alt="Licenses" className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Licenses</h2>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {licenses}
                  </p>
                </div>
              </div>
            )}

            {/* Digital Profiles Section */}
            {(socialMedia || portfolioLink) && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img
                      src={DigitalProfileIcon}
                      alt="Digital Profiles"
                      className="w-5 h-5"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Digital Presence
                  </h2>
                </div>
                <div className="space-y-4">
                  {socialMedia && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          Social Media
                        </p>
                        <a
                          href={
                            socialMedia.startsWith("http")
                              ? socialMedia
                              : `https://${socialMedia}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          {socialMedia}
                        </a>
                      </div>
                    </div>
                  )}
                  {portfolioLink && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Portfolio</p>
                        <a
                          href={
                            portfolioLink.startsWith("http")
                              ? portfolioLink
                              : `https://${portfolioLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          {portfolioLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* References Section */}
            {references !== "Available upon request" &&
              references !== "Not provided" && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <img
                        src={ReferenceIcon}
                        alt="References"
                        className="w-5 h-5"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      References
                    </h2>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {references}
                    </p>
                  </div>
                </div>
              )}

            {/* Portfolio Preview Section - if images are available */}
            {values.portfolio &&
              Array.isArray(values.portfolio) &&
              values.portfolio.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <img
                        src={PortfolioIcon}
                        alt="Portfolio"
                        className="w-5 h-5"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Portfolio Preview
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {values.portfolio.slice(0, 6).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={typeof image === "string" ? image : image.url}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalentDetailPage;
