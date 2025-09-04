import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import HeaderOnlyLayout from "../components/layout/HeaderOnlyLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

// General Pages
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "../pages/error/NotFoundPage";
import AboutPage from "../pages/about/AboutPage";
import ContactUsPage from "../pages/contact/ContactUsPage";
import ChatPage from "../pages/chat/ChatPage";
import ExploreProjectsPage from "../pages/explore/ExploreProjectsPage";
import EmirateCategoriesPage from "../pages/emirate/EmirateCategoriesPage";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyMethod from "../pages/auth/VerifyMethod";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Property Pages
import CategoryPage from "../pages/category/CategoryPage";
import CategoryListingPage from "../pages/category/CategoryListingPage";
import CategoryDetailPage from "../pages/category/CategoryDetailPage";

// Jobs Pages
import JobsMainPage from "../pages/jobs/JobsMainPage";
import JobsCategoriesPage from "../pages/jobs/JobsCategoriesPage";
import JobDetailPage from "../pages/jobs/JobDetailPage";
import JobApplicationPage from "../pages/jobs/JobApplicationPage";

// Hire Talent Pages
import HireTalentDashboard from "../pages/hire-talent/HireTalentDashboard";
import TalentDetailPage from "../pages/hire-talent/TalentDetailPage";

// Profile Pages
import ProfileLandingPage from "../pages/profile/ProfileLandingPage";
import MyProfilePage from "../pages/profile/MyProfilePage";
import PublicProfilePage from "../pages/profile/PublicProfilePage";
import ProfileAddressPage from "../pages/profile/ProfileAddressPage";
import ProfileAddressAddPage from "../pages/profile/ProfileAddressAddPage";
import JobProfilePage from "../pages/profile/JobProfilePage";

// Notifications Pages
import AllNotificationsPage from "../pages/notifications/AllNotificationsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";

// Listing Pages
import CreateListingPage from "../pages/listing/CreateListingPage";
import ListingDetailsPage from "../pages/listing/ListingDetailsPage";
import ListingPreviewPage from "../pages/listing/ListingPreviewPage";
import FavoriteCategoriesPage from "../pages/favorites/FavoriteCategoriesPage.jsx";

import BookMarkPage from "../pages/bookmark/BookMarkPage";
import FavoritesPage from "../pages/favorites/FavoritesPage.jsx";

// Place Ad Pages
import SelectCityPage from "../pages/place-ad/SelectCityPage";
import SelectCategoryPage from "../pages/place-ad/SelectCategoryPage";
import SelectSubcategoryPage from "../pages/place-ad/SelectSubcategoryPage";
import CreateAdFormPage from "../pages/place-ad/CreateAdFormPage";
import SafetyPlanPage from "../pages/place-ad/SafetyPlanPage";
import SelectPlanPage from "../pages/place-ad/SelectPlanPage";
import SuccessPage from "../pages/place-ad/SuccessPage";
import FailurePage from "../pages/place-ad/FailurePage";

// Health Care Pages
import {
  HealthLanding,
  DoctorProfile,
  ServicesListing,
  ServiceDetailPage,
} from "../pages/health-care";

