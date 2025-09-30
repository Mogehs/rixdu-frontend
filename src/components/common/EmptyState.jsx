import React from "react";

const EmptyState = ({
  title = "No listings found",
  message = "No listings available at the moment.",
  showRetry = false,
  onRetry,
  type = "listings", // "listings" or "stores"
}) => {
  return (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="mb-6">
        {/* Better, more modern SVG icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
          {type === "stores" ? (
            // Store/Shop icon
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ) : (
            // Search/Listings icon
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
        {message}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default EmptyState;
