import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getListing,
  clearCurrentListing,
  selectCurrentListing,
  selectListingsLoading,
  selectListingsError,
} from "../../features/listings";
import {
  createRating,
  getUserRatings,
  selectUserRatings,
  selectAverageRating,
  selectTotalRatings,
  selectRatingsLoading,
  selectRatingsCreating,
  selectRatingsError,
  selectRatingsCreateSuccess,
  clearCreateSuccess,
} from "../../features/ratings/ratingsSlice";
import {
  toggleFavorite,
  getFavorites,
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
} from "../../features/profile/publicProfileSlice";
import { getOrCreateChat } from "../../features/chats/chatsSlice";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Award,
  Zap,
  Heart,
  Share2,
  ThumbsUp,
  MessageCircle,
  Mail,
  Calendar,
  Users,
  Wrench,
  Car,
  PhoneCall,
  Navigation,
  ExternalLink,
  ArrowRight,
  Check,
} from "lucide-react";
import GoogleMapComponent from "../../components/common/Map/GoogleMap.jsx";

const GarageServiceDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const listingParam =
    params.serviceId || params.id || params.slug || params.garageId;
  const currentListing = useSelector(selectCurrentListing);
  const loading = useSelector(selectListingsLoading);
  const error = useSelector(selectListingsError);

  const ratingsCreating = useSelector(selectRatingsCreating);
  const ratingsError = useSelector(selectRatingsError);
  const ratingsSuccess = useSelector(selectRatingsCreateSuccess);
  const ratingsLoading = useSelector(selectRatingsLoading);
  const userRatings = useSelector(selectUserRatings);
  const averageRating = useSelector(selectAverageRating);
  const totalRatings = useSelector(selectTotalRatings);

  // Favorites state
  const favorites = useSelector(selectFavorites);
  const favoritesLoading = useSelector(selectFavoritesLoading);
  const favoritesError = useSelector(selectFavoritesError);

  // Auth user
  const authUser = useSelector((state) => state.auth?.user);
  const reviewerId = authUser?.id || authUser?._id;
  const revieweeId = currentListing?.userId?._id || currentListing?.userId;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");

  // Fetch listing by id/slug from params
  useEffect(() => {
    if (listingParam) {
      dispatch(getListing(listingParam));
    }
    return () => {
      dispatch(clearCurrentListing());
      dispatch(clearCreateSuccess());
    };
  }, [dispatch, listingParam]);

  // Fetch user's favorites on component mount
  useEffect(() => {
    if (authUser?.id || authUser?._id) {
      dispatch(getFavorites());
    }
  }, [dispatch, authUser?.id, authUser?._id]);

  // Fetch ratings for reviewee by type 'garage'
  useEffect(() => {
    if (revieweeId) {
      dispatch(
        getUserRatings({
          userId: revieweeId,
          listingId: currentListing?._id,
          page: 1,
          limit: 10,
        })
      );
    }
  }, [dispatch, revieweeId, currentListing?._id]);

  // Check if current listing is in favorites
  const isListingFavorite = useMemo(() => {
    if (!currentListing?._id || !favorites) return false;
    return favorites.some(
      (fav) =>
        (typeof fav === "string" ? fav : fav._id || fav.toString()) ===
        currentListing._id
    );
  }, [favorites, currentListing?._id]);

  const getValue = useCallback(
    (fieldNames, fallback = "") => {
      try {
        const values = currentListing?.values;
        if (!values) return fallback;
        for (const name of fieldNames) {
          let v;
          if (values.get && typeof values.get === "function")
            v = values.get(name);
          else v = values[name];
          if (v !== undefined && v !== null && v !== "") return v;
        }
        return fallback;
      } catch {
        return fallback;
      }
    },
    [currentListing?.values]
  );

  const parseImages = useCallback(() => {
    const candidates = [
      getValue(["images", "photos", "gallery", "pictures"]),
      getValue(["image", "photo", "cover", "picture"]),
      currentListing?.images,
    ];
    for (const candidate of candidates) {
      if (!candidate) continue;
      if (Array.isArray(candidate) && candidate.length) {
        return candidate
          .map((it) =>
            typeof it === "string" ? it : it?.secure_url || it?.url || null
          )
          .filter(Boolean);
      }
      if (typeof candidate === "string") return [candidate.url];
      if (candidate?.secure_url || candidate?.url)
        return [candidate.secure_url || candidate.url];
    }
    return [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=1200&auto=format&fit=crop",
    ];
  }, [getValue, currentListing?.images]);

  const parsePrice = useCallback(() => {
    const price = getValue(["price", "fee", "amount"]);
    const minPrice = getValue(["minPrice", "min Fee", "minfee"]);
    const maxPrice = getValue(["maxPrice", "max Fee", "maxfee"]);
    if (price) return price;
    if (minPrice && maxPrice) return `${minPrice} - ${maxPrice}`;
    if (minPrice) return `${minPrice}+`;
    return "$ - $$";
  }, [getValue]);

  const parseAddress = useCallback(() => {
    const loc = getValue(["location", "address", "coordinates"]);
    if (!loc) return { address: "", coords: null };
    if (typeof loc === "string") return { address: loc, coords: null };
    if (typeof loc === "object")
      return { address: loc.address, coords: loc.coordinates };
    if (loc.address || loc.text)
      return { address: loc.address || loc.text, coords: loc };
    return { address: "", coords: loc };
  }, [getValue]);

  const parseFeatures = useCallback(() => {
    const f = getValue(
      ["features", "services", "whatIncluded", "what's included"],
      []
    );
    if (Array.isArray(f) && f.length) return f;
    if (typeof f === "string") {
      try {
        const arr = JSON.parse(f);
        if (Array.isArray(arr)) return arr;
      } catch {
        // If parsing fails, fall through to split by comma
      }
      return f
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "Complete engine diagnostics",
      "Performance optimization",
      "Fuel efficiency improvement",
      "Emission testing",
      "ECU calibration",
      "Comprehensive testing",
    ];
  }, [getValue]);

  const serviceImages = useMemo(() => parseImages(), [parseImages]);
  const features = useMemo(() => parseFeatures(), [parseFeatures]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [serviceImages.length]);

  const title =
    getValue(["serviceName", "name", "title"], "Service") || "Service";
  const subtitle = getValue(
    ["tagline", "shortDescription", "subtitle", "slogan", "description"],
    "Optimize your vehicle's performance with expert calibration"
  );
  const duration = getValue(
    ["duration", "estimated time", "time"],
    "2-3 hours"
  );
  const warranty = getValue(["warranty"], "6 months");
  const experience = getValue(["experience"], "10+ years");
  const description = getValue(
    ["description", "about", "details", "serviceDescription"],
    "Professional engine tuning service that optimizes your vehicle's performance through advanced diagnostics and expert calibration."
  );
  const priceText = useMemo(() => parsePrice(), [parsePrice]);
  const { address: garageAddress, coords } = useMemo(
    () => parseAddress(),
    [parseAddress]
  );

  const mapContainerStyle = { width: "100%", height: "200px" };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + serviceImages.length) % serviceImages.length
    );
  };

  const handleToggleFavorite = async () => {
    if (!currentListing?._id) return;

    try {
      await dispatch(toggleFavorite(currentListing._id)).unwrap();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Error will be shown in the UI via favoritesError selector
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: subtitle,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is available
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to share or copy:", clipboardError);
        // Ultimate fallback: show the URL
        prompt("Copy this link to share:", window.location.href);
      }
    }
  };

  const openDirections = () => {
    const hasCoords = coords?.lat && coords?.lng;
    const fallbackLoc = currentListing?.location;
    const dest = hasCoords
      ? `${coords.lat},${coords.lng}`
      : fallbackLoc?.lat && fallbackLoc?.lng
      ? `${fallbackLoc.lat},${fallbackLoc.lng}`
      : encodeURIComponent(garageAddress || title || "Destination");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitReview = async () => {
    if (!reviewerId || !revieweeId) return;
    if (selectedStars <= 0 || !reviewMessage.trim()) return;

    try {
      await dispatch(
        createRating({
          reviewer: reviewerId,
          reviewee: revieweeId,
          stars: selectedStars,
          message: reviewMessage.trim(),
          listingId: currentListing._id,
          attributes: [],
        })
      ).unwrap();
      setSelectedStars(0);
      setReviewMessage("");
      // Refresh ratings list
      dispatch(
        getUserRatings({
          userId: revieweeId,
          listingId: currentListing._id,
          page: 1,
          limit: 10,
        })
      );
    } catch {
      // Error handling is done by the ratingsError selector
    }
  };

  // Handle get quote (start chat)
  const handleGetQuote = () => {
    if (currentListing) {
      const currentUserId = authUser?.id || authUser?._id;

      if (!currentUserId) {
        navigate("/auth/login", {
          state: {
            from: window.location.pathname,
            message: "Please log in to get a quote for this service",
          },
        });
        return;
      }

      // Don't allow chatting with self
      if (currentUserId === currentListing.userId?._id) {
        toast.info("This is your own listing");
        return;
      }

      dispatch(
        getOrCreateChat({
          listingId: currentListing._id,
          senderId: currentUserId,
          receiverId: currentListing.userId._id || currentListing.userId,
          type: "vehicle",
        })
      )
        .unwrap()
        .then((chat) => {
          // Navigate using chat slug instead of ID
          navigate(`/chat/${chat.slug}`);
        })
        .catch((error) => {
          console.error("Failed to create or get chat:", error);
          toast.error("Failed to start chat. Please try again.");
        });
    }
  };

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-1">{subtitle}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {priceText} AED
                  </div>
                  <div className="text-sm text-gray-500">Starting price</div>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  disabled={loading}
                  onClick={handleGetQuote}
                >
                  {loading ? "Loading..." : "Get Quote Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
              {typeof error === "string"
                ? error
                : error?.message || "Failed to load listing"}
            </div>
          )}

          {favoritesError && (
            <div className="mb-4 p-3 rounded bg-orange-50 text-orange-700 border border-orange-200 text-sm">
              {typeof favoritesError === "string"
                ? favoritesError
                : favoritesError?.message || "Failed to update favorites"}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative h-80">
                  <img
                    src={serviceImages[currentImageIndex]}
                    className="w-full h-full object-cover"
                    alt="Service Image"
                  />

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoritesLoading}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                        isListingFavorite
                          ? "bg-red-500 text-white"
                          : "bg-black/60 hover:bg-black/80 text-white"
                      } ${
                        favoritesLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title={
                        isListingFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isListingFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                      title="Share this service"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {serviceImages.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {serviceImages.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`min-w-[80px] w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          idx === currentImageIndex
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={src}
                          className="w-full h-full object-cover"
                          alt={`Thumb ${idx + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About This Service
                </h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p>{description}</p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Certified Technicians
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {warranty || "Warranty Included"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Fast Service</span>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What's Included
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">
                      {averageRating || 0}
                    </span>
                    <span className="text-gray-600">({totalRatings || 0})</span>
                  </div>
                </div>
                {console.log(userRatings)}
                {ratingsLoading ? (
                  <p className="text-gray-600 text-sm">Loading reviews...</p>
                ) : userRatings && userRatings.length > 0 ? (
                  <div className="space-y-4">
                    {userRatings.map((r, idx) => (
                      <div
                        key={r._id || idx}
                        className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={r?.reviewer?.avatar || "/dummy-review.png"}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                            alt={r?.reviewer?.name || "Reviewer"}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {r?.reviewer?.name || "Anonymous"}
                              </h4>

                              <div className="flex items-center gap-1">
                                {Array.from({ length: r?.stars || 0 }).map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                    />
                                  )
                                )}
                              </div>

                              <span className="text-sm text-gray-500">
                                {new Date(
                                  r?.createdAt || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">
                              {r?.message || r?.comment || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No reviews yet.</p>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Service Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Duration
                      </p>
                      <p className="text-sm text-gray-600">{duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Warranty
                      </p>
                      <p className="text-sm text-gray-600">{warranty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Experience
                      </p>
                      <p className="text-sm text-gray-600">{experience}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garage Location Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h3>

                <div className="space-y-3 mb-4">
                  {garageAddress && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{garageAddress}</span>
                    </div>
                  )}
                  {currentListing?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700">
                        {currentListing.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                  <GoogleMapComponent
                    location={
                      coords?.lat && coords?.lng
                        ? { lat: coords.lat, lng: coords.lng }
                        : currentListing?.location || {
                            lat: 25.2048,
                            lng: 55.2708,
                          }
                    }
                    mapContainerStyle={mapContainerStyle}
                    zoom={15}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={openDirections}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </button>
                </div>
              </div>

              {/* Add Review Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Share Your Experience
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedStars(star)}
                          className="p-1 hover:scale-110 transition-transform"
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={
                              star <= selectedStars
                                ? "w-5 h-5 text-yellow-400 fill-yellow-400"
                                : "w-5 h-5 text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      placeholder="Share your experience with this service..."
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    {!reviewerId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Please log in to submit a review.
                      </p>
                    )}
                    {ratingsError && (
                      <p className="text-xs text-red-600 mt-1">
                        {typeof ratingsError === "string"
                          ? ratingsError
                          : "Failed to submit review"}
                      </p>
                    )}
                    {ratingsSuccess && (
                      <p className="text-xs text-green-600 mt-1">
                        Thanks for your review!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={
                      ratingsCreating ||
                      !reviewerId ||
                      selectedStars <= 0 ||
                      !reviewMessage.trim()
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {ratingsCreating ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center gap-3">
            <button
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
              onClick={handleGetQuote}
              disabled={loading}
            >
              {loading ? "Loading..." : `Get Quote - ${priceText} AED`}
            </button>
            <button className="p-3 border border-gray-300 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 border border-gray-300 rounded-lg">
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GarageServiceDetail;
