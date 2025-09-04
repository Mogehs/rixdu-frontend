const categories = [
  'All Services',
  'General Practice',
  'Physical Therapy',
  'Home Care',
  'Mental Health',
  'Pediatric Care',
  'Elderly Care',
  'Dental Care',
  'Vision Care',
];

const ServiceCategoryList = () => (
  <div className='bg-white shadow p-4 rounded-lg'>
    <h2 className='text-[#111827] text-lg font-semibold mb-4'>Categories</h2>
    {/* Horizontal scrollable pills on small screens, vertical list on md+ */}
    <ul
      className='
        flex flex-row md:flex-col
        gap-2 md:gap-0
        overflow-x-auto md:overflow-visible
        text-[#4B5563]
        pb-2 md:pb-0
        -mx-2 md:mx-0
      '
    >
      {categories.map((cat) => (
        <li
          key={cat}
          className='
            cursor-pointer
            whitespace-nowrap
            px-4 py-2
            border border-gray-200
            rounded-full
            bg-white
            hover:bg-blue-50 hover:text-blue-600
            transition-colors
            text-sm md:text-base
            md:border-0 md:rounded-none md:px-0 md:py-1 md:bg-transparent md:hover:bg-transparent md:hover:text-secondary
          '
        >
          {cat}
        </li>
      ))}
    </ul>
  </div>
);

export default ServiceCategoryList;
