import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/garages`;

// Axios instance with auth + logging like other slices
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    // optional debug
    // console.log(`API Request: [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Public thunks
export const getAllGarages = createAsyncThunk(
  "garage/getAllGarages",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const path = query ? `/all?${query}` : "/all";
      const response = await axiosInstance.get(path);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch garages" }
      );
    }
  }
);

export const getTopRatedGarages = createAsyncThunk(
  "garage/getTopRatedGarages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/top-rated");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch top rated garages" }
      );
    }
  }
);

export const searchGarages = createAsyncThunk(
  "garage/searchGarages",
  async (searchParams = {}, { rejectWithValue }) => {
    try {
      const { slugPath, ...others } = searchParams;
      let path = "/search";
      if (slugPath) path = `/search/${slugPath}`;
      const query = new URLSearchParams(others).toString();
      const full = query ? `${path}?${query}` : path;
      const response = await axiosInstance.get(full);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to search garages" }
      );
    }
  }
);

export const getGarageBySlug = createAsyncThunk(
  "garage/getGarageBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${slug}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch garage" }
      );
    }
  }
);

export const getGarageServices = createAsyncThunk(
  "garage/getGarageServices",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${slug}/services`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch garage services" }
      );
    }
  }
);

// Protected thunks (require token)
export const createGarage = createAsyncThunk(
  "garage/createGarage",
  async (garageData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/", garageData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to create garage" }
      );
    }
  }
);

export const updateGarage = createAsyncThunk(
  "garage/updateGarage",
  async ({ slug, garageData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/${slug}`, garageData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to update garage" }
      );
    }
  }
);

export const getGarageDashboard = createAsyncThunk(
  "garage/getGarageDashboard",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${slug}/dashboard`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch garage dashboard" }
      );
    }
  }
);

export const uploadGarageImages = createAsyncThunk(
  "garage/uploadGarageImages",
  async ({ slug, files, type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("type", type);
      (files || []).forEach((file) => formData.append("images", file));
      const response = await axiosInstance.post(
        `/${slug}/upload-images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to upload images" }
      );
    }
  }
);

export const deleteGarageImages = createAsyncThunk(
  "garage/deleteGarageImages",
  async ({ slug, type, publicIds = [], urls = [] }, { rejectWithValue }) => {
    try {
      const body = { type };
      if (publicIds && publicIds.length) body.publicIds = publicIds;
      if (urls && urls.length) body.urls = urls;
      const response = await axiosInstance.delete(`/${slug}/images`, {
        data: body,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to delete images" }
      );
    }
  }
);

export const addService = createAsyncThunk(
  "garage/addService",
  async ({ slug, service }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/${slug}/services`, service);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to add service" }
      );
    }
  }
);

export const updateService = createAsyncThunk(
  "garage/updateService",
  async ({ slug, serviceId, service }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/${slug}/services/${serviceId}`,
        service
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to update service" }
      );
    }
  }
);

