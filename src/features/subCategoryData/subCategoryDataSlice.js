import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSubCategories, fetchCategoriesAds } from '../firebaseServices';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Initial state
const initialState = {
    subCategoriesData: [],
    adsData: [],
    isLoading: false,
    isAdsLoading: false,
    error: null,
    adsError: null,
};

export const fetchSubCategoryData = createAsyncThunk(
    'subCategoryData/fetchSubCategoryData',
    async({ categoryName }, { rejectWithValue }) => {
        try {
            const categoryRef = doc(db, 'Categories', categoryName);

            // Fetch the document
            const categorySnapshot = await getDoc(categoryRef);

            if (!categorySnapshot.exists()) {
                throw new Error(`Category with ID ${categoryName} not found`);
            }

            // Get the category data
            const categoryData = categorySnapshot.data();
            console.log(`Category ID: ${categoryData.id}`, categoryData);
            // Now fetch subcategories using the category ID
            const subCategoriesData = await fetchSubCategories({
                collectionName: 'TopLevelSubCategories',
                parentId: categoryData.id,
            });

            return { subCategoriesData };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCategoryAdsData = createAsyncThunk(
    'subCategoryData/fetchCategoryAdsData',
    async({ categoryName }, { rejectWithValue }) => {
        try {
            // Fetch ads data using the category name
            const adsData = await fetchCategoriesAds({ categoryName });
            console.log('Fetched category ads:', adsData);
            return { adsData };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Create the slice
const subCategoryDataSlice = createSlice({
    name: 'subCategory',
    initialState,
    reducers: {
        clearHomeData: (state) => {
            state.subCategoriesData = [];
            state.adsData = [];
            state.error = null;
            state.adsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // SubCategory data reducers
            .addCase(fetchSubCategoryData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubCategoryData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subCategoriesData = action.payload.subCategoriesData;
            })
            .addCase(fetchSubCategoryData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Category ads data reducers
            .addCase(fetchCategoryAdsData.pending, (state) => {
                state.isAdsLoading = true;
                state.adsError = null;
            })
            .addCase(fetchCategoryAdsData.fulfilled, (state, action) => {
                state.isAdsLoading = false;
                state.adsData = action.payload.adsData;
            })
            .addCase(fetchCategoryAdsData.rejected, (state, action) => {
                state.isAdsLoading = false;
                state.adsError = action.payload;
            });
    },
});

// Export actions and reducer
export const { clearHomeData } = subCategoryDataSlice.actions;
export default subCategoryDataSlice.reducer;