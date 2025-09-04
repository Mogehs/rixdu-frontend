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
  const cursorPositionsRef = useRef({});

  // Keep the ref updated with latest state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

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

  // Handle successful updates
  useEffect(() => {
    if (updateSuccess || uploadSuccess) {
      console.log('✅ Form submission successful, closing modal');
      onClose();
    }
  }, [updateSuccess, uploadSuccess, onClose]);

  // Initialize form data - optimized to run only when needed
  useEffect(() => {
    console.log('Initializing form data for section:', sectionId);

    // Create a reference to track if this effect has run for current sectionId
    const hasInitializedRef = useRef({});

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
    const { name, value } = e.target;

    // Store cursor position before state update
    if (e.target.selectionStart !== undefined) {
      cursorPositionsRef.current[name] = e.target.selectionStart;
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
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      resumeFile: file,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
          if (formData.resumeFile) {
            await uploadResumeFile(formData.resumeFile);
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

  const ResumeForm = () => (
    <>
      <FileUploadField
        id='resumeFile'
        name='resumeFile'
        label='Upload Resume'
        helpText='PDF, DOC, DOCX (MAX. 5MB)'
        onChange={handleFileChange}
      />
    </>
  );

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

  const formMapping = {
    qualification: { component: QualificationForm, title: 'Add Qualification' },
    experience: { component: ExperienceForm, title: 'Add Experience' },
    skills: { component: SkillsForm, title: 'Add Skills' },
    resume: { component: ResumeForm, title: 'Upload Resume' },
    licences: { component: LicencesForm, title: 'Add License' },
    portfolio: { component: PortfolioForm, title: 'Add Portfolio' },
    reference: { component: ReferenceForm, title: 'Add Reference' },
    'digital-profile': {
      component: DigitalProfileForm,
      title: 'Add Digital Profiles',
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
