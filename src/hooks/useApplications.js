import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitJobApplication,
  getUserApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  clearErrors,
  clearSuccess,
  resetApplications,
  setCurrentApplication,
  selectApplicationsLoading,
  selectSubmitLoading,
  selectUpdateLoading,
  selectUserApplications,
  selectJobApplications,
  selectCurrentApplication,
  selectApplicationStats,
  selectApplicationsPagination,
  selectStatusCounts,
} from "../features/applications/applicationsSlice";

export const useApplications = () => {
  const dispatch = useDispatch();

  const loading = useSelector(selectApplicationsLoading);
  const submitLoading = useSelector(selectSubmitLoading);
  const updateLoading = useSelector(selectUpdateLoading);
  const userApplications = useSelector(selectUserApplications);
  const jobApplications = useSelector(selectJobApplications);
  const currentApplication = useSelector(selectCurrentApplication);
  const applicationStats = useSelector(selectApplicationStats);
  const pagination = useSelector(selectApplicationsPagination);
  const statusCounts = useSelector(selectStatusCounts);

  const { error, submitError, updateError, submitSuccess, updateSuccess } =
    useSelector((state) => state.applications);

  const submitApplication = useCallback(
    async (applicationData) => {
      return dispatch(submitJobApplication(applicationData)).unwrap();
    },
    [dispatch]
  );

  const fetchUserApplications = useCallback(
    async (filters = {}) => {
      return dispatch(getUserApplications(filters)).unwrap();
    },
    [dispatch]
  );

  const fetchJobApplications = useCallback(
    async (params) => {
      return dispatch(getJobApplications(params)).unwrap();
    },
    [dispatch]
  );

  const fetchApplicationById = useCallback(
    async (applicationId) => {
      return dispatch(getApplicationById(applicationId)).unwrap();
    },
    [dispatch]
  );

  const updateStatus = useCallback(
    async ({ applicationId, status, notes, rating }) => {
      return dispatch(
        updateApplicationStatus({ applicationId, status, notes, rating })
      ).unwrap();
    },
    [dispatch]
  );

  const withdrawApp = useCallback(
    async (applicationId) => {
      return dispatch(withdrawApplication(applicationId)).unwrap();
    },
    [dispatch]
  );

  const fetchStats = useCallback(async () => {
    return dispatch(getApplicationStats()).unwrap();
  }, [dispatch]);

  const setCurrentApp = useCallback(
    (application) => {
      dispatch(setCurrentApplication(application));
    },
    [dispatch]
  );

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAllSuccess = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  const resetAllApplications = useCallback(() => {
    dispatch(resetApplications());
  }, [dispatch]);

  const createAutoApplication = useCallback(
    (jobSlug, data) => {
      // Extract data from the parameters
      const { profileData, jobProfile, personalData, jobDetails } = data;

      if (!profileData || !jobProfile) {
        throw new Error("Profile data is required for auto application");
      }

      if (!jobProfile.resume) {
        throw new Error("Resume is required for auto application");
      }

      // Log profile data for debugging
      console.log("Creating auto application with profile data:", {
        profileDataStructure: Object.keys(profileData || {}),
        jobProfileStructure: Object.keys(jobProfile || {}),
        personalDataStructure: Object.keys(personalData || {}),
      });

      // Get name from best available source - adapt to your Profile schema
      const fullName = profileData?.user?.name || "";

      // Prepare cover letter with job-specific details if available
      let coverLetter = `Dear Hiring Manager,\n\n`;

      if (jobDetails?.title && jobDetails?.company) {
        coverLetter += `I am writing to express my interest in the ${jobDetails.title} position at ${jobDetails.company}. `;
      } else {
        coverLetter += `I am writing to express my interest in this position. `;
      }

      coverLetter += `Based on my profile and experience, I believe I would be a great fit for this role.\n\n`;

      // Add skills if available - adapt to your Profile schema
      if (jobProfile.skills && jobProfile.skills.length > 0) {
        coverLetter += `My key skills include: ${jobProfile.skills
          .slice(0, 5)
          .join(", ")}`;
        if (jobProfile.skills.length > 5) {
          coverLetter += `, and more`;
        }
        coverLetter += `.\n\n`;
      }

      coverLetter += `Please find my attached resume for your consideration.\n\n`;
      coverLetter += `Thank you for your time and consideration.\n\n`;
      coverLetter += `Best regards,\n${fullName}`;

      // Get location formatted according to your schema
      let formattedLocation = "";
      if (personalData?.location) {
        const loc = personalData.location;
        const locationParts = [];

        if (loc.building) locationParts.push(loc.building);
        if (loc.appartment) locationParts.push(loc.appartment);
        if (loc.neighborhood) locationParts.push(loc.neighborhood);
        if (loc.country) locationParts.push(loc.country);

        formattedLocation = locationParts.join(", ");
      }

      // Construct the application data object - adapted to your Profile schema
      const applicationData = {
        jobSlug,
        applicationMethod: "auto",
        applicantData: {
          personalInfo: {
            fullName,
            email: personalData?.profileEmail || profileData?.user?.email || "",
            phone:
              personalData?.profilePhoneNumber ||
              profileData?.user?.phoneNumber ||
              "",
            location: formattedLocation,
            visaStatus: personalData?.visaStatus || "",
            // Format date as ISO string if exists, otherwise omit
            ...(personalData?.dateOfBirth && {
              dateOfBirth: new Date(personalData.dateOfBirth).toISOString(),
            }),
            gender: personalData?.gender || "",
          },
          resume: {
            url: jobProfile.resume,
            filename: jobProfile.resume_public_id
              ? jobProfile.resume_public_id.split("/").pop()
              : "resume.pdf",
          },
          // Make sure experience objects have the correct format - adapt to your Profile schema
          experience: (jobProfile.experience || []).map((exp) => ({
            jobTitle: exp.jobTitle || "",
            company: exp.company || "",
            startDate: exp.startDate
              ? new Date(exp.startDate).toISOString()
              : undefined,
            endDate: exp.endDate
              ? new Date(exp.endDate).toISOString()
              : undefined,
            current: !exp.endDate, // If no end date, consider it current
            description: exp.description || "",
            location: "",
          })),
          // Map education data to match the expected schema - adapt to your Profile schema
          education: (jobProfile.qualifications || []).map((edu) => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            graduationYear: edu.endDate
              ? new Date(edu.endDate).getFullYear()
              : undefined,
            grade: "",
            fieldOfStudy: edu.fieldOfStudy || "",
          })),
          skills: jobProfile.skills || [],
          certifications: (jobProfile.licenses || []).map((license) => ({
            name: license.name || "",
            issuer: license.issuer || "",
            issueDate: license.dateIssued
              ? new Date(license.dateIssued).toISOString()
              : undefined,
            expiryDate: undefined,
            credentialId: "",
          })),
          portfolio: {
            website:
              jobProfile.portfolio?.link ||
              jobProfile.digitalProfile?.personalWebsite ||
              "",
            linkedin: jobProfile.digitalProfile?.linkedIn || "",
            github: jobProfile.digitalProfile?.github || "",
            behance: "",
            other: "",
          },
          references: (jobProfile.references || []).map((ref) => ({
            name: ref.name || "",
            relationship: ref.position || "",
            company: ref.company || "",
            email: ref.email || "",
            phone: "",
          })),
          // Move coverLetter inside applicantData to match the schema
          coverLetter: coverLetter,
        },
      };

      return submitApplication(applicationData);
    },
    [submitApplication]
  );

  return {
    loading,
    submitLoading,
    updateLoading,
    userApplications,
    jobApplications,
    currentApplication,
    applicationStats,
    pagination,
    statusCounts,
    error,
    submitError,
    updateError,
    submitSuccess,
    updateSuccess,
    submitApplication,
    fetchUserApplications,
    fetchJobApplications,
    fetchApplicationById,
    updateStatus,
    withdrawApp,
    fetchStats,
    setCurrentApp,
    clearAllErrors,
    clearAllSuccess,
    resetAllApplications,
    createAutoApplication,
  };
};
