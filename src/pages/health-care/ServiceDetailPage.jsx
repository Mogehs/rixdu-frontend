import React from 'react';
import { FaUserDoctor, FaRegFileLines } from 'react-icons/fa6';
import { TbHealthRecognition } from 'react-icons/tb';
import { PiPhoneCallThin } from 'react-icons/pi';
import ServiceCategoryList from './ServiceCategoryList.jsx';
import ServiceListingCard from './ServiceListingCard.jsx';
import {
  genralPractitioner,
  mentalHealthCounseling,
  pediatricCare,
  elderlyCare,
  serviceDetailBanner,
} from '../../assets';

const relatedServices = [
  {
    id: 1,
    title: 'Mental Health Counseling',
    desc: 'Confidential counseling sessions with professionals.',
    img: mentalHealthCounseling,
  },
  {
    id:2,
    title: 'Pediatric Care',
    desc: 'Specialized care for infants, children, and adolescents.',
    img: pediatricCare,
  },
  {
    id:3,
    title: 'Elderly Care Services',
    desc: 'Dedicated care services for the elderly.',
    img: elderlyCare,
  },
  {
    id:4,
    title: 'Elderly Care Services',
    desc: 'Dedicated care services for the elderly.',
    img: elderlyCare,
  },
];

const ServiceDetailPage = () => {
  return (
    <div className='bg-[#F9FAFB] min-h-screen'>
      <main className='section-container mx-auto px-4 py-12'>
        {/* Main Content */}
        <div className='md:col-span-3 space-y-10'>
          {/* Service Banner */}
          <section className='bg-white rounded-2xl overflow-hidden mb-8'>
            <div className='p-8 pb-0'>
              <div className='flex items-center justify-between mb-2'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#111827]'>
                  General Health Checkup
                </h1>
                <span className='bg-[#E6F9F6] text-[#1DBF73] px-4 py-1 rounded-full text-xs font-semibold'>
                  Health & Care
                </span>
              </div>
              <p className='text-[#6B7280] text-base mb-6'>
                Complete physical checkup by certified doctors
              </p>
            </div>
            <div className='relative w-full h-64 md:h-80 flex items-center justify-center bg-gray-100'>
              <img
                src={serviceDetailBanner}
                alt='General Health Checkup'
                className='object-cover w-full h-full object-top rounded-2xl md:rounded-2xl'
                style={{ maxHeight: 320 }}
              />
              <div className='flex-wrap absolute bottom-8 left-0 w-full flex flex-col md:flex-row justify-start gap-3 xs:gap-6 px-2 md:px-10'>
                <button
                  className='bg-white text-[#111827] font-semibold rounded-full w-full sm:w-[260px] md:w-[300px] py-3 text-base shadow-none border-0 transition focus:outline-none focus:ring-2 focus:ring-[#19B5FE] focus:ring-offset-2'
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  Book Appointment
                </button>
                <button
                  className='bg-transparent text-white font-semibold rounded-full w-full sm:w-[260px] md:w-[300px] py-3 text-base border-2 border-white transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#19B5FE] focus:ring-offset-2'
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  Contact Clinic
                </button>
              </div>
            </div>
          </section>

          {/* About This Service */}
          <section className='bg-white rounded-2xl shadow-sm p-8'>
            <h2 className='text-2xl font-bold mb-2 text-[#111827]'>
              About This Service
            </h2>
            <p className='text-[#4B5563] mb-6'>
              Our General Health Checkup provides a comprehensive assessment of
              your overall health. Conducted by certified doctors, this service
              includes a thorough physical examination and essential tests to
              ensure your well-being. We focus on preventive care to help you
              maintain a healthy lifestyle.
            </p>

            {/* What's Included */}
            <div className='mb-10'>
              <h3 className='font-bold text-2xl mb-5 text-[#232B3E]'>
                What's Included
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F0FDFA] text-[#0D9488] text-2xl'>
                    <FaUserDoctor size={24} />
                  </span>
                  <span className='text-[#232B3E] text-lg font-medium'>
                    Consultation with Doctor
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F0FDFA] text-[#0D9488] text-2xl'>
                    <FaRegFileLines size={24} />
                  </span>
                  <span className='text-[#232B3E] text-lg font-medium'>
                    Summary Health Report
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F0FDFA] text-[#0D9488] text-2xl'>
                    <TbHealthRecognition size={24} />
                  </span>
                  <span className='text-[#232B3E] text-lg font-medium'>
                    Blood Pressure & Sugar Check
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F0FDFA] text-[#0D9488] text-2xl'>
                    <PiPhoneCallThin size={24} />
                  </span>
                  <span className='text-[#232B3E] text-lg font-medium'>
                    5-day Follow-up Support
                  </span>
                </div>
              </div>
            </div>

            {/* Service Mode */}
            <div className='mb-10'>
              <h3 className='font-bold text-2xl mb-5 text-[#232B3E]'>
                Service Mode
              </h3>
              <div className='flex flex-wrap flex-col sm:flex-row gap-4 w-full'>
                <button
                  className='bg-[#19B5FE] text-white font-semibold rounded-full px-10 py-2 text-lg shadow transition w-full sm:w-auto border-2 border-[#19B5FE] focus:outline-none'
                  style={{ minWidth: 250 }}
                >
                  At Home
                </button>
                <button
                  className='bg-white text-[#19B5FE] font-semibold rounded-full px-10 py-2 text-lg border-2 border-[#19B5FE] transition w-full sm:w-auto focus:outline-none'
                  style={{ minWidth: 250 }}
                >
                  At Clinic
                </button>
                <button
                  className='bg-white text-[#19B5FE] font-semibold rounded-full px-10 py-2 text-lg border-2 border-[#19B5FE] transition w-full sm:w-auto focus:outline-none'
                  style={{ minWidth: 250 }}
                >
                  Online
                </button>
              </div>
            </div>
          </section>

          {/* Related Services */}
          <section>
            <h2 className='text-2xl font-bold mb-4 text-[#111827]'>
              Related Services
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {relatedServices.map((item, idx) => (
                <ServiceListingCard key={item.title + idx} {...item} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetailPage;
