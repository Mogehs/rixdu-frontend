import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  Shield,
  Zap,
  CheckCircle,
  Trash2,
  Edit3,
} from "lucide-react";
import GoogleMapComponent from "../../components/common/Map/GoogleMap.jsx";
import CustomLocationPicker from "../../components/maps/CustomLocationPicker";
import { useDispatch, useSelector } from "react-redux";
import {
  createGarage,
  updateGarage,
  getGarageBySlug,
  selectCurrentGarage,
} from "../../features/garage/garageSlice.js";
import { toast } from "react-toastify";

const GarageCreate = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = Boolean(slug);

  // Main garage data state
  const [garageData, setGarageData] = useState({
    // Basic Information
    name: "",
    description: "",
    email: "",
    phone: "",
    website: "",

    // Location
    address: "",
    location: { lat: 25.2048, lng: 55.2708 }, // Default Dubai coordinates

    // Working Hours
    workingHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "14:00", isOpen: true },
      sunday: { open: "00:00", close: "00:00", isOpen: false },
    },

    // Business Details
    yearEstablished: "",
    licenseNumber: "",
    specialties: [],
    certifications: [],

    // Media
    logo: null,
    coverImage: null,
    gallery: [],

    // Services
    services: [],

    // Features & Badges
    features: [],
    trustBadges: {
      certified: false,
      warranty: false,
      fastService: false,
      qualityGuaranteed: false,
    },

    // SEO & Meta
    slug: "",
    metaDescription: "",
    keywords: [],
  });

  const [services, setServices] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  // Predefined options
  const specialtyOptions = [
    "Engine Repair",
    "Brake Service",
    "Oil Changes",
    "Transmission Repair",
    "AC Repair",
    "Diagnostics",
    "Tire Service",
    "Battery Service",
    "Suspension Repair",
    "Electrical Work",
    "Body Work",
    "Paint Service",
    "Detailing",
    "Towing",
    "Emergency Service",
    "Hybrid Service",
    "Diesel Service",
    "Performance Tuning",
    "Restoration",
    "Custom Work",
  ];

  const certificationOptions = [
    "ASE Certified",
    "AAA Approved",
    "BBB Accredited",
    "Manufacturer Certified",
    "EPA Certified",
    "OSHA Compliant",
    "ISO 9001",
    "Green Business Certified",
  ];

  const featureOptions = [
    "Complete engine diagnostics",
    "Performance optimization",
    "Fuel efficiency improvement",
    "Emission testing",
    "ECU calibration",
    "Comprehensive testing",
    "Digital inspection",
    "Video reports",
    "Warranty included",
    "Free estimates",
    "Shuttle service",
    "Loaner vehicles",
    "24/7 service",
    "Mobile service",
    "Pick-up and delivery",
  ];

  // Load existing garage data from backend if in edit mode
  const currentGarage = useSelector(selectCurrentGarage);

  useEffect(() => {
    if (isEditMode && slug) {
      dispatch(getGarageBySlug(slug));
    }
  }, [isEditMode, slug, dispatch]);

  // When currentGarage arrives, merge into local form state
  useEffect(() => {
    if (currentGarage) {
      setGarageData((prev) => ({ ...prev, ...currentGarage.garage }));
      setServices(currentGarage.services || []);
    }
  }, [currentGarage]);

  const handleInputChange = (field, value) => {
    setGarageData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setGarageData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setGarageData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLocationUpdate = (newLocation) => {
    setGarageData((prev) => ({
      ...prev,
      location: { lat: newLocation.lat, lng: newLocation.lng },
      address: newLocation.address || prev.address,
    }));
  };

  const addArrayItem = (field, item) => {
    if (item && !garageData[field].includes(item)) {
      setGarageData((prev) => ({
        ...prev,
        [field]: [...prev[field], item],
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setGarageData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // const handleImageUpload = (field, file) => {
  //   // TODO: Implement image upload to cloudinary
  //   console.log("Uploading image:", field, file);
  //   if (field === "gallery") {
  //     setGarageData((prev) => ({
  //       ...prev,
  //       gallery: [...prev.gallery, URL.createObjectURL(file)],
  //     }));
  //   } else {
  //     setGarageData((prev) => ({
  //       ...prev,
  //       [field]: URL.createObjectURL(file),
  //     }));
  //   }
  // };

  const addService = () => {
    const newService = {
      id: Date.now(),
      name: "",
      description: "",
      priceMin: "",
      priceMax: "",
      duration: "",
      features: [],
      images: [],
      category: "",
      warranty: "",
      experience: "",
    };
    setServices((prev) => [...prev, newService]);
  };

  const updateService = (serviceId, field, value) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    );
  };

  const removeService = (serviceId) => {
    setServices((prev) => prev.filter((service) => service.id !== serviceId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Remove client-side temporary IDs from services before sending to backend
      const sanitizedServices = services.map((s) => {
        const copy = { ...s };
        delete copy.id;
        return copy;
      });

      const payload = {
        ...garageData,
        services: sanitizedServices,
      };

      if (isEditMode && slug) {
        const result = await dispatch(
          updateGarage({ slug, garageData: payload })
        ).unwrap();
        toast.success(result?.message || "Garage updated successfully");
        const nextSlug = payload.slug || result?.data?.slug || slug;
        navigate(`/garage/${nextSlug}`);
      } else {
        const result = await dispatch(createGarage(payload)).unwrap();
        toast.success(result?.message || "Garage created successfully");
        const nextSlug = payload.slug || result?.data?.slug || "new-garage";
        navigate(`/garage/${nextSlug}`);
      }
    } catch (error) {
      const msg =
        error?.message || error?.data?.message || "Failed to save garage";
      if (
        error?.errors &&
        Array.isArray(error.errors) &&
        error.errors.length > 0
      ) {
        toast.error(error.errors[0].msg || msg);
      } else {
        toast.error(msg);
      }
      console.error("Error saving garage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: "Basic Information", icon: Edit3 },
    { id: 2, title: "Location & Hours", icon: MapPin },
    { id: 3, title: "Services", icon: Award },
    { id: 4, title: "Features", icon: Upload },
    { id: 5, title: "Review & Publish", icon: CheckCircle },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garage Name *
                </label>
                <input
                  type="text"
                  required
                  value={garageData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter garage name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Established
                </label>
                <input
                  type="text"
                  value={garageData.yearEstablished}
                  onChange={(e) =>
                    handleInputChange("yearEstablished", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 2010"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={garageData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@garage.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={garageData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={garageData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={garageData.licenseNumber}
                  onChange={(e) =>
                    handleInputChange("licenseNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Business license number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={garageData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your garage, services, and what makes you special..."
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {garageData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("specialties", index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addArrayItem("specialties", e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a specialty to add</option>
                {specialtyOptions
                  .filter((option) => !garageData.specialties.includes(option))
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {garageData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("certifications", index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addArrayItem("certifications", e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a certification to add</option>
                {certificationOptions
                  .filter(
                    (option) => !garageData.certifications.includes(option)
                  )
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Location & Working Hours
            </h3>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              {/* <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={garageData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full address"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Pick Location
                </button>
              </div> */}
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <CustomLocationPicker
                onLocationSelect={(locationData) => {
                  const fullLocationData = {
                    address:
                      locationData.address ||
                      locationData.formatted_address ||
                      "",
                    coordinates: {
                      lat: locationData.lat || locationData.latitude,
                      lng: locationData.lng || locationData.longitude,
                    },
                    lat: locationData.lat || locationData.latitude,
                    lng: locationData.lng || locationData.longitude,
                  };

                  handleLocationUpdate(fullLocationData);
                }}
                initialLocation={garageData.location}
              />
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Working Hours
              </label>
              <div className="space-y-3">
                {Object.entries(garageData.workingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) =>
                          handleWorkingHoursChange(
                            day,
                            "isOpen",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </div>
                    {hours.isOpen && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            handleWorkingHoursChange(
                              day,
                              "open",
                              e.target.value
                            )
                          }
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            handleWorkingHoursChange(
                              day,
                              "close",
                              e.target.value
                            )
                          }
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </>
                    )}
                    {!hours.isOpen && (
                      <span className="text-sm text-red-600 font-medium">
                        Closed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Services</h3>
              <button
                type="button"
                onClick={addService}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No services added yet. Click "Add Service" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Service #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeService(service.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Name
                        </label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) =>
                            updateService(service.id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. Engine Repair"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={service.category}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              "category",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select category</option>
                          {specialtyOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Min ($)
                        </label>
                        <input
                          type="number"
                          value={service.priceMin}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              "priceMin",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Max ($)
                        </label>
                        <input
                          type="number"
                          value={service.priceMax}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              "priceMax",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={service.duration}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              "duration",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 2-3 hours"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Warranty
                        </label>
                        <input
                          type="text"
                          value={service.warranty}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              "warranty",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 6 months"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={service.description}
                        onChange={(e) =>
                          updateService(
                            service.id,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe what this service includes..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Features</h3>

            {/* Logo Upload */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center gap-4">
                {garageData.logo && (
                  <img
                    src={garageData.logo}
                    alt="Logo"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <label className="cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      handleImageUpload("logo", e.target.files[0])
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div> */}

            {/* Cover Image Upload */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="flex items-center gap-4">
                {garageData.coverImage && (
                  <img
                    src={garageData.coverImage}
                    alt="Cover"
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <label className="cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Upload Cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      handleImageUpload("coverImage", e.target.files[0])
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div> */}

            {/* Gallery Upload */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images
              </label>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {garageData.gallery.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGarageData((prev) => ({
                          ...prev,
                          gallery: prev.gallery.filter((_, i) => i !== index),
                        }));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      handleImageUpload("gallery", e.target.files[0])
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div> */}

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Features
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {garageData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("features", index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addArrayItem("features", e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a feature to add</option>
                {featureOptions
                  .filter((option) => !garageData.features.includes(option))
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>

            {/* Trust Badges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Trust Badges
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={garageData.trustBadges.certified}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "trustBadges",
                        "certified",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">
                    Certified Technicians
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={garageData.trustBadges.warranty}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "trustBadges",
                        "warranty",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">6 Month Warranty</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={garageData.trustBadges.fastService}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "trustBadges",
                        "fastService",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Fast Service</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={garageData.trustBadges.qualityGuaranteed}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "trustBadges",
                        "qualityGuaranteed",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">
                    Quality Guaranteed
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Review & Publish
            </h3>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Garage Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {garageData.name || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {garageData.email || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">
                    {garageData.phone || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-900">
                    {garageData.address || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Specialties:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {garageData.specialties.length} selected
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Services:</span>
                  <span className="ml-2 text-gray-900">
                    {services.length} services
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Ready to Publish
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your garage profile is ready to be published. You can always
                    edit it later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Garage" : "Create New Garage"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Update your garage information"
                    : "Add your garage to get started with bookings"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <nav className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(steps.length, prev + 1))
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? "Updating..." : "Publishing..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditMode ? "Update Garage" : "Publish Garage"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GarageCreate;
