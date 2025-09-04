import React from 'react';

const ConfirmationModal = ({ open, onClose, appointment }) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md px-8 py-10 mx-4 relative flex flex-col items-center top-16'>
        {/* Success Icon */}
        <div className='flex items-center justify-center mb-4'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
            <svg width='36' height='36' fill='none' viewBox='0 0 24 24'>
              <circle cx='12' cy='12' r='12' fill='#D1FADF' />
              <path
                d='M7 13l3 3 7-7'
                stroke='#22C55E'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        </div>
        <h2 className='text-2xl font-bold text-center mb-2 text-gray-800'>
          Your appointment is confirmed
        </h2>
        <p className='text-center text-gray-500 mb-6'>
          You'll receive an email with all the details. You can also view your
          appointment details below.
        </p>
        <div className='w-full border-t pt-6 mb-4'>
          <div className='flex items-center gap-3 mb-2'>
            <img
              src={appointment?.doctorImg || '/default-doctor.png'}
              alt='Doctor'
              className='w-12 h-12 rounded-full object-cover border'
            />
            <div>
              <div className='font-semibold text-gray-800'>
                {appointment?.doctorName}
              </div>
              <div className='text-sm text-gray-500'>
                {appointment?.specialty}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3 mb-2'>
            <span className='bg-gray-100 rounded-full p-2'>
              <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                <rect
                  x='3'
                  y='5'
                  width='18'
                  height='16'
                  rx='2'
                  stroke='#6B7280'
                  strokeWidth='2'
                />
                <path
                  d='M16 3v4M8 3v4'
                  stroke='#6B7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </span>
            <div>
              <div className='text-xs text-gray-500'>Date and time</div>
              <div className='font-medium text-gray-800'>
                {appointment?.dateTime}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3 mb-2'>
            <span className='bg-gray-100 rounded-full p-2'>
              <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                <rect
                  x='4'
                  y='7'
                  width='16'
                  height='10'
                  rx='2'
                  stroke='#6B7280'
                  strokeWidth='2'
                />
                <path
                  d='M8 11h8'
                  stroke='#6B7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </span>
            <div>
              <div className='text-xs text-gray-500'>Consultation type</div>
              <div className='font-medium text-gray-800'>
                {appointment?.consultationType}
              </div>
            </div>
          </div>
        </div>
        <div className='flex gap-3 w-full mt-2'>
          <button
            className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition'
            onClick={appointment?.onViewDetails}
          >
            View appointment d.
          </button>
          <button
            className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-full transition'
            onClick={onClose}
          >
            Go To Home Page
          </button>
        </div>
        <div className='w-full text-center mt-6'>
          <a href='#' className='text-sm text-blue-600 underline'>
            Need help? Contact us
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
