import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import BookingModal from "../../components/common/BookingModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import GoogleMapComponent from "../../components/common/Map/GoogleMap";
import ModernCalendar from "../../components/common/ModernCalendar";
import ReviewForm from "../../components/common/ReviewForm";
import { FaMapMarkerAlt, FaClock, FaStar, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineVerifiedUser, MdWorkspacePremium } from "react-icons/md";
import { doctorcardImage } from "../../assets";
import CarouselSpecialists from "./CarouselSpecialists";
import {
  getListing,
  selectCurrentListing,
  selectListingsLoading,
  getHealthcareListings,
  selectHealthcareListings,
} from "../../features/listings/listingsSlice";
import {
  createBooking,
  getAvailableSlots,
  selectAvailableSlots,
  selectAllSlots,
  selectSlotsLoading,
  selectCreatingBooking,
  checkDateAvailability,
  selectDateAvailability,
  selectCheckingAvailability,
  clearDateAvailability,
} from "../../features/bookings/bookingsSlice";
import {
  createRating,
  getUserRatings,
  selectUserRatings,
  selectRatingsCreating,
  selectRatingsError,
  selectRatingsCreateSuccess,
  selectAverageRating,
  selectTotalRatings,
  clearCreateSuccess,
} from "../../features/ratings/ratingsSlice";

