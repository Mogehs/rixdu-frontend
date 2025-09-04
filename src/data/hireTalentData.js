import * as assets from '../assets';

// Talent categories data
export const talentCategories = {
  // Top level categories
  root: [
    { id: 'beauty', name: 'Beauty / Salon' },
    { id: 'security', name: 'Security Guard' },
    { id: 'hr', name: 'HR / Admin' },
    { id: 'medical', name: 'Medical / Healthcare' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'data', name: 'Data Management & Analysis' },
    { id: 'manufacturing', name: 'Manufacturing / Warehouse' },
    { id: 'cook', name: 'Cook / Chef' },
    { id: 'driver', name: 'Driver' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'logistics', name: 'Logistics & Distribution' },
    { id: 'education', name: 'Education' },
    { id: 'marketing', name: 'Marketing / Advertising' },
    { id: 'legal', name: 'Legal Services' },
    { id: 'accounting', name: 'Accounting / Finance' },
    { id: 'customer-service', name: 'Customer Service / Call Centre' },
    { id: 'automobile', name: 'Automobile' },
    { id: 'travel', name: 'Travel & Tourism / Leisure' },
    { id: 'marine', name: 'Marine Captain / Crew' },
    { id: 'event', name: 'Event Management & Operations' },
  ],
};

// Mock job listings data
export const talentJobListings = [
  {
    id: 1,
    title: 'Senior Hair Stylist',
    company: 'Luxury Salon & Spa',
    salary: 'AED 4,000 - 7,000 per month',
    experience: '3-5 years Experience',
    type: 'Full Time',
    location: 'Dubai',
    postedTime: '2 hours ago',
  },
  {
    id: 2,
    title: 'Professional Makeup Artist',
    company: 'Beauty Studio LLC',
    salary: 'AED 3,500 - 6,000 per month',
    experience: '2-4 years Experience',
    type: 'Full Time',
    location: 'Abu Dhabi',
    postedTime: '3 hours ago',
  },
];

// Filter options data
export const talentFilterOptions = {
  city: [
    { label: 'All Cities', value: 'all' },
    { label: 'Dubai', value: 'dubai' },
    { label: 'Abu Dhabi', value: 'abu-dhabi' },
    { label: 'Sharjah', value: 'sharjah' },
  ],
  remoteJob: [
    { label: 'All Types', value: 'all' },
    { label: 'Remote Only', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'On-site', value: 'onsite' },
  ],
  employmentType: [
    { label: 'All Types', value: 'all' },
    { label: 'Full Time', value: 'full-time' },
    { label: 'Part Time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
  ],
  education: [
    { label: 'All Education', value: 'all' },
    { label: 'High School', value: 'high-school' },
    { label: 'Diploma', value: 'diploma' },
    { label: "Bachelor's Degree", value: 'bachelors' },
  ],
  experience: [
    { label: 'All Experience', value: 'all' },
    { label: 'No Experience', value: '0' },
    { label: '1-2 years', value: '1-2' },
    { label: '3-5 years', value: '3-5' },
  ],
};

// Detailed talent profile data
export const talentProfileData = {
  id: 1,
  name: 'Sarah Johnson',
  title: 'Senior Hair Stylist',
  avatar: assets.jobsProviderIcon,
  rateRange: 'AED 150 - 300 per hour',
  availability: 'Available Immediately',
  location: 'Dubai, UAE',
  gender: 'Female',
  experience: '5+ Years',
  education: 'Professional Certification in Advanced Hair Styling',
  about: `Creative and detail-oriented hair stylist with over 5 years of experience in high-end salons. Specialized in modern cutting techniques, color treatments, and bridal styling. Known for creating personalized looks that enhance each client's unique features and lifestyle.`,
  languages: ['English', 'Arabic', 'Russian'],
  skills: [
    'Hair Cutting',
    'Color Treatment',
    'Bridal Styling',
    'Hair Extensions',
    'Keratin Treatment',
    'Balayage Specialist',
  ],
  portfolio: [
    assets.jobsProviderIcon,
    assets.jobsProviderIcon,
    assets.jobsProviderIcon,
  ],
  certifications: [
    "L'Oréal Professional Color Specialist",
    'Wella Master Colorist',
    'Vidal Sassoon Advanced Cutting',
  ],
  workHistory: [
    {
      company: 'Luxury Salon & Spa',
      position: 'Senior Hair Stylist',
      duration: '2020 - Present',
      location: 'Dubai',
    },
    {
      company: 'Elite Beauty Center',
      position: 'Hair Stylist',
      duration: '2018 - 2020',
      location: 'Abu Dhabi',
    },
  ],
  availability_hours: 'Flexible Hours, including weekends',
  preferred_location: 'Dubai, Abu Dhabi',
  expected_salary: 'AED 12,000 - 15,000 per month',
  qualifications: [
    {
      degree: 'Advanced Hair Styling Certification',
      institution: 'London Beauty Academy',
      year: '2018',
      grade: 'Distinction',
    },
    {
      degree: 'Diploma in Cosmetology',
      institution: 'Dubai Institute of Beauty',
      year: '2016',
      grade: 'A',
    },
  ],
  digitalProfiles: [
    {
      platform: 'Instagram',
      url: '@sarahstyles',
      followers: '15.2K',
    },
    {
      platform: 'YouTube',
      url: 'SarahHairArtistry',
      subscribers: '8.5K',
    },
  ],
  resume: {
    fileName: 'sarah_johnson_resume.pdf',
    size: '2.5 MB',
    uploadDate: '2023-05-15',
  },
};
