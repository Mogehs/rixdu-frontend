import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import {
  FaUser,
  FaBriefcase,
  FaUsers,
  FaBell,
  FaHeart,
  FaCar,
  FaBookmark,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaList,
} from 'react-icons/fa';
import { sidebarItems } from '../../data/dashboardData';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('profile_info');
  const [openDropdown, setOpenDropdown] = useState('my_profile');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const findActiveItemFromPath = (path) => {
    const pathSegments = path.replace(/^\//, '').split('/');
    if (pathSegments.length >= 2 && pathSegments[0] === 'dashboard') {
      const mainSection = pathSegments[1];
      const subSection = pathSegments[2] || '';
      const subSectionNormalized = subSection.toLowerCase();

      for (const item of sidebarItems) {
        const itemBasePath = item.basePath?.split('/');
        if (itemBasePath && itemBasePath[1] === mainSection) {
          if (item.subItems && subSection) {
            for (const subItem of item.subItems) {
              if (subItem.path.toLowerCase() === subSectionNormalized) {
                return {
                  mainItemKey: item.key,
                  activeItemKey: subItem.key,
                };
              }

              if (subItem.subCategories) {
                for (const subCategory of subItem.subCategories) {
                  if (
                    subCategory.path === subSection ||
                    (subSection === subItem.path &&
                      subCategory.key === 'motors')
                  ) {
                    return {
                      mainItemKey: item.key,
                      activeItemKey: subCategory.key,
                    };
                  }
                }
              }
            }

            if (item.subItems.length > 0) {
              return {
                mainItemKey: item.key,
                activeItemKey: item.subItems[0].key,
              };
            }
          }

          return {
            mainItemKey: item.key,
            activeItemKey: item.key,
          };
        }
      }
    }

    return {
      mainItemKey: 'my_profile',
      activeItemKey: 'profile_info',
    };
  };

  const getActiveItemDetails = () => {
    for (const item of sidebarItems) {
      if (item.key === activeItem) {
        return {
          mainItem: item,
          subItem: {
            icon: item.icon,
            label: item.label,
            key: item.key,
          },
        };
      }

      const subItem = item.subItems?.find((sub) => sub.key === activeItem);
      if (subItem) {
        return {
          mainItem: item,
          subItem,
        };
      }
      for (const sub of item.subItems || []) {
        if (sub.subCategories) {
          const subCategory = sub.subCategories.find(
            (cat) => cat.key === activeItem
          );
          if (subCategory) {
            return {
              mainItem: item,
              subItem: sub,
              subCategory,
            };
          }
        }
      }
    }
    return null;
  };

  const handleItemClick = (key) => {
    const clickedItem = sidebarItems.find((item) => item.key === key);
    if (clickedItem?.subItems) {
      setOpenDropdown(openDropdown === key ? null : key);
    } else if (clickedItem) {
      setActiveItem(key);
      setOpenDropdown(null);
      navigate(`/${clickedItem.basePath}`);
      setMobileFiltersOpen(false);
    }
  };

  const handleSubItemClick = (mainKey, subKey, subCategory = null) => {
    const mainItem = sidebarItems.find((item) => item.key === mainKey);

    if (subCategory) {
      const subItem = mainItem?.subItems.find(
        (sub) => sub.key === 'all_categories'
      );
      const category = subItem?.subCategories.find((cat) => cat.key === subKey);

      if (mainItem && subItem && category) {
        setActiveItem(subKey);
        setOpenDropdown(mainKey);
        navigate(`/${mainItem.basePath}/${subItem.path}/${category.path}`);
      }
    } else {
      const subItem = mainItem?.subItems.find((sub) => sub.key === subKey);

      if (mainItem && subItem) {
        setActiveItem(subKey);
        setOpenDropdown(mainKey);
        navigate(`/${mainItem.basePath}/${subItem.path}`);
      }
    }
    setMobileFiltersOpen(false);
  };

  useEffect(() => {
    const { mainItemKey, activeItemKey } = findActiveItemFromPath(
      location.pathname
    );
    setActiveItem(activeItemKey);
    setOpenDropdown(mainItemKey);
  }, [location.pathname]);

  const activeDetails = getActiveItemDetails();

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <div className='flex-grow flex flex-col lg:flex-row w-full pt-[120px]'>
        <div className='lg:hidden bg-white p-4 border-b border-gray-200'>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            Menu
          </button>
        </div>

        <div
          className={`
            ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block
            w-full lg:w-80 bg-white lg:mt-4 p-4 lg:p-6 
            lg:border-r lg:border-t border-gray-400 shadow-sm lg:rounded-tr-2xl
            ${mobileFiltersOpen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}
          `}
        >
          {mobileFiltersOpen && (
            <div className='lg:hidden flex justify-between items-center mb-4 pb-4 border-b'>
              <h2 className='text-xl font-bold text-gray-800'>Menu</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className='p-2 hover:bg-gray-100 rounded-full'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          )}

          <div className='bg-gray-50 rounded-2xl p-4 mb-6'>
            <h2 className='text-xl font-bold text-gray-800'>Profile Setting</h2>
          </div>

          <div className='space-y-2'>
            {sidebarItems.map((item) => (
              <div key={item.key} className='mb-4'>
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    openDropdown === item.key ||
                    (!item.subItems && activeItem === item.key)
                      ? 'bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100'
                      : 'bg-gray-50 rounded-xl hover:bg-gray-100'
                  }`}
                  onClick={() => handleItemClick(item.key)}
                >
                  <div className='flex items-center gap-3'>
                    <item.icon
                      className={`text-xl ${
                        openDropdown === item.key || activeItem === item.key
                          ? 'text-blue-400'
                          : 'text-gray-600'
                      }`}
                    />
                    <span className='font-semibold text-gray-800'>
                      {item.label}
                    </span>
                  </div>
                  {item.subItems && (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className={`h-5 w-5 text-blue-400 transition-transform ${
                        openDropdown === item.key ? 'rotate-180' : ''
                      }`}
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  )}
                </div>
                {item.subItems && openDropdown === item.key && (
                  <div className='mt-3 space-y-1 ml-4'>
                    {item.subItems.map((subItem) => (
                      <div
                        key={subItem.key}
                        className={`py-3 px-4 mx-1 rounded-lg cursor-pointer transition-colors ${
                          activeItem === subItem.key
                            ? 'bg-[#E6EEFA] text-gray-700 font-medium'
                            : 'bg-gray-100 hover:bg-[#E6EEFA] text-gray-700'
                        } ${subItem.subCategories ? 'mb-2' : ''}`}
                        onClick={() =>
                          handleSubItemClick(item.key, subItem.key)
                        }
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <subItem.icon
                              className={`text-lg ${
                                activeItem === subItem.key
                                  ? 'text-blue-400'
                                  : 'text-gray-600'
                              }`}
                            />
                            <span>{subItem.label}</span>
                          </div>
                          {subItem.subCategories && (
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-4 w-4 text-gray-600'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          )}
                        </div>
                        {subItem.subCategories && (
                          <div className='ml-6 mt-2 space-y-1'>
                            {subItem.subCategories.map((subCategory) => (
                              <div
                                key={subCategory.key}
                                className={`py-2 px-4 rounded-lg cursor-pointer transition-colors ${
                                  activeItem === subCategory.key
                                    ? 'bg-[#D1E7DD] text-green-800 font-medium'
                                    : 'bg-gray-100 hover:bg-[#D1E7DD] text-gray-700'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubItemClick(
                                    item.key,
                                    subCategory.key,
                                    true
                                  );
                                }}
                              >
                                <div className='flex items-center gap-3'>
                                  <span>{subCategory.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {mobileFiltersOpen && (
            <div className='flex gap-4 mt-6'>
              <button
                className='flex-1 py-3 text-gray-700 rounded-xl font-semibold bg-[#E5E5E5] hover:bg-[#d6d6d6] transition-colors'
                onClick={() => setMobileFiltersOpen(false)}
              >
                Close
              </button>
              <button
                className='flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition-colors shadow-lg'
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <main className='flex-grow p-6 rounded-lg shadow-md'>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
