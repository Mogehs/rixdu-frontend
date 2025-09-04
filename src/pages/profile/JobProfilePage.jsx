import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaPencilAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import * as assets from '../../assets';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Modal from '../../components/common/Modal';
import DynamicForm from '../../components/forms/DynamicForm';
import EditProfileForm from '../../components/forms/EditProfileForm';
import {
  jobProfileBanner,
  PhoneIcon,
  EmailIcon,
  BirthDateIcon,
  VisaIcon,
  DigitalProfileIcon,
  ExperienceIcon,
  LicenceIcon,
  PortfolioIcon,
  QualificationIcon,
  ReferenceIcon,
  ResumeIcon,
  SkillsIcon,
  samWilson,
} from '../../assets';
import { profileSections, formTitleMapping } from '../../data/profileData';

import { useProfile } from '../../hooks/useProfile';

// Section key mapping for API
const sectionKeyMapping = {
  qualification: 'qualifications',
  experience: 'experience',
  skills: 'skills',
  resume: 'resume',
  licences: 'licenses',
  portfolio: 'portfolio',
  reference: 'references',
  'digital-profile': 'digitalProfile',
};

const JobProfilePage = () => {
  // Use unified profile hook
  const {
    profileData: jobProfileData,
    jobProfile,
    personal: personalData,
    loading,
    updateLoading,
    error,
    updateError,
    updateSuccess,
    updateProfile,
    forceRefreshProfile,
    clearErrors: clearJobProfileErrors,
    clearSuccess: clearJobUpdateSuccessFlag,
  } = useProfile();

  const { user: authUser } = useSelector((state) => state.auth);

  // Local state
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTopSection, setSelectedTopSection] = useState(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({
    email: '',
    phoneNumber: '',
    visaStatus: '',
    dateOfBirth: '',
    gender: '',
  });

  const [basicInfoErrors, setBasicInfoErrors] = useState({
    email: '',
    phoneNumber: '',
    visaStatus: '',
    dateOfBirth: '',
    gender: '',
  });

  // Refs for section scrolling and mount tracking
  const sectionRefs = useRef({});
  const mountedRef = useRef(false);

  // Force refresh profile data on component mount to ensure fresh data
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('🔄 JobProfilePage mounted - force refreshing profile data');
      forceRefreshProfile().catch((error) => {
        console.error('Failed to force refresh profile on mount:', error);
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [forceRefreshProfile]);

  // Initialize basic info form when profile data is loaded
  useEffect(() => {
    if (jobProfileData?.user) {
      console.log('💼 Job profile data updated:', {
        hasUser: !!jobProfileData.user,
        hasPersonal: !!personalData,
        hasJobProfile: !!jobProfile,
        email: jobProfileData.user.email,
        phoneNumber: jobProfileData.user.phoneNumber,
        profileEmail: personalData?.profileEmail,
        profilePhoneNumber: personalData?.profilePhoneNumber,
        visaStatus: personalData?.visaStatus,
        personalDataKeys: personalData ? Object.keys(personalData) : [],
      });

      setBasicInfoForm({
        // Prioritize profile-specific email/phone if available, fall back to user data
        email: personalData?.profileEmail || jobProfileData.user.email || '',
        phoneNumber:
          personalData?.profilePhoneNumber ||
          jobProfileData.user.phoneNumber ||
          '',
        visaStatus: personalData?.visaStatus || '',
        // Make sure to include date of birth and gender
        dateOfBirth: personalData?.dateOfBirth || '',
        gender: personalData?.gender || '',
      });

      // Log personal data for debugging
      console.log('Personal data loaded:', {
        email: personalData?.profileEmail || jobProfileData.user.email || '',
        phoneNumber:
          personalData?.profilePhoneNumber ||
          jobProfileData.user.phoneNumber ||
          '',
        visaStatus: personalData?.visaStatus || '',
        dateOfBirth: personalData?.dateOfBirth || '',
        gender: personalData?.gender || '',
      });
    } else {
      console.log('💼 Job profile data is null or undefined');
    }
  }, [jobProfileData, personalData]);

  // Handle success message
  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => {
        clearJobUpdateSuccessFlag();
      }, 3000);
    }
  }, [updateSuccess, clearJobUpdateSuccessFlag]);

  // Determine login method and editable fields
  const getEditableFields = () => {
    const user = jobProfileData?.user || authUser;
    if (!user) return { emailEditable: true, phoneEditable: true };

    // If user has email but no phone, they logged in with email
    if (user.email && !user.phoneNumber) {
      return { emailEditable: false, phoneEditable: true };
    }
    // If user has phone but no email, they logged in with phone
    if (user.phoneNumber && !user.email) {
      return { emailEditable: true, phoneEditable: false };
    }
    // If they have both, both are editable
    return { emailEditable: true, phoneEditable: true };
  };

  const { emailEditable, phoneEditable } = getEditableFields();

  const sections = profileSections;

  const isModalOpen = Boolean(activeSection);

  console.log('🔥 Modal state debug:', {
    activeSection,
    isModalOpen,
    hasProfileSections: !!profileSections,
    sectionKeyMapping,
  });

  const handleOpenModal = (sectionId) => {
    console.log('🔥 Opening modal for section:', sectionId);
    setActiveSection(sectionId);
  };

  const handleCloseModal = () => {
    console.log('🔥 Closing modal, activeSection was:', activeSection);
    setActiveSection(null);
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      console.log('Updating profile with:', profileData);

      // Call the updateProfile function from useProfile hook
      await updateProfile(profileData);

      // Close modal after successful update
      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Error handling is already done by Redux state
    }
  };

  // Format and validate phone number
  const formatPhoneNumber = (number) => {
    if (!number) return '';
    // Remove all non-digit characters except +
    const cleanedNumber = number.replace(/[^\d+]/g, '');
    // Handle international format
    if (cleanedNumber.startsWith('00')) {
      return '+' + cleanedNumber.substring(2);
    }
    if (!cleanedNumber.startsWith('+') && cleanedNumber.length > 10) {
      return '+' + cleanedNumber;
    }
    return cleanedNumber;
  };

  const validatePhoneNumber = (number) => {
    if (!number) return true; // Empty is valid
    const formattedNumber = formatPhoneNumber(number);
    // Basic phone validation - at least 7 digits (including country code)
    return /^[+]?[\d]{7,}$/.test(formattedNumber);
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone numbers
    if (name === 'phoneNumber') {
      // Allow entry of digits, +, spaces, hyphens, and parentheses
      const sanitizedValue = value.replace(/[^\d+\s()\-]/g, '');
      setBasicInfoForm((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));

      // Show validation feedback if needed
      if (value && !validatePhoneNumber(value)) {
        console.log('Invalid phone number format:', value);
        setBasicInfoErrors((prev) => ({
          ...prev,
          [name]: 'Please enter a valid phone number with country code',
        }));
      } else {
        // Clear error when valid
        setBasicInfoErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    } else if (name === 'email') {
      setBasicInfoForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate email format
      if (value && !validateEmail(value)) {
        setBasicInfoErrors((prev) => ({
          ...prev,
          [name]: 'Please enter a valid email address',
        }));
      } else {
        // Clear error when valid
        setBasicInfoErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    } else {
      // Standard handling for other fields
      setBasicInfoForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle top section button click - scroll to section and highlight
  const handleTopSectionClick = (sectionId) => {
    setSelectedTopSection(sectionId);
    const sectionElement = sectionRefs.current[sectionId];
    if (sectionElement) {
      sectionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Highlight section temporarily
      sectionElement.classList.add(
        'ring-2',
        'ring-blue-500',
        'ring-opacity-50'
      );
      setTimeout(() => {
        sectionElement.classList.remove(
          'ring-2',
          'ring-blue-500',
          'ring-opacity-50'
        );
        setSelectedTopSection(null);
      }, 2000);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      console.log('Saving basic info:', {
        ...basicInfoForm,
        visaStatusType: typeof basicInfoForm.visaStatus,
        visaStatusValue: basicInfoForm.visaStatus,
      });

      // Validate email before submitting
      if (basicInfoForm.email && !validateEmail(basicInfoForm.email)) {
        console.error('Invalid email format. Cannot save.');
        // You could show an error message to the user here
        return;
      }

      // Validate phone number before submitting
      if (
        basicInfoForm.phoneNumber &&
        !validatePhoneNumber(basicInfoForm.phoneNumber)
      ) {
        console.error('Invalid phone number format. Cannot save.');
        // You could show an error message to the user here
        return;
      }

      // Format phone number
      let formattedPhoneNumber = '';
      if (basicInfoForm.phoneNumber) {
        formattedPhoneNumber = formatPhoneNumber(basicInfoForm.phoneNumber);
        console.log('Formatted phone number:', {
          original: basicInfoForm.phoneNumber,
          formatted: formattedPhoneNumber,
        });
      }

      // Determine what fields can be updated based on login method
      const { emailEditable, phoneEditable } = getEditableFields();
      const updateData = {
        // Always include visa status, even if it's an empty string
        visaStatus: basicInfoForm.visaStatus || '',
        // Include date of birth and gender
        dateOfBirth: basicInfoForm.dateOfBirth || '',
        gender: basicInfoForm.gender || '',
      };

      // Only include email if it's editable
      if (emailEditable) {
        updateData.profileEmail = basicInfoForm.email;
      }

      // Only include phone if it's editable
      if (phoneEditable) {
        updateData.profilePhoneNumber =
          formattedPhoneNumber || basicInfoForm.phoneNumber;
      }

      console.log('Updating profile with:', updateData);

      // Call the API to update user info via personal profile
      await updateProfile(updateData);

      setIsEditingBasicInfo(false);
    } catch (error) {
      console.error('Failed to save basic info:', error);
      // Error handling is done by Redux state
    }
  };

  const handleCancelBasicInfo = () => {
    // Reset form to original values
    if (jobProfileData?.user) {
      setBasicInfoForm({
        // Prioritize profile-specific email/phone if available, fall back to user data
        email: personalData?.profileEmail || jobProfileData.user.email || '',
        phoneNumber:
          personalData?.profilePhoneNumber ||
          jobProfileData.user.phoneNumber ||
          '',
        visaStatus: personalData?.visaStatus || '',
        dateOfBirth: personalData?.dateOfBirth || '',
        gender: personalData?.gender || '',
      });
    }
    setIsEditingBasicInfo(false);
  };

  // Check if user's email is valid
  const validateEmail = (email) => {
    if (!email) return true; // Empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Update basic info form validation
  useEffect(() => {
    // Check for email validation errors
    if (basicInfoForm.email && !validateEmail(basicInfoForm.email)) {
      console.warn('Invalid email format:', basicInfoForm.email);
    }

    // Check for phone validation errors
    if (
      basicInfoForm.phoneNumber &&
      !validatePhoneNumber(basicInfoForm.phoneNumber)
    ) {
      console.warn('Invalid phone format:', basicInfoForm.phoneNumber);
    }
  }, [basicInfoForm.email, basicInfoForm.phoneNumber]);

  // Calculate completed sections based on actual job profile data
  const completedSections = jobProfile
    ? sections.filter((section) => {
        const apiKey = sectionKeyMapping[section.id];
        const sectionData = jobProfile[apiKey];

        if (Array.isArray(sectionData)) {
          return sectionData.length > 0;
        }
        if (typeof sectionData === 'object' && sectionData !== null) {
          return Object.keys(sectionData).length > 0;
        }
        return Boolean(sectionData);
      }).length
    : 0;

  const totalSections = 8;

  // Get display data
  const displayUser = jobProfileData?.user || authUser;
  const displayName = displayUser?.name || 'User';

  // Avatar fallback logic with multiple sources
  const getDisplayAvatar = () => {
    return (
      jobProfileData?.personal?.avatar || // From job profile personal data
      jobProfileData?.user?.avatar || // From user data
      authUser?.avatar || // From auth user
      samWilson // Default fallback
    );
  };
  const displayAvatar = getDisplayAvatar();

  if (loading) {
    return (
      <>
        <Header />
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg text-gray-500'>Loading job profile...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className='relative bg-gray-50 min-h-screen'>
        {/* Hero Banner */}
        <div className='h-80 relative bg-gradient-to-r from-blue-500 to-purple-600'>
          <img
            src={jobProfileBanner}
            alt='Background'
            className='w-full h-full object-cover'
            onError={(e) => {
              console.log('Image failed to load:', jobProfileBanner);
              e.target.style.display = 'none';
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10'></div>
        </div>

        <div className='container mx-auto px-4 -mt-16 relative z-10'>
          <div className='flex flex-col lg:flex-row gap-6'>
            {/* Left sidebar - User basic info */}
            <div className='lg:w-1/4'>
              <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                {/* Profile Header */}
                <div className='text-center pt-8 pb-6 px-6'>
                  <div className='relative inline-block'>
                    <img
                      src={displayAvatar}
                      alt='User Profile'
                      className='w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg'
                      onError={(e) => {
                        console.log('Avatar failed to load, using fallback');
                        e.target.src = samWilson;
                      }}
                    />
                    <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white'></div>
                  </div>
                  <h2 className='text-xl font-semibold mt-4 text-gray-800'>
                    {displayName}
                  </h2>
                  <p className='text-sm text-gray-500'>Job Seeker</p>
                </div>

                {/* Profile Actions */}
                <div className='px-6 pb-4'>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className='w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center'
                  >
                    <FaPencilAlt className='mr-2' size={14} />
                    Edit Profile Info
                  </button>
                </div>

                {/* Messages */}
                <div className='px-6'>
                  {updateSuccess && (
                    <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm'>
                      Profile updated successfully!
                    </div>
                  )}

                  {(error || updateError) && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm'>
                      <p>{error || updateError}</p>
                      <button
                        onClick={clearJobProfileErrors}
                        className='mt-1 text-xs underline hover:no-underline'
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                {/* Basic Info Section */}
                <div className='px-6 pb-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-800'>
                      Basic Info
                    </h3>
                    {!isEditingBasicInfo ? (
                      <button
                        onClick={() => setIsEditingBasicInfo(true)}
                        className='text-blue-500 hover:text-blue-700'
                      >
                        <FaEdit size={16} />
                      </button>
                    ) : (
                      <div className='flex space-x-2'>
                        <button
                          onClick={handleSaveBasicInfo}
                          className={`${
                            basicInfoErrors.email ||
                            basicInfoErrors.phoneNumber ||
                            updateLoading
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-500 hover:text-green-700'
                          }`}
                          disabled={
                            updateLoading ||
                            basicInfoErrors.email ||
                            basicInfoErrors.phoneNumber
                          }
                          title={
                            basicInfoErrors.email || basicInfoErrors.phoneNumber
                              ? 'Please fix validation errors before saving'
                              : 'Save changes'
                          }
                        >
                          <FaSave size={16} />
                        </button>
                        <button
                          onClick={handleCancelBasicInfo}
                          className='text-red-500 hover:text-red-700'
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className='space-y-3'>
                    {/* Email Field */}
                    <div>
                      <label className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Email
                      </label>
                      <div className='mt-1 bg-gray-50 rounded-lg p-3 flex items-center'>
                        <img
                          src={EmailIcon}
                          alt='Email'
                          className='w-4 h-4 mr-2 opacity-60'
                        />
                        {isEditingBasicInfo && emailEditable ? (
                          <div className='flex flex-col w-full'>
                            <input
                              type='email'
                              name='email'
                              value={basicInfoForm.email}
                              onChange={handleBasicInfoChange}
                              className={`text-sm bg-transparent flex-1 outline-none ${
                                basicInfoErrors.email
                                  ? 'border-b border-red-500'
                                  : ''
                              }`}
                              placeholder='Enter a valid email address'
                            />
                            {basicInfoErrors.email && (
                              <p className='text-xs text-red-500 mt-1'>
                                {basicInfoErrors.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className='flex-1'>
                            <p className='text-sm text-gray-800'>
                              {basicInfoForm.email || (
                                <span className='text-gray-400'>
                                  Not provided
                                </span>
                              )}
                            </p>
                            {!emailEditable && (
                              <span className='text-xs text-blue-600 font-medium'>
                                Login method
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Phone
                      </label>
                      <div className='mt-1 bg-gray-50 rounded-lg p-3 flex items-center'>
                        <img
                          src={PhoneIcon}
                          alt='Phone'
                          className='w-4 h-4 mr-2 opacity-60'
                        />
                        {isEditingBasicInfo && phoneEditable ? (
                          <div className='flex flex-col w-full'>
                            <div className='flex items-center w-full'>
                              <input
                                type='tel'
                                name='phoneNumber'
                                value={basicInfoForm.phoneNumber}
                                onChange={handleBasicInfoChange}
                                className={`text-sm bg-transparent flex-1 outline-none ${
                                  basicInfoErrors.phoneNumber
                                    ? 'border-b border-red-500'
                                    : ''
                                }`}
                                placeholder='e.g., +971 50 123 4567'
                              />
                              <div className='text-xs text-gray-500 ml-auto'>
                                Include country code
                              </div>
                            </div>
                            {basicInfoErrors.phoneNumber && (
                              <p className='text-xs text-red-500 mt-1'>
                                {basicInfoErrors.phoneNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className='flex-1'>
                            <p className='text-sm text-gray-800'>
                              {basicInfoForm.phoneNumber || (
                                <span className='text-gray-400'>
                                  Not provided
                                </span>
                              )}
                            </p>
                            {!phoneEditable && (
                              <span className='text-xs text-blue-600 font-medium'>
                                Login method
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visa Status Field */}
                    <div>
                      <label className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Visa Status
                      </label>
                      <div className='mt-1 bg-gray-50 rounded-lg p-3 flex items-center'>
                        <img
                          src={VisaIcon}
                          alt='Visa Status'
                          className='w-4 h-4 mr-2 opacity-60'
                        />
                        {isEditingBasicInfo ? (
                          <input
                            type='text'
                            name='visaStatus'
                            value={basicInfoForm.visaStatus}
                            onChange={handleBasicInfoChange}
                            className='text-sm bg-transparent flex-1 outline-none'
                            placeholder='Enter visa status'
                          />
                        ) : (
                          <div className='flex-1'>
                            <p className='text-sm text-gray-800'>
                              {basicInfoForm.visaStatus || (
                                <span className='text-gray-400'>
                                  Not specified
                                </span>
                              )}
                            </p>
                            <span className='text-xs text-gray-500'>
                              Optional
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Date of Birth
                      </label>
                      <div className='mt-1 bg-gray-50 rounded-lg p-3 flex items-center'>
                        <img
                          src={BirthDateIcon}
                          alt='Date of Birth'
                          className='w-4 h-4 mr-2 opacity-60'
                        />
                        {isEditingBasicInfo ? (
                          <input
                            type='date'
                            name='dateOfBirth'
                            value={
                              basicInfoForm.dateOfBirth
                                ? basicInfoForm.dateOfBirth.substr(0, 10)
                                : ''
                            }
                            onChange={handleBasicInfoChange}
                            className='text-sm bg-transparent flex-1 outline-none'
                          />
                        ) : (
                          <p className='text-sm text-gray-800 flex-1'>
                            {jobProfileData?.personal?.dateOfBirth ? (
                              new Date(
                                jobProfileData.personal.dateOfBirth
                              ).toLocaleDateString()
                            ) : (
                              <span className='text-gray-400'>
                                Not provided
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Gender
                      </label>
                      <div className='mt-1 bg-gray-50 rounded-lg p-3 flex items-center'>
                        <img
                          src={assets.GenderIcon}
                          alt='Gender'
                          className='w-4 h-4 mr-2 opacity-60'
                        />
                        {isEditingBasicInfo ? (
                          <select
                            name='gender'
                            value={basicInfoForm.gender || ''}
                            onChange={handleBasicInfoChange}
                            className='text-sm bg-transparent flex-1 outline-none'
                          >
                            <option value=''>Select gender</option>
                            <option value='Male'>Male</option>
                            <option value='Female'>Female</option>
                            <option value='Other'>Other</option>
                            <option value='Prefer not to say'>
                              Prefer not to say
                            </option>
                          </select>
                        ) : (
                          <p className='text-sm text-gray-800 flex-1'>
                            {jobProfileData?.personal?.gender || (
                              <span className='text-gray-400'>
                                Not specified
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit Basic Info Buttons */}
                  <div className='mt-6'>
                    {!isEditingBasicInfo ? (
                      <button
                        onClick={() => setIsEditingBasicInfo(true)}
                        className='w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center'
                      >
                        <FaEdit className='mr-2' size={12} />
                        Edit Basic Info
                      </button>
                    ) : (
                      <div className='flex space-x-2'>
                        <button
                          onClick={handleSaveBasicInfo}
                          disabled={updateLoading}
                          className='flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center justify-center'
                        >
                          <FaSave className='mr-2' size={12} />
                          {updateLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelBasicInfo}
                          className='flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center'
                        >
                          <FaTimes className='mr-2' size={12} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right content area - Job profile sections */}
            <div className='lg:flex-1'>
              <div className='bg-white rounded-xl shadow-lg p-6'>
                {/* Header with completion stats */}
                <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white'>
                  <h2 className='text-xl font-bold mb-2'>
                    Complete Your Job Profile
                  </h2>
                  <p className='text-blue-100 mb-4'>
                    Complete profiles get 5x more attention from potential
                    employers
                  </p>

                  {/* Professional Progress bar */}
                  <div className='relative mb-3'>
                    <div className='bg-white/80 backdrop-blur-sm rounded-full h-3 overflow-hidden shadow-inner'>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden ${
                          completedSections === 0
                            ? 'bg-gray-200'
                            : completedSections < totalSections / 2
                            ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                            : completedSections === totalSections
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                        }`}
                        style={{
                          width: `${Math.max(
                            (completedSections / totalSections) * 100,
                            0
                          )}%`,
                        }}
                      >
                        {/* Subtle shine effect */}
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-between items-center text-sm'>
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          completedSections === 0
                            ? 'bg-gray-300'
                            : completedSections < totalSections / 2
                            ? 'bg-blue-400'
                            : completedSections === totalSections
                            ? 'bg-emerald-400'
                            : 'bg-indigo-400'
                        }`}
                      ></div>
                      <span className='font-medium text-white/90'>
                        {completedSections}/{totalSections} sections completed
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xl font-semibold text-white'>
                        {Math.round((completedSections / totalSections) * 100)}%
                      </span>
                      {completedSections === totalSections && (
                        <div className='flex items-center text-emerald-200'>
                          <svg
                            className='w-4 h-4 ml-1'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <span className='text-xs ml-1 font-medium'>Complete</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional motivational message */}
                  <div className='mt-4 text-center'>
                    <p className='text-sm text-blue-100 font-medium'>
                      {completedSections === 0
                        ? "Ready to get started? Complete your first section."
                        : completedSections < totalSections / 2
                        ? 'Great start! Add more sections to enhance your profile.'
                        : completedSections === totalSections
                        ? '✓ Excellent! Your profile is complete and professional.'
                        : 'You\'re doing well! Almost ready to showcase your expertise.'}
                    </p>
                  </div>
                </div>

                {/* Interactive Section Navigation */}
                <div className='mb-8'>
                  <h3 className='text-lg font-semibold mb-4 text-gray-800'>
                    Quick Navigation
                  </h3>
                  <div className='grid grid-cols-4 sm:grid-cols-8 gap-3'>
                    {sections.map((section) => {
                      const apiKey = sectionKeyMapping[section.id];
                      const sectionData = jobProfile?.[apiKey];
                      const hasData = sectionData
                        ? Array.isArray(sectionData)
                          ? sectionData.length > 0
                          : typeof sectionData === 'object' &&
                            sectionData !== null
                          ? Object.keys(sectionData).length > 0
                          : Boolean(sectionData)
                        : false;

                      return (
                        <button
                          key={section.id}
                          onClick={() => handleTopSectionClick(section.id)}
                          className={`relative p-3 rounded-lg transition-all duration-200 group ${
                            selectedTopSection === section.id
                              ? 'bg-blue-500 text-white scale-105'
                              : hasData
                              ? 'bg-green-50 hover:bg-green-100 border border-green-200'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <div className='flex flex-col items-center'>
                            <img
                              src={section.icon}
                              alt={section.title}
                              className={`w-6 h-6 mb-1 ${
                                selectedTopSection === section.id
                                  ? 'filter invert'
                                  : ''
                              }`}
                            />
                            <span className='text-xs font-medium text-center leading-tight'>
                              {section.title}
                            </span>
                            {hasData && (
                              <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white'></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sections grid */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Profile Sections
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {sections.map((section) => {
                      // Determine if section has data using correct API key mapping
                      const apiKey = sectionKeyMapping[section.id];
                      const sectionData = jobProfile?.[apiKey];

                      const sectionHasData = sectionData
                        ? Array.isArray(sectionData)
                          ? sectionData.length > 0
                          : typeof sectionData === 'object' &&
                            sectionData !== null
                          ? Object.keys(sectionData).length > 0
                          : Boolean(sectionData)
                        : false;

                      return (
                        <div
                          key={section.id}
                          ref={(el) => (sectionRefs.current[section.id] = el)}
                          className={`bg-white border-2 p-6 rounded-xl transition-all duration-300 hover:shadow-md ${
                            sectionHasData
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className='flex items-start justify-between mb-4'>
                            <div className='flex items-center'>
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                                  sectionHasData ? 'bg-green-100' : 'bg-blue-50'
                                }`}
                              >
                                <img
                                  src={section.icon}
                                  alt={section.title}
                                  className='w-7 h-7'
                                />
                              </div>
                              <div>
                                <h3 className='font-semibold text-lg text-gray-800'>
                                  {section.title}
                                </h3>
                                <p className='text-sm text-gray-600 mt-1'>
                                  {section.description}
                                </p>
                              </div>
                            </div>
                            <div className='flex flex-col items-end space-y-2'>
                              <button
                                onClick={() => handleOpenModal(section.id)}
                                className={`flex items-center gap-2 text-white text-sm py-2 px-4 rounded-lg transition-colors ${
                                  sectionHasData
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-primary hover:bg-blue-600'
                                }`}
                              >
                                {sectionHasData ? (
                                  <>
                                    <FaEdit size={12} /> Edit
                                  </>
                                ) : (
                                  <>
                                    <FaPlus size={12} /> Add
                                  </>
                                )}
                              </button>
                              {sectionHasData && (
                                <div className='flex items-center text-xs text-green-600 font-medium'>
                                  <div className='w-2 h-2 bg-green-500 rounded-full mr-1'></div>
                                  Completed
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Preview content for completed sections */}
                          {sectionHasData && (
                            <div className='mt-4 p-3 bg-white rounded-lg border border-gray-100'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-gray-600'>
                                  Content added
                                </span>
                                <button
                                  onClick={() => handleOpenModal(section.id)}
                                  className='text-xs text-blue-600 hover:text-blue-800 flex items-center'
                                >
                                  <FaEye size={10} className='mr-1' />
                                  View/Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={formTitleMapping[activeSection] || 'Add Information'}
      >
        {activeSection && (
          <DynamicForm
            sectionId={activeSection}
            currentData={jobProfile?.[sectionKeyMapping[activeSection]] || null}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title='Edit Profile Info'
      >
        <EditProfileForm
          currentUser={{
            name: personalData?.fullName || displayUser?.fullName,
            email: personalData?.profileEmail || displayUser?.email,
            phone: personalData?.profilePhoneNumber || displayUser?.phoneNumber,
            visaStatus: personalData?.visaStatus || '',
            dob: personalData?.dateOfBirth || '',
            gender: personalData?.gender || '',
          }}
          onSave={handleProfileUpdate}
          onClose={() => setIsEditProfileModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default JobProfilePage;
