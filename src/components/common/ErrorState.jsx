import React from "react";

const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an error while loading the content.",
  onRetry,
  retryText = "Try Again",
  variant = "default", // "default" or "minimal"
}) => {
  if (variant === "minimal") {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Minimal error icon */}
          <div className="w-12 h-12 mx-auto mb-4 opacity-40">
            <svg
              className="w-full h-full text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-base font-medium text-gray-500 mb-2">{title}</h3>

          <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="mb-6">
        {/* Error icon with better styling */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
