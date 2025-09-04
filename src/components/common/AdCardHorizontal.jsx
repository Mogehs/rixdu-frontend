import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeartIcon from '../../assets/icons/heart.svg';
import HeartFilledIcon from '../../assets/icons/heart-filled.svg';
import VerifiedBadgeIcon from '../../assets/icons/verified-badge.svg';
import BedIcon from '../../assets/icons/bed.svg';
import BathIcon from '../../assets/icons/bath.svg';
import LocationIcon from '../../assets/icons/location.svg';
import PremiumBadgeIcon from '../../assets/icons/crown.svg';
import MeasureIcon from '../../assets/icons/sewing-tape-measure.svg';

const AdCardHorizontal = ({
  item,
  index,
  passedFavorites = [],
  onToggleFavorite,
  isProcessingFavorite
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);

  // Handle potentially undefined item
  if (!item) {
    return null;
  }

  // Extract values from item
  const {
    values = {},
    _id,
    images,
    isFeatured=true,
    isVerified=true,
  } = item;

  // Check if listing is in favorites using passed favorites data
  useEffect(() => {
    if (passedFavorites?.length > 0 && _id) {
      const isInFavorites = passedFavorites.some(
        favItem =>
          (typeof favItem === 'string' && favItem === _id) ||
          (favItem._id && favItem._id === _id)
      );
      setIsFavorited(isInFavorites);
    }
  }, [_id, passedFavorites]);

  // Handle favorite toggle - using the parent function
  const handleToggleFavorite = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the heart
    e.stopPropagation(); // Prevent event bubbling

    if (isLocalProcessing || isProcessingFavorite) return;

    setIsLocalProcessing(true);

    if (onToggleFavorite) {
      onToggleFavorite(_id)
        .then((result) => {
          // Update local state based on the response
          setIsFavorited(result.status === 'added');
        })
        .catch(() => {
          // Error is already handled by the parent function
        })
        .finally(() => {
          setIsLocalProcessing(false);
        });
    } else {
      // If no parent handler is provided, reset processing state
      setIsLocalProcessing(false);
    }
  };

  // Helper function to find value by partial key match (case insensitive)
  const findValueByKeyPattern = (patterns) => {
    const keys = Object.keys(values);
    for (const pattern of patterns) {
      const matchingKey = keys.find(key =>
        key.toLowerCase().includes(pattern.toLowerCase())
      );
      if (matchingKey && values[matchingKey]) {
        return values[matchingKey];
      }
    }
    return null;
  };

  // Extract specific values using flexible key matching
  const title = findValueByKeyPattern(['title', 'name', 'heading']);
  const description = findValueByKeyPattern(['description', 'desc', 'short description', 'details']);
  const price = findValueByKeyPattern(['price', 'cost', 'amount', 'fee']);
  const location = findValueByKeyPattern(['location', 'address', 'place', 'city']);
  const beds = findValueByKeyPattern(['bed', 'bedroom', 'room']);
  const baths = findValueByKeyPattern(['bath', 'bathroom', 'toilet']);
  const area = findValueByKeyPattern(['area', 'size', 'sqft', 'square']);

  // Handle different image formats
  const getImage = () => {
    // Check for images array from item
    if (images && images.length > 0) {
      return images[0];
    }

    // Check for various image key patterns in values
    const imagePatterns = ['image', 'images', 'photo', 'picture', 'file', 'files'];
    const imageValue = findValueByKeyPattern(imagePatterns);

    if (imageValue) {
      // Handle array of images
      if (Array.isArray(imageValue) && imageValue.length > 0) {
        const firstImage = imageValue[0];
        // Handle different image object structures
        if (typeof firstImage === 'string') {
          return firstImage;
        }
        if (firstImage?.url) {
          return firstImage.url;
        }
        if (firstImage?.path) {
          return firstImage.path;
        }
      }
      // Handle single image object
      if (typeof imageValue === 'object' && imageValue?.url) {
        return imageValue.url;
      }
      // Handle direct URL string
      if (typeof imageValue === 'string') {
        return imageValue;
      }
    }

    return null;
  };

  // Get location display text
  const getLocationText = () => {
    if (!location) return null;

    if (typeof location === 'object') {
      return location.address || location.city || location.name || JSON.stringify(location);
    }
    return location;
  };

  const displayImage = getImage();
  const locationText = getLocationText();

  return (
    <Link key={index} to={`/ad/${_id || ''}`}>
      <div className='rounded-xl bg-white shadow-lg h-full flex overflow-hidden'>
        <div className='relative w-1/3 min-w-[160px] max-w-[250px]'>
          <img
            src={displayImage ||
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
            }
            alt={title || 'Ad Image'}
            className='h-full w-full object-cover object-center'
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />

          {/* Heart Icon - Favorite toggle */}
          <div
            className='absolute top-3 right-2 w-7 sm:w-8 bg-white rounded-full p-2 cursor-pointer'
            onClick={handleToggleFavorite}
          >
            <img
              src={isFavorited ? HeartFilledIcon : HeartIcon}
              alt={isFavorited ? 'favorited' : 'add to favorites'}
              className={`w-full h-full ${isLocalProcessing || isProcessingFavorite ? 'opacity-50' : ''}`}
            />
          </div>

          {/* Badges container - positioned at bottom right */}
          <div className='absolute bottom-3 right-3 flex flex-col gap-2'>
            {/* Premium badge */}
            {isFeatured && (
              <div className='bg-primary py-1 px-2 sm:px-2.5 rounded-md flex items-center justify-center shadow-sm'>
                <img
                  src={PremiumBadgeIcon}
                  alt='premium'
                  className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                />
                <span className='ml-1 text-[10px] sm:text-xs font-medium text-white'>
                  Premium
                </span>
              </div>
            )}

            {/* Verified badge */}
            {isVerified && (
              <div className='bg-gray-50 py-1 px-2 sm:px-2.5 rounded-md flex items-center justify-center shadow-sm'>
                <img
                  src={VerifiedBadgeIcon}
                  alt='verified'
                  className='w-3.5 h-3.5 sm:w-4 sm:h-4'
                />
                <span className='ml-1 text-[10px] sm:text-xs font-medium text-gray-700'>
                  Verified
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='p-3 sm:p-4 flex flex-col gap-2 flex-grow'>
          {/* Title */}
          {title && (
            <h3 className='text-base sm:text-lg font-bold text-dark line-clamp-2 overflow-ellipsis'>
              {title}
            </h3>
          )}

          {/* Description */}
          {description && (
            <p className='text-gray-600 text-sm mb-2 line-clamp-2'>
              {description}
            </p>
          )}

          {/* Price */}
          {price && (
            <p className='text-dark text-sm sm:text-base'>
              Price: <span className='text-primary'>{price}</span>
            </p>
          )}

          {/* Property details (beds, baths, area) - only show if at least one is available */}
          {(beds || baths || area) && (
            <div className='flex w-full justify-start gap-6 text-dark text-xs sm:text-sm'>
              {beds && (
                <div className='flex gap-1 sm:gap-2 items-center'>
                  <img src={BedIcon} alt='bed' className='w-4 sm:w-auto' />
                  <span>{beds}</span>
                </div>
              )}
              {baths && (
                <div className='flex gap-1 sm:gap-2 items-center'>
                  <img src={BathIcon} alt='bath' className='w-4 sm:w-auto' />
                  <span>{baths}</span>
                </div>
              )}
              {area && (
                <div className='flex gap-1 sm:gap-2 items-center'>
                  <img src={MeasureIcon} alt='area' className='w-4 sm:w-auto' />
                  <span>{area}</span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {locationText && (
            <div className='flex gap-1 sm:gap-2 text-dark text-xs sm:text-sm items-center mt-auto'>
              <img src={LocationIcon} alt='location' className='h-4 sm:h-5' />
              <span className='truncate'>{locationText}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AdCardHorizontal;
