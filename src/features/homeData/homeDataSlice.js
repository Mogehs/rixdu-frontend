import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Initial state
const initialState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchHomeData = createAsyncThunk(
  'homeData/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      const homeData = {};

      // Fetch and sort categories by 'index'
      const categoriesQuery = query(
        collection(db, 'Categories'),
        orderBy('index')
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);

      const categories = await Promise.all(
        categoriesSnapshot.docs.map(async (doc) => {
          const categoryData = doc.data();
          const categoryId = categoryData.id;

          // Fetch up to 5 subcategories from the nested subcollection
          const subCategoriesRef = collection(
            db,
            'TopLevelSubCategories',
            categoryId,
            'subCategories'
          );
          const subCategoriesQuery = query(subCategoriesRef, limit(5));

          const subCategoriesSnapshot = await getDocs(subCategoriesQuery);

          const subCategories = subCategoriesSnapshot.docs.map((subDoc) => ({
            ...subDoc.data(),
          }));

          return {
            name: categoryData.name,
            image: categoryData.image,
            subCategories,
          };
        })
      );
      // console.log(`printing full data , ${JSON.stringify(categories)}`);
      homeData.categories = categories;

      return homeData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the slice
const homeDataSlice = createSlice({
  name: 'homeData',
  initialState,
  reducers: {
    clearHomeData: (state) => {
      state.categories = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearHomeData } = homeDataSlice.actions;
export default homeDataSlice.reducer;
