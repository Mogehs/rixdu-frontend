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
} from "react-icons/fa";

// Dashboard sidebar navigation items
export const sidebarItems = [
  {
    key: "my_profile",
    label: "My Profile",
    icon: FaUser,
    basePath: "dashboard/my-profile",
    subItems: [
      {
        key: "profile_info",
        label: "Profile Info",
        icon: FaInfoCircle,
        path: "profile",
      },
      {
        key: "my_address",
        label: "My Address",
        icon: FaMapMarkerAlt,
        path: "address",
      },
    ],
  },
  {
    key: "job_profile",
    label: "My Job Profile",
    icon: FaBriefcase,
    basePath: "dashboard/job-profile",
  },
  {
    key: "public_profile",
    label: "My Public Profile",
    icon: FaUsers,
    basePath: "dashboard/public-profile",
  },
  {
    key: "notification",
    label: "Notification",
    icon: FaBell,
    basePath: "dashboard/notifications/all",
  },
  {
    key: "favorite",
    label: "Favorite",
    icon: FaHeart,
    basePath: "dashboard/favorites/categories",
    // subItems: [
    //   {
    //     key: 'all_categories',
    //     label: 'All Categories',
    //     icon: FaList,
    //     path: 'categories',
    //     subCategories: [
    //       { key: 'motors', label: 'Motors', path: '' },
    //       {
    //         key: 'properties_for_sale',
    //         label: 'Properties for Sale',
    //         path: '',
    //       },
    //       { key: 'classified', label: 'Classified', path: '' },
    //     ],
    //   },
    // ],
  },
  {
    key: "appointments",
    label: "Appointments",
    icon: FaBookmark,
    basePath: "dashboard/doctor-appointment",
  },
];
