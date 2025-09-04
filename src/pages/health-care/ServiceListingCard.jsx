import { useNavigate } from 'react-router';

const ServiceListingCard = ({ id, title, desc, img }) => {
  const navigate = useNavigate();
  return (
    <div className='bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center'>
      <img
        src={img}
        alt={title}
        className='w-full h-40 object-cover rounded-xl mb-4'
        style={{ maxHeight: 170 }}
      />
      <h3 className='text-[#111827] font-bold text-xl w-full mb-1'>{title}</h3>
      <p className='text-[#4B5563] text-base w-full mb-6'>{desc}</p>
      <button
        className='w-full border border-gray-300 rounded-full py-2 text-[#374151] font-semibold text-base transition hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-200'
        onClick={(e) => navigate(`/health-care/services/${id}`)}
      >
        View Details
      </button>
    </div>
  );
};

export default ServiceListingCard;