const DoctorProfile = () => {
  const { id, slug } = useParams();
  const dispatch = useDispatch();

  // Use slug if available, otherwise use id
  const identifier = slug || id;

  // Redux state
  const currentListing = useSelector(selectCurrentListing);
  const listingsLoading = useSelector(selectListingsLoading);
  const healthcareListings = useSelector(selectHealthcareListings);
  const availableSlots = useSelector(selectAvailableSlots);
  const allSlots = useSelector(selectAllSlots);
  const slotsLoading = useSelector(selectSlotsLoading);
  const creatingBooking = useSelector(selectCreatingBooking);
  const dateAvailability = useSelector(selectDateAvailability);
  const checkingAvailability = useSelector(selectCheckingAvailability);

  // Ratings state
  const userRatings = useSelector(selectUserRatings);
  const ratingsCreating = useSelector(selectRatingsCreating);
  const ratingsError = useSelector(selectRatingsError);
  const ratingsCreateSuccess = useSelector(selectRatingsCreateSuccess);
  const averageRating = useSelector(selectAverageRating);
  const totalRatings = useSelector(selectTotalRatings);

  // Auth state
  const { user: authUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Calendar booking state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  // Booking modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  // Confirmation modal state
  const [isConfirmedOpen, setIsConfirmedOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Fetch listing data when component mounts
  useEffect(() => {
    if (identifier) {
      dispatch(getListing(identifier));
    }
    // Also fetch other healthcare listings for recommendations
    dispatch(getHealthcareListings({ limit: 4 }));
  }, [dispatch, identifier]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (currentListing?._id && selectedDate) {
      // Use local date formatting to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      dispatch(
        getAvailableSlots({
          listingId: currentListing._id,
          doctorId: currentListing.userId._id,
          date: dateString,
        })
      )
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch available slots:", error);
          toast.error(
            "Failed to load available time slots. Please try refreshing the page."
          );
        });
    }
  }, [
    dispatch,
    currentListing?._id,
    currentListing?.userId?._id,
    selectedDate,
  ]);

  // Create a memo for the month/year to avoid unnecessary API calls
  const currentMonthKey = useMemo(() => {
    if (!selectedDate) return "";
    return `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
  }, [selectedDate]);

  // Fetch date availability for calendar when doctor or month changes
  useEffect(() => {
    if (currentListing?._id && currentMonthKey) {
      // Clear previous availability data
      dispatch(clearDateAvailability());

      // Get the current month's start and end dates
      const now = new Date();
      const currentMonth = selectedDate || now;
      const currentMonthValue = currentMonth.getMonth();
      const currentYearValue = currentMonth.getFullYear();
      const startOfMonth = new Date(currentYearValue, currentMonthValue, 1);
      const endOfMonth = new Date(currentYearValue, currentMonthValue + 1, 0);

      // Add some buffer days for previous/next month visibility
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(endOfMonth);
      endDate.setDate(endDate.getDate() + 7);

      // Use local date formatting to avoid timezone issues
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      dispatch(
        checkDateAvailability({
          doctorId: currentListing._id,
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(endDate),
        })
      )
        .unwrap()
        .catch((error) => {
          console.error("Failed to check date availability:", error);
        });
    }
  }, [dispatch, currentListing?._id, currentMonthKey, selectedDate]);

  // Fetch user ratings when doctor changes
  useEffect(() => {
    if (currentListing?.userId?._id) {
      dispatch(
        getUserRatings({
          userId: currentListing.userId._id,
          listingId: currentListing._id,
          page: 1,
          limit: 10,
        })
      );
    }
  }, [dispatch, currentListing?.userId?._id, currentListing?._id]);

  // Handle rating creation success
  useEffect(() => {
    if (ratingsCreateSuccess) {
      toast.success("Review submitted successfully!");
      // Refresh ratings after successful creation
      if (currentListing?.userId?._id) {
        dispatch(
          getUserRatings({
            userId: currentListing.userId._id,
            listingId: currentListing._id,
            page: 1,
            limit: 10,
          })
        );
      }
      dispatch(clearCreateSuccess());
    }
  }, [
    ratingsCreateSuccess,
    dispatch,
    currentListing?.userId?._id,
    currentListing?._id,
  ]);

  // Handle rating submission
  const handleRatingSubmit = async (ratingData) => {
    if (!isAuthenticated) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (!currentListing?.userId?._id || !authUser?.id) {
      toast.error("Unable to submit review. Missing user information.");
      return;
    }

    try {
      await dispatch(
        createRating({
          reviewer: authUser.id,
          reviewee: currentListing.userId._id,
          stars: ratingData.stars,
          message: ratingData.message,
          listingId: currentListing._id,
          attributes: [],
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  // Helper function to get value from listing
  const getListingValue = (fieldName, fallback = "") => {
    try {
      const values = currentListing?.values;
      if (!values) return fallback;

      // Handle both Map objects and plain objects
      let value;
      if (values.get && typeof values.get === "function") {
        value = values.get(fieldName);
      } else {
        value = values[fieldName];
      }

      return value !== undefined && value !== null ? value : fallback;
    } catch {
      return fallback;
    }
  };

  // Helper function to get value from any listing (for recommendations)
  const getListingValueFromListing = (listing, fieldName, fallback = "") => {
    try {
      const values = listing?.values;
      if (!values) return fallback;

      // Handle both Map objects and plain objects
      let value;
      if (values.get && typeof values.get === "function") {
        value = values.get(fieldName);
      } else {
        value = values[fieldName];
      }

      return value !== undefined && value !== null ? value : fallback;
    } catch {
      return fallback;
    }
  };

  // Helper function to get image from listing
  const getListingImage = () => {
    try {
      const values = currentListing?.values;
      if (!values) return doctorcardImage;

      // Try to get image from profile field first, then other fields
      const imageFields = [
        "profile",
        "image",
        "images",
        "photo",
        "photos",
        "avatar",
        "picture",
      ];

      for (const field of imageFields) {
        let fieldValue;
        if (values.get && typeof values.get === "function") {
          fieldValue = values.get(field);
        } else {
          fieldValue = values[field];
        }

        if (fieldValue) {
          if (typeof fieldValue === "string") return fieldValue;
          if (fieldValue.url) return fieldValue.url;
          if (fieldValue.secure_url) return fieldValue.secure_url;
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            const firstImage = fieldValue[0];
            return typeof firstImage === "string"
              ? firstImage
              : firstImage?.url || firstImage?.secure_url;
          }
        }
      }

      return doctorcardImage;
    } catch {
      return doctorcardImage;
    }
  };

  // Helper function to get image from any listing (for recommendations)
  const getListingImageFromListing = (listing) => {
    try {
      const values = listing?.values;
      if (!values) return doctorcardImage;

      // Try to get image from profile field first, then other fields
      const imageFields = [
        "profile",
        "image",
        "images",
        "photo",
        "photos",
        "avatar",
        "picture",
      ];

      for (const field of imageFields) {
        let fieldValue;
        if (values.get && typeof values.get === "function") {
          fieldValue = values.get(field);
        } else {
          fieldValue = values[field];
        }

        if (fieldValue) {
          if (typeof fieldValue === "string") return fieldValue;
          if (fieldValue.url) return fieldValue.url;
          if (fieldValue.secure_url) return fieldValue.secure_url;
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            const firstImage = fieldValue[0];
            return typeof firstImage === "string"
              ? firstImage
              : firstImage?.url || firstImage?.secure_url;
          }
        }
      }

      return doctorcardImage;
    } catch {
      return doctorcardImage;
    }
  };

  // Parse languages from string
  const parseLanguages = (languagesStr) => {
    try {
      if (!languagesStr) return ["English"];

      // Remove quotes and brackets, split by comma
      const cleanStr = languagesStr.replace(/[[\]"]/g, "");
      return cleanStr
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang);
    } catch {
      return ["English"];
    }
  };

  // Parse fee range
  const parseFeeRange = (feeStr) => {
    try {
      if (!feeStr) return { min: null, max: null, currency: "AED" };

      // Extract numbers and currency from string like "450AED-800AED"
      const match = feeStr.match(/(\d+)([A-Z]+)-(\d+)([A-Z]+)/);
      if (match) {
        return {
          min: parseInt(match[1]),
          max: parseInt(match[3]),
          currency: match[2],
        };
      }

      // Handle single fee value
      const singleMatch = feeStr.match(/(\d+)([A-Z]*)/);
      if (singleMatch) {
        return {
          min: parseInt(singleMatch[1]),
          max: null,
          currency: singleMatch[2] || "AED",
        };
      }

      return { min: null, max: null, currency: "AED" };
    } catch {
      return { min: null, max: null, currency: "AED" };
    }
  };

  // Format fee display
  const formatFeeDisplay = (feeRange) => {
    if (!feeRange.min) return "Fee varies";

    if (feeRange.max && feeRange.max !== feeRange.min) {
      return `${feeRange.min} - ${feeRange.max} ${feeRange.currency}`;
    }

    return `${feeRange.min} ${feeRange.currency}`;
  };

  // Parse working hours
  const parseWorkingHours = (workingHoursStr) => {
    try {
      if (!workingHoursStr) {
        return [
          { day: "Monday", time: "9 AM - 5 PM", closed: false },
          { day: "Tuesday", time: "9 AM - 5 PM", closed: false },
          { day: "Wednesday", time: "9 AM - 5 PM", closed: false },
          { day: "Thursday", time: "9 AM - 5 PM", closed: false },
          { day: "Friday", time: "9 AM - 2 PM", closed: false },
          { day: "Saturday", time: "Closed", closed: true },
          { day: "Sunday", time: "Closed", closed: true },
        ];
      }

      // Parse string like "Mon-Thu (9am-5pm) & Fri (9am-2pm)"
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const workingHours = [];

      // Extract Mon-Thu time pattern
      const monThuMatch = workingHoursStr.match(/Mon-Thu[^)]*\(([^)]+)\)/i);
      const monThuTime = monThuMatch
        ? monThuMatch[1].replace(/am|pm/gi, (m) => m.toUpperCase())
        : null;

      // Extract Friday time pattern
      const friMatch = workingHoursStr.match(/Fri[^)]*\(([^)]+)\)/i);
      const friTime = friMatch
        ? friMatch[1].replace(/am|pm/gi, (m) => m.toUpperCase())
        : null;

      // Extract Saturday time pattern
      const satMatch = workingHoursStr.match(/Sat[^)]*\(([^)]+)\)/i);
      const satTime = satMatch
        ? satMatch[1].replace(/am|pm/gi, (m) => m.toUpperCase())
        : null;

      // Extract Sunday time pattern
      const sunMatch = workingHoursStr.match(/Sun[^)]*\(([^)]+)\)/i);
      const sunTime = sunMatch
        ? sunMatch[1].replace(/am|pm/gi, (m) => m.toUpperCase())
        : null;

      days.forEach((day) => {
        if (
          ["Monday", "Tuesday", "Wednesday", "Thursday"].includes(day) &&
          monThuTime
        ) {
          // Mon-Thu means Monday through Thursday
          workingHours.push({
            day,
            time: monThuTime,
            closed: false,
          });
        } else if (day === "Friday" && friTime) {
          workingHours.push({
            day,
            time: friTime,
            closed: false,
          });
        } else if (day === "Saturday" && satTime) {
          workingHours.push({
            day,
            time: satTime,
            closed: false,
          });
        } else if (day === "Sunday" && sunTime) {
          workingHours.push({
            day,
            time: sunTime,
            closed: false,
          });
        } else {
          // Default to closed if no specific time mentioned
          workingHours.push({
            day,
            time: "Closed",
            closed: true,
          });
        }
      });

      return workingHours;
    } catch {
      return [
        { day: "Monday", time: "9 AM - 5 PM", closed: false },
        { day: "Tuesday", time: "9 AM - 5 PM", closed: false },
        { day: "Wednesday", time: "9 AM - 5 PM", closed: false },
        { day: "Thursday", time: "9 AM - 5 PM", closed: false },
        { day: "Friday", time: "9 AM - 2 PM", closed: false },
        { day: "Saturday", time: "Closed", closed: true },
        { day: "Sunday", time: "Closed", closed: true },
      ];
    }
  };

  // Calculate review breakdown from actual ratings data
  const calculateReviewBreakdown = (ratings) => {
    if (!ratings || ratings.length === 0) {
      // Return empty data if no ratings exist
      return [
        { star: 5, percent: 0, count: 0 },
        { star: 4, percent: 0, count: 0 },
        { star: 3, percent: 0, count: 0 },
        { star: 2, percent: 0, count: 0 },
        { star: 1, percent: 0, count: 0 },
      ];
    }

    const total = ratings.length;
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Count ratings for each star level
    ratings.forEach((rating) => {
      if (rating.stars >= 1 && rating.stars <= 5) {
        starCounts[rating.stars]++;
      }
    });

    // Calculate percentages
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: starCounts[star],
      percent: total > 0 ? Math.round((starCounts[star] / total) * 100) : 0,
    }));
  };

  // Get dynamic review breakdown
  const reviewBreakdown = calculateReviewBreakdown(userRatings);
  const doctorData = currentListing
    ? {
        name: getListingValue("name", "Healthcare Professional"),
        specialization:
          getListingValue("specialist type") ||
          getListingValue("specialization") ||
          currentListing.categoryId?.name ||
          "Healthcare",
        rating: parseFloat(getListingValue("rating", "4.8")),
        reviewsCount: parseInt(getListingValue("reviews", "0")),
        experience: getListingValue("experience", "1-2 Years"),
        languages: parseLanguages(getListingValue("languages")),
        education: getListingValue("education", "Professional Degree"),
        image: getListingImage(),
        clinicAddress:
          currentListing?.values?.location?.address ||
          currentListing?.location?.address ||
          getListingValue("location") ||
          "Location not specified",
        clinicCoordinates:
          currentListing?.values?.location?.coordinates ||
          currentListing?.location?.coordinates ||
          getListingValue("coordinates") ||
          null,
        workingHours: parseWorkingHours(getListingValue("working hours")),
        services: getListingValue(
          "services offer",
          "Professional healthcare services"
        )
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter((s) => s),
        about: getListingValue(
          "about",
          "Experienced healthcare professional dedicated to providing quality care."
        ),
        feeRange: parseFeeRange(getListingValue("fee")),
        serviceDetails: getListingValue(
          "service details",
          "Professional healthcare services"
        ),
        reviews: [
          {
            name: "Patient Review",
            rating: 5,
            date: "Recent",
            comment: "Great experience with professional care.",
          },
        ],
        reviewBreakdown: reviewBreakdown,
      }
    : null;

  // Transform healthcare listings for recommendations
  const transformedDoctors = healthcareListings
    .map((listing) => ({
      id: listing._id,
      name:
        getListingValueFromListing(listing, "doctorName") ||
        getListingValueFromListing(listing, "name") ||
        getListingValueFromListing(listing, "title") ||
        "Healthcare Professional",
      image: getListingImageFromListing(listing),
      specialty:
        getListingValueFromListing(listing, "specialty") ||
        getListingValueFromListing(listing, "specialist type") ||
        listing.categoryId?.name ||
        "Healthcare",
      location: listing?.values?.location?.address || listing?.city,
      experience: getListingValueFromListing(listing, "experience", "0"),
      fee:
        getListingValueFromListing(listing, "fee") ||
        getListingValueFromListing(listing, "minFee") ||
        "100",
      slug: listing.slug,
      // Badge information from listing model
      isVerified: listing.isVerified || false,
      isFeatured: listing.isFeatured || false,
      isPremium: listing.isPremium || false,
      plan: listing.plan || "free",
      paymentStatus: listing.paymentStatus || "pending",
    }))
    .filter((doc) => doc.id !== currentListing?._id); // Exclude current doctor

  if (listingsLoading) {
    return (
      <div className="section-container py-10 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="section-container py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Healthcare Professional Not Found
          </h2>
          <p className="text-gray-600">
            The requested healthcare professional could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Doctor Info, About, Services, Reviews */}
        <div className="md:col-span-2 space-y-8">
          {/* Doctor Info Card */}
          <div className="bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow">
            <div className="flex-shrink-0 flex justify-center items-center">
              <img
                src={doctorData.image}
                alt={doctorData.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 bg-white"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {doctorData.name}
                </h1>
                {/* Badges inline with name */}
                {currentListing?.isFeatured && (
                  <span className="flex items-center gap-1 bg-slate-800 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                    <FaStar className="text-sm" />
                    Featured
                  </span>
                )}
                {currentListing?.isPremium && !currentListing?.isFeatured && (
                  <span className="flex items-center gap-1 bg-slate-700 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                    <MdWorkspacePremium className="text-sm" />
                    Premium
                  </span>
                )}
                {currentListing?.isVerified && (
                  <span className="flex items-center gap-1 bg-[#DCFCE7] text-[#166534] px-2 py-1 rounded text-xs font-medium shadow-sm">
                    <MdOutlineVerifiedUser className="text-sm" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-blue-600 font-medium text-base mb-2 cursor-pointer hover:underline">
                {doctorData.specialization}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-2">
                <span className="flex items-center gap-1">
                  <FaStar className="text-[#FACC15]" />
                  <span className="font-semibold text-gray-800">
                    {averageRating || "No rating"}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({userRatings.length} reviews)
                  </span>
                </span>
                <span className="hidden md:inline-block">|</span>
                <span className="flex items-center gap-1">
                  {doctorData.experience} experience
                </span>
                <span className="hidden md:inline-block">|</span>
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  {formatFeeDisplay(doctorData.feeRange)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <FaMapMarkerAlt className="text-gray-400" />
                <span>{doctorData.clinicAddress}</span>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow transition"
                  onClick={() => setIsBookingOpen(true)}
                  disabled={creatingBooking}
                >
                  {creatingBooking ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl sm:p-6 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              About Dr. {doctorData.name.split(" ")[0]}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {doctorData.about}
            </p>
            <div className="bg-gray-50 rounded-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-y  divide-gray-200 ">
                <div>
                  <div className="flex flex-col  justify-center px-6 py-4">
                    <span className="font-semibold text-gray-800 mb-1">
                      Education
                    </span>
                  </div>
                  <div className="flex flex-col  justify-center px-6 py-4">
                    <span className="font-semibold text-gray-800 mb-1">
                      Experience
                    </span>
                  </div>
                  <div className="flex flex-col  justify-center px-6 py-4">
                    <span className="font-semibold text-gray-800 mb-1">
                      Languages Spoken
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col justify-center px-6 py-4">
                    <span className="text-gray-700">
                      {doctorData.education}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center px-6 py-4">
                    <span className="text-gray-700">
                      {doctorData.experience}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center px-6 py-4">
                    <span className="text-gray-700">
                      {doctorData.languages.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Services Offered
            </h2>
            <div className="flex flex-wrap gap-4 mt-2">
              {/* Render services from listing data */}
              <div className="flex flex-wrap gap-4 w-full">
                {doctorData.services.slice(0, 4).map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 min-w-[220px]"
                  >
                    <span className="bg-blue-100 rounded-full p-2">
                      {index === 0 && <FaStar className="text-blue-500" />}
                      {index === 1 && <FaClock className="text-blue-500" />}
                      {index === 2 && (
                        <FaMapMarkerAlt className="text-blue-500" />
                      )}
                      {index >= 3 && (
                        <FaCalendarAlt className="text-blue-500" />
                      )}
                    </span>
                    <span className="font-medium text-gray-800">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Reviews */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Patient Reviews
            </h2>

            {/* Only show review breakdown if there are actual reviews */}
            {userRatings && userRatings.length > 0 && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-8 items-center mb-6">
                <div className="flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-4xl font-bold text-gray-900 mb-2">
                    {averageRating || "0.0"}
                  </span>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(averageRating || 0)
                            ? "text-[#FACC15]"
                            : "text-[#FACC15] opacity-40"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {totalRatings || userRatings.length} reviews
                  </span>
                </div>
                <div className="flex-1 w-full">
                  {doctorData.reviewBreakdown.map(
                    ({ star, percent, count }) => (
                      <div key={star} className="flex items-center gap-2 mb-2">
                        <span className="text-gray-600 text-sm w-4">
                          {star}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded h-2">
                          <div
                            className="bg-[#FACC15] h-2 rounded transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-500 text-xs w-12 text-right">
                          {percent}% ({count || 0})
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {/* Individual Reviews */}
            <div className="space-y-6 mt-2">
              {/* Real reviews from API */}
              {userRatings && userRatings.length > 0 ? (
                userRatings.map((review, index) => (
                  <div
                    key={review._id || index}
                    className="bg-white border border-gray-100 rounded-xl p-6 flex gap-4 items-start"
                  >
                    <img
                      src={`${
                        review.reviewer.avatar == "" ||
                        !review.reviewer.avatar ||
                        review.reviewer.avatar == "default-avatar.jpg"
                          ? "/dummy-review.png"
                          : review?.reviewer?.avatar
                      }`}
                      alt={review.reviewer?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-base">
                          {review.reviewer?.name || "Anonymous User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.stars
                                ? "text-[#FACC15] text-base"
                                : "text-gray-200 text-base"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm">{review.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                /* No reviews state */
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <FaStar className="mx-auto text-gray-300 text-3xl mb-3" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Be the first to share your experience with this healthcare
                    professional.
                  </p>
                </div>
              )}
            </div>

            {/* Review Form - Only show if user is authenticated and not rating themselves */}
            {isAuthenticated &&
              authUser?._id !== currentListing?.userId?._id && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <ReviewForm
                    onSubmit={handleRatingSubmit}
                    loading={ratingsCreating}
                    error={ratingsError}
                  />
                </div>
              )}

            {/* Show login prompt if not authenticated */}
            {!isAuthenticated && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">
                    Share your experience
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Login to leave a review for this healthcare professional.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/auth/login")}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Login to Review
                  </button>
                </div>
              </div>
            )}

            {/* Show message if user tries to review themselves */}
            {isAuthenticated &&
              authUser?._id === currentListing?.userId?._id && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm">
                      This is your profile - you cannot review yourself.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Right Column: Booking, Address/Map, Working Hours */}
        <div className="md:col-span-1 space-y-8">
          {/* Availability & Booking */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Availability & Booking
            </h2>

            {/* Modern Calendar */}
            <ModernCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              dateAvailability={dateAvailability}
              isCheckingAvailability={checkingAvailability}
              className="mb-4"
            />

            {/* Available Slots */}
            {selectedDate && (
              <div className="mt-4 w-full">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Available Slots for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>

                {slotsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Loading slots...
                    </span>
                  </div>
                ) : allSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {allSlots.map((slotInfo, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (slotInfo.available) {
                            setSelectedTime(slotInfo.time);
                            setIsBookingOpen(true);
                          }
                        }}
                        disabled={!slotInfo.available}
                        className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 border font-medium ${
                          slotInfo.available
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 border-blue-200 cursor-pointer"
                            : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                        }`}
                        title={
                          slotInfo.available
                            ? "Click to book"
                            : "Already booked"
                        }
                      >
                        {slotInfo.time}
                        {!slotInfo.available && (
                          <span className="block text-xs mt-1 text-gray-400">
                            Booked
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : availableSlots.length > 0 ? (
                  // Fallback to old display if allSlots is not available
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedTime(slot);
                          setIsBookingOpen(true);
                        }}
                        className="px-3 py-2 text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 font-medium"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <FaClock className="mx-auto text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      No working hours
                    </p>
                    <p className="text-xs text-gray-400">
                      Doctor is not available on this day
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Book Button */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              {/* <button
                onClick={() => setIsBookingOpen(true)}
                disabled={creatingBooking || availableSlots.length === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {creatingBooking
                  ? "Booking..."
                  : availableSlots.length === 0
                  ? "No Slots Available"
                  : "Book Appointment"}
              </button> */}
            </div>
          </div>

          {/* Clinic Address & Map */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Clinic Address & Map
            </h2>
            <p className="text-blue-700 font-semibold text-base mb-2">
              {doctorData.clinicAddress}
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-blue-50 w-full h-44">
              {/* Use reusable GoogleMapComponent */}
              <GoogleMapComponent
                location={doctorData.clinicCoordinates}
                mapContainerStyle={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "1rem",
                }}
              />
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Working Hours
            </h2>
            <ul className="mt-2">
              {doctorData.workingHours.map((slot, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span className="text-gray-700 font-medium">{slot.day}</span>
                  <span
                    className={
                      slot.closed
                        ? "text-red-500 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {slot.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Similar Doctors */}
      <div className="bg-white py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
          Similar Specialists
        </h2>
        {transformedDoctors.length > 0 ? (
          <CarouselSpecialists doctors={transformedDoctors} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No similar specialists found.</p>
          </div>
        )}
      </div>
      {/* Booking Modal */}
      <BookingModal
        open={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorName={doctorData.name}
        doctorSpecialty={doctorData.specialization}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onSubmit={(data) => {
          // Create booking with real API call
          const bookingData = {
            doctorId: currentListing.userId._id,
            date: selectedDate.toISOString(),
            listing: currentListing._id,
            time: selectedTime,
            consultationType: data.consultationType,
            patientName: data.patientName,
            phone: data.phone,
            email: data.email,
            notes: data.notes || "",
          };

          dispatch(createBooking(bookingData))
            .unwrap()
            .then(() => {
              setIsBookingOpen(false);
              const formattedDateTime = `${selectedDate.toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }
              )} at ${selectedTime}`;

              toast.success(
                `Appointment confirmed with ${doctorData.name} for ${formattedDateTime}. You'll receive a confirmation email shortly.`
              );

              setAppointmentDetails({
                doctorName: doctorData.name,
                doctorImg: doctorData.image,
                specialty: doctorData.specialization,
                dateTime: `${selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })} · ${selectedTime}`,
                consultationType:
                  data.consultationType === "online"
                    ? "Video call"
                    : data.consultationType === "clinic"
                    ? "Clinic visit"
                    : "Home visit",
                onViewDetails: () => setIsConfirmedOpen(false),
              });
              setIsConfirmedOpen(true);
            })
            .catch((error) => {
              console.error("Booking failed:", error);

              // Handle different types of errors
              let errorMessage =
                "Failed to book appointment. Please try again.";

              if (error.message) {
                if (error.message.includes("already booked")) {
                  errorMessage =
                    "This time slot is already booked. Please select a different time.";
                } else if (error.message.includes("required")) {
                  errorMessage = "Please fill in all required fields.";
                } else if (error.message.includes("Invalid")) {
                  errorMessage =
                    "Invalid information provided. Please check your details.";
                } else if (error.message.includes("future")) {
                  errorMessage = "Cannot book appointments for past dates.";
                } else {
                  errorMessage = error.message;
                }
              }

              toast.error(errorMessage);
            });
        }}
      />
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={isConfirmedOpen}
        onClose={() => setIsConfirmedOpen(false)}
        appointment={appointmentDetails}
      />
    </div>
  );
};

export default DoctorProfile;
