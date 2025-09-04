import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  InputField,
  TextAreaField,
  FileUploadField,
} from "../../components/forms/FormFields";
import { useApplications } from "../../hooks/useApplications";
import LoadingState from "../../components/LoadingState";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "not_disclose", label: "Does not want to disclose" },
];

const languagesOptions = [
  "English",
  "Arabic",
  "French",
  "Hindi",
  "Russian",
  "Other",
];

const locationOptions = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Fujairah",
  "Ras Al Khaimah",
  "Umm Al Quwain",
  "Other",
];

const visaStatusOptions = [
  "Visit Visa",
  "Employment Visa",
  "Dependent Visa",
  "Student Visa",
  "Other",
];

const jobStatusOptions = [
  { value: "fresher", label: "Fresher" },
  { value: "experience", label: "Experience" },
];

const categoryOptions = [
  "Admin",
  "IT",
  "Sales",
  "Marketing",
  "Finance",
  "HR",
  "Other",
];

const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Other",
];

const JobApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    submitApplication,
    submitLoading,
    submitSuccess,
    submitError,
    clearAllErrors,
  } = useApplications();
  const { currentListing: jobData } = useSelector((state) => state.listings);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    coverLetter: "",
    email: "",
    phone: "",
    gender: "",
    languages: [],
    location: "",
    visaStatus: "",
    qualification: "",
    jobStatus: "experience",
    jobTitle: "",
    category: "",
    industry: "",
    company: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    cv: null,
  });

  // Load job details if available
  useEffect(() => {
    if (jobData) {
      setIsLoading(false);
      // Pre-populate job title from the job data if available
      if (jobData.values?.title) {
        setForm((prev) => ({
          ...prev,
          jobTitle: jobData.values.title,
        }));
      }
    } else {
      if (id) {
        navigate(`/jobs/detail/${id}`);
      } else {
        setIsLoading(false);
      }
    }
  }, [jobData, id, navigate]);

  // Handle submission success and error
  useEffect(() => {
    if (submitSuccess) {
      toast.success("Your application has been submitted successfully!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
      });

      // Redirect to jobs list or job details
      setTimeout(() => {
        navigate(id && `/jobs/detail/${id}`);
      }, 2000);
    }

    if (submitError) {
      toast.error(`Application failed: ${submitError}`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
      });

      // Clear error after showing
      setTimeout(() => {
        clearAllErrors();
      }, 5000);
    }
  }, [submitSuccess, submitError, id, navigate, clearAllErrors]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      if (files[0]) {
        // Store the file object for submission
        if (name === "resume") {
          setResumeFile(files[0]);
        } else {
          // For other file inputs, if any
          setForm((prev) => ({ ...prev, [name]: files[0] }));
        }
        // Store the file name in the form for display purposes
        setForm((prev) => ({ ...prev, [`${name}Name`]: files[0].name }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.fullName || !form.email || !form.phone || !resumeFile) {
      toast.warning("Please fill all required fields and upload your CV", {
        position: "bottom-left",
      });
      return;
    }

    try {
      // Create experience data if user has experience
      let experience = [];
      if (form.jobStatus === "experience" && form.company && form.jobTitle) {
        experience = [
          {
            jobTitle: form.jobTitle,
            company: form.company,
            startDate: form.startDate
              ? new Date(form.startDate).toISOString()
              : undefined,
            endDate: form.currentlyWorking
              ? undefined
              : form.endDate
              ? new Date(form.endDate).toISOString()
              : undefined,
            current: form.currentlyWorking,
            description: "",
            category: form.category,
            industry: form.industry,
          },
        ];
      }

      // Prepare education data
      let education = [];
      if (form.qualification) {
        education = [
          {
            degree: form.qualification,
            institution: "",
            graduationYear: new Date().getFullYear(),
            fieldOfStudy: "",
          },
        ];
      }

      // Create a FormData object to send the resume file
      const formData = new FormData();

      // Add the resume file
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      // Create the applicant data object
      const applicantData = {
        personalInfo: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          location: form.location,
          visaStatus: form.visaStatus,
        },
        coverLetter: form.coverLetter,
        experience: experience,
        education: education,
        skills: [],
        languages: form.languages,
      };

      // Add other data to the FormData
      formData.append("jobSlug", jobData?.slug || id); // Use slug if available, fallback to id
      formData.append("applicationMethod", "manual");
      formData.append("applicantData", JSON.stringify(applicantData));

      // Submit the application with FormData
      await submitApplication(formData);
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "bottom-left",
      });
      console.error("Application submission error:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="section-container">
        <h1 className="section-heading mb-6">
          Apply {jobData?.values?.title ? `for ${jobData.values.title}` : ""}
        </h1>

        {isLoading ? (
          <LoadingState message="Preparing application form..." />
        ) : (
          <>
            {/* Job Information Card */}
            {jobData && (
              <div className="bg-white rounded-lg p-6 shadow-elegant mb-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {jobData.values?.files?.url ? (
                      <img
                        src={jobData.values.files.url}
                        alt="Company logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {jobData.values?.title || "Job Position"}
                    </h2>
                    <p className="text-gray-600">
                      {jobData.values?.["company name"] ||
                        jobData.values?.company ||
                        "Company Name"}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium">
                          {typeof jobData.values?.location === "object"
                            ? jobData.values.location.address
                            : jobData.values?.location || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Job Type</p>
                        <p className="text-sm font-medium">
                          {jobData.values?.time ||
                            jobData.values?.["job type"] ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Salary</p>
                        <p className="text-sm font-medium">
                          {jobData.values?.salary || "Not disclosed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Posted</p>
                        <p className="text-sm font-medium">
                          {jobData.createdAt
                            ? new Date(jobData.createdAt).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Application Form */}
            <form
              className="bg-white rounded-lg p-6 shadow-elegant"
              onSubmit={handleSubmit}
            >
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-blue-700">
                <p>Fields marked with an asterisk (*) are required.</p>
                <p>
                  Submitting a complete application increases your chances of
                  being considered.
                </p>
              </div>

              <InputField
                id="fullName"
                label="Full Name"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                name="fullName"
                required={true}
              />
              <TextAreaField
                id="coverLetter"
                label="Cover Letter"
                placeholder="Introduce yourself and explain why you are a good fit for this position"
                value={form.coverLetter}
                onChange={handleChange}
                name="coverLetter"
              />
              <InputField
                id="email"
                label="Email Id"
                placeholder="Email Id"
                value={form.email}
                onChange={handleChange}
                name="email"
                type="email"
                required={true}
              />
              <InputField
                id="phone"
                label="Phone Number"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                name="phone"
                type="tel"
                required={true}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-2">
                  {genderOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        form.gender === opt.value
                          ? "bg-blue-400 text-white border-blue-400"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                      }`}
                      onClick={() => handleSelectChange("gender", opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Languages
                </label>
                <select
                  multiple
                  className="w-full p-3 border outline-none border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={form.languages}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    );
                    handleMultiSelectChange("languages", selected);
                  }}
                  name="languages"
                >
                  {languagesOptions.map((lang) => (
                    <option
                      key={lang}
                      value={lang}
                      className="text-gray-800 py-2 px-3 font-medium tracking-wide"
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Located In
                </label>
                <select
                  className="outline-none w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={form.location}
                  onChange={(e) =>
                    handleSelectChange("location", e.target.value)
                  }
                  name="location"
                >
                  <option value="">Select</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Visa Status
                </label>
                <select
                  className="outline-none w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={form.visaStatus}
                  onChange={(e) =>
                    handleSelectChange("visaStatus", e.target.value)
                  }
                  name="visaStatus"
                >
                  <option value="">Select</option>
                  {visaStatusOptions.map((visa) => (
                    <option key={visa} value={visa}>
                      {visa}
                    </option>
                  ))}
                </select>
              </div>
              <InputField
                id="qualification"
                label="Qualification Degree"
                placeholder="Qualification Degree"
                value={form.qualification}
                onChange={handleChange}
                name="qualification"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Status
                </label>
                <div className="flex gap-2">
                  {jobStatusOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        form.jobStatus === opt.value
                          ? "bg-blue-400 text-white border-blue-400"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                      }`}
                      onClick={() => handleSelectChange("jobStatus", opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {form.jobStatus === "experience" && (
                <>
                  <InputField
                    id="jobTitle"
                    label="Select Job Title"
                    placeholder="Select Job Title"
                    value={form.jobTitle}
                    onChange={handleChange}
                    name="jobTitle"
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category
                    </label>
                    <select
                      className="outline-none w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
                      value={form.category}
                      onChange={(e) =>
                        handleSelectChange("category", e.target.value)
                      }
                      name="category"
                    >
                      <option value="">Select</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Industry
                    </label>
                    <select
                      className="outline-none w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition "
                      value={form.industry}
                      onChange={(e) =>
                        handleSelectChange("industry", e.target.value)
                      }
                      name="industry"
                    >
                      <option value="">Select</option>
                      {industryOptions.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    id="company"
                    label="Current/Last Company"
                    placeholder="Current/Last Company"
                    value={form.company}
                    onChange={handleChange}
                    name="company"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <InputField
                      id="startDate"
                      label="Start Date"
                      type="date"
                      value={form.startDate}
                      onChange={handleChange}
                      name="startDate"
                    />
                    <InputField
                      id="endDate"
                      label="End Date"
                      type="date"
                      value={form.endDate}
                      onChange={handleChange}
                      name="endDate"
                      disabled={form.currentlyWorking}
                    />
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="currentlyWorking"
                      name="currentlyWorking"
                      checked={form.currentlyWorking}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-400 border-gray-300 rounded focus:ring-blue-400"
                    />
                    <label
                      htmlFor="currentlyWorking"
                      className="text-sm text-gray-700"
                    >
                      Currently Working
                    </label>
                  </div>
                </>
              )}
              <div className="mb-6">
                <FileUploadField
                  id="resume"
                  label="Upload your CV"
                  helpText="PDF, DOC, DOCX (MAX. 5MB)"
                  name="resume"
                  onChange={handleChange}
                  required={true}
                />
                {resumeFile && (
                  <div className="mt-2 px-3 py-2 bg-green-50 border border-green-100 rounded-md text-sm text-green-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    File selected: {resumeFile.name}
                  </div>
                )}
              </div>
              <div className="mt-6 mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">
                <h4 className="font-medium mb-1">
                  Before submitting your application:
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ensure your contact information is correct</li>
                  <li>
                    Make sure your CV is up-to-date and relevant to this
                    position
                  </li>
                  <li>Add a personalized cover letter to stand out</li>
                  <li>Double-check all information for accuracy</li>
                </ul>
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="confirmAccuracy"
                  name="confirmAccuracy"
                  className="h-4 w-4 text-blue-400 border-gray-300 rounded focus:ring-blue-400"
                  required
                />
                <label
                  htmlFor="confirmAccuracy"
                  className="ml-2 text-sm text-gray-700"
                >
                  I confirm that all information provided is accurate and
                  complete. *
                </label>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className={`w-full ${
                  submitLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-400 hover:bg-blue-500"
                } text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2`}
              >
                {submitLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default JobApplicationPage;
