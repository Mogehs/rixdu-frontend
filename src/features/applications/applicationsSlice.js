import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/applications`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Applications API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const submitJobApplication = createAsyncThunk(
  "applications/submitJobApplication",
  async (applicationData, { rejectWithValue }) => {
    try {
      // Check if applicationData is FormData (for file uploads)
      const isFormData = applicationData instanceof FormData;

      if (isFormData) {
        // FormData validation
        if (!applicationData.get("jobSlug")) {
          throw new Error("Job slug is required");
        }

        // Try to parse the applicantData JSON
        let parsedData;
        try {
          parsedData = JSON.parse(applicationData.get("applicantData") || "{}");
        } catch {
          throw new Error("Invalid applicant data format");
        }

        // Validate the parsed data
        if (!parsedData.personalInfo?.fullName) {
          throw new Error("Applicant name is required");
        }

        // Check if resume file is attached
        if (!applicationData.get("resume")) {
          throw new Error("Resume file is required");
        }

        console.log("📝 Submitting job application with file upload:", {
          jobSlug: applicationData.get("jobSlug"),
          method: applicationData.get("applicationMethod"),
          fullName: parsedData.personalInfo?.fullName,
          hasResumeFile: !!applicationData.get("resume"),
          experienceCount: parsedData.experience?.length || 0,
          educationCount: parsedData.education?.length || 0,
        });
      } else {
        // Regular JSON validation
        if (!applicationData.jobSlug) {
          throw new Error("Job slug is required");
        }

        if (!applicationData.applicantData?.personalInfo?.fullName) {
          throw new Error("Applicant name is required");
        }

        if (!applicationData.applicantData?.resume?.url) {
          throw new Error("Resume URL is required");
        }

        console.log("📝 Submitting job application:", {
          jobSlug: applicationData.jobSlug,
          method: applicationData.applicationMethod,
          fullName: applicationData.applicantData?.personalInfo?.fullName,
          hasResume: !!applicationData.applicantData?.resume?.url,
          experienceCount:
            applicationData.applicantData?.experience?.length || 0,
          educationCount: applicationData.applicantData?.education?.length || 0,
        });
      }

      // Send the request to the API
      // If it's FormData, Axios will automatically set the correct Content-Type
      const response = await axiosInstance.post("/", applicationData);

      console.log("✅ Application submitted successfully:", {
        applicationId: response.data.data._id,
        status: response.data.data.status,
      });

      return response.data.data;
    } catch (error) {
      // Check if this is an Axios error with a response
      if (error.response) {
        console.error("❌ Submit application server error:", {
          status: error.response.status,
          message: error.response.data?.message || "Server error",
          data: error.response.data,
        });

        return rejectWithValue(
          error.response.data?.message || "Failed to submit application"
        );
      }

      // For client-side validation errors or network issues
      console.error("❌ Submit application client error:", error.message);
      return rejectWithValue(error.message || "Failed to submit application");
    }
  }
);

export const getUserApplications = createAsyncThunk(
  "applications/getUserApplications",
  async (
    {
      page = 1,
      limit = 10,
      status,
      sortBy = "appliedAt",
      sortOrder = "desc",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      console.log("📋 Fetching user applications with filters:", {
        page,
        limit,
        status,
        sortBy,
        sortOrder,
      });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (status) params.append("status", status);

      const response = await axiosInstance.get(`/my-applications?${params}`);

      console.log("✅ User applications fetched:", {
        total: response.data.data.pagination.total,
        currentPage: response.data.data.pagination.page,
        applications: response.data.data.applications.length,
      });

      return response.data.data;
    } catch (error) {
      console.error("❌ Get user applications error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch applications"
      );
    }
  }
);

export const getJobApplications = createAsyncThunk(
  "applications/getJobApplications",
  async (
    {
      jobId,
      page = 1,
      limit = 10,
      status,
      sortBy = "appliedAt",
      sortOrder = "desc",
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("📋 Fetching job applications:", {
        jobId,
        page,
        limit,
        status,
      });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (status) params.append("status", status);

      const response = await axiosInstance.get(`/job/${jobId}?${params}`);

      console.log("✅ Job applications fetched:", {
        total: response.data.data.pagination.total,
        statusCounts: response.data.data.statusCounts,
      });

      return response.data.data;
    } catch (error) {
      console.error("❌ Get job applications error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job applications"
      );
    }
  }
);

export const getApplicationById = createAsyncThunk(
  "applications/getApplicationById",
  async (applicationId, { rejectWithValue }) => {
    try {
      console.log("📄 Fetching application by ID:", applicationId);

      const response = await axiosInstance.get(`/${applicationId}`);

      console.log("✅ Application details fetched:", {
        applicationId: response.data.data._id,
        status: response.data.data.status,
        jobTitle: response.data.data.job?.values?.title,
      });

      return response.data.data;
    } catch (error) {
      console.error("❌ Get application by ID error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch application details"
      );
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async ({ applicationId, status, notes, rating }, { rejectWithValue }) => {
    try {
      console.log("🔄 Updating application status:", {
        applicationId,
        status,
        hasNotes: !!notes,
        rating,
      });

      const response = await axiosInstance.put(`/${applicationId}/status`, {
        status,
        notes,
        rating,
      });

      console.log("✅ Application status updated:", {
        applicationId,
        newStatus: response.data.data.status,
      });

      return response.data.data;
    } catch (error) {
      console.error(
        "❌ Update application status error:",
        error.response?.data
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to update application status"
      );
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  "applications/withdrawApplication",
  async (applicationId, { rejectWithValue }) => {
    try {
      console.log("🗑️ Withdrawing application:", applicationId);

      await axiosInstance.delete(`/${applicationId}`);

      console.log("✅ Application withdrawn successfully");

      return applicationId;
    } catch (error) {
      console.error("❌ Withdraw application error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to withdraw application"
      );
    }
  }
);

export const getApplicationStats = createAsyncThunk(
  "applications/getApplicationStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📊 Fetching application statistics");

      const response = await axiosInstance.get("/stats");

      console.log("✅ Application stats fetched:", {
        asApplicant: response.data.data.asApplicant.length,
        asJobOwner: response.data.data.asJobOwner.length,
        totalJobsPosted: response.data.data.totalJobsPosted,
      });

      return response.data.data;
    } catch (error) {
      console.error("❌ Get application stats error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch application statistics"
      );
    }
  }
);

const initialState = {
  userApplications: [],
  jobApplications: [],
  currentApplication: null,
  applicationStats: null,
  statusCounts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  submitLoading: false,
  updateLoading: false,
  error: null,
  submitError: null,
  updateError: null,
  submitSuccess: false,
  updateSuccess: false,
  lastFetchTime: 0,
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.submitError = null;
      state.updateError = null;
    },
    clearSuccess: (state) => {
      state.submitSuccess = false;
      state.updateSuccess = false;
    },
    resetApplications: () => {
      return { ...initialState };
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
    },
    updateApplicationInList: (state, action) => {
      const updatedApplication = action.payload;

      const userAppIndex = state.userApplications.findIndex(
        (app) => app._id === updatedApplication._id
      );
      if (userAppIndex !== -1) {
        state.userApplications[userAppIndex] = updatedApplication;
      }

      const jobAppIndex = state.jobApplications.findIndex(
        (app) => app._id === updatedApplication._id
      );
      if (jobAppIndex !== -1) {
        state.jobApplications[jobAppIndex] = updatedApplication;
      }

      if (state.currentApplication?._id === updatedApplication._id) {
        state.currentApplication = updatedApplication;
      }
    },
    removeApplicationFromList: (state, action) => {
      const applicationId = action.payload;

      state.userApplications = state.userApplications.filter(
        (app) => app._id !== applicationId
      );
      state.jobApplications = state.jobApplications.filter(
        (app) => app._id !== applicationId
      );

      if (state.currentApplication?._id === applicationId) {
        state.currentApplication = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitJobApplication.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitJobApplication.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.userApplications.unshift(action.payload);
        state.submitError = null;
      })
      .addCase(submitJobApplication.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
        state.submitSuccess = false;
      })

      .addCase(getUserApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.userApplications = action.payload.applications;
        state.pagination = action.payload.pagination;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(getUserApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getJobApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.jobApplications = action.payload.applications;
        state.statusCounts = action.payload.statusCounts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
        state.error = null;
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateApplicationStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.updateError = null;

        applicationsSlice.caseReducers.updateApplicationInList(state, action);
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      .addCase(withdrawApplication.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;

        applicationsSlice.caseReducers.removeApplicationFromList(state, action);
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      .addCase(getApplicationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplicationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStats = action.payload;
        state.error = null;
      })
      .addCase(getApplicationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearErrors,
  clearSuccess,
  resetApplications,
  setCurrentApplication,
  updateApplicationInList,
  removeApplicationFromList,
} = applicationsSlice.actions;

export const selectApplicationsLoading = (state) => state.applications.loading;
export const selectSubmitLoading = (state) => state.applications.submitLoading;
export const selectUpdateLoading = (state) => state.applications.updateLoading;
export const selectUserApplications = (state) =>
  state.applications.userApplications;
export const selectJobApplications = (state) =>
  state.applications.jobApplications;
export const selectCurrentApplication = (state) =>
  state.applications.currentApplication;
export const selectApplicationStats = (state) =>
  state.applications.applicationStats;
export const selectApplicationsPagination = (state) =>
  state.applications.pagination;
export const selectStatusCounts = (state) => state.applications.statusCounts;

export default applicationsSlice.reducer;
