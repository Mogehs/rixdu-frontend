import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Edit3,
  Award,
  Shield,
  Zap,
  CheckCircle,
  Trash2,
} from "lucide-react";
import GoogleMapComponent from "../../components/common/Map/GoogleMap.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  getGarageBySlug,
  selectCurrentGarage,
  selectGarageLoading,
  selectGarageError,
  uploadGarageImages,
  selectGarageUploading,
} from "../../features/garage/garageSlice.js";
import { toast } from "react-toastify";
import { deleteGarageImages } from "../../features/garage/garageSlice";

const reviews = [
  {
    name: "Michael Chen",
    rating: 5,
    time: "2 weeks ago",
    text: "Excellent service! Fixed my engine issues quickly and professionally. Highly recommend!",
    service: "Engine Repair",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Sarah Johnson",
    rating: 5,
    time: "1 month ago",
    text: "Great brake service. The team was very knowledgeable and completed the work on time.",
    service: "Brake Service",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b550?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "David Wilson",
    rating: 4,
    time: "2 months ago",
    text: "Good oil change service. Quick and efficient. Will come back for future maintenance.",
    service: "Oil Change",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
  },
];

const mapContainerStyle = { width: "100%", height: "320px" };

export default function GarageProfile() {
  const navigate = useNavigate();
  const { garageId: slug } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useSelector((state) => state.auth);
  const [garageData, setGarageData] = useState({});
  const [garageServices, setGarageServices] = useState([]);
  const [deletingImages, setDeletingImages] = useState([]);

  const handleGetDirections = () => {
    const lat = garageData?.location?.coordinates[0];
    const lng = garageData?.location?.coordinates[1];
    if (!lat || !lng) {
      toast.warn("Garage location is not available");
      return;
    }
    const destination = `${lat},${lng}`;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
          window.open(url, "_blank");
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
          window.open(url, "_blank");
        }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  // Redux
  const dispatch = useDispatch();
  const currentGarage = useSelector(selectCurrentGarage);

  const loading = useSelector(selectGarageLoading);
  const error = useSelector(selectGarageError);
  // Fetch garage by slug on mount / slug change
  useEffect(() => {
    if (slug) {
      dispatch(getGarageBySlug(slug));
    }
  }, [dispatch, slug]);

  // Update local state when fetched
  useEffect(() => {
    if (currentGarage) {
      // Merge fetched garage data into local state
      setGarageData((prev) => ({ ...prev, ...currentGarage.garage }));
      setGarageServices(currentGarage.services || []);
    }
  }, [currentGarage]);

  // Show error toast
  useEffect(() => {
    if (error) {
      const msg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to load garage";
      toast.error(msg);
    }
  }, [error]);

  // Derived display data (prefer backend data)
  const displayedServices = garageServices;

  const displayedGallery = Array.isArray(garageData.gallery)
    ? garageData.gallery
    : [];

  // Delete a single image (optimistic). Prefer sending publicIds when available.
  const handleDeleteImage = async (imageUrl) => {
    // Add to deleting set
    setDeletingImages((s) => [...s, imageUrl]);

    // Optimistically remove from local UI
    const prevGallery = Array.isArray(garageData.gallery)
      ? garageData.gallery.slice()
      : [];
    const newGallery = prevGallery.filter((u) => u !== imageUrl);
    setGarageData((g) => ({ ...g, gallery: newGallery }));

    try {
      const currentSlug = slug || garageData.slug;

      // Extract Cloudinary public_id from the URL (simple and deterministic for standard URLs)
      const extractPublicId = (url) => {
        try {
          const parts = url.split("/upload/");
          if (parts.length < 2) return null;
          let after = parts[1];
          // remove version prefix like v123456789/
          after = after.replace(/^v\d+\//, "");
          // strip file extension
          const idx = after.lastIndexOf(".");
          if (idx !== -1) after = after.substring(0, idx);
          return after;
        } catch {
          return null;
        }
      };

      const publicId = extractPublicId(imageUrl);
      let res;
      if (publicId) {
        res = await dispatch(
          deleteGarageImages({
            slug: currentSlug,
            type: "gallery",
            publicIds: [publicId],
          })
        );
      } else {
        res = await dispatch(
          deleteGarageImages({
            slug: currentSlug,
            type: "gallery",
            urls: [imageUrl],
          })
        );
      }

      if (res && res.meta && res.meta.requestStatus === "fulfilled") {
        const updated = (res.payload && res.payload.data) || res.payload;
        if (updated) {
          setGarageData((g) => ({ ...g, ...updated }));
        }
      }
    } catch (err) {
      setGarageData((g) => ({ ...g, gallery: prevGallery }));
      console.error("Failed to delete image", err);
      toast.error("Failed to delete image");
    } finally {
      setDeletingImages((s) => s.filter((u) => u !== imageUrl));
    }
  };

  const displayedReviews =
    garageData.reviews && garageData.reviews.length > 0
      ? garageData.reviews
      : reviews;

  const handleEditGarage = () => {
    const garageSlug = slug || "precision-auto-works";
    navigate(`/garage/create/${garageSlug}`);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const filesArray = Array.from(files);
      await dispatch(
        uploadGarageImages({ slug, files: filesArray, type: "gallery" })
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images");
    } finally {
      e.target.value = null;
    }
  };

  const handleAddService = () => {
    const garageSlug = slug || "precision-auto-works";
    navigate(`/garage/create/${garageSlug}`);
  };

  const uploading = useSelector(selectGarageUploading);

  // Before render
  if (loading || !currentGarage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="text-gray-600 text-sm font-medium">
            Loading garage details...
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Main Content - Horizontal Layout */}
        <div className="flex">
          {/* MAIN CONTENT AREA */}
          <div className="flex-1 p-6 space-y-6">
            {/* Hero Banner - Full Width */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">
                  Welcome to {garageData.name}
                </h2>
                {/* <p className="text-blue-100 text-lg mb-6">
                  Your trusted automotive service partner since 2010
                </p> */}
                <div className="flex items-center gap-8">
                  {garageData?.trustBadges?.certified && (
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      <span>Certified Technicians</span>
                    </div>
                  )}
                  {garageData?.trustBadges?.warranty && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>6 Month Warranty</span>
                    </div>
                  )}
                  {garageData?.trustBadges?.fastService && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span>Fast Service</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Edit Button */}
              {user?.id === garageData?.owner?._id && (
                <button
                  onClick={handleEditGarage}
                  className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/30 transition-colors flex items-center gap-2 text-white font-medium z-100 "
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Garage
                </button>
              )}
              <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Services Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Services
                    </h3>
                    {displayedServices?.length > 0 &&
                      user.id === garageData.owner._id && (
                        <button
                          className="text-blue-600 text-sm font-medium"
                          onClick={handleAddService}
                        >
                          + Add Service
                        </button>
                      )}
                  </div>
                </div>
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {displayedServices?.length > 0 ? (
                    displayedServices.slice(0, 3).map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          navigate(
                            `/garage/${garageData.slug}/service/${service.slug}`
                          )
                        }
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {service.name}
                            </h4>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                service.isActive === true
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {service.description
                              .split(" ")
                              .slice(0, 20)
                              .join(" ")}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-gray-900">
                              {service.priceMin} {"-"} {service.priceMax} AED
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{service.rating.count}</span>
                              {/* <span className="text-gray-500">
                                ({service.bookings})
                              </span> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <Star className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm font-medium">
                        No services available
                      </p>
                      {user?.id === garageData?.owner?._id && (
                        <>
                          <p className="text-gray-400 text-xs mb-4">
                            Start by adding your first service
                          </p>
                          <button
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                            onClick={handleAddService}
                          >
                            + Add Service
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Location
                    </h3>
                    <button
                      onClick={() =>
                        navigate(`/garage/create/${garageData.slug}`)
                      }
                      className="text-blue-600 text-sm font-medium"
                    ></button>
                  </div>
                </div>
                <div className="p-6">
                  <>
                    <div className="rounded-lg overflow-hidden mb-4">
                      <GoogleMapComponent
                        location={garageData.location}
                        mapContainerStyle={mapContainerStyle}
                        zoom={15}
                      />
                    </div>
                    <button
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      onClick={handleGetDirections}
                    >
                      Get Directions
                    </button>
                  </>
                </div>
              </div>
            </div>

            {/* Bottom Tabs Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Navigation */}
              <div className="border-b border-gray-100 px-6">
                <nav className="flex space-x-8">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "gallery", label: "Gallery" },
                    // { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        About Our Garage
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {garageData?.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {garageData?.specialties?.map((specialty) => (
                          <div
                            key={specialty}
                            className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center text-blue-800 text-sm font-medium"
                          >
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {garageData?.trustBadges?.certified && (
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Quality Guaranteed
                          </h4>
                          <p className="text-sm text-gray-600">
                            6-month warranty
                          </p>
                        </div>
                      )}
                      {garageData?.trustBadges?.fastService && (
                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Fast Service
                          </h4>
                          <p className="text-sm text-gray-600">
                            Same-day repairs
                          </p>
                        </div>
                      )}
                      {garageData?.trustBadges?.certified && (
                        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Certified Team
                          </h4>
                          <p className="text-sm text-gray-600">ASE certified</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "gallery" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Photo Gallery
                      </h3>
                      {displayedGallery.length > 0 &&
                      user?.id === garageData?.owner?._id ? (
                        <label
                          htmlFor="fileUpload"
                          className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                            uploading
                              ? "opacity-60 pointer-events-none"
                              : "hover:bg-blue-700"
                          }`}
                        >
                          {uploading ? "Uploading..." : "+ Add Photos"}
                        </label>
                      ) : null}
                      <input
                        id="fileUpload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e)}
                        disabled={uploading}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {displayedGallery?.length > 0 ? (
                        displayedGallery.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                          >
                            <img
                              src={src}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              alt={`Gallery ${idx + 1}`}
                            />

                            {/* Delete icon overlay */}
                            {user?.id === garageData?.owner?._id && (
                              <button
                                aria-label={`Delete image ${idx + 1}`}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  // prevent duplicate deletes
                                  if (uploading || deletingImages.includes(src))
                                    return;
                                  await handleDeleteImage(src);
                                }}
                                className={`absolute top-2 right-2 z-20 p-1 rounded-full text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-red-600 hover:text-white transition ${
                                  deletingImages.includes(src) || uploading
                                    ? "opacity-60 pointer-events-none"
                                    : ""
                                }`}
                              >
                                {deletingImages.includes(src) ? (
                                  <svg
                                    className="w-4 h-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 md:col-span-4">
                          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <svg
                              className="w-12 h-12 text-gray-400 mb-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v11.25M3 16.5l3.75-3.75a2.121 2.121 0 013 0L15 18M3 16.5l6.75 6.75c.44.44 1.16.44 1.6 0L21 13.5M15 18l6-6"
                              />
                            </svg>
                            <p className="text-gray-600 text-sm font-medium mb-2">
                              No photos available
                            </p>
                            {user?.id === garageData?.owner?._id && (
                              <>
                                {" "}
                                <p className="text-gray-400 text-xs mb-4">
                                  Add some photos to showcase your garage
                                </p>
                                <label
                                  htmlFor="fileUpload"
                                  className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow transition cursor-pointer ${
                                    uploading
                                      ? "opacity-60 pointer-events-none"
                                      : "hover:bg-blue-700"
                                  }`}
                                >
                                  {uploading
                                    ? "Uploading..."
                                    : "+ Upload Photos"}
                                </label>
                                <input
                                  id="fileUpload"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e)}
                                  disabled={uploading}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Customer Reviews
                      </h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {garageData.rating}
                        </span>
                        <span className="text-gray-500">
                          ({garageData.totalReviews})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {displayedReviews.slice(0, 3).map((review, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-100 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={review.avatar}
                              className="w-10 h-10 rounded-full object-cover"
                              alt={review.name}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {review.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: review.rating }).map(
                                    (_, i) => (
                                      <Star
                                        key={i}
                                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                      />
                                    )
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {review.time}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {review.text}
                              </p>
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {review.service}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
