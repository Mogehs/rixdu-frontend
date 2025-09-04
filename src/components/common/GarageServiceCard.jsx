import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// Icons
import HeartIcon from "../../assets/icons/heart.svg";
import HeartFilledIcon from "../../assets/icons/heart-filled.svg";
import LocationIcon from "../../assets/icons/location.svg";
import ServiceIcon from "../../assets/icons/tools.svg"; // replace with custom icon if you want
import PriceIcon from "../../assets/icons/cash.svg";

const GarageServiceCard = ({
  item,
  index,
  passedFavorites = [],
  onToggleFavorite,
  isProcessingFavorite,
  showFavourite = false,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  // Favorites check - moved before early return
  useEffect(() => {
    if (passedFavorites?.length > 0 && item?._id) {
      const isInFavorites = passedFavorites.some(
        (fav) =>
          (typeof fav === "string" && fav === item._id) ||
          (fav._id && fav._id === item._id)
      );
      setIsFavorited(isInFavorites);
    }
  }, [item?._id, passedFavorites]);

  if (!item) return null;

  const {
    values = {},
    _id,
    slug,
    images,
    isVerified,
    isFeatured,
    isPremium,
    paymentStatus,
  } = item;

  // Badge logic - professional priority: Featured > Premium > Verified
  const getBadgeInfo = () => {
    if (isFeatured && paymentStatus === "succeeded") {
      return {
        text: "Featured",
        className: "bg-slate-900 text-white",
        priority: 3,
      };
    }
    if (isPremium && paymentStatus === "succeeded") {
      return {
        text: "Premium",
        className: "bg-slate-700 text-white",
        priority: 2,
      };
    }
    if (isVerified) {
      return {
        text: "Verified",
        className: "bg-green-600 text-white",
        priority: 1,
      };
    }
    return null;
  };

  const badgeInfo = getBadgeInfo();

  // ✅ Flexible key matcher for dynamic parsed values
  const findValueByKeyPattern = (patterns) => {
    const keys = Object.keys(values);
    for (const pattern of patterns) {
      const matchingKey = keys.find((key) =>
        key.toLowerCase().includes(pattern.toLowerCase())
      );
      if (matchingKey && values[matchingKey]) {
        return values[matchingKey];
      }
    }
    return null;
  };

  // Extract fields
  const serviceName = findValueByKeyPattern(["service", "title", "name"]);
  const description = findValueByKeyPattern([
    "description",
    "details",
    "about",
  ]);
  const price = findValueByKeyPattern(["price", "cost", "fee"]);
  const location = findValueByKeyPattern([
    "location",
    "city",
    "address",
    "place",
  ]);
  const duration = findValueByKeyPattern(["time", "duration", "hours", "mins"]);
  const category = findValueByKeyPattern(["category", "type"]);

  // Fee formatting function
  const formatFee = (fee) => {
    if (!fee) return null;

    const feeStr = fee.toString().toLowerCase();

    // Handle "free" or "0" cases
    if (feeStr === "free" || feeStr === "0" || feeStr === "free consultation") {
      return "Free";
    }

    // Extract numbers and format
    const numbers = feeStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const amount = parseInt(numbers[0]);

      // Handle ranges like "100-200"
      if (numbers.length > 1) {
        const maxAmount = parseInt(numbers[1]);
        return `${amount}-${maxAmount} AED`;
      }

      return `${amount} AED`;
    }

    // Return original if no numbers found but contains currency
    if (feeStr.includes("aed") || feeStr.includes("dirhams")) {
      return fee;
    }

    return fee + " AED";
  };

  // Truncate service name to maintain card height
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // ✅ Location text handler
  const getLocationText = (loc) => {
    if (!loc) return null;
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      if (loc.address) return loc.address;
      if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
      if (loc.city) return loc.city;
      if (loc.locationName) return loc.locationName;
      return Object.values(loc).join(", ");
    }
    return null;
  };
  const locationText = getLocationText(location);

  // Image fallback
  const getImage = () => {
    if (images?.length > 0) return images[0];
    const imgVal = findValueByKeyPattern(["image", "photo", "icon", "picture"]);
    if (Array.isArray(imgVal) && imgVal.length > 0) return imgVal[0].url;
    if (typeof imgVal === "string") return imgVal;
    if (typeof imgVal === "object") return imgVal.url;
    return null;
  };
  const displayImage = getImage();

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isLocalProcessing || isProcessingFavorite) return;

    setIsLocalProcessing(true);
    if (onToggleFavorite) {
      onToggleFavorite(_id)
        .then((result) => {
          setIsFavorited(result.status === "added");
        })
        .finally(() => setIsLocalProcessing(false));
    } else {
      setIsLocalProcessing(false);
    }
  };

  return (
    <Link
      key={index}
      to={`/garage/service/${slug || _id}`}
      className="group relative block"
    >
      <div className="rounded-xl bg-white shadow-md hover:shadow-lg transition h-full">
        {/* Image/cover section */}
        <div className="relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={serviceName || "Service"}
              className="h-[160px] sm:h-[180px] w-full object-cover rounded-t-xl"
            />
          ) : (
            <div className="h-[160px] sm:h-[180px] w-full flex items-center justify-center bg-gray-100 rounded-t-xl">
              <img
                src={ServiceIcon}
                alt="service"
                className="w-12 h-12 opacity-60"
              />
            </div>
          )}

          {/* Favorite Button */}
          {showFavourite && (
            <div
              className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow"
              onClick={handleToggleFavorite}
            >
              <img
                src={isFavorited ? HeartFilledIcon : HeartIcon}
                alt="fav"
                className={`w-5 h-5 ${
                  isLocalProcessing || isProcessingFavorite ? "opacity-50" : ""
                }`}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4 flex flex-col gap-2">
          {serviceName && (
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-dark line-clamp-1 flex-1">
                {truncateText(serviceName, 35)}
              </h3>
              {badgeInfo && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badgeInfo.className}`}
                >
                  {badgeInfo.text}
                </span>
              )}
            </div>
          )}
          {category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {category}
            </p>
          )}
          {description && (
            <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
          )}

          {/* Price + Duration */}
          <div className="flex items-center justify-between mt-2">
            {price && (
              <div className="flex items-center gap-1 text-sm text-dark font-medium">
                <img src={PriceIcon} alt="price" className="w-4 h-4" />
                <span className="text-primary font-semibold">
                  {formatFee(price)}
                </span>
              </div>
            )}
            {duration && (
              <span className="text-xs text-gray-500">{duration}</span>
            )}
          </div>

          {/* Location */}
          {locationText && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
              <img src={LocationIcon} alt="location" className="w-4 h-4" />
              <span className="truncate">{truncateText(locationText, 40)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GarageServiceCard;
