import React from "react";
import { useNavigate } from "react-router";

export default function GarageCreatedModal({ onClose, slug }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 mt-20 h-screen">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-18 text-center relative">
        {/* Icon */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900">
          Garage Created Successfully!
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-2">
          Your have successfully setup your garage profile. What would you like
          to do next.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2 font-medium"
            onClick={() => navigate(`/garage/${slug || ""}`)}
          >
            View your garage
          </button>
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full py-2 font-medium"
            onClick={() => {
              onClose();
              navigate("/garage");
            }}
          >
            Go To Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
