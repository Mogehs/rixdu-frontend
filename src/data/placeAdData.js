import {
  classifiedIcon,
  communityIcon,
  eventsIcon,
  healthAndCareIcon,
  jobsIcon,
  motorsIcon,
  propertyForRentIcon,
  propertyForSaleIcon,
} from '../assets';

// Place Ad categories
export const placeAdCategories = [
  {
    name: 'Classifieds',
    value: 'classifieds',
    icon: classifiedIcon,
  },
  {
    name: 'Community',
    value: 'community',
    icon: communityIcon,
  },
  {
    name: 'Events',
    value: 'events',
    icon: eventsIcon,
  },
  {
    name: 'Health & Care',
    value: 'health-care',
    icon: healthAndCareIcon,
  },
  {
    name: 'Jobs',
    value: 'jobs',
    icon: jobsIcon,
  },
  {
    name: 'Motors',
    value: 'motors',
    icon: motorsIcon,
  },
  {
    name: 'Property for Rent',
    value: 'property-rent',
    icon: propertyForRentIcon,
  },
  {
    name: 'Property for Sale',
    value: 'property-sale',
    icon: propertyForSaleIcon,
  },
];

// Safety rules for place-ad
export const safetyRules = [
  'For any prohibited item or activity that violates UAE law',
  'In the wrong category',
  'Place multiple times, or in multiple categories',
  'With fraudulent or misleading information',
  'For an item that is located outside the UAE',
];
