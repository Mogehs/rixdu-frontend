import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchCategoryBySlug,
  fetchCategoryById,
} from "../../features/admin/categoriesSlice";
import {
  updateListing,
  selectCreatingListing,
  selectUpdatingListing,
  selectListingsError,
  selectValidationErrors,
  clearError,
  getListing,
} from "../../features/listings/listingsSlice";
import {
  saveDraft,
  selectDraftLoading,
  clearError as clearDraftError,
} from "../../features/listings/draftSlice";
import { homeIcon } from "../../assets";
import CustomLocationPicker from "../../components/maps/CustomLocationPicker";

// Emirates data
const emirates = [
  { name: "Dubai", value: "dubai" },
  { name: "Abu Dhabi", value: "abu-dhabi" },
  { name: "Sharjah", value: "sharjah" },
  { name: "Ras Al Khaimah", value: "ras-al-khaimah" },
  { name: "Ajman", value: "ajman" },
  { name: "Fujairah", value: "fujairah" },
  { name: "Umm Al Quwain", value: "umm-al-quwain" },
];

const CreateAdFormPage = () => {
  const navigate = useNavigate();
  const { city, category } = useParams();
  const [selectedEmirate, setSelectedEmirate] = useState("");
  const location = useLocation();
  const dispatch = useDispatch();
  const fileInputRefs = useRef({});

  const isEditMode = location.pathname.includes("/edit-listing/");
  const listingId = location.state?.listingId;
  const existingListing = location.state?.listing;

  const { currentCategory, loading, error } = useSelector(
    (state) => state.adminCategories
  );

  const isCreating = useSelector(selectCreatingListing);
  const isUpdating = useSelector(selectUpdatingListing);
  const listingsError = useSelector(selectListingsError);
  const validationErrors = useSelector(selectValidationErrors);
  const { currentListing } = useSelector((state) => state.listings);

  // Draft selectors
  const isDraftSaving = useSelector(selectDraftLoading);

  const [retainedFiles, setRetainedFiles] = useState({});

  useEffect(() => {
    if (isEditMode && listingId) {
      dispatch(getListing(listingId));
    }
  }, [dispatch, listingId, isEditMode]);

  const getLastSlugFromUrl = useCallback(() => {
    // Use currentListing from Redux store instead of existingListing from location state
    const listingToUse = isEditMode ? currentListing || existingListing : null;

    if (isEditMode && listingToUse?.categoryId) {
      return null;
    }
    const pathAfterCategory =
      location.pathname.split(`/place-ad/form/${city}/${category}/`)[1] || "";
    const subcategories = pathAfterCategory.split("/").filter(Boolean);
    return subcategories.length > 0
      ? subcategories[subcategories.length - 1]
      : category;
  }, [
    location.pathname,
    city,
    category,
    isEditMode,
    currentListing,
    existingListing,
  ]);

  const pathAfterCategory =
    location.pathname.split(`/place-ad/form/${city}/${category}/`)[1] || "";
  const subcategories = pathAfterCategory.split("/").filter(Boolean);

  const [formData, setFormData] = useState({
    dynamicFields: {},
  });

  // Initialize selectedEmirate based on current listing in edit mode
  useEffect(() => {
    if (isEditMode && currentListing?.city) {
      const matchingEmirate = emirates.find(
        (emirate) =>
          emirate.name.toLowerCase() === currentListing.city.toLowerCase() ||
          emirate.value.toLowerCase() === currentListing.city.toLowerCase()
      );
      setSelectedEmirate(matchingEmirate?.value || "");
    }
    // In create mode, we don't initialize emirate selection since city comes from URL
  }, [currentListing, isEditMode]);

  useEffect(() => {
    // Use currentListing from Redux store instead of existingListing from location state
    const listingToUse = isEditMode ? currentListing || existingListing : null;

    if (isEditMode && listingToUse?.categoryId) {
      const categoryId = listingToUse.categoryId._id || listingToUse.categoryId;
      dispatch(fetchCategoryById(categoryId));
    } else {
      const slug = getLastSlugFromUrl();
      if (slug) {
        dispatch(fetchCategoryBySlug({ slug }));
      }
    }
  }, [
    dispatch,
    getLastSlugFromUrl,
    isEditMode,
    currentListing,
    existingListing,
  ]);

  useEffect(() => {
    if (currentCategory && currentCategory.fields) {
      const initialDynamicFields = {};
      const initialRetainedFiles = {};

      const listingToUse = isEditMode
        ? currentListing || existingListing
        : null;

      currentCategory.fields.forEach((field) => {
        if (isEditMode && listingToUse) {
          const existingValue = listingToUse.values?.[field.name];

          if (field.type === "image" || field.type === "file") {
            initialDynamicFields[field.name] = field.multiple ? [] : null;

            // Handle existing files properly - they could be single object or array
            if (existingValue) {
              if (field.multiple) {
                initialRetainedFiles[field.name] = Array.isArray(existingValue)
                  ? existingValue
                  : [existingValue];
              } else {
                initialRetainedFiles[field.name] = Array.isArray(existingValue)
                  ? existingValue
                  : [existingValue];
              }
            } else {
              initialRetainedFiles[field.name] = [];
            }
          } else if (field.type === "checkbox") {
            const isMultipleField = shouldAllowMultipleSelection(
              field.name,
              field.multiple
            );

            // Handle checkbox values - could be string, array, or JSON string
            let processedValue = existingValue;
            if (
              typeof existingValue === "string" &&
              existingValue.startsWith("[")
            ) {
              try {
                processedValue = JSON.parse(existingValue);
              } catch {
                processedValue = existingValue;
              }
            }

            initialDynamicFields[field.name] =
              processedValue !== undefined
                ? processedValue
                : isMultipleField
                ? []
                : "";
          } else if (field.type === "radio") {
            initialDynamicFields[field.name] =
              existingValue !== undefined ? existingValue : "";
          } else if (field.type === "location" || field.type === "point") {
            // Handle location field specially
            if (existingValue && typeof existingValue === "object") {
              let coordinates = { lat: null, lng: null };

              // Handle database format: coordinates as array [lng, lat] (GeoJSON format)
              if (existingValue.coordinates) {
                if (Array.isArray(existingValue.coordinates)) {
                  // Database GeoJSON format: [longitude, latitude]
                  coordinates = {
                    lat: parseFloat(existingValue.coordinates[1]) || null,
                    lng: parseFloat(existingValue.coordinates[0]) || null,
                  };
                } else if (typeof existingValue.coordinates === "object") {
                  // Already in object format
                  coordinates = {
                    lat: parseFloat(existingValue.coordinates.lat) || null,
                    lng: parseFloat(existingValue.coordinates.lng) || null,
                  };
                }
              }

              initialDynamicFields[field.name] = {
                address: existingValue.address || "",
                coordinates: coordinates,
              };
              console.log(`Location field initialized for ${field.name}:`, {
                existingValue,
                coordinates,
                finalValue: initialDynamicFields[field.name],
              });
            } else {
              initialDynamicFields[field.name] = {
                address: "",
                coordinates: { lat: null, lng: null },
              };
            }
          } else {
            initialDynamicFields[field.name] =
              existingValue !== undefined
                ? existingValue
                : field.multiple
                ? []
                : "";
          }
        } else {
          switch (field.type) {
            case "checkbox": {
              const isMultipleField = shouldAllowMultipleSelection(
                field.name,
                field.multiple
              );
              initialDynamicFields[field.name] = isMultipleField ? [] : "";
              break;
            }
            case "radio":
              initialDynamicFields[field.name] = "";
              break;
            case "file":
            case "image":
              initialDynamicFields[field.name] = field.multiple ? [] : null;
              break;
            case "location":
              initialDynamicFields[field.name] = {
                address: "",
                coordinates: { lat: null, lng: null },
              };
              break;
            default:
              initialDynamicFields[field.name] = "";
          }
        }
      });

      setFormData({
        dynamicFields: initialDynamicFields,
      });

      if (isEditMode) {
        setRetainedFiles(initialRetainedFiles);
      }
    }
  }, [currentCategory, isEditMode, currentListing, existingListing]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleFileChange = (
    fieldName,
    files,
    isMultiple = false,
    field = null
  ) => {
    if (isMultiple) {
      const existingFiles = formData.dynamicFields[fieldName] || [];
      const retainedCount = retainedFiles[fieldName]
        ? retainedFiles[fieldName].length
        : 0;
      const newFilesArray = Array.from(files);
      const maxFiles = field?.maxFiles || 5;

      const totalExistingFiles = existingFiles.length + retainedCount;
      const availableSlots = maxFiles - totalExistingFiles;

      if (availableSlots <= 0) {
        toast.error(`Maximum ${maxFiles} files allowed for ${fieldName}`, {
          position: "bottom-left",
          autoClose: 3000,
        });
        return;
      }

      if (newFilesArray.length > availableSlots) {
        toast.warning(
          `You can only add ${availableSlots} more file${
            availableSlots !== 1 ? "s" : ""
          } (maximum ${maxFiles} files allowed)`,
          {
            position: "bottom-left",
            autoClose: 4000,
          }
        );
        const allowedFiles = newFilesArray.slice(0, availableSlots);
        setFormData((prev) => ({
          ...prev,
          dynamicFields: {
            ...prev.dynamicFields,
            [fieldName]: [...existingFiles, ...allowedFiles],
          },
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        dynamicFields: {
          ...prev.dynamicFields,
          [fieldName]: [...existingFiles, ...newFilesArray],
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        dynamicFields: {
          ...prev.dynamicFields,
          [fieldName]: files[0] || null,
        },
      }));
    }
  };

  const removeFile = (fieldName, fileIndex) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldName]: prev.dynamicFields[fieldName].filter(
          (_, index) => index !== fileIndex
        ),
      },
    }));
  };

  const removeRetainedFile = (fieldName, fileUrl, isMultiple = false) => {
    if (isMultiple) {
      setRetainedFiles((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((file) => file.url !== fileUrl),
      }));
    } else {
      setRetainedFiles((prev) => ({ ...prev, [fieldName]: [] }));
    }
  };

  const shouldAllowMultipleSelection = (fieldName, fieldMultiple) => {
    if (fieldMultiple !== undefined) {
      return fieldMultiple;
    }

    const singleSelectionFields = [
      "salary",
      "gender",
      "sex",
      "type",
      "price_range",
      "age_group",
    ];

    const multipleSelectionFields = [
      "skills",
      "skill",
      "expertise",
      "specialties",
      "interests",
      "hobbies",
    ];

    const lowerFieldName = fieldName.toLowerCase();

    if (multipleSelectionFields.includes(lowerFieldName)) {
      return true;
    }

    if (singleSelectionFields.includes(lowerFieldName)) {
      return false;
    }

    return true;
  };

  const capitalizeFieldName = (fieldName) => {
    return fieldName
      .split(/[_\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getFieldLabel = (field) => {
    const baseName = capitalizeFieldName(field.name);

    switch (field.type) {
      case "image":
      case "file":
        return baseName;
      case "text":
        if (field.name.toLowerCase().includes("description")) {
          return `${baseName} (Please provide detailed information)`;
        }
        return baseName;
      case "input":
        if (field.name.toLowerCase().includes("title")) {
          return `${baseName} (Enter an attractive title for your ad)`;
        }
        if (field.name.toLowerCase().includes("price")) {
          return `${baseName} (Enter the price in AED)`;
        }
        return baseName;
      case "location":
        return `${baseName} (Select your exact location)`;
      case "email":
        return `${baseName} (Your contact email address)`;
      case "phone":
      case "tel":
        return `${baseName} (Your contact number)`;
      default:
        return baseName;
    }
  };

  const getFieldPlaceholder = (field) => {
    switch (field.type) {
      case "text":
        if (field.name.toLowerCase().includes("description")) {
          return "Provide detailed description of your item/service...";
        }
        return `Enter ${field.name.toLowerCase()}`;
      case "input":
        if (field.name.toLowerCase().includes("title")) {
          return "Enter an attractive title for your ad";
        }
        if (field.name.toLowerCase().includes("price")) {
          return "Enter price (e.g., 1000)";
        }
        return `Enter ${field.name.toLowerCase()}`;
      case "email":
        return "Enter your email address";
      case "phone":
      case "tel":
        return "Enter your phone number";
      case "location":
        return "Enter your location address";
      default:
        return `Enter ${field.name.toLowerCase()}`;
    }
  };

  const handleLocationChange = (fieldName, locationData) => {
    // Extract coordinates and ensure they are numbers
    let lat = null;
    let lng = null;

    // Try different sources for coordinates
    if (locationData.lat !== undefined && locationData.lng !== undefined) {
      lat = parseFloat(locationData.lat);
      lng = parseFloat(locationData.lng);
    } else if (
      locationData.latitude !== undefined &&
      locationData.longitude !== undefined
    ) {
      lat = parseFloat(locationData.latitude);
      lng = parseFloat(locationData.longitude);
    } else if (locationData.coordinates) {
      if (Array.isArray(locationData.coordinates)) {
        // Handle GeoJSON format [lng, lat] or regular [lat, lng]
        if (locationData.coordinates.length >= 2) {
          // Assuming it's GeoJSON format [lng, lat] from database
          lng = parseFloat(locationData.coordinates[0]);
          lat = parseFloat(locationData.coordinates[1]);
        }
      } else if (typeof locationData.coordinates === "object") {
        lat = parseFloat(locationData.coordinates.lat);
        lng = parseFloat(locationData.coordinates.lng);
      }
    }

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      lat = null;
      lng = null;
    }

    let locationInfo = {
      address: locationData.address || locationData.formatted_address || "",
      coordinates: {
        lat: lat,
        lng: lng,
      },
    };

    if (locationData.address_components) {
      const components = locationData.address_components;
      let city = "";
      let country = "";
      let area = "";

      components.forEach((component) => {
        const types = component.types;
        if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          area = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name;
        }
      });

      const locationParts = [city, area, country].filter((part) => part);
      if (locationParts.length > 0) {
        locationInfo.locationName = locationParts.join(", ");
      }
    }

    setFormData((prev) => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldName]: locationInfo,
      },
    }));

    console.log(`Location updated in form for ${fieldName}:`, locationInfo);
  };

  const reverseGeocode = (lat, lng, fieldName) => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const result = results[0];
          let city = "";
          let country = "";
          let area = "";

          if (result.address_components) {
            result.address_components.forEach((component) => {
              const types = component.types;
              if (types.includes("locality")) {
                city = component.long_name;
              } else if (types.includes("administrative_area_level_1")) {
                area = component.long_name;
              } else if (types.includes("country")) {
                country = component.long_name;
              }
            });
          }

          const locationParts = [city, area, country].filter((part) => part);
          const locationName =
            locationParts.length > 0 ? locationParts.join(", ") : "";

          handleLocationChange(fieldName, {
            address: result.formatted_address,
            lat,
            lng,
            coordinates: { lat, lng },
            address_components: result.address_components,
            locationName,
          });
        }
      });
    }
  };

  const handleDynamicFieldChange = (
    fieldName,
    value,
    isCheckbox = false,
    isMultiple = false
  ) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldName]: isCheckbox
          ? isMultiple
            ? prev.dynamicFields[fieldName].includes(value)
              ? prev.dynamicFields[fieldName].filter((v) => v !== value)
              : [...prev.dynamicFields[fieldName], value]
            : prev.dynamicFields[fieldName] === value
            ? ""
            : value
          : value,
      },
    }));
  };

  const renderDynamicFields = () => {
    if (!currentCategory || !currentCategory.fields || loading) return null;

    return currentCategory.fields.map((field, index) => {
      const fieldKey = `dynamic-field-${index}`;
      const fieldValue = formData.dynamicFields[field.name];
      const fieldLabel = getFieldLabel(field);
      const fieldPlaceholder = getFieldPlaceholder(field);
      switch (field.type) {
        case "input":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="text"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                placeholder={fieldPlaceholder}
                required={field.required}
              />
            </div>
          );

        case "number":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="number"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                placeholder={fieldPlaceholder}
                required={field.required}
              />
            </div>
          );

        case "email":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="email"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                placeholder={fieldPlaceholder}
                required={field.required}
              />
            </div>
          );

        case "phone":
        case "tel":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="tel"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                placeholder={fieldPlaceholder}
                required={field.required}
              />
            </div>
          );

        case "url":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="url"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                placeholder={fieldPlaceholder}
                required={field.required}
              />
            </div>
          );

        case "date":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="date"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                required={field.required}
              />
            </div>
          );

        case "time":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="time"
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                required={field.required}
              />
            </div>
          );

        case "range":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}: {fieldValue || 0}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type="range"
                min={field.min || 0}
                max={field.max || 100}
                step={field.step || 1}
                value={fieldValue || 0}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                required={field.required}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{field.min || 0}</span>
                <span>{field.max || 100}</span>
              </div>
            </div>
          );

        case "text":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                name={field.name}
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200 resize-vertical"
                placeholder={fieldPlaceholder}
                rows={field.rows || 4}
                required={field.required}
              />
            </div>
          );

        case "select":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                name={field.name}
                value={fieldValue || ""}
                onChange={(e) =>
                  handleDynamicFieldChange(field.name, e.target.value)
                }
                className="w-full p-3 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200 bg-white"
                required={field.required}
              >
                <option value="">
                  Select {capitalizeFieldName(field.name).toLowerCase()}
                </option>
                {field.options?.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );

        case "checkbox": {
          const isMultipleField = shouldAllowMultipleSelection(
            field.name,
            field.multiple
          );

          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-3 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {isMultipleField && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Multiple selections allowed)
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {field.options?.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`inline-flex items-center px-4 py-2 rounded-full border border-[var(--color-border)] cursor-pointer transition-all duration-200 select-none
                        ${
                          (
                            isMultipleField
                              ? (fieldValue || []).includes(option)
                              : fieldValue === option
                          )
                            ? "bg-[var(--color-primary)]/90 border-[var(--color-primary)] text-white shadow"
                            : "bg-white hover:bg-[var(--color-primary)]/10 text-[var(--color-dark)]"
                        }
                      `}
                    style={{ minWidth: "fit-content" }}
                  >
                    <input
                      name={field.name}
                      type="checkbox"
                      checked={
                        isMultipleField
                          ? (fieldValue || []).includes(option)
                          : fieldValue === option
                      }
                      onChange={() =>
                        handleDynamicFieldChange(
                          field.name,
                          option,
                          true,
                          isMultipleField
                        )
                      }
                      className="hidden"
                    />
                    <span className="ml-0.5 text-sm font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        case "radio":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-3 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {field.options?.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 cursor-pointer"
                  >
                    <input
                      name={field.name}
                      type="radio"
                      value={option}
                      checked={fieldValue === option}
                      onChange={() =>
                        handleDynamicFieldChange(field.name, option)
                      }
                      className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)] focus:ring-2"
                    />
                    <span className="text-[var(--color-dark)]">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );

        case "file":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center hover:border-[var(--color-primary)] transition-colors">
                <input
                  ref={(el) => (fileInputRefs.current[field.name] = el)}
                  name={field.name}
                  type="file"
                  multiple={field.multiple}
                  accept={field.accept}
                  onChange={(e) =>
                    handleFileChange(
                      field.name,
                      e.target.files,
                      field.multiple,
                      field
                    )
                  }
                  className="hidden"
                  required={field.required && !isEditMode}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[field.name]?.click()}
                  className="inline-flex items-center px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Choose {field.multiple ? "Files" : "File"}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {field.multiple
                    ? `Upload ${
                        field.minFiles && field.minFiles > 0
                          ? `${field.minFiles}-${field.maxFiles || 5}`
                          : `up to ${field.maxFiles || 5}`
                      } files`
                    : "Upload a file"}
                </p>
              </div>

              {isEditMode &&
                retainedFiles[field.name] &&
                retainedFiles[field.name].length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Current Files:
                    </p>
                    <div className="space-y-2">
                      {retainedFiles[field.name].map((file, index) => (
                        <div
                          key={`retained-file-${index}`}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-blue-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-700 truncate">
                              {file.originalName || "Current File"}
                            </span>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-blue-500 hover:underline"
                            >
                              View
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeRetainedFile(
                                field.name,
                                file.url,
                                field.multiple
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {field.multiple && fieldValue && fieldValue.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Files:
                  </p>
                  <div className="space-y-2">
                    {fieldValue.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200"
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-green-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700 truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(field.name, fileIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!field.multiple && fieldValue && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New File:
                  </p>
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">
                          {fieldValue.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            dynamicFields: {
                              ...prev.dynamicFields,
                              [field.name]: null,
                            },
                          }))
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );

        case "image":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center hover:border-[var(--color-primary)] transition-colors">
                <input
                  ref={(el) => (fileInputRefs.current[field.name] = el)}
                  name={field.name}
                  type="file"
                  multiple={field.multiple}
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(
                      field.name,
                      e.target.files,
                      field.multiple,
                      field
                    )
                  }
                  className="hidden"
                  required={field.required && !isEditMode}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[field.name]?.click()}
                  className="inline-flex items-center px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Choose {field.multiple ? "Images" : "Image"}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Upload high-quality images to attract more viewers
                </p>
              </div>

              {isEditMode &&
                retainedFiles[field.name] &&
                retainedFiles[field.name].length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Current Images:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {retainedFiles[field.name].map((file, index) => (
                        <div
                          key={`retained-${index}`}
                          className="relative group"
                        >
                          <img
                            src={file.url}
                            alt={`Current ${index + 1}`}
                            className="w-full h-24 object-cover rounded border shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeRetainedFile(
                                field.name,
                                file.url,
                                field.multiple
                              )
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            Current
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {field.multiple && fieldValue && fieldValue.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Images:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {fieldValue.map((file, fileIndex) => (
                      <div key={fileIndex} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${fileIndex + 1}`}
                          className="w-full h-24 object-cover rounded border shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(field.name, fileIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div className="absolute bottom-1 left-1 bg-green-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {fileIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!field.multiple && fieldValue && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Image:
                  </p>
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(fieldValue)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          dynamicFields: {
                            ...prev.dynamicFields,
                            [field.name]: null,
                          },
                        }))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );

        case "location":
        case "point":
          return (
            <div key={fieldKey} className="mb-4">
              <label className="block text-[var(--color-dark)] mb-2 font-medium text-sm">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    name={field.name}
                    type="text"
                    value={fieldValue?.address || ""}
                    onChange={(e) =>
                      handleLocationChange(field.name, {
                        address: e.target.value,
                        coordinates: fieldValue?.coordinates || {
                          lat: null,
                          lng: null,
                        },
                      })
                    }
                    className="w-full p-3 pr-12 border border-[var(--color-border)] outline-none rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
                    placeholder="Enter your exact location address"
                    required={field.required}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;

                            reverseGeocode(lat, lng, field.name);
                          },
                          (error) => {
                            console.error("Error getting location:", error);
                            toast.error(
                              "Unable to get your current location. Please enter the address manually or use the map.",
                              {
                                position: "bottom-left",
                                autoClose: 4000,
                              }
                            );
                          }
                        );
                      } else {
                        toast.error(
                          "Geolocation is not supported by this browser.",
                          {
                            position: "bottom-left",
                            autoClose: 3000,
                          }
                        );
                      }
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-lg transition-colors"
                    title="Use Current Location"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>

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

                    if (locationData.address_components) {
                      fullLocationData.address_components =
                        locationData.address_components;
                    }

                    handleLocationChange(field.name, fullLocationData);
                  }}
                  initialLocation={fieldValue}
                />

                {fieldValue?.coordinates?.lat &&
                  fieldValue?.coordinates?.lng && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600 mb-1 font-medium">
                        Location Selected
                      </p>
                      {fieldValue.locationName ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {fieldValue.locationName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {fieldValue.address}
                          </p>
                        </div>
                      ) : (
                        <>
                          {" "}
                          <p className="text-sm text-gray-800">
                            {fieldValue.address || "Location selected on map"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {fieldValue.coordinates
                              ? `Lat: ${fieldValue.coordinates.lat}, Lng: ${fieldValue.coordinates.lng}`
                              : "Coordinates not available"}
                          </p>
                        </>
                      )}
                    </div>
                  )}
              </div>
            </div>
          );

        default:
          return null;
      }
    });
  };

  // Helper function to prepare files for submission
  const prepareFilesForSubmission = () => {
    const filesByField = {};
    if (currentCategory && currentCategory.fields) {
      currentCategory.fields.forEach((field) => {
        if (field.type === "file" || field.type === "image") {
          const newFiles = formData.dynamicFields[field.name];

          if (newFiles) {
            if (field.multiple && Array.isArray(newFiles)) {
              filesByField[field.name] = newFiles;
            } else if (!field.multiple && newFiles) {
              filesByField[field.name] = [newFiles];
            }
          }
        }
      });
    }
    return filesByField;
  };

  const prepareDynamicFieldsForSubmission = () => {
    const values = {};
    if (currentCategory && currentCategory.fields) {
      currentCategory.fields.forEach((field) => {
        const fieldValue = formData.dynamicFields[field.name];

        console.log(
          `Processing field: ${field.name}, type: ${field.type}, value:`,
          fieldValue
        );

        if (field.type === "file" || field.type === "image") {
          return;
        }

        if (
          field.required ||
          (fieldValue !== undefined && fieldValue !== null && fieldValue !== "")
        ) {
          if (
            (field.type === "location" || field.type === "point") &&
            fieldValue &&
            fieldValue.coordinates
          ) {
            // Send coordinates in {lat, lng} format - backend will convert to GeoJSON
            const coordinates = fieldValue.coordinates;
            if (
              coordinates &&
              coordinates.lat !== null &&
              coordinates.lat !== undefined &&
              coordinates.lng !== null &&
              coordinates.lng !== undefined
            ) {
              // Ensure coordinates are numbers with explicit conversion
              const lat = Number(coordinates.lat);
              const lng = Number(coordinates.lng);

              console.log(`Converting coordinates for ${field.name}:`, {
                originalLat: coordinates.lat,
                originalLng: coordinates.lng,
                convertedLat: lat,
                convertedLng: lng,
                latType: typeof lat,
                lngType: typeof lng,
              });

              if (
                !isNaN(lat) &&
                !isNaN(lng) &&
                isFinite(lat) &&
                isFinite(lng)
              ) {
                values[field.name] = {
                  address: fieldValue.address || "",
                  coordinates: { lat: lat, lng: lng }, // Backend expects {lat, lng} format
                };
                console.log(
                  `Location prepared for submission for ${field.name}:`,
                  {
                    original: fieldValue,
                    submitted: values[field.name],
                  }
                );
              } else {
                console.error(
                  "Invalid coordinates detected - conversion failed:",
                  {
                    original: coordinates,
                    converted: { lat, lng },
                    checks: {
                      latNaN: isNaN(lat),
                      lngNaN: isNaN(lng),
                      latFinite: isFinite(lat),
                      lngFinite: isFinite(lng),
                    },
                  }
                );
                return;
              }
            } else {
              console.warn(
                "Coordinates missing or null for field:",
                field.name,
                coordinates
              );
              // If coordinates are null, don't include this field
              return;
            }
          } else if (
            Array.isArray(fieldValue) &&
            fieldValue.length === 0 &&
            !field.required
          ) {
            // Skip empty arrays for non-required fields
            return;
          } else {
            values[field.name] = fieldValue;
          }
        }
      });
    }
    console.log("Final values being submitted:", values);
    return values;
  };

  // Handle Emirates selection
  const handleEmirateSelect = (emirateValue) => {
    setSelectedEmirate(emirateValue);
  };

  // Get final city value for submission
  const getFinalCityValue = () => {
    if (isEditMode) {
      // In edit mode, use selected emirate or fall back to current listing city
      if (selectedEmirate) {
        const emirate = emirates.find((e) => e.value === selectedEmirate);
        return emirate?.name || selectedEmirate;
      }
      return currentListing?.city || "";
    } else {
      // In create mode, use URL city parameter
      return city || "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentCategory || !currentCategory._id) {
      toast.error("Category information is missing. Please try again.", {
        position: "bottom-left",
        autoClose: 3000,
      });
      return;
    }

    const validationErrors = [];
    if (currentCategory && currentCategory.fields) {
      currentCategory.fields.forEach((field, index) => {
        if (!field.name) {
          console.warn(`Field at index ${index} has no name:`, field);
          return;
        }

        if (field.required) {
          const fieldValue = formData.dynamicFields[field.name];
          const fieldDisplayName =
            field.label || field.name || `Field ${index + 1}`;

          if (field.type === "file" || field.type === "image") {
            if (isEditMode) {
              const hasRetainedFiles =
                retainedFiles[field.name] &&
                retainedFiles[field.name].length > 0;
              const hasNewFiles =
                fieldValue &&
                (Array.isArray(fieldValue)
                  ? fieldValue.length > 0
                  : fieldValue !== null);
              const retainedCount = retainedFiles[field.name]
                ? retainedFiles[field.name].length
                : 0;
              const newFilesCount = fieldValue
                ? Array.isArray(fieldValue)
                  ? fieldValue.length
                  : 1
                : 0;
              const totalFilesCount = retainedCount + newFilesCount;

              if (field.required && !hasRetainedFiles && !hasNewFiles) {
                validationErrors.push(`${fieldDisplayName} is required`);
              }

              if (field.multiple) {
                const minFiles = field.minFiles || 0;
                const maxFiles = field.maxFiles || 5;

                if (totalFilesCount < minFiles) {
                  validationErrors.push(
                    `${fieldDisplayName} requires at least ${minFiles} file${
                      minFiles !== 1 ? "s" : ""
                    }`
                  );
                }

                if (totalFilesCount > maxFiles) {
                  validationErrors.push(
                    `${fieldDisplayName} allows maximum ${maxFiles} file${
                      maxFiles !== 1 ? "s" : ""
                    }`
                  );
                }
              }
            } else {
              const filesCount = fieldValue
                ? Array.isArray(fieldValue)
                  ? fieldValue.length
                  : 1
                : 0;

              if (
                field.required &&
                (!fieldValue ||
                  (field.multiple &&
                    (!Array.isArray(fieldValue) || fieldValue.length === 0)) ||
                  (!field.multiple && !fieldValue))
              ) {
                validationErrors.push(`${fieldDisplayName} is required`);
              }

              if (field.multiple && fieldValue) {
                const minFiles = field.minFiles || 0;
                const maxFiles = field.maxFiles || 5;

                if (filesCount < minFiles) {
                  validationErrors.push(
                    `${fieldDisplayName} requires at least ${minFiles} file${
                      minFiles !== 1 ? "s" : ""
                    }`
                  );
                }

                if (filesCount > maxFiles) {
                  validationErrors.push(
                    `${fieldDisplayName} allows maximum ${maxFiles} file${
                      maxFiles !== 1 ? "s" : ""
                    }`
                  );
                }
              }
            }
          } else if (field.type === "location") {
            if (
              !fieldValue ||
              !fieldValue.coordinates ||
              !fieldValue.coordinates.lat ||
              !fieldValue.coordinates.lng
            ) {
              validationErrors.push(`${fieldDisplayName} is required`);
            }
          } else {
            if (
              !fieldValue ||
              fieldValue === "" ||
              (Array.isArray(fieldValue) && fieldValue.length === 0)
            ) {
              validationErrors.push(`${fieldDisplayName} is required`);
            }
          }
        }
      });
    }

    if (validationErrors.length > 0) {
      const errorMessage =
        validationErrors.length === 1
          ? validationErrors[0]
          : `Please fill in the following required fields: ${validationErrors.join(
              ", "
            )}`;

      toast.error(errorMessage, {
        position: "bottom-left",
        autoClose: 5000,
      });
      return;
    }

    try {
      dispatch(clearError());
      dispatch(clearDraftError());

      const finalCity = getFinalCityValue();
      if (!finalCity) {
        const errorMessage = isEditMode
          ? "City information is missing. Please select an Emirate or enter a custom city."
          : "City information is missing. Please check the URL and try again.";
        toast.error(errorMessage, {
          position: "bottom-left",
          autoClose: 3000,
        });
        return;
      }

      if (isEditMode && listingId) {
        // For edit mode, still update the listing directly
        const listingData = {
          categoryId: currentCategory._id,
          storeId: currentCategory.storeId,
          values: prepareDynamicFieldsForSubmission(),
          files: prepareFilesForSubmission(),
          city: finalCity,
          retainedFiles: retainedFiles,
        };

        const result = await dispatch(
          updateListing({ listingId, listingData })
        );

        if (result.type === "listings/updateListing/fulfilled") {
          toast.success("Listing updated successfully!", {
            position: "bottom-left",
            autoClose: 3000,
          });
          console.log("Listing updated successfully:", result.payload);
          navigate("/dashboard/public-profile");
        } else {
          const errorMessage =
            result.payload?.message ||
            "Failed to update listing. Please try again.";
          toast.error(errorMessage, {
            position: "bottom-left",
            autoClose: 4000,
          });
          console.error("Failed to update listing:", result.payload);
        }
      } else {
        // For create mode, save as draft and proceed to safety plan
        const draftListingData = {
          categoryId: currentCategory._id,
          storeId: currentCategory.storeId,
          values: prepareDynamicFieldsForSubmission(),
          files: prepareFilesForSubmission(), // Store files directly
          city: finalCity,
          formData: formData.dynamicFields, // Store original form data
          retainedFiles: retainedFiles,
          createdAt: new Date().toISOString(),
          isEdit: false,
        };

        console.log("Saving draft data:", draftListingData);

        // Save draft using simplified Redux action (no async needed)
        dispatch(saveDraft(draftListingData));

        toast.success("Draft saved successfully!", {
          position: "bottom-left",
          autoClose: 3000,
        });

        navigate("/place-ad/safety-plan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "bottom-left",
        autoClose: 4000,
      });
    }
  };

  const getBreadcrumb = () => {
    const items = [{ text: "", icon: homeIcon, link: "/" }];

    if (category) {
      items.push({
        text:
          category.charAt(0).toUpperCase() +
          category.slice(1).replace(/-/g, " "),
        link: `/place-ad/${city}/${category}`,
      });
    }

    let currentPath = `/place-ad/${city}/${category}/subcategory`;
    subcategories.forEach((subcat, index) => {
      currentPath += `/${subcat}`;
      const isLastItem = index === subcategories.length - 1;
      items.push({
        text:
          subcat.charAt(0).toUpperCase() + subcat.slice(1).replace(/-/g, " "),
        link: isLastItem ? null : currentPath,
      });
    });

    return (
      <div className="flex items-center gap-2 mb-6">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-[var(--color-dark)]">{">"}</span>
            )}
            {item.icon ? (
              <Link to={item.link} className="hover:opacity-80">
                <img src={item.icon} alt="home" className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to={item.link || "#"}
                className={`${
                  !item.link
                    ? "text-[var(--color-dark)] pointer-events-none"
                    : "text-[var(--color-primary)] hover:underline"
                }`}
                onClick={item.link ? undefined : (e) => e.preventDefault()}
              >
                {item.text}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {getBreadcrumb()}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-[var(--color-headings)]">
          You're almost there!
        </h1>
        <p className="text-[var(--color-dark]">
          Include as much details and pictures as possible and set the right
          price!
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="relative flex items-center justify-center">
            {/* Outer ring */}
            <div className="w-12 h-12 rounded-full border-4 border-blue-300 animate-ping absolute"></div>
            {/* Spinner */}
            <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <span className="ml-4 text-lg font-medium text-blue-600 animate-pulse">
            Loading category data...
          </span>
        </div>
      )}

      {listingsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error creating listing
              </h3>
              <p className="mt-1 text-sm text-red-700">{listingsError}</p>
              {validationErrors && validationErrors.length > 0 && (
                <div className="mt-2">
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>
                        {error.field}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading category
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {currentCategory &&
      currentCategory.fields &&
      currentCategory.fields.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emirates Selection Section - Only in Edit Mode */}
          {isEditMode && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Emirate
              </h3>

              {/* Professional Emirates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {emirates.map((emirate) => (
                  <button
                    key={emirate.value}
                    type="button"
                    onClick={() => handleEmirateSelect(emirate.value)}
                    className={`relative p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-lg group ${
                      selectedEmirate === emirate.value
                        ? "border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`text-lg font-semibold mb-2 ${
                          selectedEmirate === emirate.value
                            ? "text-blue-700"
                            : "text-gray-800 group-hover:text-gray-900"
                        }`}
                      >
                        {emirate.name}
                      </div>
                      <div
                        className={`text-sm ${
                          selectedEmirate === emirate.value
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-gray-600"
                        }`}
                      >
                        UAE
                      </div>
                    </div>

                    {/* Professional Selection indicator */}
                    {selectedEmirate === emirate.value && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Current Selection Display */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    Selected Emirate:
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {getFinalCityValue() || "No emirate selected"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display current city in create mode (read-only) */}
          {/* {!isEditMode && city && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-blue-800 font-medium">
                    Location:{" "}
                    {city.charAt(0).toUpperCase() +
                      city.slice(1).replace("-", " ")}
                  </span>
                </div>
              </div>
            )} */}

          <div className="space-y-6">{renderDynamicFields()}</div>

          <button
            type="submit"
            disabled={isCreating || isUpdating || loading || isDraftSaving}
            className={`w-full p-4 rounded-lg font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-colors ${
              isCreating || isUpdating || loading || isDraftSaving
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[var(--color-primary)] text-[var(--color-white)] hover:bg-[var(--color-secondary)]"
            }`}
          >
            {isCreating || isUpdating || isDraftSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isUpdating
                  ? "Updating Listing..."
                  : isDraftSaving
                  ? "Saving Draft..."
                  : "Creating Listing..."}
              </div>
            ) : isEditMode ? (
              "Update Listing"
            ) : (
              "Continue to Safety Plan"
            )}
          </button>
        </form>
      ) : (
        !loading && (
          <div className="text-center py-8">
            <p className="text-[var(--color-dark)]">
              No specific fields required for this category.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default CreateAdFormPage;
