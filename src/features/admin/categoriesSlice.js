import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/categories`;

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `Category API Request: [${config.method.toUpperCase()}] ${
        config.baseURL
      }${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Category API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `Category API Response: [${response.status}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error("Category API Response Error:", error);
    return Promise.reject(error);
  }
);

// Async thunks for category operations
export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchCategoryTree",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/store/${storeId}/tree`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category tree"
      );
    }
  }
);

export const fetchCategoriesByStore = createAsyncThunk(
  "categories/fetchCategoriesByStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/store/${storeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories by store"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (
    { storeId, parent, isLeaf, page = 1, limit = 50 },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (storeId) params.append("storeId", storeId);
      if (parent !== undefined) params.append("parent", parent);
      if (isLeaf !== undefined) params.append("isLeaf", isLeaf);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axiosInstance.get(`/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/${categoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category by ID"
      );
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async ({ slug, storeId }, { rejectWithValue }) => {
    try {
      const params = storeId ? `?storeId=${storeId}` : "";
      const response = await axiosInstance.get(`/slug/${slug}${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category by slug"
      );
    }
  }
);

export const fetchCategoryChildrenBySlug = createAsyncThunk(
  "categories/fetchCategoryChildrenBySlug",
  async ({ slug, storeId }, { rejectWithValue }) => {
    try {
      const params = storeId ? `?storeId=${storeId}` : "";
      const response = await axiosInstance.get(
        `slug/${slug}/children${params}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("storeId", categoryData.storeId);
      formData.append("name", categoryData.name);
      formData.append("isLeaf", categoryData.isLeaf);

      if (categoryData.parent) {
        formData.append("parent", categoryData.parent);
      }

      if (categoryData.fields && categoryData.fields.length > 0) {
        formData.append("fields", JSON.stringify(categoryData.fields));
      }

      if (categoryData.icon) {
        formData.append("icon", categoryData.icon);
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      let response;
      if (categoryData.icon) {
        // Use FormData if uploading an icon
        const formData = new FormData();
        if (categoryData.name) formData.append("name", categoryData.name);
        if (categoryData.isLeaf !== undefined)
          formData.append("isLeaf", String(categoryData.isLeaf));
        if (categoryData.fields) {
          formData.append("fields", JSON.stringify(categoryData.fields));
        }
        formData.append("icon", categoryData.icon);
        response = await axios.put(`${API_URL}/${categoryId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } else {
        // Use JSON if not uploading an icon
        response = await axios.put(
          `${API_URL}/${categoryId}`,
          {
            ...categoryData,
            isLeaf:
              categoryData.isLeaf !== undefined
                ? categoryData.isLeaf
                : undefined,
            fields: categoryData.fields,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/${categoryId}`);
      return categoryId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const searchCategories = createAsyncThunk(
  "categories/searchCategories",
  async (
    { q, storeSlug, isLeaf, level, page = 1, limit = 20 },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (storeSlug) params.append("storeSlug", storeSlug);
      if (isLeaf !== undefined) params.append("isLeaf", isLeaf);
      if (level !== undefined) params.append("level", level);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axiosInstance.get(`/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search categories"
      );
    }
  }
);

export const getCategoryPath = createAsyncThunk(
  "categories/getCategoryPath",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/path/${categoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get category path"
      );
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  categoryPath: [],
  searchResults: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    pages: 1,
    limit: 50,
    total: 0,
  },
};

// Categories slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    resetCategories: (state) => {
      state.categories = [];
      state.categoryTree = [];
      state.currentCategory = null;
      state.categoryPath = [];
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch category tree
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTree = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch categories by store
      .addCase(fetchCategoriesByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByStore.fulfilled, (state, action) => {
        state.loading = false;
        // The response structure is different: data.categories instead of just data
        state.categories = action.payload.data?.categories || [];
        state.error = null;
      })
      .addCase(fetchCategoriesByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch category by slug
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch category children by slug
      .addCase(fetchCategoryChildrenBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryChildrenBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCategoryChildrenBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload.data);
        state.success = true;
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (cat) => cat._id === action.payload.data._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
        if (
          state.currentCategory &&
          state.currentCategory._id === action.payload.data._id
        ) {
          state.currentCategory = action.payload.data;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
        // Remove from categoryTree recursively
        function removeFromTree(tree, id) {
          return tree
            .filter((node) => node._id !== id)
            .map((node) => ({
              ...node,
              children: node.children ? removeFromTree(node.children, id) : [],
            }));
        }
        state.categoryTree = removeFromTree(state.categoryTree, action.payload);
        if (
          state.currentCategory &&
          state.currentCategory._id === action.payload
        ) {
          state.currentCategory = null;
        }
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search categories
      .addCase(searchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data || [];
        state.error = null;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get category path
      .addCase(getCategoryPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryPath.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryPath = action.payload.data || [];
        state.error = null;
      })
      .addCase(getCategoryPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentCategory,
  clearCurrentCategory,
  clearSearchResults,
  resetCategories,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
