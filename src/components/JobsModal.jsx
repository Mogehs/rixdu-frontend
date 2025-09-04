import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon,
  DocumentMagnifyingGlassIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

const JobsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleFindJobsClick = () => {
    navigate('/jobs/main');
    onClose();
  };

  const handleHireTalentClick = () => {
    navigate('/hire-talent');
    onClose();
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className='fixed inset-0 bg-black/70 overflow-y-auto h-full w-full flex justify-center items-center z-[200]'
      onClick={onClose}
    >
      <div
        className='relative mx-auto p-6 border-none w-full max-w-5xl shadow-lg rounded-xl bg-white'
        onClick={handleModalContentClick}
      >
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Get Hired or Find Talent
          </h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>
        <div className='mt-4 space-y-4'>
          <button
            onClick={handleFindJobsClick}
            className='w-full flex items-center p-4 text-left bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <div className='mr-4 flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center'>
              <DocumentMagnifyingGlassIcon className='h-6 w-6 text-blue-500' />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900'>Find Jobs</p>
              <p className='text-xs text-gray-500'>
                Get Hired at the job you want
              </p>
            </div>
          </button>
          <button
            onClick={handleHireTalentClick}
            className='w-full flex items-center p-4 text-left bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <div className='mr-4 flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center'>
              <UserPlusIcon className='h-6 w-6 text-blue-500' />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900'>Hire Talent</p>
              <p className='text-xs text-gray-500'>
                Find the right person for the job
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobsModal;
