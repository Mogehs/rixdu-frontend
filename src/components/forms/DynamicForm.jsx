import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { InputField, TextAreaField, FileUploadField } from './FormFields';

// First define the component as a regular function
const DynamicFormComponent = ({ sectionId, currentData, onClose }) => {
  const {
    updateJob,
    uploadResume: uploadResumeFile,
    updateLoading,
    uploadLoading,
    updateError,
    uploadError,
    updateSuccess,
    uploadSuccess,
  } = useProfile();

  // Form state management using useRef to maintain stability across renders
  const [formData, setFormData] = useState({});
  const formDataRef = useRef(formData);

  // Local state for form validation errors
  const [localError, setLocalError] = useState('');
  const cursorPositionsRef = useRef({});
  const hasInitializedRef = useRef({});

  // Keep the ref updated with latest state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Reset submission state when section changes
  useEffect(() => {
    setHasSubmitted(false);
  }, [sectionId]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Track when form has been submitted
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Handle successful updates, but only close the form if the user has actually submitted
  useEffect(() => {
    console.log('State change detected:', {
      updateSuccess,
      uploadSuccess,
      updateLoading,
      uploadLoading,
      updateError,
      uploadError,
      hasSubmitted,
    });

    // Only close the modal if we've had a successful submission
    if ((updateSuccess || uploadSuccess) && hasSubmitted) {
      console.log('✅ Form submission successful, closing modal after delay');

      // Add a slight delay before closing the modal so users can see the success message
      const timer = setTimeout(() => {
        onClose();
      }, 1500); // 1.5 second delay

      // Clean up timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, [
    updateSuccess,
    uploadSuccess,
    updateLoading,
    uploadLoading,
    updateError,
    uploadError,
    hasSubmitted,
    onClose,
  ]);

  // Initialize form data - optimized to run only when needed
  useEffect(() => {
    console.log('Initializing form data for section:', sectionId);

    // Only initialize if we haven't already done so for this sectionId
    if (!hasInitializedRef.current[sectionId]) {
      // Mark this section as initialized
      hasInitializedRef.current[sectionId] = true;

      if (currentData) {
        // Pre-fill form for editing
        switch (sectionId) {
          case 'qualification':
            if (Array.isArray(currentData) && currentData.length > 0) {
              const qual = currentData[0]; // For simplicity, edit first item
              setFormData({
                degree: qual.degree || '',
                fieldOfStudy: qual.fieldOfStudy || '',
                institution: qual.institution || '',
                startDate: qual.startDate ? qual.startDate.substring(0, 7) : '',
                endDate: qual.endDate ? qual.endDate.substring(0, 7) : '',
              });
            }
            break;
          case 'experience':
            if (Array.isArray(currentData) && currentData.length > 0) {
              const exp = currentData[0]; // For simplicity, edit first item
              setFormData({
                jobTitle: exp.jobTitle || '',
                company: exp.company || '',
                startDate: exp.startDate ? exp.startDate.substring(0, 7) : '',
                endDate: exp.endDate ? exp.endDate.substring(0, 7) : '',
                description: exp.description || '',
              });
            }
            break;
          case 'skills':
            setFormData({
              skills: Array.isArray(currentData) ? currentData.join(', ') : '',
            });
            break;
          case 'resume':
            console.log(
              'Initializing resume form with existing data:',
              currentData
            );
            // For resume, we don't need to pre-populate the form since we'll upload a new file
            // But we should show the current resume information
            setFormData({
              currentResume: currentData,
              // Don't set resumeFile here as we'll need a new file upload
            });
            break;
          case 'licences':
            if (Array.isArray(currentData) && currentData.length > 0) {
              const license = currentData[0]; // For simplicity, edit first item
              setFormData({
                name: license.name || '',
                issuer: license.issuer || '',
                dateIssued: license.dateIssued
                  ? license.dateIssued.substring(0, 7)
                  : '',
              });
            }
            break;
          case 'portfolio':
            setFormData({
              link: currentData.link || '',
              description: currentData.description || '',
            });
            break;
          case 'reference':
            if (Array.isArray(currentData) && currentData.length > 0) {
              const ref = currentData[0]; // For simplicity, edit first item
              setFormData({
                name: ref.name || '',
                position: ref.position || '',
                company: ref.company || '',
                email: ref.email || '',
              });
            }
            break;
          case 'digital-profile':
            setFormData({
              linkedIn: currentData.linkedIn || '',
              github: currentData.github || '',
              personalWebsite: currentData.personalWebsite || '',
            });
            break;
          default:
            setFormData({});
        }
        console.log(
          '✅ Form initialized with current data for section:',
          sectionId
        );
      } else {
        // Initialize empty form for new entries
        setFormData({});
        console.log(
          '✅ Form initialized empty for new entry in section:',
          sectionId
        );
      }
    }
    // Only include sectionId and a stable reference to currentData in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, currentData]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;

    // Store cursor position before state update, but only for input types that support selection
    const unsupportedTypes = [
      'month',
      'date',
      'time',
      'color',
      'range',
      'file',
    ];

    if (
      e.target.selectionStart !== undefined &&
      !unsupportedTypes.includes(type)
    ) {
      try {
        cursorPositionsRef.current[name] = e.target.selectionStart;
      } catch (error) {
        console.warn(
          `Could not get selection position for input ${name} of type ${type}`
        );
      }
    }

    // Use the functional update form to ensure we're working with the latest state
    setFormData((prevFormData) => {
      const newFormData = {
        ...prevFormData,
        [name]: value,
      };

      // Log for debugging
      console.log(
        `Field ${name} updated to: ${value.substring(0, 15)}${
          value.length > 15 ? '...' : ''
        }`
      );

      // Update the ref for immediate access outside of state updates
      formDataRef.current = newFormData;

      return newFormData;
    });

    // Prevent default to maintain focus
    e.preventDefault();
  }, []);

  // Add validation function for resume files
  const validateResumeFile = (file) => {
    if (!file) return true; // Allow empty (no file selected)

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file. Other formats are not supported.';
    }

    // Check file size (5MB max - matches backend constraint)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB. Please compress your file or select a smaller file.';
    }

    return true;
  };

  const handleFileChange = useCallback((e) => {
    // Fix: We need to properly handle the file input event
    let file;

    // If we have a custom event from FileUploadField that provides files array
    if (e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    }
    // If we have a custom event that provides a direct file object
    else if (e.target.value instanceof File) {
      file = e.target.value;
    }

    // Debug - log what we've got
    console.log('File change event:', {
      hasFiles: !!(e.target.files && e.target.files.length),
      hasValue: !!e.target.value,
      fileObject: file ? 'Found file object' : 'No file object found',
    });

    if (file) {
      console.log('Resume file selected:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type,
      });

      // Validate the file
      const validationResult = validateResumeFile(file);

      if (validationResult !== true) {
        console.error('File validation error:', validationResult);
        // Set an error state
        setLocalError(validationResult);
        return;
      }

      // Clear any previous errors
      setLocalError('');

      setFormData((prev) => ({
        ...prev,
        resumeFile: file,
      }));
    } else {
      console.warn('No valid file found in the event');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mark form as submitted so we know to close it on success
    setHasSubmitted(true);

    try {
      const apiKey = sectionKeyMapping[sectionId];
      let payload = {};

      // Format data according to API requirements
      switch (sectionId) {
        case 'qualification':
          payload[apiKey] = [
            {
              degree: formData.degree,
              fieldOfStudy: formData.fieldOfStudy,
              institution: formData.institution,
              startDate: formData.startDate,
              endDate: formData.endDate,
            },
          ];
          break;

        case 'experience':
          payload[apiKey] = [
            {
              jobTitle: formData.jobTitle,
              company: formData.company,
              startDate: formData.startDate,
              endDate: formData.endDate,
              description: formData.description,
            },
          ];
          break;

        case 'skills': {
          const skillsArray = formData.skills
            ? formData.skills
                .split(',')
                .map((skill) => skill.trim())
                .filter((skill) => skill)
            : [];
          payload[apiKey] = skillsArray;
          break;
        }

        case 'resume':
          // If we're in edit mode and no new file is selected, user might just be viewing
          // We'll keep the modal open unless they explicitly click Cancel or Submit
          if (!formData.resumeFile && formData.currentResume) {
            console.log(
              'No new resume file selected in edit mode, keeping modal open'
            );
            setIsSubmitting(false);
            setHasSubmitted(false); // Reset submission status
            return;
          }

          if (formData.resumeFile) {
            // Check if we have a proper File object
            if (!(formData.resumeFile instanceof File)) {
              console.error('Invalid file object:', formData.resumeFile);
              setLocalError(
                'The selected file is invalid. Please try selecting it again.'
              );
              setIsSubmitting(false);
              return;
            }

            // Validate file before uploading
            const validationResult = validateResumeFile(formData.resumeFile);
            if (validationResult !== true) {
              console.error('File validation failed:', validationResult);
              setLocalError(validationResult);
              setIsSubmitting(false);
              return;
            }

            console.log('Uploading resume file:', {
              name: formData.resumeFile.name,
              size: `${(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB`,
              type: formData.resumeFile.type,
              isReplacing: !!formData.currentResume,
            });

            try {
              // Show more debug info
              console.log('Starting resume upload process...');

              // Explicitly create a new FormData to check what's going on
              const testFormData = new FormData();
              testFormData.append('resume', formData.resumeFile);

              // Log FormData content to verify it contains the file
              for (let [key, value] of testFormData.entries()) {
                console.log(
                  `FormData contains: ${key} = ${
                    value instanceof File
                      ? `File: ${value.name} (${value.type})`
                      : value
                  }`
                );
              }

              const result = await uploadResumeFile(formData.resumeFile);
              console.log('Resume upload completed with result:', result);

              // Form will close automatically due to the uploadSuccess effect
            } catch (error) {
              console.error('Failed to upload resume:', error);
              // Provide more detailed error info
              setLocalError(
                error.message || 'Upload failed. Please try again.'
              );
              setIsSubmitting(false);
              // Don't close the form so user can try again
              return;
            }
          } else {
            console.error('No resume file selected');
            setLocalError('Please select a resume file to upload');
            setIsSubmitting(false);
            return;
          }
          break;

        case 'licences':
          payload[apiKey] = [
            {
              name: formData.name,
              issuer: formData.issuer,
              dateIssued: formData.dateIssued,
            },
          ];
          break;

        case 'portfolio':
          payload[apiKey] = {
            link: formData.link,
            description: formData.description,
          };
          break;

        case 'reference':
          payload[apiKey] = [
            {
              name: formData.name,
              position: formData.position,
              company: formData.company,
              email: formData.email,
            },
          ];
          break;

        case 'digital-profile':
          payload[apiKey] = {
            linkedIn: formData.linkedIn,
            github: formData.github,
            personalWebsite: formData.personalWebsite,
          };
          break;
      }

      // Submit data if not resume upload
      if (sectionId !== 'resume') {
        console.log('📝 Submitting job profile section:', {
          sectionId,
          payload,
        });
        await updateJob(payload);
      }

      // Success handling is now done in useEffect when updateSuccess changes
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define form components here - move them OUTSIDE the render function
  // Form components with controlled inputs
  const QualificationForm = () => (
    <>
      <InputField
        id='degree'
        name='degree'
        label='Degree/Certificate'
        placeholder='E.g., Bachelor of Science'
        value={formData.degree || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='fieldOfStudy'
        name='fieldOfStudy'
        label='Field of Study'
        placeholder='E.g., Computer Science'
        value={formData.fieldOfStudy || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='institution'
        name='institution'
        label='Institution'
        placeholder='E.g., University of Technology'
        value={formData.institution || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <InputField
          id='startDate'
          name='startDate'
          label='Start Date'
          type='month'
          value={formData.startDate || ''}
          onChange={handleInputChange}
          cursorPositionRef={cursorPositionsRef}
        />
        <InputField
          id='endDate'
          name='endDate'
          label='End Date'
          type='month'
          value={formData.endDate || ''}
          onChange={handleInputChange}
          cursorPositionRef={cursorPositionsRef}
        />
      </div>
    </>
  );

  const ExperienceForm = () => (
    <>
      <InputField
        id='jobTitle'
        name='jobTitle'
        label='Job Title'
        placeholder='E.g., Software Engineer'
        value={formData.jobTitle || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='company'
        name='company'
        label='Company'
        placeholder='E.g., Tech Solutions Inc.'
        value={formData.company || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <InputField
          id='startDate'
          name='startDate'
          label='Start Date'
          type='month'
          value={formData.startDate || ''}
          onChange={handleInputChange}
          cursorPositionRef={cursorPositionsRef}
        />
        <InputField
          id='endDate'
          name='endDate'
          label='End Date'
          type='month'
          value={formData.endDate || ''}
          onChange={handleInputChange}
          cursorPositionRef={cursorPositionsRef}
        />
      </div>
      <TextAreaField
        id='description'
        name='description'
        label='Description'
        placeholder='Describe your responsibilities and achievements.'
        value={formData.description || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
    </>
  );

  const SkillsForm = () => (
    <>
      <TextAreaField
        id='skills'
        name='skills'
        label='Skills'
        placeholder='Enter skills separated by commas (e.g., React, Node.js, JavaScript)'
        value={formData.skills || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
    </>
  );

  const ResumeForm = () => {
    // Debug what's in the form data for resume
    console.log('ResumeForm rendering with formData:', {
      hasResumeFile: !!formData.resumeFile,
      hasCurrentResume: !!formData.currentResume,
      currentResume: formData.currentResume,
      fileDetails: formData.resumeFile
        ? {
            name: formData.resumeFile.name,
            type: formData.resumeFile.type,
            size: formData.resumeFile.size,
          }
        : null,
      uploadError: uploadError,
      localError: localError,
      isUploading: uploadLoading,
    });

    // Extract more readable filename from the resume URL if available
    const currentResumeFilename = (() => {
      if (!formData.currentResume) return null;

      // Extract the original filename from the URL parameters if available
      const url = new URL(formData.currentResume);
      const originalFilename = url.searchParams.get('original_filename');

      if (originalFilename) {
        return originalFilename;
      }

      // Fallback: Extract public_id and add file extension based on URL analysis
      const publicId = formData.currentResume.split('/').pop().split('?')[0];

      // Try to determine file type from URL or default to .pdf
      let extension = '.pdf';
      if (formData.currentResume.includes('.doc')) extension = '.doc';
      if (formData.currentResume.includes('.docx')) extension = '.docx';

      return `${publicId}${extension}`;
    })();

    // Get file type for icon display
    const getFileIconByType = (filename) => {
      if (!filename) return null;
      const lowercase = filename.toLowerCase();

      if (lowercase.endsWith('.pdf')) {
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
            />
          </svg>
        );
      } else if (lowercase.endsWith('.doc') || lowercase.endsWith('.docx')) {
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-blue-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        );
      } else {
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        );
      }
    };

    return (
      <>
        {/* Show current resume information if editing */}
        {formData.currentResume && (
          <div className='mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              Current Resume
            </h4>
            <div className='flex items-center'>
              <span className='mr-2'>
                {getFileIconByType(currentResumeFilename)}
              </span>
              <a
                href={formData.currentResume}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline text-sm flex-grow'
              >
                {currentResumeFilename || 'View current resume'}
              </a>

              <a
                href={formData.currentResume}
                download={currentResumeFilename || 'resume.pdf'}
                className='ml-3 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded border border-blue-200 flex items-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-3 w-3 mr-1'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                  />
                </svg>
                Download
              </a>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              Upload a new file below to replace your current resume
            </p>
          </div>
        )}

        <FileUploadField
          id='resumeFile'
          name='resumeFile'
          label='Upload Resume'
          accept='.pdf,.doc,.docx'
          onChange={handleFileChange}
          error={localError || uploadError}
          helpText='Your resume will be shared with potential employers when you apply for jobs'
          required={!formData.currentResume} // Only required if no current resume
          disabled={uploadLoading}
          cursorPositionRef={cursorPositionsRef}
        />
        <div className='text-sm text-gray-500 mt-2 mb-4'>
          Accepted formats: PDF, DOC, DOCX (Maximum 5MB)
        </div>
        {formData.resumeFile && !localError && (
          <div className='text-sm text-green-600 mt-2 mb-4 flex items-center'>
            <span className='inline-block w-4 h-4 mr-1'>✓</span>
            File selected: {formData.resumeFile.name} (
            {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        {uploadLoading && (
          <div className='text-sm text-blue-600 mt-2 mb-4 flex items-center'>
            <span className='inline-block animate-spin mr-2'>⟳</span>
            Uploading resume...
          </div>
        )}
        {uploadSuccess && (
          <div className='text-sm text-green-600 mt-2 mb-4 flex items-center'>
            <span className='inline-block w-4 h-4 mr-1'>✓</span>
            Resume uploaded successfully!
          </div>
        )}
      </>
    );
  };

  const LicencesForm = () => (
    <>
      <InputField
        id='name'
        name='name'
        label='License Name'
        placeholder='E.g., Professional Engineer License'
        value={formData.name || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='issuer'
        name='issuer'
        label='Issuing Authority'
        placeholder='E.g., Board of Engineering'
        value={formData.issuer || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='dateIssued'
        name='dateIssued'
        label='Date Issued'
        type='month'
        value={formData.dateIssued || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
    </>
  );

  const PortfolioForm = () => (
    <>
      <InputField
        id='link'
        name='link'
        label='Portfolio Link'
        type='url'
        placeholder='E.g., https://yourportfolio.com'
        value={formData.link || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <TextAreaField
        id='description'
        name='description'
        label='Description'
        placeholder='Briefly describe your portfolio'
        value={formData.description || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
    </>
  );

  const ReferenceForm = () => (
    <>
      <InputField
        id='name'
        name='name'
        label='Reference Name'
        placeholder='E.g., John Smith'
        value={formData.name || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='position'
        name='position'
        label='Position'
        placeholder='E.g., Senior Manager'
        value={formData.position || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='company'
        name='company'
        label='Company'
        placeholder='E.g., Tech Solutions Inc.'
        value={formData.company || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='email'
        name='email'
        label='Email'
        type='email'
        placeholder='E.g., john.smith@example.com'
        value={formData.email || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
    </>
  );

  const DigitalProfileForm = () => (
    <>
      <InputField
        id='linkedIn'
        name='linkedIn'
        label='LinkedIn Profile'
        type='url'
        placeholder='https://linkedin.com/in/yourprofile'
        value={formData.linkedIn || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='github'
        name='github'
        label='GitHub Profile'
        type='url'
        placeholder='https://github.com/yourusername'
        value={formData.github || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
      <InputField
        id='personalWebsite'
        name='personalWebsite'
        label='Personal Website'
        type='url'
        placeholder='https://your-website.com'
        value={formData.personalWebsite || ''}
        onChange={handleInputChange}
        cursorPositionRef={cursorPositionsRef}
      />
    </>
  );

  // Dynamically determine title based on whether we're editing or adding
  const getFormTitle = (section) => {
    const isEditing = !!currentData;

    switch (section) {
      case 'qualification':
        return isEditing ? 'Edit Qualification' : 'Add Qualification';
      case 'experience':
        return isEditing ? 'Edit Experience' : 'Add Experience';
      case 'skills':
        return isEditing ? 'Edit Skills' : 'Add Skills';
      case 'resume':
        return isEditing ? 'Manage Resume' : 'Upload Resume';
      case 'licences':
        return isEditing ? 'Edit License' : 'Add License';
      case 'portfolio':
        return isEditing ? 'Edit Portfolio' : 'Add Portfolio';
      case 'reference':
        return isEditing ? 'Edit Reference' : 'Add Reference';
      case 'digital-profile':
        return isEditing ? 'Edit Digital Profiles' : 'Add Digital Profiles';
      default:
        return isEditing ? 'Edit' : 'Add';
    }
  };

  const formMapping = {
    qualification: {
      component: QualificationForm,
      title: getFormTitle('qualification'),
    },
    experience: {
      component: ExperienceForm,
      title: getFormTitle('experience'),
    },
    skills: { component: SkillsForm, title: getFormTitle('skills') },
    resume: { component: ResumeForm, title: getFormTitle('resume') },
    licences: { component: LicencesForm, title: getFormTitle('licences') },
    portfolio: { component: PortfolioForm, title: getFormTitle('portfolio') },
    reference: { component: ReferenceForm, title: getFormTitle('reference') },
    'digital-profile': {
      component: DigitalProfileForm,
      title: getFormTitle('digital-profile'),
    },
  };

  // Get the form component for the current section
  const FormComponent = formMapping[sectionId]?.component;

  if (!FormComponent) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg text-gray-700'>
          Form not available for this section yet.
        </p>
        <p className='text-sm text-gray-500 mt-2'>
          Please check back later or contact support.
        </p>
      </div>
    );
  }

  const isLoading = isSubmitting || updateLoading || uploadLoading;
  const error = updateError || uploadError;

  return (
    <form onSubmit={handleSubmit}>
      <div key={`form-${sectionId}`}>
        <FormComponent />
      </div>

      {/* Error Message */}
      {error && (
        <div className='mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm'>
          {error}
        </div>
      )}

      <div className='flex justify-end items-center gap-3 mt-6'>
        <button
          type='button'
          onClick={onClose}
          disabled={isLoading}
          className='py-2 px-5 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-medium disabled:opacity-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className='py-2 px-5 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors font-medium disabled:opacity-50'
        >
          {isLoading ? 'Saving...' : currentData ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// Then wrap it with memo and export it
const DynamicForm = React.memo(DynamicFormComponent);
DynamicForm.displayName = 'DynamicForm'; // Add display name for debugging

export default DynamicForm;