export const deleteService = createAsyncThunk(
  "garage/deleteService",
  async ({ slug, serviceId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/${slug}/services/${serviceId}`
      );
      return { ...response.data, deletedId: serviceId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to delete service" }
      );
    }
  }
);

const initialState = {
  garages: [],
  topRated: [],
  searchResults: [],
  currentGarage: null,
  services: [],
  dashboard: null,
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  uploading: false,
  error: null,
  validationErrors: [],
};

const garageSlice = createSlice({
  name: "garage",
  initialState,
  reducers: {
    clearGarageError: (state) => {
      state.error = null;
      state.validationErrors = [];
    },
    clearCurrentGarage: (state) => {
      state.currentGarage = null;
    },
    resetGarages: () => initialState,
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllGarages
      .addCase(getAllGarages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGarages.fulfilled, (state, action) => {
        state.loading = false;
        state.garages = action.payload.data;
        state.totalPages = action.payload.totalPages || state.totalPages;
        state.currentPage = action.payload.currentPage || state.currentPage;
        state.totalCount = action.payload.count || state.totalCount;
      })
      .addCase(getAllGarages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch garages";
      })

      // top rated
      .addCase(getTopRatedGarages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopRatedGarages.fulfilled, (state, action) => {
        state.loading = false;
        state.topRated = action.payload.data || action.payload;
      })
      .addCase(getTopRatedGarages.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch top rated garages";
      })

      // search
      .addCase(searchGarages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGarages.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data || action.payload;
      })
      .addCase(searchGarages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to search garages";
      })

      // get by slug
      .addCase(getGarageBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGarageBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGarage = action.payload.data;
      })
      .addCase(getGarageBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch garage";
      })

      // services
      .addCase(getGarageServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGarageServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data || action.payload;
      })
      .addCase(getGarageServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch services";
      })

      // create garage
      .addCase(createGarage.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(createGarage.fulfilled, (state, action) => {
        state.creating = false;
        // assume action.payload.data contains created garage
        const created = action.payload.data || action.payload;
        if (created) state.garages.unshift(created);
      })
      .addCase(createGarage.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to create garage";
        state.validationErrors = action.payload?.errors || [];
      })

      // update garage
      .addCase(updateGarage.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(updateGarage.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload.data || action.payload;
        if (!updated) return;
        const idx = state.garages.findIndex((g) => g._id === updated._id);
        if (idx !== -1) state.garages[idx] = updated;
        if (state.currentGarage && state.currentGarage._id === updated._id) {
          state.currentGarage = updated;
        }
      })
      .addCase(updateGarage.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update garage";
        state.validationErrors = action.payload?.errors || [];
      })

      // dashboard
      .addCase(getGarageDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGarageDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data || action.payload;
      })
      .addCase(getGarageDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch dashboard";
      })

      // upload images
      .addCase(uploadGarageImages.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadGarageImages.fulfilled, (state, action) => {
        state.uploading = false;
        // update current garage images if returned
        const updated = action.payload.data || action.payload;
        if (
          updated &&
          state.currentGarage &&
          updated._id === state.currentGarage._id
        ) {
          state.currentGarage = updated;
        }
      })
      .addCase(uploadGarageImages.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload?.message || "Failed to upload images";
      })

      // add service
      .addCase(addService.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.creating = false;
        const service = action.payload.data || action.payload;
        if (service) state.services.push(service);
      })
      .addCase(addService.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to add service";
      })

      // update service
      .addCase(updateService.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updating = false;
        const service = action.payload.data || action.payload;
        if (service) {
          const idx = state.services.findIndex((s) => s._id === service._id);
          if (idx !== -1) state.services[idx] = service;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update service";
      })

      // delete service
      .addCase(deleteService.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload.deletedId;
        state.services = state.services.filter((s) => s._id !== deletedId);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message || "Failed to delete service";
      });

    // delete images
    builder
      .addCase(deleteGarageImages.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteGarageImages.fulfilled, (state, action) => {
        state.deleting = false;
        const updated = action.payload.data || action.payload;
        if (
          updated &&
          state.currentGarage &&
          updated._id === state.currentGarage._id
        ) {
          state.currentGarage = updated;
        }
      })
      .addCase(deleteGarageImages.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message || "Failed to delete images";
      });
  },
});

export const {
  clearGarageError,
  clearCurrentGarage,
  resetGarages,
  setCurrentPage,
} = garageSlice.actions;

// selectors
export const selectGarages = (state) => state.garage.garages;
export const selectTopRatedGarages = (state) => state.garage.topRated;
export const selectSearchGarages = (state) => state.garage.searchResults;
export const selectCurrentGarage = (state) => state.garage.currentGarage;
export const selectGarageServices = (state) => state.garage.services;
export const selectGarageDashboard = (state) => state.garage.dashboard;
export const selectGarageLoading = (state) => state.garage.loading;
export const selectGarageCreating = (state) => state.garage.creating;
export const selectGarageUpdating = (state) => state.garage.updating;
export const selectGarageDeleting = (state) => state.garage.deleting;
export const selectGarageUploading = (state) => state.garage.uploading;
export const selectGarageError = (state) => state.garage.error;
export const selectGarageValidationErrors = (state) =>
  state.garage.validationErrors;
export const selectGarageTotalPages = (state) => state.garage.totalPages;
export const selectGarageCurrentPage = (state) => state.garage.currentPage;
export const selectGarageTotalCount = (state) => state.garage.totalCount;

export default garageSlice.reducer;
