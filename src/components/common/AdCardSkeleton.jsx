import React from "react";

const AdCardSkeleton = () => {
  // Create some variation in the skeleton to make it more realistic
  const titleWidths = ["w-3/4", "w-2/3", "w-4/5"];
  const descWidths = ["w-full", "w-5/6", "w-4/5"];
  const priceWidths = ["w-1/3", "w-1/4", "w-2/5"];
  const locationWidths = ["w-24", "w-20", "w-28"];

  const randomTitleWidth =
    titleWidths[Math.floor(Math.random() * titleWidths.length)];
  const randomDescWidth =
    descWidths[Math.floor(Math.random() * descWidths.length)];
  const randomPriceWidth =
    priceWidths[Math.floor(Math.random() * priceWidths.length)];
  const randomLocationWidth =
    locationWidths[Math.floor(Math.random() * locationWidths.length)];

  return (
    <div className="rounded-xl bg-white shadow-lg h-full animate-pulse group hover:shadow-xl transition-all duration-300">
      {/* Image placeholder */}
      <div className="relative overflow-hidden">
        <div className="h-[160px] sm:h-[180px] md:h-[200px] w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-t-lg relative">
          {/* Subtle shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        </div>

        {/* Heart icon placeholder */}
        <div className="absolute top-3 right-2 w-7 sm:w-8 h-7 sm:h-8 bg-gray-300 rounded-full shadow-sm"></div>

        {/* Badge placeholders - sometimes show, sometimes don't for variety */}
        {Math.random() > 0.6 && (
          <div className="absolute bottom-3 right-3 flex flex-col gap-2">
            <div className="bg-gray-300 py-1 px-2 sm:px-2.5 rounded-md w-16 h-6 shadow-sm"></div>
          </div>
        )}
      </div>

      {/* Content placeholder */}
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        {/* Title placeholder with variation */}
        <div className="space-y-2">
          <div
            className={`h-4 sm:h-5 bg-gray-200 rounded ${randomTitleWidth} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
          </div>
          {Math.random() > 0.5 && (
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          )}
        </div>

        {/* Description placeholder */}
        <div className="space-y-1">
          <div
            className={`h-3 bg-gray-200 rounded ${randomDescWidth} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-2/3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
          </div>
        </div>

        {/* Price placeholder */}
        <div
          className={`h-4 bg-gray-200 rounded ${randomPriceWidth} relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
        </div>

        {/* Property details placeholder (beds, baths, area) - sometimes show */}
        {Math.random() > 0.3 && (
          <div className="flex w-full justify-start gap-6">
            <div className="flex gap-1 sm:gap-2 items-center">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-4 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-1 sm:gap-2 items-center">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-4 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-1 sm:gap-2 items-center">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-6 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}

        {/* Location placeholder */}
        <div className="flex gap-1 sm:gap-2 items-center mt-1">
          <div className="h-4 sm:h-5 w-4 sm:w-5 bg-gray-200 rounded"></div>
          <div
            className={`h-3 bg-gray-200 rounded ${randomLocationWidth} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCardSkeleton;
