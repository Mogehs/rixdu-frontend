import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Async thunk to fetch a single ad detail from Firebase
export const fetchAdDetail = createAsyncThunk(
    'adDetail/fetchAdDetail',
    async(adId, { rejectWithValue }) => {
        try {
            const adRef = doc(db, 'Ads', adId);
            const adSnap = await getDoc(adRef);

            if (adSnap.exists()) {
                const adData = {
                    id: adSnap.id,
                    ...adSnap.data()
                };
                return adData;
            } else {
                return rejectWithValue('Ad not found');
            }
        } catch (error) {
            console.error('Error fetching ad detail:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    adDetail: null,
    loading: false,
    error: null,
};

const adDetailSlice = createSlice({
    name: 'adDetail',
    initialState,
    reducers: {
        resetAdDetail: (state) => {
            state.adDetail = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdDetail.fulfilled, (state, action) => {
                state.adDetail = action.payload;
                state.loading = false;
            })
            .addCase(fetchAdDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetAdDetail } = adDetailSlice.actions;
export default adDetailSlice.reducer;