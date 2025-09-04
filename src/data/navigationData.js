import {
  homeIcon,
  notificationIcon,
  heartIcon,
  chatBubbleIcon,
  customerIcon,
  classifiedIcon,
  propertyForSaleIcon,
  jobsIcon,
  propertyForRentIcon,
  communityIcon,
  motorsIcon,
  healthAndCareIcon,
} from '../assets';

// ========================================
// API INTEGRATION UTILITIES
// ========================================

/**
 * Transform API response to navigation structure
 * Expected API structure:
 * {
 *   id: string,
 *   name: string,
 *   link: string,
 *   icon?: string,
 *   children?: Category[] // Recursive nesting
 * }
 */
export const transformApiToNavigation = (apiData, iconMap = {}) => {
  return apiData.map((item) => ({
    id: item.id,
    name: item.name,
    link: item.link,
    icon: iconMap[item.id] || classifiedIcon, // Fallback icon
    subcategories: item.children
      ? transformApiToNavigation(item.children, iconMap)
      : [],
  }));
};

/**
 * Icon mapping for API integration
 * Map category IDs to their respective icons
 */
export const categoryIconMap = {
  classified: classifiedIcon,
  'property-sale': propertyForSaleIcon,
  jobs: jobsIcon,
  'property-rent': propertyForRentIcon,
  community: communityIcon,
  motors: motorsIcon,
  'health-care': healthAndCareIcon,
};

/**
 * Validate navigation structure for infinite nesting
 * Ensures each category has required fields
 */
export const validateNavigationStructure = (categories) => {
  const validate = (item, path = '') => {
    const required = ['id', 'name', 'link'];
    const missing = required.filter((field) => !item[field]);

    if (missing.length > 0) {
      console.warn(`Missing required fields in ${path}: ${missing.join(', ')}`);
      return false;
    }

    if (item.subcategories) {
      return item.subcategories.every((sub, index) =>
        validate(sub, `${path}[${index}]`)
      );
    }

    return true;
  };

  return categories.every((cat, index) => validate(cat, `category[${index}]`));
};

// ========================================
// STATIC NAVIGATION DATA (FOR DEVELOPMENT)
// ========================================

// Header navigation links
export const navLinks = [
  { icon: homeIcon, text: 'home', to: '/' },
  { icon: notificationIcon, text: 'notifications', to: '/notifications' },
  { icon: heartIcon, text: 'favorites', to: '/favorites' },
  { icon: chatBubbleIcon, text: 'chat', to: '/chat' },
  { icon: customerIcon, text: 'profile', to: '/profile' },
];

