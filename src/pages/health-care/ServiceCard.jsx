import { HiOutlineArrowRightCircle } from 'react-icons/hi2';

const ServiceCard = ({ icon, title, description }) => (
  <div
    className='section-container bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] text-center px-8 py-10 flex flex-col items-center transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
    style={{ minWidth: 320, maxWidth: 360 }}
  >
    <div className='flex items-center justify-center w-[80px] h-[80px] rounded-full bg-primary mb-6 shadow-[0_2px_8px_rgba(25,181,254,0.12)]'>
      <img src={icon} alt={title} className='w-10 h-10' />
    </div>
    <h3 className='text-[1.5rem] font-semibold text-[#1A253C] mb-3 leading-tight tracking-tight'>
      {title}
    </h3>
    <p className='text-base text-[#5A6A85] mb-6 leading-relaxed font-normal'>
      {description}
    </p>
    <button className='flex items-center gap-2 text-[1rem] font-semibold text-[#1A253C] underline underline-offset-2 hover:text-[#19B5FE] transition-colors'>
      Learn More
      <span>
        <HiOutlineArrowRightCircle className='w-4 h-4 hover:text-[#19B5FE] transition-colors' />
      </span>
    </button>
  </div>
);

export default ServiceCard;
