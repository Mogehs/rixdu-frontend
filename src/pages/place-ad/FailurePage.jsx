import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { BiSupport } from 'react-icons/bi';

const FailurePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error details from previous page
  const { error, plan } = location.state || {};

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <div className='text-center mb-8'>
        <div className='flex justify-center mb-4'>
          <IoCloseCircleOutline className='text-6xl text-red-500' />
        </div>
        <h1 className='text-2xl font-semibold mb-2 text-[var(--color-headings)]'>
          {plan ? 'Payment Failed' : 'Listing Creation Failed'}
        </h1>
        <p className='text-[var(--color-dark)] mb-4'>
          {error || "We couldn't process your payment. Please try again or contact support."}
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-elegant p-6 mb-6'>
        <h2 className='text-lg font-semibold mb-4 text-[var(--color-headings)]'>
          What went wrong?
        </h2>
        <ul className='space-y-3 text-[var(--color-dark)]'>
          <li className='flex items-start gap-2'>
            • Your payment might have been declined by your bank
          </li>
          <li className='flex items-start gap-2'>
            • There might be an issue with your payment method
          </li>
          <li className='flex items-start gap-2'>
            • The payment service might be temporarily unavailable
          </li>
        </ul>
      </div>

      <div className='space-y-4'>
        <button
          onClick={() => navigate('/place-ad/select-plan')}
          className='w-full bg-[var(--color-primary)] text-[var(--color-white)] p-4 rounded-lg hover:bg-[var(--color-secondary)] transition-colors font-semibold'
        >
          Try Again
        </button>

        <button
          onClick={() => (window.location.href = 'mailto:support@rixdu.com')}
          className='w-full bg-[var(--color-white)] text-[var(--color-dark)] border-2 border-[var(--color-border)] p-4 rounded-lg hover:border-[var(--color-primary)] transition-colors font-semibold flex items-center justify-center gap-2'
        >
          <BiSupport className='text-xl' />
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FailurePage;
