import { notificationImage } from '../assets';

// Mock notification data for both notification pages
export const notificationsData = [
  {
    id: 1,
    title: '2874 new search results',
    description: 'Have a look at these samsung ads',
    date: '19 September, 2024',
    image: notificationImage,
    isRead: false,
  },
  {
    id: 2,
    title: '2875 new search results',
    description: 'Have a look at these samsung ads',
    date: '19 September, 2024',
    image: notificationImage,
    isRead: false,
  },
  {
    id: 3,
    title: '2876 new search results',
    description: 'Have a look at these samsung ads',
    date: '19 September, 2024',
    image: notificationImage,
    isRead: false,
  },
  {
    id: 4,
    title: '2877 new search results',
    description: 'Have a look at these samsung ads',
    date: '19 September, 2024',
    image: notificationImage,
    isRead: false,
  },
];

// Additional notifications for all notifications page
export const allNotificationsData = [
  ...notificationsData,
  {
    id: 5,
    title: '2874 new search results',
    description: 'Have a look at these samsung ads',
    date: '19 September, 2024',
    image: notificationImage,
    isRead: true,
  },
  {
    id: 6,
    title: '2874 new search results',
    description: 'Have a look at these samsung ads',
    date: '18 September, 2024',
    image: notificationImage,
    isRead: true,
  },
];
