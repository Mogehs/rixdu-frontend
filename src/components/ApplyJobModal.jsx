import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useApplications } from "../hooks/useApplications";

const ApplyJobModal = ({
  isOpen,
  onClose,
  jobId, // This is now actually the job slug from URL params
  jobTitle,
  companyName,
  jobProfileData,
  jobProfile,
  personalData,
  jobProfileLoading,
  onAutoApply,
}) => {
  const navigate = useNavigate();
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const { submitLoading, submitSuccess, submitError } = useApplications();

  if (!isOpen) return null;

  // Debugging profile data
  console.log("ApplyJobModal Profile Data:", {
    jobProfile: jobProfile ? Object.keys(jobProfile) : "Missing",
    personalData: personalData ? Object.keys(personalData) : "Missing",
  });

  // Check if we have enough profile data to apply automatically (adapting to ProfileSchema)
  const canAutoApply =
    jobProfileData &&
    jobProfile &&
    // Must have basic personal info from user's name
    jobProfileData?.user?.name &&
    // Must have email from user or profile
    (personalData?.profileEmail || jobProfileData?.user?.email) &&
    // Must have phone number
    (personalData?.profilePhoneNumber || jobProfileData?.user?.phoneNumber);

  // Check for resume - adapted to your schema
  const hasResume = jobProfile?.resume ? true : false;

  // Check for experience - adapted to your schema
  const hasExperience =
    jobProfile?.experience && jobProfile.experience.length > 0;

  // Check for education - adapted to your schema
  const hasEducation =
    jobProfile?.qualifications && jobProfile.qualifications.length > 0;

  // Profile completion percentage calculation
  const requiredFields = ["fullName", "email", "phoneNumber", "resume"];
  const optionalFields = [
    "experience",
    "qualifications",
    "skills",
    "visaStatus",
  ];

  let completedFields = 0;
  if (jobProfileData?.user?.name) completedFields++;
  if (personalData?.profileEmail || jobProfileData?.user?.email)
    completedFields++;
  if (personalData?.profilePhoneNumber || jobProfileData?.user?.phoneNumber)
    completedFields++;
  if (hasResume) completedFields++;
  if (hasExperience) completedFields++;
  if (hasEducation) completedFields++;
  if (jobProfile?.skills && jobProfile.skills.length > 0) completedFields++;
  if (personalData?.visaStatus) completedFields++;

  const profileCompletion = Math.floor(
    (completedFields / (requiredFields.length + optionalFields.length)) * 100
  );

  const handleManualApply = () => {
    navigate(`/jobs/apply/${jobId}`);
    onClose();
  };

  const handleAutoApply = () => {
    if (!canAutoApply) {
      toast.warning(
        <div>
          Please complete your profile information before using auto-apply
          <button
            onClick={() => navigate("/profile/job")}
            className="ml-2 bg-blue-600 text-white px-2 py-1 text-xs rounded"
          >
            Complete Profile
          </button>
        </div>,
        {
          position: "bottom-left",
          autoClose: 6000,
          closeOnClick: false,
          pauseOnHover: true,
        }
      );
      return;
    }

    if (!hasResume) {
      toast.warning(
        <div>
          A resume is required. Please add a resume to your profile before
          applying.
          <button
            onClick={() => navigate("/profile/job")}
            className="ml-2 bg-blue-600 text-white px-2 py-1 text-xs rounded"
          >
            Add Resume
          </button>
        </div>,
        {
          position: "bottom-left",
          autoClose: 6000,
          closeOnClick: false,
          pauseOnHover: true,
        }
      );
      return;
    }

    onAutoApply();
  };

  const toggleProfilePreview = () => {
    setShowProfilePreview(!showProfilePreview);
  };

  const handleModalContentClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-[200]"
      onClick={onClose}
    >
      <div
        className="relative mx-auto p-6 w-full max-w-5xl shadow-lg rounded-xl bg-white max-h-[90vh] overflow-y-auto"
        onClick={handleModalContentClick}
      >
        {/* Success message overlay */}
        {submitSuccess && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 z-10">
            <div className="bg-green-50 border border-green-100 rounded-full p-4 mb-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Your application for{" "}
              <span className="font-medium">{jobTitle}</span> at{" "}
              <span className="font-medium">{companyName}</span> has been
              submitted successfully.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Error overlay */}
        {submitError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 z-10">
            <div className="bg-red-50 border border-red-100 rounded-full p-4 mb-4">
              <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Application Failed
            </h3>
            <p className="text-red-600 mb-6 text-center max-w-md">
              {submitError}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/profile/job")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Apply for <span className="text-blue-600">{jobTitle}</span> at{" "}
            <span className="text-gray-700">{companyName}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Completion Status */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Profile Completion
            </h4>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                profileCompletion >= 75
                  ? "bg-green-100 text-green-800"
                  : profileCompletion >= 50
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {profileCompletion}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                profileCompletion >= 75
                  ? "bg-green-600"
                  : profileCompletion >= 50
                  ? "bg-blue-600"
                  : "bg-yellow-400"
              }`}
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>

          {/* Profile Status Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <div
              className={`flex items-center text-xs ${
                personalData?.fullName || jobProfileData?.user?.name
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full mr-1 ${
                  personalData?.fullName || jobProfileData?.user?.name
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              Basic Info
            </div>
            <div
              className={`flex items-center text-xs ${
                hasResume ? "text-green-600" : "text-red-500"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full mr-1 ${
                  hasResume ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              Resume
            </div>
            <div
              className={`flex items-center text-xs ${
                hasExperience ? "text-green-600" : "text-gray-500"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full mr-1 ${
                  hasExperience ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              Experience
            </div>
            <div
              className={`flex items-center text-xs ${
                hasEducation ? "text-green-600" : "text-gray-500"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full mr-1 ${
                  hasEducation ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              Education
            </div>
          </div>
        </div>

        {/* Application Methods */}
        <div className="space-y-4">
          {/* Auto-Apply Option */}
          <div
            className={`w-full border ${
              showProfilePreview
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200"
            } rounded-lg transition-colors overflow-hidden`}
          >
            <button
              onClick={toggleProfilePreview}
              className="w-full flex items-center p-4 hover:bg-gray-50"
            >
              <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-grow text-left">
                <p className="text-sm font-semibold text-gray-900">
                  Quick Apply with Profile
                </p>
                <p className="text-xs text-gray-500">
                  Use your job profile details for this application
                </p>
              </div>
              <div className="ml-4">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    canAutoApply
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {canAutoApply ? "Ready" : "Incomplete"}
                </span>
              </div>
            </button>

            {/* Profile Preview Section */}
            {showProfilePreview && (
              <div className="p-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-800 mb-3">
                  Application Preview
                </h4>

                <div className="space-y-4 mb-4">
                  {/* Personal Info */}
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-center mb-2">
                      <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <h5 className="text-xs font-semibold text-gray-700">
                        Personal Information
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Name: </span>
                        <span className="text-gray-800">
                          {jobProfileData?.user?.name || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email: </span>
                        <span className="text-gray-800">
                          {personalData?.profileEmail ||
                            jobProfileData?.user?.email ||
                            "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone: </span>
                        <span className="text-gray-800">
                          {personalData?.profilePhoneNumber ||
                            jobProfileData?.user?.phoneNumber ||
                            "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Visa Status: </span>
                        <span className="text-gray-800">
                          {personalData?.visaStatus || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resume */}
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-center mb-2">
                      <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <h5 className="text-xs font-semibold text-gray-700">
                        Resume
                      </h5>
                    </div>
                    {jobProfile?.resume ? (
                      <div className="flex items-center text-xs">
                        <span className="text-green-600">
                          ✓ Resume available
                        </span>
                        <a
                          href={jobProfile.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </a>
                        {jobProfile.resume_public_id && (
                          <span className="ml-2 text-gray-500">
                            ID: {jobProfile.resume_public_id.split("/").pop()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-red-500">
                        No resume found. Resume is required for
                        auto-application.
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-center mb-2">
                      <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <h5 className="text-xs font-semibold text-gray-700">
                        Experience
                      </h5>
                    </div>
                    {jobProfile?.experience &&
                    jobProfile.experience.length > 0 ? (
                      <div className="space-y-2">
                        {jobProfile.experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="text-xs">
                            <div className="font-medium">{exp.jobTitle}</div>
                            <div className="text-gray-600">{exp.company}</div>
                            {exp.startDate && (
                              <div className="text-gray-500 text-xs">
                                {new Date(exp.startDate).toLocaleDateString()} -
                                {exp.endDate
                                  ? new Date(exp.endDate).toLocaleDateString()
                                  : "Present"}
                              </div>
                            )}
                          </div>
                        ))}
                        {jobProfile.experience.length > 2 && (
                          <div className="text-xs text-gray-500">
                            + {jobProfile.experience.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        No experience added (optional)
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-center mb-2">
                      <AcademicCapIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <h5 className="text-xs font-semibold text-gray-700">
                        Education
                      </h5>
                    </div>
                    {jobProfile?.qualifications &&
                    jobProfile.qualifications.length > 0 ? (
                      <div className="space-y-2">
                        {jobProfile.qualifications
                          .slice(0, 2)
                          .map((edu, index) => (
                            <div key={index} className="text-xs">
                              <div className="font-medium">{edu.degree}</div>
                              <div className="text-gray-600">
                                {edu.institution}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {edu.fieldOfStudy}
                                {edu.startDate && edu.endDate && (
                                  <span>
                                    {" "}
                                    • {new Date(
                                      edu.startDate
                                    ).getFullYear()} -{" "}
                                    {new Date(edu.endDate).getFullYear()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        {jobProfile.qualifications.length > 2 && (
                          <div className="text-xs text-gray-500">
                            + {jobProfile.qualifications.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        No education added (optional)
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleAutoApply}
                    disabled={
                      !canAutoApply ||
                      !hasResume ||
                      jobProfileLoading ||
                      submitLoading
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      !canAutoApply ||
                      !hasResume ||
                      jobProfileLoading ||
                      submitLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {submitLoading ? "Submitting..." : "Apply Now with Profile"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Apply Option */}
          <button
            onClick={handleManualApply}
            className="w-full flex items-center p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="mr-4 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <PencilSquareIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-start text-sm font-semibold text-gray-900">
                Apply Manually
              </p>
              <p className="text-start text-xs text-gray-500">
                Fill out the application form yourself
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal;
