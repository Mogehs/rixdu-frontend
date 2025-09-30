import React from "react";

const NavigationShimmer = ({ isCompact = false }) => {
  const shimmerItems = Array.from({ length: 6 }, (_, index) => index);

  return (
    <div
      className={`flex items-center relative transition-all duration-300 ${
        isCompact ? "gap-1 lg:gap-1.5" : "gap-1.5 lg:gap-2 xl:gap-3"
      }`}
    >
      {isCompact ? (
        <>
          <div className="text-xs font-medium text-gray-400 mr-2">
            Categories:
          </div>
          {shimmerItems.map((index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-1.5 lg:px-2 py-1.5 pr-2 lg:pr-2.5 animate-pulse"
            >
              <div className="w-3.5 h-3.5 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </>
      ) : (
        shimmerItems.map((index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-2 lg:px-3 py-2 pr-3 lg:pr-4 animate-pulse"
          >
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded"></div>
          </div>
        ))
      )}
    </div>
  );
};

export default NavigationShimmer;