// Category navigation for second row with nested structure
export const categoryNavigation = [
  {
    id: 'classified',
    name: 'Classified',
    icon: classifiedIcon,
    link: '/category/classified',
    subcategories: [
      {
        id: 'electronics',
        name: 'Electronics',
        link: '/category/classified/electronics',
        subcategories: [
          {
            id: 'mobile-devices',
            name: 'Mobile Devices',
            link: '/category/classified/electronics/mobile',
            subcategories: [
              {
                id: 'smartphones',
                name: 'Smartphones',
                link: '/category/classified/electronics/mobile/smartphones',
                subcategories: [
                  {
                    id: 'iphone',
                    name: 'iPhone',
                    link: '/category/classified/electronics/mobile/smartphones/iphone',
                  },
                  {
                    id: 'samsung',
                    name: 'Samsung Galaxy',
                    link: '/category/classified/electronics/mobile/smartphones/samsung',
                  },
                  {
                    id: 'android-phones',
                    name: 'Android Phones',
                    link: '/category/classified/electronics/mobile/smartphones/android',
                  },
                ],
              },
              {
                id: 'tablets',
                name: 'Tablets & iPads',
                link: '/category/classified/electronics/mobile/tablets',
                subcategories: [
                  {
                    id: 'ipad',
                    name: 'iPad',
                    link: '/category/classified/electronics/mobile/tablets/ipad',
                  },
                  {
                    id: 'android-tablets',
                    name: 'Android Tablets',
                    link: '/category/classified/electronics/mobile/tablets/android',
                  },
                  {
                    id: 'windows-tablets',
                    name: 'Windows Tablets',
                    link: '/category/classified/electronics/mobile/tablets/windows',
                  },
                ],
              },
              {
                id: 'accessories',
                name: 'Mobile Accessories',
                link: '/category/classified/electronics/mobile/accessories',
              },
            ],
          },
          {
            id: 'computers',
            name: 'Computers & Laptops',
            link: '/category/classified/electronics/computers',
            subcategories: [
              {
                id: 'laptops',
                name: 'Laptops',
                link: '/category/classified/electronics/computers/laptops',
              },
              {
                id: 'desktops',
                name: 'Desktop Computers',
                link: '/category/classified/electronics/computers/desktops',
              },
              {
                id: 'gaming-pcs',
                name: 'Gaming PCs',
                link: '/category/classified/electronics/computers/gaming',
              },
              {
                id: 'computer-parts',
                name: 'Computer Parts',
                link: '/category/classified/electronics/computers/parts',
              },
            ],
          },
          {
            id: 'gaming',
            name: 'Gaming',
            link: '/category/classified/electronics/gaming',
            subcategories: [
              {
                id: 'consoles',
                name: 'Gaming Consoles',
                link: '/category/classified/electronics/gaming/consoles',
              },
              {
                id: 'pc-gaming',
                name: 'PC Gaming',
                link: '/category/classified/electronics/gaming/pc',
              },
              {
                id: 'gaming-accessories',
                name: 'Gaming Accessories',
                link: '/category/classified/electronics/gaming/accessories',
              },
            ],
          },
          {
            id: 'audio-video',
            name: 'Audio & Video',
            link: '/category/classified/electronics/audio-video',
            subcategories: [
              {
                id: 'televisions',
                name: 'Televisions',
                link: '/category/classified/electronics/audio-video/tv',
              },
              {
                id: 'audio-systems',
                name: 'Audio Systems',
                link: '/category/classified/electronics/audio-video/audio',
              },
              {
                id: 'home-theater',
                name: 'Home Theater',
                link: '/category/classified/electronics/audio-video/theater',
              },
              {
                id: 'headphones',
                name: 'Headphones & Earbuds',
                link: '/category/classified/electronics/audio-video/headphones',
              },
            ],
          },
        ],
      },
      {
        id: 'furniture',
        name: 'Furniture & Home',
        link: '/category/classified/furniture',
        subItems: [
          {
            name: 'Living Room Furniture',
            link: '/category/classified/furniture/living-room',
          },
          {
            name: 'Bedroom Sets & Mattresses',
            link: '/category/classified/furniture/bedroom',
          },
          {
            name: 'Dining Room & Kitchen Furniture',
            link: '/category/classified/furniture/dining',
          },
          {
            name: 'Office & Study Room Furniture',
            link: '/category/classified/furniture/office',
          },
          {
            name: 'Outdoor & Garden Furniture',
            link: '/category/classified/furniture/outdoor',
          },
          {
            name: 'Home Appliances & Electronics',
            link: '/category/classified/furniture/appliances',
          },
          {
            name: 'Home Decor & Accessories',
            link: '/category/classified/furniture/decor',
          },
          {
            name: 'Storage & Organization Solutions',
            link: '/category/classified/furniture/storage',
          },
          {
            name: 'Lighting & Electrical Fixtures',
            link: '/category/classified/furniture/lighting',
          },
          {
            name: 'Curtains, Carpets & Textiles',
            link: '/category/classified/furniture/textiles',
          },
        ],
      },
      {
        id: 'clothing',
        name: 'Clothing & Accessories',
        link: '/category/classified/clothing',
        subItems: [
          { name: "Men's Fashion", link: '/category/classified/clothing/mens' },
          {
            name: "Women's Fashion",
            link: '/category/classified/clothing/womens',
          },
          { name: "Kids' Fashion", link: '/category/classified/clothing/kids' },
          { name: 'Watches', link: '/category/classified/clothing/watches' },
          { name: 'Jewelry', link: '/category/classified/clothing/jewelry' },
        ],
      },
      {
        id: 'books',
        name: 'Books & Hobbies',
        link: '/category/classified/books',
        subItems: [
          {
            name: 'Academic & Educational Books',
            link: '/category/classified/books/academic',
          },
          {
            name: 'Fiction & Literature',
            link: '/category/classified/books/fiction',
          },
          {
            name: 'Professional & Business Books',
            link: '/category/classified/books/business',
          },
          {
            name: "Children's Books & Comics",
            link: '/category/classified/books/children',
          },
          {
            name: 'Sports & Fitness Equipment',
            link: '/category/classified/books/sports',
          },
          {
            name: 'Musical Instruments & Audio',
            link: '/category/classified/books/music',
          },
          {
            name: 'Art & Craft Supplies',
            link: '/category/classified/books/art',
          },
          {
            name: 'Board Games & Puzzles',
            link: '/category/classified/books/games',
          },
        ],
      },
      {
        id: 'automotive-parts',
        name: 'Auto Parts & Accessories',
        link: '/category/classified/auto-parts',
        subItems: [
          {
            name: 'Car Parts & Engine Components',
            link: '/category/classified/auto-parts/car-parts',
          },
          {
            name: 'Motorcycle Parts & Accessories',
            link: '/category/classified/auto-parts/motorcycle',
          },
          {
            name: 'Car Audio & Electronics',
            link: '/category/classified/auto-parts/audio',
          },
          {
            name: 'Tires, Wheels & Rims',
            link: '/category/classified/auto-parts/tires',
          },
          {
            name: 'Car Care & Maintenance Products',
            link: '/category/classified/auto-parts/care',
          },
          {
            name: 'Performance & Tuning Parts',
            link: '/category/classified/auto-parts/performance',
          },
          {
            name: 'Safety & Security Equipment',
            link: '/category/classified/auto-parts/safety',
          },
        ],
      },
      {
        id: 'beauty-health',
        name: 'Beauty & Personal Care',
        link: '/category/classified/beauty',
        subItems: [
          {
            name: 'Skincare Products & Tools',
            link: '/category/classified/beauty/skincare',
          },
          {
            name: 'Makeup & Cosmetics',
            link: '/category/classified/beauty/makeup',
          },
          {
            name: 'Hair Care & Styling Tools',
            link: '/category/classified/beauty/hair',
          },
          {
            name: 'Perfumes & Fragrances',
            link: '/category/classified/beauty/perfumes',
          },
          {
            name: 'Health Supplements & Vitamins',
            link: '/category/classified/beauty/supplements',
          },
          {
            name: 'Personal Care Appliances',
            link: '/category/classified/beauty/appliances',
          },
        ],
      },
      {
        id: 'pets-animals',
        name: 'Pets & Animals',
        link: '/category/classified/pets',
        subItems: [
          {
            name: 'Dogs & Puppies',
            link: '/category/classified/pets/dogs',
          },
          {
            name: 'Cats & Kittens',
            link: '/category/classified/pets/cats',
          },
          {
            name: 'Birds & Exotic Pets',
            link: '/category/classified/pets/birds',
          },
          {
            name: 'Fish & Aquarium Supplies',
            link: '/category/classified/pets/fish',
          },
          {
            name: 'Pet Food & Accessories',
            link: '/category/classified/pets/accessories',
          },
          {
            name: 'Pet Services & Training',
            link: '/category/classified/pets/services',
          },
        ],
      },
      {
        id: 'services',
        name: 'Services & Business',
        link: '/category/classified/services',
        subItems: [
          {
            name: 'Home Services & Maintenance',
            link: '/category/classified/services/home',
          },
          {
            name: 'Professional Services',
            link: '/category/classified/services/professional',
          },
          {
            name: 'Event Planning & Catering',
            link: '/category/classified/services/events',
          },
          {
            name: 'Tutoring & Education',
            link: '/category/classified/services/education',
          },
          {
            name: 'Health & Wellness Services',
            link: '/category/classified/services/health',
          },
          {
            name: 'IT & Digital Services',
            link: '/category/classified/services/digital',
          },
          {
            name: 'Transportation & Logistics',
            link: '/category/classified/services/transport',
          },
        ],
      },
    ],
  },
  {
    id: 'property-sale',
    name: 'Buy Property',
    icon: propertyForSaleIcon,
    link: '/category/property-sale',
    subcategories: [
      {
        id: 'residential-sale',
        name: 'Residential',
        link: '/category/property-sale/residential',
        subcategories: [
          {
            id: 'apartments',
            name: 'Apartments',
            link: '/category/property-sale/residential/apartments',
            subcategories: [
              {
                id: 'studio-apartments',
                name: 'Studio Apartments',
                link: '/category/property-sale/residential/apartments/studio',
              },
              {
                id: '1-bedroom',
                name: '1 Bedroom Apartments',
                link: '/category/property-sale/residential/apartments/1-bedroom',
              },
              {
                id: '2-bedroom',
                name: '2 Bedroom Apartments',
                link: '/category/property-sale/residential/apartments/2-bedroom',
              },
              {
                id: '3-bedroom',
                name: '3+ Bedroom Apartments',
                link: '/category/property-sale/residential/apartments/3-bedroom',
              },
            ],
          },
          {
            id: 'villas',
            name: 'Villas',
            link: '/category/property-sale/residential/villas',
            subcategories: [
              {
                id: 'luxury-villas',
                name: 'Luxury Villas',
                link: '/category/property-sale/residential/villas/luxury',
              },
              {
                id: 'family-villas',
                name: 'Family Villas',
                link: '/category/property-sale/residential/villas/family',
              },
              {
                id: 'waterfront-villas',
                name: 'Waterfront Villas',
                link: '/category/property-sale/residential/villas/waterfront',
              },
            ],
          },
          {
            id: 'townhouses',
            name: 'Townhouses',
            link: '/category/property-sale/residential/townhouses',
            subcategories: [
              {
                id: 'modern-townhouses',
                name: 'Modern Townhouses',
                link: '/category/property-sale/residential/townhouses/modern',
              },
              {
                id: 'duplex',
                name: 'Duplex Townhouses',
                link: '/category/property-sale/residential/townhouses/duplex',
              },
            ],
          },
        ],
      },
      {
        id: 'commercial-sale',
        name: 'Commercial',
        link: '/category/property-sale/commercial',
        subItems: [
          {
            name: 'Offices',
            link: '/category/property-sale/commercial/offices',
          },
          {
            name: 'Retail Spaces',
            link: '/category/property-sale/commercial/retail',
          },
          {
            name: 'Warehouses',
            link: '/category/property-sale/commercial/warehouses',
          },
          {
            name: 'Industrial',
            link: '/category/property-sale/commercial/industrial',
          },
        ],
      },
      {
        id: 'land',
        name: 'Land',
        link: '/category/property-sale/land',
        subItems: [
          {
            name: 'Residential Land',
            link: '/category/property-sale/land/residential',
          },
          {
            name: 'Commercial Land',
            link: '/category/property-sale/land/commercial',
          },
        ],
      },
    ],
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: jobsIcon,
    link: '/category/jobs',
    subcategories: [
      {
        id: 'it-software',
        name: 'IT & Software Development',
        link: '/category/jobs/it-software',
        subcategories: [
          {
            id: 'web-development',
            name: 'Web Development',
            link: '/category/jobs/it-software/web',
            subcategories: [
              {
                id: 'frontend',
                name: 'Frontend Development',
                link: '/category/jobs/it-software/web/frontend',
              },
              {
                id: 'backend',
                name: 'Backend Development',
                link: '/category/jobs/it-software/web/backend',
              },
              {
                id: 'fullstack',
                name: 'Full Stack Development',
                link: '/category/jobs/it-software/web/fullstack',
              },
            ],
          },
          {
            id: 'mobile-development',
            name: 'Mobile Development',
            link: '/category/jobs/it-software/mobile',
            subcategories: [
              {
                id: 'ios-development',
                name: 'iOS Development',
                link: '/category/jobs/it-software/mobile/ios',
              },
              {
                id: 'android-development',
                name: 'Android Development',
                link: '/category/jobs/it-software/mobile/android',
              },
              {
                id: 'react-native',
                name: 'React Native',
                link: '/category/jobs/it-software/mobile/react-native',
              },
              {
                id: 'flutter',
                name: 'Flutter Development',
                link: '/category/jobs/it-software/mobile/flutter',
              },
            ],
          },
          {
            id: 'data-ai',
            name: 'Data Science & AI',
            link: '/category/jobs/it-software/data-ai',
            subcategories: [
              {
                id: 'data-science',
                name: 'Data Science',
                link: '/category/jobs/it-software/data-ai/data-science',
              },
              {
                id: 'machine-learning',
                name: 'Machine Learning',
                link: '/category/jobs/it-software/data-ai/ml',
              },
              {
                id: 'artificial-intelligence',
                name: 'Artificial Intelligence',
                link: '/category/jobs/it-software/data-ai/ai',
              },
              {
                id: 'data-engineering',
                name: 'Data Engineering',
                link: '/category/jobs/it-software/data-ai/data-eng',
              },
            ],
          },
          {
            id: 'devops-cloud',
            name: 'DevOps & Cloud',
            link: '/category/jobs/it-software/devops',
            subcategories: [
              {
                id: 'aws',
                name: 'AWS Specialist',
                link: '/category/jobs/it-software/devops/aws',
              },
              {
                id: 'azure',
                name: 'Azure Engineer',
                link: '/category/jobs/it-software/devops/azure',
              },
              {
                id: 'kubernetes',
                name: 'Kubernetes Expert',
                link: '/category/jobs/it-software/devops/kubernetes',
              },
              {
                id: 'docker',
                name: 'Docker Specialist',
                link: '/category/jobs/it-software/devops/docker',
              },
            ],
          },
        ],
      },
      {
        id: 'sales-marketing',
        name: 'Sales & Marketing',
        link: '/category/jobs/sales-marketing',
        subItems: [
          {
            name: 'Digital Marketing Specialist',
            link: '/category/jobs/sales-marketing/digital',
          },
          {
            name: 'Sales Executive & Account Manager',
            link: '/category/jobs/sales-marketing/sales',
          },
          {
            name: 'Business Development Manager',
            link: '/category/jobs/sales-marketing/business-dev',
          },
          {
            name: 'Content Marketing & Copywriting',
            link: '/category/jobs/sales-marketing/content',
          },
          {
            name: 'Social Media Management',
            link: '/category/jobs/sales-marketing/social-media',
          },
          {
            name: 'SEO & SEM Specialist',
            link: '/category/jobs/sales-marketing/seo',
          },
          {
            name: 'Brand Management & Marketing',
            link: '/category/jobs/sales-marketing/brand',
          },
          {
            name: 'Email Marketing & Automation',
            link: '/category/jobs/sales-marketing/email',
          },
          {
            name: 'Market Research & Analytics',
            link: '/category/jobs/sales-marketing/research',
          },
        ],
      },
      {
        id: 'finance-accounting',
        name: 'Finance & Accounting',
        link: '/category/jobs/finance',
        subItems: [
          {
            name: 'Financial Analyst & Planning',
            link: '/category/jobs/finance/analyst',
          },
          {
            name: 'Accountant & Bookkeeper',
            link: '/category/jobs/finance/accountant',
          },
          {
            name: 'Investment Banking & Advisory',
            link: '/category/jobs/finance/investment',
          },
          {
            name: 'Audit & Compliance Officer',
            link: '/category/jobs/finance/audit',
          },
          {
            name: 'Tax Specialist & Consultant',
            link: '/category/jobs/finance/tax',
          },
          {
            name: 'Corporate Finance & Treasury',
            link: '/category/jobs/finance/corporate',
          },
          {
            name: 'Risk Management & Assessment',
            link: '/category/jobs/finance/risk',
          },
        ],
      },
      {
        id: 'healthcare',
        name: 'Healthcare & Medical',
        link: '/category/jobs/healthcare',
        subItems: [
          {
            name: 'Doctors & Physicians (All Specialties)',
            link: '/category/jobs/healthcare/doctors',
          },
          {
            name: 'Nurses & Healthcare Assistants',
            link: '/category/jobs/healthcare/nurses',
          },
          {
            name: 'Pharmacists & Pharmacy Technicians',
            link: '/category/jobs/healthcare/pharmacy',
          },
          {
            name: 'Medical Technology & Lab Technicians',
            link: '/category/jobs/healthcare/technology',
          },
          {
            name: 'Healthcare Administration & Management',
            link: '/category/jobs/healthcare/admin',
          },
          {
            name: 'Dental & Oral Health Professionals',
            link: '/category/jobs/healthcare/dental',
          },
          {
            name: 'Mental Health & Counseling',
            link: '/category/jobs/healthcare/mental',
          },
        ],
      },
      {
        id: 'education',
        name: 'Education & Training',
        link: '/category/jobs/education',
        subItems: [
          {
            name: 'Teachers & Educators (All Levels)',
            link: '/category/jobs/education/teachers',
          },
          {
            name: 'Corporate Training & Development',
            link: '/category/jobs/education/corporate',
          },
          {
            name: 'Online Education & E-Learning',
            link: '/category/jobs/education/online',
          },
          {
            name: 'Academic Administration & Leadership',
            link: '/category/jobs/education/admin',
          },
          {
            name: 'Special Education & Support',
            link: '/category/jobs/education/special',
          },
          {
            name: 'Tutoring & Private Education',
            link: '/category/jobs/education/tutoring',
          },
        ],
      },
      {
        id: 'engineering',
        name: 'Engineering & Technical',
        link: '/category/jobs/engineering',
        subItems: [
          {
            name: 'Civil Engineering & Construction',
            link: '/category/jobs/engineering/civil',
          },
          {
            name: 'Mechanical Engineering & Design',
            link: '/category/jobs/engineering/mechanical',
          },
          {
            name: 'Electrical & Electronics Engineering',
            link: '/category/jobs/engineering/electrical',
          },
          {
            name: 'Chemical & Process Engineering',
            link: '/category/jobs/engineering/chemical',
          },
          {
            name: 'Project Management & Coordination',
            link: '/category/jobs/engineering/project',
          },
          {
            name: 'Environmental & Sustainability',
            link: '/category/jobs/engineering/environmental',
          },
          {
            name: 'Oil & Gas Engineering',
            link: '/category/jobs/engineering/oil-gas',
          },
        ],
      },
      {
        id: 'hospitality-tourism',
        name: 'Hospitality & Tourism',
        link: '/category/jobs/hospitality',
        subItems: [
          {
            name: 'Hotel Management & Operations',
            link: '/category/jobs/hospitality/hotel',
          },
          {
            name: 'Restaurant & Food Service',
            link: '/category/jobs/hospitality/restaurant',
          },
          {
            name: 'Travel & Tourism Services',
            link: '/category/jobs/hospitality/travel',
          },
          {
            name: 'Event Management & Planning',
            link: '/category/jobs/hospitality/events',
          },
          {
            name: 'Customer Service & Guest Relations',
            link: '/category/jobs/hospitality/customer-service',
          },
        ],
      },
      {
        id: 'media-creative',
        name: 'Media & Creative Arts',
        link: '/category/jobs/media',
        subItems: [
          {
            name: 'Graphic Design & Visual Arts',
            link: '/category/jobs/media/graphic-design',
          },
          {
            name: 'Video Production & Editing',
            link: '/category/jobs/media/video',
          },
          {
            name: 'Photography & Visual Media',
            link: '/category/jobs/media/photography',
          },
          {
            name: 'Content Writing & Journalism',
            link: '/category/jobs/media/writing',
          },
          {
            name: 'Music & Audio Production',
            link: '/category/jobs/media/music',
          },
        ],
      },
    ],
  },
  {
    id: 'property-rent',
    name: 'Rent Property',
    icon: propertyForRentIcon,
    link: '/category/property-rent',
    subcategories: [
      {
        id: 'apartments-rent',
        name: 'Apartments',
        link: '/category/property-rent/apartments',
        subItems: [
          { name: 'Studio', link: '/category/property-rent/apartments/studio' },
          { name: '1 Bedroom', link: '/category/property-rent/apartments/1br' },
          { name: '2 Bedroom', link: '/category/property-rent/apartments/2br' },
          {
            name: '3+ Bedroom',
            link: '/category/property-rent/apartments/3br-plus',
          },
        ],
      },
      {
        id: 'villas-rent',
        name: 'Villas',
        link: '/category/property-rent/villas',
        subItems: [
          {
            name: '3 Bedroom Villas',
            link: '/category/property-rent/villas/3br',
          },
          {
            name: '4 Bedroom Villas',
            link: '/category/property-rent/villas/4br',
          },
          {
            name: '5+ Bedroom Villas',
            link: '/category/property-rent/villas/5br-plus',
          },
        ],
      },
      {
        id: 'commercial-rent',
        name: 'Commercial',
        link: '/category/property-rent/commercial',
        subItems: [
          {
            name: 'Office Space',
            link: '/category/property-rent/commercial/office',
          },
          {
            name: 'Retail Shop',
            link: '/category/property-rent/commercial/retail',
          },
          {
            name: 'Warehouse',
            link: '/category/property-rent/commercial/warehouse',
          },
        ],
      },
      {
        id: 'short-term',
        name: 'Short Term',
        link: '/category/property-rent/short-term',
        subItems: [
          {
            name: 'Daily Rental',
            link: '/category/property-rent/short-term/daily',
          },
          {
            name: 'Weekly Rental',
            link: '/category/property-rent/short-term/weekly',
          },
          {
            name: 'Monthly Rental',
            link: '/category/property-rent/short-term/monthly',
          },
        ],
      },
    ],
  },
  {
    id: 'community',
    name: 'Community',
    icon: communityIcon,
    link: '/category/community',
    subcategories: [
      {
        id: 'services',
        name: 'Services',
        link: '/category/community/services',
        subItems: [
          {
            name: 'Home Maintenance',
            link: '/category/community/services/maintenance',
          },
          {
            name: 'Cleaning Services',
            link: '/category/community/services/cleaning',
          },
          { name: 'Tutoring', link: '/category/community/services/tutoring' },
          {
            name: 'Beauty Services',
            link: '/category/community/services/beauty',
          },
        ],
      },
      {
        id: 'activities',
        name: 'Activities',
        link: '/category/community/activities',
        subItems: [
          {
            name: 'Sports & Fitness',
            link: '/category/community/activities/sports',
          },
          { name: 'Art & Culture', link: '/category/community/activities/art' },
          {
            name: 'Music & Dance',
            link: '/category/community/activities/music',
          },
        ],
      },
      {
        id: 'events',
        name: 'Events',
        link: '/category/community/events',
        subItems: [
          { name: 'Workshops', link: '/category/community/events/workshops' },
          { name: 'Meetups', link: '/category/community/events/meetups' },
          {
            name: 'Charity Events',
            link: '/category/community/events/charity',
          },
        ],
      },
    ],
  },
  {
    id: 'motors',
    name: 'Motors',
    icon: motorsIcon,
    link: '/category/motors',
    subcategories: [
      {
        id: 'cars',
        name: 'Cars',
        link: '/category/motors/cars',
        subItems: [
          { name: 'Sedan', link: '/category/motors/cars/sedan' },
          { name: 'SUV', link: '/category/motors/cars/suv' },
          { name: 'Hatchback', link: '/category/motors/cars/hatchback' },
          { name: 'Coupe', link: '/category/motors/cars/coupe' },
          { name: 'Luxury Cars', link: '/category/motors/cars/luxury' },
          { name: 'Sports Cars', link: '/category/motors/cars/sports' },
        ],
      },
      {
        id: 'motorcycles',
        name: 'Motorcycles',
        link: '/category/motors/motorcycles',
        subItems: [
          { name: 'Sport Bikes', link: '/category/motors/motorcycles/sport' },
          { name: 'Cruisers', link: '/category/motors/motorcycles/cruisers' },
          { name: 'Scooters', link: '/category/motors/motorcycles/scooters' },
        ],
      },
      {
        id: 'heavy-vehicles',
        name: 'Heavy Vehicles',
        link: '/category/motors/heavy-vehicles',
        subItems: [
          { name: 'Trucks', link: '/category/motors/heavy-vehicles/trucks' },
          { name: 'Buses', link: '/category/motors/heavy-vehicles/buses' },
          {
            name: 'Construction Vehicles',
            link: '/category/motors/heavy-vehicles/construction',
          },
        ],
      },
      {
        id: 'boats',
        name: 'Boats',
        link: '/category/motors/boats',
        subItems: [
          { name: 'Yachts', link: '/category/motors/boats/yachts' },
          { name: 'Fishing Boats', link: '/category/motors/boats/fishing' },
          { name: 'Speed Boats', link: '/category/motors/boats/speed' },
        ],
      },
    ],
  },
  {
    id: 'health-care',
    name: 'Health Care',
    icon: healthAndCareIcon,
    link: '/category/health-care',
    subcategories: [
      {
        id: 'medical-services',
        name: 'Medical Services',
        link: '/category/health-care/medical',
        subItems: [
          { name: 'Clinics', link: '/category/health-care/medical/clinics' },
          {
            name: 'Hospitals',
            link: '/category/health-care/medical/hospitals',
          },
          {
            name: 'Specialists',
            link: '/category/health-care/medical/specialists',
          },
        ],
      },
      {
        id: 'wellness',
        name: 'Wellness',
        link: '/category/health-care/wellness',
        subItems: [
          {
            name: 'Fitness Centers',
            link: '/category/health-care/wellness/fitness',
          },
          { name: 'Spa & Massage', link: '/category/health-care/wellness/spa' },
          {
            name: 'Nutrition',
            link: '/category/health-care/wellness/nutrition',
          },
        ],
      },
    ],
  },
];

