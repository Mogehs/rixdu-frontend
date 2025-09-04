import React from "react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Loading Rixdu
        </h2>
        <p className="text-sm text-gray-500">
          Please wait while we set up your experience...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
