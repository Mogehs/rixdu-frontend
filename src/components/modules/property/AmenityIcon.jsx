import React from 'react';

const AmenityIcon = ({ type }) => {
  switch (type) {
    case 'ac':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M13 3L15.5 10.5L23 13L15.5 15.5L13 23L10.5 15.5L3 13L10.5 10.5L13 3Z'
            fill='#4299E1'
          />
        </svg>
      );
    case 'lobby':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect
            x='8'
            y='4'
            width='10'
            height='18'
            stroke='#4B5563'
            strokeWidth='2'
          />
          <rect x='11' y='7' width='4' height='2' fill='#4B5563' />
          <rect x='11' y='12' width='4' height='2' fill='#4B5563' />
          <rect x='11' y='17' width='4' height='2' fill='#4B5563' />
        </svg>
      );
    case 'concierge':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M13 5L5 9V17L13 21L21 17V9L13 5Z'
            stroke='#FBBF24'
            strokeWidth='2'
          />
          <circle cx='13' cy='13' r='3' fill='#FBBF24' />
        </svg>
      );
    case 'disposal':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M7 20C7 21.1 7.9 22 9 22H17C18.1 22 19 21.1 19 20V8H7V20Z'
            fill='#10B981'
          />
          <path d='M16 4L15 3H11L10 4H6V6H20V4H16Z' fill='#10B981' />
        </svg>
      );
    case 'kitchen':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M6 10H20V22H6V10Z' fill='#EF4444' fillOpacity='0.2' />
          <path d='M20 7H6V9H20V7Z' fill='#EF4444' />
          <path d='M8 4H10V6H8V4Z' fill='#EF4444' />
          <path d='M12 4H14V6H12V4Z' fill='#EF4444' />
          <path d='M16 4H18V6H16V4Z' fill='#EF4444' />
          <line
            x1='9'
            y1='11'
            x2='9'
            y2='21'
            stroke='#EF4444'
            strokeWidth='2'
          />
          <line
            x1='13'
            y1='11'
            x2='13'
            y2='21'
            stroke='#EF4444'
            strokeWidth='2'
          />
          <line
            x1='17'
            y1='11'
            x2='17'
            y2='21'
            stroke='#EF4444'
            strokeWidth='2'
          />
        </svg>
      );
    case 'camera':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M5 8V20C5 20.5523 5.44772 21 6 21H20C20.5523 21 21 20.5523 21 20V8C21 7.44772 20.5523 7 20 7H6C5.44772 7 5 7.44772 5 8Z'
            fill='#374151'
          />
          <circle cx='13' cy='14' r='3' fill='#9CA3AF' />
          <path d='M15 4L14 7H12L11 4L15 4Z' fill='#374151' />
        </svg>
      );
    case 'cafe':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M8 4H18V14H8V4Z' fill='#7C3AED' fillOpacity='0.2' />
          <path
            d='M8 14V17C8 18.6569 9.34315 20 11 20H15C16.6569 20 18 18.6569 18 17V14H8Z'
            fill='#7C3AED'
            fillOpacity='0.5'
          />
          <path d='M4 22H22V23H4V22Z' fill='#7C3AED' />
          <path d='M21 8H18V11H21V8Z' fill='#7C3AED' />
        </svg>
      );
    case 'waterpark':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M8 14C8 14 10 12 13 12C16 12 18 14 18 14'
            stroke='#3B82F6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <path
            d='M8 17C8 17 10 15 13 15C16 15 18 17 18 17'
            stroke='#3B82F6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <path
            d='M8 20C8 20 10 18 13 18C16 18 18 20 18 20'
            stroke='#3B82F6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='13' cy='8' r='3' fill='#3B82F6' />
        </svg>
      );
    case 'spa':
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M13 4C11 6 8 6 5 6C5 12 5 18 5 18C8 18 11 18 13 16C15 18 18 18 21 18C21 18 21 12 21 6C18 6 15 6 13 4Z'
            fill='#8B5CF6'
            fillOpacity='0.3'
          />
          <circle cx='13' cy='9' r='2' fill='#8B5CF6' />
          <circle cx='9' cy='10' r='2' fill='#8B5CF6' />
          <circle cx='17' cy='10' r='2' fill='#8B5CF6' />
        </svg>
      );
    default:
      return (
        <svg
          width='26'
          height='26'
          viewBox='0 0 26 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='13' cy='13' r='8' fill='#9CA3AF' fillOpacity='0.4' />
        </svg>
      );
  }
};

export default AmenityIcon;
