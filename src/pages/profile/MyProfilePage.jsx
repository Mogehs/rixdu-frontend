import React, { useState, useRef, useEffect } from "react";
import { samWilson } from "../../assets";
import { MdVerified, MdEdit, MdSave, MdCancel } from "react-icons/md";
import { useProfile } from "../../hooks/useProfile";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const MyProfilePage = () => {
  const {
    personal: personalProfile,
    user,
    loading,
    updateLoading,
    error,
    updateError,
    updateSuccess,
    updateProfile,
    forceRefreshProfile,
    clearErrors: clearProfileErrors,
    clearSuccess: clearUpdateSuccessFlag,
  } = useProfile();

  const { user: authUser } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);

  // Determine which fields should be editable based on login method
  const getEditableFields = () => {
    const currentUser = user || authUser;
    if (!currentUser) return { emailEditable: true, phoneEditable: true };

    // If user has email but no phone, they logged in with email
    if (currentUser.email && !currentUser.phoneNumber) {
      return { emailEditable: false, phoneEditable: true };
    }
    // If user has phone but no email, they logged in with phone
    if (currentUser.phoneNumber && !currentUser.email) {
      return { emailEditable: true, phoneEditable: false };
    }
    // If they have both, both are editable
    return { emailEditable: true, phoneEditable: true };
  };

  const { emailEditable, phoneEditable } = getEditableFields();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const mountedRef = useRef(false);

  const [formData, setFormData] = useState({
    bio: "",
    dateOfBirth: "",
    gender: "",
    zipCode: "",
    languages: "",
    visaStatus: "",
    email: "",
    phoneNumber: "",
  });

  // Force refresh profile data on component mount to ensure fresh data
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;

      forceRefreshProfile().catch((error) => {
        console.error("Failed to force refresh profile on mount:", error);
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [forceRefreshProfile]);

  // Update form data when profile data is loaded
  useEffect(() => {
    if (personalProfile) {
      const dobValue = personalProfile.dateOfBirth
        ? new Date(personalProfile.dateOfBirth).toISOString().split("T")[0]
        : "";

      // Get user email and phone from either personal profile or auth user
      const currentUser = user || authUser;

      setFormData({
        bio: personalProfile.bio || "",
        dateOfBirth: dobValue,
        gender: personalProfile.gender || "",
        zipCode: personalProfile.location?.zipCode || "",
        languages: Array.isArray(personalProfile.languages)
          ? personalProfile.languages.join(", ")
          : typeof personalProfile.languages === "string"
          ? personalProfile.languages
          : "",
        visaStatus: personalProfile.visaStatus || "",
        email: personalProfile.profileEmail || currentUser?.email || "",
        phoneNumber:
          personalProfile.profilePhoneNumber || currentUser?.phoneNumber || "",
      });
    } else {
      console.log("📋 Personal profile data is null or undefined");
    }
  }, [personalProfile, user, authUser, emailEditable, phoneEditable]);

  // Handle success message with toast
  useEffect(() => {
    if (updateSuccess) {
      toast.success("Profile updated successfully!", {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setIsEditing(false);
      setSelectedAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success flag after showing it
      setTimeout(() => {
        clearUpdateSuccessFlag();
      }, 3000);
    }
  }, [updateSuccess, clearUpdateSuccessFlag]);

  // Handle error messages with toast
  useEffect(() => {
    if (error || updateError) {
      toast.error(error || updateError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error, updateError]);

  // Clear errors when component unmounts or editing changes
  useEffect(() => {
    return () => {
      clearProfileErrors();
    };
  }, [clearProfileErrors]);

  // Format and validate phone number
  const formatPhoneNumber = (number) => {
    if (!number) return "";
    // Remove all non-digit characters except +
    const cleanedNumber = number.replace(/[^\d+]/g, "");
    // Handle international format
    if (cleanedNumber.startsWith("00")) {
      return "+" + cleanedNumber.substring(2);
    }
    if (!cleanedNumber.startsWith("+") && cleanedNumber.length > 10) {
      return "+" + cleanedNumber;
    }
    return cleanedNumber;
  };

  const validatePhoneNumber = (number) => {
    if (!number) return true; // Empty is valid
    const formattedNumber = formatPhoneNumber(number);
    // Basic phone validation - at least 7 digits (including country code)
    return /^[+]?[\d]{7,}$/.test(formattedNumber);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone numbers
    if (name === "phoneNumber") {
      // Allow entry of digits, +, spaces, hyphens, and parentheses
      const sanitizedValue = value.replace(/[^\d+\s()-]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));

      // Show validation feedback if needed
      if (value && !validatePhoneNumber(value)) {
        console.log("Invalid phone number format:", value);
      }
    } else {
      // Standard handling for other fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatar(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const languagesArray = formData.languages
      ? formData.languages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang !== "")
      : [];

    // Format phone number using our utility function
    let formattedPhoneNumber = "";
    if (formData.phoneNumber && phoneEditable) {
      formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);

      // Validate the phone number
      if (!validatePhoneNumber(formData.phoneNumber)) {
        toast.error(
          "Invalid phone number format. Please enter a valid phone number with country code.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return; // Prevent submission
      }
    }

    const profileUpdateData = {
      bio: formData.bio,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      location: {
        zipCode: formData.zipCode,
      },
      languages: languagesArray,
      visaStatus: formData.visaStatus || "",
      profileEmail: emailEditable ? formData.email : undefined, // Only include if editable
      profilePhoneNumber: phoneEditable ? formattedPhoneNumber : undefined, // Only include if editable and formatted
    };

    if (selectedAvatar) {
      profileUpdateData.avatar = selectedAvatar;
    }

    try {
      // First try the normal way
      await updateProfile({
        ...profileUpdateData,
        // Force include visa status with an alternate property name as backup
        visaStatusField: formData.visaStatus || "",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.", {
        position: "bottom-left",
        autoClose: 3000,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Reset form data to original values
    if (personalProfile) {
      const dobValue = personalProfile.dateOfBirth
        ? new Date(personalProfile.dateOfBirth).toISOString().split("T")[0]
        : "";

      // Get user email and phone from either personal profile or auth user
      const currentUser = user || authUser;

      setFormData({
        bio: personalProfile.bio || "",
        dateOfBirth: dobValue,
        gender: personalProfile.gender || "",
        zipCode: personalProfile.location?.zipCode || "",
        languages: Array.isArray(personalProfile.languages)
          ? personalProfile.languages.join(", ")
          : typeof personalProfile.languages === "string"
          ? personalProfile.languages
          : "",
        visaStatus: personalProfile.visaStatus || "",
        email: personalProfile.profileEmail || currentUser?.email || "",
        phoneNumber:
          personalProfile.profilePhoneNumber || currentUser?.phoneNumber || "",
      });
    }
    clearProfileErrors();
  };

  const displayName = user?.name || authUser?.name || "User";

  // Avatar fallback logic with multiple sources
  const getDisplayAvatar = () => {
    return (
      avatarPreview || // Current upload preview
      personalProfile?.avatar || // From personal profile
      user?.avatar || // From user data
      authUser?.avatar || // From auth user
      samWilson // Default fallback
    );
  };
  const displayAvatar = getDisplayAvatar();

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-white rounded-lg shadow-md font-[var(--font-base)] text-[var(--color-black)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-headings)]">
          My Profile
        </h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MdEdit size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <MdCancel size={16} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* User Info Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={displayAvatar}
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-[var(--color-light)]"
              onError={(e) => {
                console.log("Avatar failed to load, using fallback");
                e.target.src = samWilson;
              }}
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-0 bg-[var(--color-primary)] text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <MdEdit size={14} />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <h2 className="text-xl font-bold text-[var(--color-headings)]">
            {displayName}
          </h2>
          <p className="text-sm text-gray-500">
            {user?.email || authUser?.email || "No email available"}
          </p>

          {/* Verification Box */}
          <div className="mt-4 p-3 bg-[var(--color-card)] rounded-lg flex items-start space-x-2 text-sm w-full max-w-xs">
            <MdVerified className="text-blue-500 text-2xl" />
            <div>
              <p className="font-semibold text-[var(--color-headings)]">
                {user?.isVerified || authUser?.isVerified
                  ? "Verified"
                  : "Not Verified"}
              </p>
              <p className="text-xs text-gray-600">
                {user?.isVerified || authUser?.isVerified
                  ? "Your account is verified"
                  : "Got a verified badge yet?"}
              </p>
              {!(user?.isVerified || authUser?.isVerified) && (
                <a
                  href="#"
                  className="text-xs text-[var(--color-links)] font-medium hover:underline"
                >
                  Get Started
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-1 text-[var(--color-headings)]">
            Bio
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Tell others about yourself
          </p>
          {isEditing ? (
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-[var(--color-headings)] mb-1"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Write a short bio about yourself..."
                className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
          ) : (
            <p className="text-base text-gray-700 p-3 bg-gray-50 rounded-lg">
              {formData.bio || "No bio provided."}
            </p>
          )}
        </div>

        {/* Personal Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-1 text-[var(--color-headings)]">
            Personal Details
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This information helps us provide better services
          </p>

          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--color-headings)] mb-1"
                    >
                      Email{" "}
                      {!emailEditable && (
                        <span className="text-xs text-gray-500">
                          (Not editable)
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!emailEditable}
                      placeholder="Enter your email"
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-[var(--color-headings)] mb-1"
                    >
                      Phone Number{" "}
                      {!phoneEditable && (
                        <span className="text-xs text-gray-500">
                          (Not editable)
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!phoneEditable}
                      placeholder="e.g., +971 50 123 4567"
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include country code for international format (e.g., +971)
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-[var(--color-headings)] mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-headings)] mb-2">
                    Gender
                  </label>
                  <div className="flex items-center space-x-6">
                    <label
                      htmlFor="male"
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)]"
                      />
                      <span className="ml-2 text-sm text-[var(--color-black)]">
                        Male
                      </span>
                    </label>
                    <label
                      htmlFor="female"
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)]"
                      />
                      <span className="ml-2 text-sm text-[var(--color-black)]">
                        Female
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-[var(--color-headings)] mb-1"
                  >
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter your zip code"
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="languages"
                    className="block text-sm font-medium text-[var(--color-headings)] mb-1"
                  >
                    Languages
                  </label>
                  <input
                    type="text"
                    id="languages"
                    name="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    placeholder="e.g., English, Arabic, Hindi (comma separated)"
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple languages with commas
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="visaStatus"
                    className="block text-sm font-medium text-[var(--color-headings)] mb-1"
                  >
                    Visa Status
                  </label>
                  <input
                    type="text"
                    id="visaStatus"
                    name="visaStatus"
                    value={formData.visaStatus}
                    onChange={handleInputChange}
                    placeholder="e.g., Resident, Work Visa, Tourist Visa"
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Enter your current visa status
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-700">
                      {formData.email || "Not provided"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Phone Number
                    </p>
                    <p className="text-base text-gray-700">
                      {formData.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="text-base text-gray-700">
                    {formData.dateOfBirth || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-base text-gray-700 capitalize">
                    {formData.gender || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Zip Code</p>
                  <p className="text-base text-gray-700">
                    {formData.zipCode || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Languages</p>
                  <p className="text-base text-gray-700">
                    {formData.languages || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Visa Status
                  </p>
                  <p className="text-base text-gray-700">
                    {formData.visaStatus || "Not provided"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateLoading}
              className="flex items-center space-x-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <MdSave size={16} />
              <span>{updateLoading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MyProfilePage;