// Footer navigation links
export const footerLinks = {
  quickLinks: [
    { text: 'Home', to: '/' },
    { text: 'Properties', to: '/property/category' },
    { text: 'Motors', to: '/motors/category' },
    { text: 'Jobs', to: '/jobs/main' },
  ],
  companyLinks: [
    { text: 'About Us', to: '/about' },
    { text: 'Contact Us', to: '/contact' },
  ],
  accountLinks: [
    { text: 'My Profile', to: '/profile/my' },
    { text: 'Favorites', to: '/favorites' },
    { text: 'Notifications', to: '/notifications' },
  ],
  socialLinks: [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
  ],
};

// Mobile navigation links
export const mobileNavLinks = [
  { text: 'Home', to: '/' },
  { text: 'Property', to: '/property/category' },
  { text: 'Motors', to: '/motors/category' },
  { text: 'Jobs', to: '/jobs/main' },
  { text: 'Explore', to: '/explore' },
  { text: 'About', to: '/about' },
  { text: 'Contact', to: '/contact' },
];

// Safety rules for place-ad
export const safetyRules = [
  'For any prohibited item or activity that violates UAE law',
  'In the wrong category',
  'Place multiple times, or in multiple categories',
  'With fraudulent or misleading information',
  'For an item that is located outside the UAE',
];
