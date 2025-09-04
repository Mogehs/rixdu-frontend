import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from previous page
  const { listing, plan, planPrice } = location.state || {};

  // Determine success message based on plan
  const getSuccessMessage = () => {
    if (plan === "free") {
      return "Your free ad has been posted successfully";
    } else if (plan?.includes("premium")) {
      return "Your premium ad has been posted successfully";
    } else if (plan?.includes("featured")) {
      return "Your featured ad has been posted successfully";
    }
    return "Your ad has been posted successfully";
  };

  const getSubMessage = () => {
    if (plan === "free") {
      return "Your ad is now live and visible to millions of potential buyers";
    } else {
      const planType = plan?.includes("premium") ? "premium" : "featured";
      const duration = plan?.split("-")[1];
      return `Your ${planType} ad will be highlighted for ${duration} days and visible to millions of potential buyers`;
    }
  };

  return (
    <div className="h-screen bg-[#FAFAFA] flex items-center justify-center pb-25">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-elegant p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EDF8FF] flex items-center justify-center">
                <IoCheckmarkCircleOutline className="text-4xl sm:text-5xl text-[var(--color-primary)]" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#72EEF6] rounded-full animate-pulse"></div>
              <div className="absolute bottom-0 -left-3 w-4 h-4 bg-[#72EEF6] rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3 text-[var(--color-headings)]">
            Congratulations!
          </h1>
          <p className="text-[var(--color-dark)] text-sm sm:text-base mb-2">
            {getSuccessMessage()}
          </p>
          <p className="text-[var(--color-dark)] text-xs sm:text-sm opacity-75">
            {getSubMessage()}
          </p>
          {planPrice && planPrice > 0 && (
            <p className="text-[var(--color-primary)] text-sm font-medium mt-2">
              Plan Cost: AED {planPrice}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[var(--color-primary)] text-[var(--color-white)] p-3 sm:p-4 rounded-xl hover:bg-[var(--color-secondary)] transition-colors font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <IoHomeOutline className="text-xl" />
            Go to Home
          </button>

          <button
            onClick={() => navigate("/place-ad")}
            className="w-full bg-[var(--color-white)] text-[var(--color-dark)] border-2 border-[var(--color-border)] p-3 sm:p-4 rounded-xl hover:border-[var(--color-primary)] transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <IoAddCircleOutline className="text-xl" />
            Place Another Ad
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
