import * as assets from '../assets';

// Profile sections for job profile page
export const profileSections = [
  {
    id: 'qualification',
    title: 'Qualification',
    icon: assets.QualificationIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'experience',
    title: 'Experience',
    icon: assets.ExperienceIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: assets.SkillsIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'resume',
    title: 'Resume',
    icon: assets.ResumeIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'licences',
    title: 'Licences',
    icon: assets.LicenceIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    icon: assets.PortfolioIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'reference',
    title: 'Reference',
    icon: assets.ReferenceIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
  {
    id: 'digital-profile',
    title: 'Digital Profile',
    icon: assets.DigitalProfileIcon,
    description:
      'Add your academic qualification details such as School, Undergrad and Post graduation degree.',
  },
];

// Form title mapping for different sections
export const formTitleMapping = {
  qualification: 'Add Qualification',
  experience: 'Add Experience',
  skills: 'Add Skills',
  resume: 'Upload Resume',
  licences: 'Add Licence',
  portfolio: 'Add Portfolio',
  reference: 'Add Reference',
  'digital-profile': 'Add Digital Profile',
};

// Mock user profile data
export const mockUserProfile = {
  name: 'Sam Wilson',
  email: 'my@gmail.com',
  phone: '+0123456789',
  visaStatus: '',
  dob: '',
  gender: '',
  avatar: assets.samWilson,
};

// Mock data for car ads in public profile
export const mockCarAds = [
  {
    id: 1,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add1,
  },
  {
    id: 2,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add2,
  },
  {
    id: 3,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add3,
  },
  {
    id: 4,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add3,
  },
  {
    id: 5,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add2,
  },
  {
    id: 6,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add1,
  },
  {
    id: 7,
    title: 'GCC Top Mercedes-Benz 2023',
    year: '2023',
    kilometer: '587',
    price: 'AED 190,500',
    image: assets.add1,
  },
];

// Mock ratings data for public profile
export const mockRatings = [
  {
    id: 1,
    buyerName: 'Muhammad safdar',
    buyerImage: assets.samWilson,
    rating: 4,
    comment: 'Nice! I like this one',
    fastReplies: true,
    fairPrice: true,
    onTime: true,
  },
  {
    id: 2,
    buyerName: 'Muhammad safdar',
    buyerImage: assets.samWilson,
    rating: 4,
    comment: 'Great! I would recommend this to others',
    fastReplies: true,
    fairPrice: true,
    onTime: true,
  },
  {
    id: 3,
    buyerName: 'Muhammad Shoaib',
    buyerImage: assets.samWilson,
    rating: 4,
    comment: 'Thats great! I really like this one',
    fastReplies: true,
    fairPrice: true,
    onTime: true,
  },
];