// Garage Pages
import {
  GarageService,
  GarageProfile,
  GarageServiceDetail,
} from "../pages/garage";
import Main from "../pages/admin/Main.jsx";
import Subcategory from "../pages/place-ad/Subcategory.jsx";
import GarageCreate from "../pages/garage/GarageCreate.jsx";
import AllGarages from "../pages/garage/AllGarages.jsx";
import AppointmentsPage from "../pages/appointments/AppointmentPage.jsx";
import PublicProfileView from "../pages/profile/PublicProfileView.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about-us" element={<AboutPage />} />
        <Route path="contact-us" element={<ContactUsPage />} />
        <Route path="explore" element={<ExploreProjectsPage />} />
        <Route path="category/:name" element={<CategoryPage />}></Route>
        <Route path="all-listings" element={<CategoryListingPage />} />
        <Route path="ad/:id" element={<CategoryDetailPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="public-profile/:id?" element={<PublicProfileView />} />

        {/* Emirates Categories Page */}
        <Route path="emirate/:emirate" element={<EmirateCategoriesPage />} />

        {/* Jobs Routes */}
        <Route path="jobs">
          <Route path="main" element={<JobsMainPage />} />
          {/* <Route path="categories" element={<JobsCategoriesPage />} /> */}
          <Route path="categories" element={<JobsCategoriesPage />} />
          <Route path="detail/:id" element={<JobDetailPage />} />
          <Route path="apply/:id" element={<JobApplicationPage />} />
        </Route>

        {/* Hire Talent Routes */}
        <Route path="hire-talent">
          <Route path=":slug" element={<HireTalentDashboard />} />
          <Route path=":slug/:category" element={<HireTalentDashboard />} />
          <Route
            path=":category/:subcategory"
            element={<HireTalentDashboard />}
          />
          <Route path="detail/:id" element={<TalentDetailPage />} />
        </Route>

        {/* health care services */}

        <Route path="health-care">
          <Route index element={<HealthLanding />} />
          <Route path="doctor/:id" element={<DoctorProfile />} />
          <Route path="specialist/:slug" element={<DoctorProfile />} />
          <Route path="services" element={<ServicesListing />} />
          <Route
            path="services/category/:categorySlug"
            element={<ServicesListing />}
          />
          {/* <Route path="services/:id" element={<ServiceDetailPage />} /> */}
        </Route>

        {/* garage routes */}

        <Route path="garage">
          <Route index element={<GarageService />} />
          <Route path="all-garages" element={<AllGarages />} />
          <Route path="all-services" element={<AllGarages />} />
          <Route path="create" element={<GarageCreate />} />
          <Route path="create/:slug" element={<GarageCreate />} />
          <Route path=":garageId" element={<GarageProfile />} />
          <Route
            path=":garageId/service/:serviceId"
            element={<GarageServiceDetail />}
          />
          <Route path="service/:serviceId" element={<GarageServiceDetail />} />
        </Route>
      </Route>

      <Route path="/dashboard/admin" element={<Main />} />

      {/* Profile Landing Page - Header Only */}
      <Route element={<HeaderOnlyLayout />}>
        {/* Chat Route - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="chat/:id?" element={<ChatPage />} />
        </Route>

        <Route
          path="profile"
          element={<Navigate to="/dashboard/my-profile/profile" />}
        />
        <Route path="profile/public/:id" element={<PublicProfilePage />} />

        {/* Place Ad Routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="edit-listing/:id" element={<CreateAdFormPage />} />
          <Route path="place-ad">
            <Route index element={<SelectCityPage />} />
            <Route path=":city" element={<SelectCategoryPage />} />
            <Route path=":city/:category" element={<SelectSubcategoryPage />} />
            <Route
              path=":city/:category/*"
              element={<SelectSubcategoryPage />}
            />

            <Route
              path="/place-ad/:city/:category/subcategory/*"
              element={<Subcategory />}
            />

            <Route
              path="form/:city/:category/*"
              element={<CreateAdFormPage />}
            />
            <Route path="safety-plan" element={<SafetyPlanPage />} />
            <Route path="select-plan" element={<SelectPlanPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="failure" element={<FailurePage />} />
          </Route>
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="auth">
          <Route path="verify-method" element={<VerifyMethod />} />
          <Route path="verify-otp" element={<VerifyOtp />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Job Profile Route - Outside Dashboard Layout but Protected */}
        <Route path="dashboard/job-profile" element={<JobProfilePage />} />

        <Route element={<DashboardLayout />}>
          {/* My Profile Routes */}
          <Route path="dashboard/my-profile">
            <Route path="profile" element={<MyProfilePage />} />
            <Route path="address" element={<ProfileAddressPage />} />
            <Route path="address/add" element={<ProfileAddressAddPage />} />
          </Route>

          {/* Public Profile Routes */}
          <Route
            path="dashboard/public-profile"
            element={<PublicProfilePage />}
          />

          {/* Notifications Routes */}
          <Route
            path="dashboard/notifications/all"
            element={<AllNotificationsPage />}
          />

          {/* Favorites Routes */}
          <Route path="dashboard/favorites">
            <Route path="categories" element={<FavoriteCategoriesPage />} />
          </Route>

          {/* Doctor Appointment Routes */}
          <Route
            path="dashboard/doctor-appointment"
            element={<AppointmentsPage />}
          />

          {/* Bookmark Routes */}
          <Route path="dashboard/bookmarks" element={<BookMarkPage />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
