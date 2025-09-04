import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaWhatsapp,
  FaRegFlag,
  FaChevronLeft,
  FaChevronRight,
  FaComments,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaExclamationTriangle,
  FaTimes,
  FaBed,
  FaBath,
  FaCar,
  FaRulerCombined,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaDollarSign,
  FaMapPin,
  FaBuilding,
  FaIndustry,
  FaClock,
  FaTag,
  FaCheck,
  FaInfo,
  FaCog,
} from "react-icons/fa";
import { HiLocationMarker, HiOutlineHome } from "react-icons/hi";
import {
  MdVerified,
  MdApartment,
  MdLocalParking,
  MdSquareFoot,
  MdLocationOn,
} from "react-icons/md";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import useEmblaCarousel from "embla-carousel-react";
import BackToTop from "../../components/common/BackToTop";
import GoogleMapComponent from "../../components/common/Map/GoogleMap";
import AdCard from "../../components/common/AdCard";
import { useDispatch, useSelector } from "react-redux";
import { getListing, searchListings } from "../../features/listings/index.js";
import { getOrCreateChat } from "../../features/chats/chatsSlice.js";
import {
  getUserRatings,
  createRating,
} from "../../features/ratings/ratingsSlice.js";
import { toast } from "react-toastify";
import {
  toggleFavorite,
  getFavorites,
  selectFavorites,
  selectFavoritesLoading,
} from "../../features/profile/publicProfileSlice";

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  // Optimistic favorite override (null => derive from store)
  const [optimisticFavorite, setOptimisticFavorite] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [newRating, setNewRating] = useState({ rating: 0, comment: "" });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    speed: 10,
    dragFree: true,
    slidesToScroll: 3,
  });

  const dispatch = useDispatch();
  const { currentListing, loading, error } = useSelector(
    (state) => state.listings
  );
  const { searchResults, searching } = useSelector((state) => state.listings);
  const { userRatings, averageRating, totalRatings } = useSelector(
    (state) => state.ratings
  );
  const authUser = useSelector((state) => state.auth?.user);
  const favorites = useSelector(selectFavorites);
  const favoritesLoading = useSelector(selectFavoritesLoading);
  // favoritesError available if future UI needs to display favorite fetch errors

  // Fetch favorites when authenticated
  useEffect(() => {
    if (authUser?.id || authUser?._id) {
      dispatch(getFavorites());
    }
  }, [authUser?.id, authUser?._id, dispatch]);

  const isFavorited = useMemo(() => {
    if (optimisticFavorite !== null) return optimisticFavorite;
    if (!currentListing?._id || !favorites) return false;
    return favorites.some(
      (fav) =>
        (typeof fav === "string" ? fav : fav._id || fav.toString()) ===
        currentListing._id
    );
  }, [favorites, currentListing?._id, optimisticFavorite]);

  useEffect(() => {
    if (id) {
      dispatch(getListing(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentListing) {
      const searchParams = {
        categorySlug: currentListing.categoryId.slug,
        storeSlug: currentListing.storeId.slug,
        limit: 20,
      };

      dispatch(searchListings(searchParams));

      // Fetch ratings for the listing owner
      dispatch(
        getUserRatings({
          userId: currentListing.userId._id,
          listingId: currentListing._id,
        })
      );
    }
  }, [currentListing, dispatch]);

  const handleProfileClick = (userId) => {
    localStorage.setItem("publicProfile", userId);
    navigate("/public-profile");
  };

  // Handle chat with seller
  const handleChatWithSeller = () => {
    if (currentListing) {
      const user = JSON.parse(localStorage.getItem("user"));
      const currentUserId = user?.id;

      if (!currentUserId) {
        navigate("/auth/login", {
          state: {
            from: `/category/${id}`,
            message: "Please log in to chat with the seller",
          },
        });
        return;
      }

      // Don't allow chatting with self
      if (currentUserId === currentListing.userId._id) {
        toast.info("This is your own listing", { position: "bottom-left" });
        return;
      }

      dispatch(
        getOrCreateChat({
          listingId: currentListing._id,
          senderId: currentUserId,
          receiverId: currentListing.userId._id,
        })
      )
        .unwrap()
        .then((chat) => {
          navigate(`/chat/${chat.slug}`);
        })
        .catch((err) => {
          console.error("Failed to create or get chat:", err);
          toast.error("Failed to start chat. Please try again.");
        });
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (!newRating.rating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await dispatch(
        createRating({
          reviewee: currentListing.userId._id,
          reviewer: authUser.id,
          listingId: currentListing._id,
          stars: newRating.rating,
          message: newRating.comment,
        })
      ).unwrap();

      toast.success("Rating submitted successfully");
      setShowRatingModal(false);
      setNewRating({ rating: 0, comment: "" });

      // Refresh ratings
      dispatch(
        getUserRatings({
          userId: currentListing.userId._id,
          listingId: currentListing._id,
        })
      );
    } catch (err) {
      console.error("Failed to submit rating:", err);
      toast.error(err);
    }
  };

  // Professional loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 bg-gray-200 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Professional error state
  if (error || !currentListing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <FaExclamationTriangle className="w-full h-full" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Listing Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const listing = currentListing;

  const getImages = () => {
    if (!listing.values.files) return [];

    if (Array.isArray(listing.values.files)) {
      return listing.values.files.map((file) => file.url);
    } else if (listing.values.files.url) {
      return [listing.values.files.url];
    }
    return [];
  };

  const images = getImages();

  // Enhanced dynamic fields renderer with professional icons
  const getDynamicFields = () => {
    const fields = [];
    const excludeFields = ["title", "description", "price", "files"];

    if (listing.categoryId?.fields && listing.values) {
      listing.categoryId.fields.forEach((field) => {
        if (!excludeFields.includes(field.name) && listing.values[field.name]) {
          fields.push({
            label: field.label || field.name,
            value: listing.values[field.name],
            type: field.type,
            options: field.options,
            name: field.name,
          });
        }
      });
    }

    return fields;
  };

  const dynamicFields = getDynamicFields();

  // Enhanced field value renderer with professional formatting
  const renderFieldValue = (field) => {
    const { value, type, options } = field;

    switch (type) {
      case "checkbox":
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          );
        }
        // Return actual value instead of Yes/No
        return value?.toString() || value;

      case "select":
      case "radio": {
        const option = options?.find((opt) => opt.value === value);
        return option ? option.label : value;
      }

      case "date":
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

      case "datetime":
        return new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

      case "currency":
        return `AED ${parseFloat(value).toLocaleString()}`;

      case "number": {
        const num = parseFloat(value);
        if (
          field.name.toLowerCase().includes("area") ||
          field.name.toLowerCase().includes("size")
        ) {
          return `${num.toLocaleString()} sq ft`;
        }
        return num.toLocaleString();
      }

      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {value}
          </a>
        );

      case "tel":
        return (
          <a
            href={`tel:${value}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {value}
          </a>
        );

      case "url":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {value}
          </a>
        );

      case "point":
        if (typeof value === "object") {
          return (
            <div className="space-y-1">
              {value.locationName && (
                <div className="font-medium text-gray-900">
                  {value.locationName}
                </div>
              )}
              {value.address && (
                <div className="text-sm text-gray-600">{value.address}</div>
              )}
            </div>
          );
        }
        return value;

      case "textarea":
        return (
          <div className="text-sm leading-relaxed text-gray-700">{value}</div>
        );

      default:
        if (typeof value === "object") {
          return JSON.stringify(value, null, 2);
        }
        // Return the actual value instead of converting to Yes/No
        return value?.toString() || value;
    }
  };

  // Star rating component
  const StarRating = ({
    rating,
    size = "text-base",
    interactive = false,
    onRatingChange,
  }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar
            key={i}
            className={`${size} text-yellow-400 ${
              interactive ? "cursor-pointer hover:text-yellow-500" : ""
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(i)}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className={`${size} text-yellow-400 ${
              interactive ? "cursor-pointer hover:text-yellow-500" : ""
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(i)}
          />
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            className={`${size} text-gray-300 ${
              interactive ? "cursor-pointer hover:text-yellow-400" : ""
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(i)}
          />
        );
      }
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const scrollPrev = () => {
    emblaApi && emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi && emblaApi.scrollNext();
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleToggleFavorite = () => {
    if (!authUser?.id && !authUser?._id) {
      return navigate("/auth/login", {
        state: {
          from: `/category/${id}`,
          message: "Please log in to manage favorites",
        },
      });
    }
    if (!currentListing?._id || favoritesLoading) return;
    setOptimisticFavorite(!isFavorited);
    dispatch(toggleFavorite(currentListing._id))
      .unwrap()
      .then((res) => {
        toast.success(
          res.status === "added"
            ? "Added to favorites"
            : "Removed from favorites",
          { position: "bottom-left" }
        );
        setOptimisticFavorite(null);
      })
      .catch(() => {
        setOptimisticFavorite(null);
        toast.error("Failed to update favorites", { position: "bottom-left" });
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.values.title,
          text: listing.values.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard", { position: "bottom-left" });
    }
  };

  // Professional contact details component
  const renderContactDetails = () => (
    <div className="space-y-3">
      <button
        onClick={handleChatWithSeller}
        className="flex items-center justify-center gap-2 bg-blue-100 w-full py-3 px-4 rounded-md text-blue-800 hover:bg-blue-200 transition-colors"
      >
        <FaComments className="w-4 h-4" />
        Start Conversation
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 transition-all ${
            isFavorited
              ? "bg-red-50 border-red-200 text-red-600"
              : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
          } ${favoritesLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={favoritesLoading}
        >
          {favoritesLoading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isFavorited ? (
            <FaHeart className="w-4 h-4" />
          ) : (
            <FaRegHeart className="w-4 h-4" />
          )}
          <span className="font-medium text-sm">Save</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 border-2 border-gray-200 py-3 px-4 rounded-md text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <FaShare className="w-4 h-4" />
          <span className="font-medium text-sm">Share</span>
        </button>
      </div>

      {/* Seller Profile */}
      <div
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer"
        onClick={() => handleProfileClick(listing?.userId?._id)}
      >
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
          {listing?.userId?.avatar ? (
            <img
              src={listing.userId.avatar}
              alt={listing.userId.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            listing?.userId?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <div className="font-medium">{listing.userId.name}</div>
            <MdVerified className="text-blue-500 w-4 h-4" />
          </div>
          <div className="text-xs text-gray-500">{listing.userId.email}</div>
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={averageRating} size="text-xs" />
            <span className="text-xs text-gray-500">
              {totalRatings} reviews
            </span>
          </div>
        </div>
      </div>

      {/* Rate Seller */}
      <button
        onClick={() => setShowRatingModal(true)}
        className="w-full border border-gray-300 py-2.5 px-4 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
      >
        Rate This Seller
      </button>

      <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium">
        <FaRegFlag className="w-4 h-4" />
        Report this ad
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Professional Title Section */}
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {listing.values.title}
        </h1>

        {/* Professional Breadcrumb */}
        {/* <nav className="flex items-center text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate("/")}
            className="hover:text-gray-700 transition-colors"
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <button
            onClick={() =>
              navigate(
                `/all-listings?store=${listing.storeId.slug}&category=${listing.categoryId.slug}`
              )
            }
            className="hover:text-gray-700 transition-colors"
          >
            {listing.categoryId.name}
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate">
            {listing.values.title}
          </span>
        </nav> */}

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
          {/* Main Image */}
          <div className="md:col-span-2 relative rounded-lg overflow-hidden h-auto">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={`Listing image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                style={{ aspectRatio: "16/10" }}
              />
            ) : (
              <div
                className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                style={{ aspectRatio: "16/10" }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-500 font-semibold text-lg">
                    No image available
                  </span>
                </div>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  aria-label="Previous image"
                >
                  <BsChevronLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  aria-label="Next image"
                >
                  <BsChevronRight />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {currentImageIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>

          {/* Right column - Contact Details or Secondary Images */}
          {images.length <= 1 || !images[1] ? (
            <div className="hidden md:block">{renderContactDetails()}</div>
          ) : (
            <div className="hidden md:grid grid-rows-2 gap-2">
              {images[1] && (
                <div className="rounded-lg overflow-hidden h-full">
                  <img
                    src={images[1]}
                    alt="Property thumbnail 1"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {images[2] ? (
                <div className="rounded-lg overflow-hidden h-full">
                  <img
                    src={images[2]}
                    alt="Property thumbnail 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div>{renderContactDetails()}</div>
              )}
            </div>
          )}

          {/* Mobile Image Indicators */}
          <div className="flex justify-center gap-1 mt-2 md:hidden">
            {images.length > 1 &&
              images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
          </div>
        </div>

        {/* Mobile Contact Details */}
        {(() => {
          const hasEmptyThumbnailSpace =
            images.length <= 1 || !images[1] || !images[2];
          const hasCompleteImages =
            images.length >= 2 && images[1] && images[2];

          if (hasEmptyThumbnailSpace || hasCompleteImages) {
            return (
              <div
                className={`${
                  hasEmptyThumbnailSpace ? "md:hidden" : "lg:hidden"
                } mb-6`}
              >
                {renderContactDetails()}
              </div>
            );
          }
          return null;
        })()}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Price and Key Info Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-blue-600">
                  AED {listing.values.price?.toLocaleString()}
                </div>
                {/* <div className="text-sm text-gray-500">
                  Listed {new Date(listing.createdAt).toLocaleDateString()}
                </div> */}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-800">
                    Available Now
                  </span>
                </div>
                {listing.values.Warranty &&
                  listing.values.Warranty !== "No" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                      <span className="text-xs font-medium text-blue-800">
                        Warranty Included
                      </span>
                    </div>
                  )}
                <div className="flex items-center gap-2 text-gray-600">
                  <FaTag className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm">
                    {listing.categoryId.name}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            {/* Item Overview Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Item overview</h2>
              <div className="flex overflow-x-auto pb-2 -mx-4 px-4 lg:grid lg:grid-cols-5 gap-4 lg:overflow-visible">
                {dynamicFields
                  .filter((f) =>
                    [
                      "Brand",
                      "Model",
                      "Condition",
                      "Age Of Phone",
                      "Storage Capacity",
                      "RAM",
                    ].includes(f.label)
                  )
                  .slice(0, 5)
                  .map((field, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 flex flex-col items-center bg-white p-4 rounded-lg shadow-md w-[110px] sm:w-[130px] h-[105px] justify-center mx-1 lg:mx-0"
                    >
                      <div className="mb-2">
                        <FaTag className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="text-xs font-bold text-center text-gray-900 mt-1">
                        {field.label}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-0.5">
                        {typeof field.value === "string"
                          ? field.value
                          : renderFieldValue(field)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {showFullDescription
                  ? listing.values.description
                  : `${listing.values.description.substring(0, 150)}${
                      listing.values.description.length > 150 ? "..." : ""
                    }`}
              </p>
              {listing.values.description.length > 150 && (
                <button
                  onClick={toggleDescription}
                  className="bg-blue-500 text-white py-1 px-4 mt-3 rounded-full text-sm hover:bg-blue-600 transition-colors capitalize"
                >
                  {showFullDescription ? "see less" : "see more"}
                </button>
              )}
            </div>

            <hr className="border-t border-gray-200 my-6" />

            {/* Additional Details */}
            {dynamicFields.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Additional Detail
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {dynamicFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex flex-col bg-white/90 shadow-sm border border-gray-200 p-5 rounded-lg hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="text-base font-semibold text-gray-800 mb-1">
                        {field.label.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="text-gray-700 flex items-center">
                        {renderFieldValue(field)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-t border-gray-200 my-6" />

            {/* Location Section */}
            {listing.values.location && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Location</h2>
                <div className="flex items-start gap-2 mb-4">
                  <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0" />
                  <div className="text-gray-700">
                    {listing.values.location.address ||
                      listing.values.location.locationName}
                  </div>
                </div>
                <div className="h-56 bg-gray-200 rounded-md overflow-hidden">
                  <GoogleMapComponent
                    location={listing.values.location}
                    zoom={15}
                  />
                </div>
              </div>
            )}

            <hr className="border-t border-gray-200 my-6" />

            {/* Similar Listings Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Similar Ads</h2>

              <div className="w-full mb-3 flex justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={scrollPrev}
                    className="p-2 bg-white shadow-md rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Previous"
                  >
                    <FaChevronLeft className="text-blue-600" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="p-2 bg-white shadow-md rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Next"
                  >
                    <FaChevronRight className="text-blue-600" />
                  </button>
                </div>
              </div>

              {searching && (
                <div className="flex justify-center py-16">
                  <div className="flex items-center space-x-3 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-lg">
                      Discovering similar items...
                    </span>
                  </div>
                </div>
              )}

              {!searching &&
                (!searchResults ||
                  searchResults.length === 0 ||
                  searchResults.filter((item) => item._id !== listing._id)
                    .length === 0) && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      One of a Kind
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      This appears to be a unique listing in the{" "}
                      <span className="font-medium">
                        {listing.categoryId.name}
                      </span>{" "}
                      category.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                      >
                        Explore More
                      </button>
                      <button
                        onClick={handleChatWithSeller}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        Contact Seller
                      </button>
                    </div>
                  </div>
                )}

              {!searching &&
                searchResults &&
                searchResults.length > 0 &&
                searchResults.filter((item) => item._id !== listing._id)
                  .length > 0 && (
                  <div className="relative w-full">
                    <div ref={emblaRef} className="overflow-hidden">
                      <div className="flex gap-3">
                        {searchResults
                          .filter((item) => item._id !== listing._id)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="flex-none w-[85%] sm:w-[45%] md:w-[31%] lg:w-[31%] py-2"
                            >
                              <AdCard
                                item={{
                                  ...item,
                                  category: "listing",
                                }}
                                index={idx}
                                passedFavorites={favorites}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Desktop Sidebar */}
          {images.length >= 2 && images[1] && images[2] && (
            <div className="lg:col-span-1 hidden lg:block">
              <div className="space-y-3 sticky top-4">
                {renderContactDetails()}

                {/* Recent Reviews */}
                {userRatings.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-36 overflow-y-auto">
                    {userRatings.slice(0, 3).map((rating) => (
                      <div
                        key={rating._id}
                        className="border border-gray-200 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <StarRating rating={rating.stars} size="text-xs" />
                          <span className="text-xs text-gray-400">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.message && (
                          <p className="text-gray-700 leading-snug">
                            {rating.message.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Report Button */}
        <div className="flex justify-center my-8 lg:hidden">
          <button className="flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium">
            <FaRegFlag className="w-4 h-4" />
            Report this ad
          </button>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Rate this seller
                </h3>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex justify-center">
                  <StarRating
                    rating={newRating.rating}
                    size="text-3xl"
                    interactive={true}
                    onRatingChange={(rating) =>
                      setNewRating((prev) => ({ ...prev, rating }))
                    }
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Comment
                </label>
                <textarea
                  value={newRating.comment}
                  onChange={(e) =>
                    setNewRating((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Share your experience with this seller..."
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none h-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRatingSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg shadow-blue-600/25"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}

        <BackToTop />
      </div>
    </div>
  );
};

export default CategoryDetailPage;
