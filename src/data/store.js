import { configureStore } from "@reduxjs/toolkit";
import homeDataReducer from "../features/homeData/homeDataSlice";
import subCategoryDataReducer from "../features/subCategoryData/subCategoryDataSlice";
import categoryListingReducer from "../features/categoryListing/categoryListingSlice";
import adDetailReducer from "../features/adDetail/adDetailSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";
import authReducer from "../features/auth/authSlice";
import personalProfileReducer from "../features/profile/personalProfileSlice";
import jobProfileReducer from "../features/profile/jobProfileSlice";
import chatsReducer from "../features/chats/chatsSlice";
import messagesReducer from "../features/chats/messagesSlice";
import profileReducer from "../features/profile/profileSlice";
import publicProfileReducer from "../features/profile/publicProfileSlice";
import adminStoresReducer from "../features/admin/storesSlice";
import adminCategoriesReducer from "../features/admin/categoriesSlice";
import adminPricePlansReducer from "../features/admin/pricePlansSlice";
import listingsReducer from "../features/listings/listingsSlice";
import draftReducer from "../features/listings/draftSlice";
import garageReducer from "../features/garage/garageSlice";
import applicationsReducer from "../features/applications/applicationsSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import bookingsReducer from "../features/bookings/bookingsSlice";
import ratingsReducer from "../features/ratings/ratingsSlice";
import paymentReducer from "../features/payment/paymentSlice";

const store = configureStore({
  reducer: {
    homeData: homeDataReducer,
    subCategory: subCategoryDataReducer,
    categoryListing: categoryListingReducer,
    adDetail: adDetailReducer,
    favorites: favoritesReducer,
    auth: authReducer,
    personalProfile: personalProfileReducer,
    jobProfile: jobProfileReducer,
    chats: chatsReducer,
    messages: messagesReducer,
    profile: profileReducer,
    publicProfile: publicProfileReducer,
    adminStores: adminStoresReducer,
    adminCategories: adminCategoriesReducer,
    adminPricePlans: adminPricePlansReducer,
    listings: listingsReducer,
    draft: draftReducer,
    garage: garageReducer,
    applications: applicationsReducer,
    notifications: notificationsReducer,
    bookings: bookingsReducer,
    ratings: ratingsReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
