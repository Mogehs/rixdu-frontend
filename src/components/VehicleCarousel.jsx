import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useNavigate } from "react-router-dom";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

// Helper component for vehicle content
const VehicleCardContent = ({ vehicle }) => {
  const formatPrice = (item) => {
    const price =
      item.values?.price || item.values?.fee || item.values?.cost || 0;
    if (!price || price === 0) return "Price on request";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getItemImage = (item) => {
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    if (item.values?.picture?.url) {
      return item.values.picture.url;
    }
    if (item.values?.image?.url) {
      return item.values.image.url;
    }
    if (item.values?.photos && item.values.photos.length > 0) {
      return item.values.photos[0]?.url || item.values.photos[0];
    }
    if (item.storeId?.slug === "vehicles") {
      return "https://via.placeholder.com/400x270/f3f4f6/9ca3af?text=Vehicle";
    }
    return "https://via.placeholder.com/400x270/f3f4f6/9ca3af?text=Service";
  };

  const getItemTitle = (item) => {
    return (
      item.values?.title ||
      item.values?.name ||
      item.values?.serviceName ||
      `${item.values?.make || ""} ${item.values?.model || ""}`.trim() ||
      item.categoryId?.name ||
      "Listing"
    );
  };

  const getItemLocation = (item) => {
    if (item.values?.location?.locationName) {
      return item.values.location.locationName;
    }
    if (item.values?.location?.address) {
      return item.values.location.address;
    }
    if (item.city) {
      return item.city.charAt(0).toUpperCase() + item.city.slice(1);
    }
    if (item.values?.city) {
      return item.values.city;
    }
    return "Location N/A";
  };

  const getItemSubtitle = (item) => {
    const parts = [];
    if (item.values?.year) parts.push(item.values.year);
    if (item.values?.brand) parts.push(item.values.brand);
    if (item.values?.make) parts.push(item.values.make);
    if (item.categoryId?.name && !parts.length)
      parts.push(item.categoryId.name);
    if (item.values?.warranty) parts.push(`Warranty: ${item.values.warranty}`);
    if (item.values?.status) parts.push(item.values.status);
    return parts.join(" • ") || "Available";
  };

  const getItemDescription = (item) => {
    if (item.values?.description) {
      return item.values.description.length > 40
        ? item.values.description.substring(0, 40) + "..."
        : item.values.description;
    }
    if (item.values?.features) {
      let features = item.values.features;
      if (typeof features === "string") {
        features = features.split(",")[0];
      } else if (Array.isArray(features)) {
        features = features[0];
      }
      return features || "Available";
    }
    if (item.storeId?.name) {
      return item.storeId.name;
    }
    return "Available";
  };

  return (
    <div className="relative w-full h-[270px]">
      <img
        src={getItemImage(vehicle)}
        alt={getItemTitle(vehicle)}
        className="w-full h-full object-cover rounded-2xl"
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/400x270/f3f4f6/9ca3af?text=No+Image";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-2xl transition duration-300 group-hover:from-transparent group-hover:via-transparent"></div>

      {/* Price badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-[#007BFF] font-semibold text-sm">
          {formatPrice(vehicle)}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 text-white">
        <h4 className="text-xl font-semibold mb-1 drop-shadow-lg">
          {getItemTitle(vehicle)}
        </h4>
        <div className="flex items-center text-gray-200 text-sm mb-2">
          <span className="mr-2">{getItemSubtitle(vehicle)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-white text-sm font-medium drop-shadow">
            {getItemDescription(vehicle)}
          </div>
          <div className="text-white text-sm drop-shadow">
            {getItemLocation(vehicle)}
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleCarousel = ({ vehicles, loading = false }) => {
  const navigate = useNavigate();

  const handleVehicleClick = (vehicle) => {
    navigate(`service/${vehicle.slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No listings available at the moment.</p>
      </div>
    );
  }

  // Only render the carousel component when we have valid data
  return (
    <CarouselWithEmbla
      vehicles={vehicles}
      onVehicleClick={handleVehicleClick}
    />
  );
};

// Separate component that handles Embla carousel
const CarouselWithEmbla = ({ vehicles, onVehicleClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-8 py-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="embla__slide min-w-[320px] max-w-[370px] flex-shrink-0 rounded-2xl overflow-hidden relative group shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => onVehicleClick(vehicle)}
            >
              <VehicleCardContent vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>
      {/* Carousel Controls - only show if we have multiple items */}
      {vehicles.length > 1 && (
        <div className="w-full flex justify-start items-center gap-4 mt-8">
          <button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className={`w-12 h-12 rounded-full border-2 border-[#1A253C] bg-white text-[#1A253C] flex items-center justify-center transition-colors ${
              prevBtnDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#EAF6FF]"
            }`}
            aria-label="Previous"
          >
            <GrFormPreviousLink size={24} />
          </button>
          <button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className={`w-12 h-12 rounded-full border-2 border-[#1A253C] bg-white text-[#1A253C] flex items-center justify-center transition-colors ${
              nextBtnDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#EAF6FF]"
            }`}
            aria-label="Next"
          >
            <GrFormNextLink size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleCarousel;
