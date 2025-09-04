import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { IoChevronBack } from "react-icons/io5";
import { PiDiamondsFourBold } from "react-icons/pi";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RiVipDiamondFill } from "react-icons/ri";
import {
  selectDraftData,
  clearDraft,
} from "../../features/listings/draftSlice";
import {
  createListing,
  clearError,
} from "../../features/listings/listingsSlice";
import {
  fetchPricePlansForCategory,
  clearError as clearPricePlanError,
} from "../../features/admin/pricePlansSlice";
import StripePaymentModal from "../../components/StripePaymentModal";

// Free Plans
const freePlans = [
  {
    id: "free",
    title: "Post this add for free!",
    subtitle: "You have 1 free ad to post in Domestic",
    type: "standard",
    price: 0,
  },
];

const SelectPlanPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State declarations first
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [isProcessingListing, setIsProcessingListing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    originalPrice: 0,
    discountPercentage: 0,
    discountAmount: 0,
    finalPrice: 0,
  });

  // Redux selectors
  const draftData = useSelector(selectDraftData);
  const { categoryPlans, error: pricePlansError } = useSelector(
    (state) => state.adminPricePlans
  );
  const { currentPayment, success: paymentSuccess } = useSelector(
    (state) => state.payment
  );

  // Handle payment success
  useEffect(() => {
    if (paymentSuccess && currentPayment) {
      // Navigate to success page with the created listing data
      navigate("/place-ad/success", {
        state: {
          listing: currentPayment,
          plan: selectedPlan,
          planPrice:
            selectedPlanData?.discountedPrice || selectedPlanData?.price || 0,
          isPayment: true,
        },
        replace: true,
      });
    }
  }, [
    paymentSuccess,
    currentPayment,
    navigate,
    selectedPlan,
    selectedPlanData,
  ]);

  // Extract plans from API response using useMemo to prevent re-renders
  const premiumPlans = useMemo(
    () => categoryPlans?.grouped?.premium || [],
    [categoryPlans]
  );
  const featuredPlans = useMemo(
    () => categoryPlans?.grouped?.featured || [],
    [categoryPlans]
  );

  // Load draft data and fetch price plans on component mount
  useEffect(() => {
    // Don't redirect if we're currently processing a listing
    if (isProcessingListing) return;

    if (!draftData) {
      // If no draft data, redirect back to form
      toast.error("No draft data found. Please fill out the form first.", {
        position: "bottom-left",
        autoClose: 3000,
      });
      navigate("/place-ad");
      return;
    }

    // Fetch price plans for the category
    if (draftData.categoryId) {
      dispatch(clearPricePlanError());
      dispatch(
        fetchPricePlansForCategory({
          categoryId: draftData.categoryId,
          isActive: true,
        })
      );
    }

    // Notify user if files were uploaded but not saved in draft
    if (draftData.hasFiles) {
      toast.warning(
        "Note: Uploaded files are not saved in draft. You can add files after creating the listing.",
        {
          position: "bottom-left",
          autoClose: 5000,
        }
      );
    }
  }, [navigate, draftData, isProcessingListing, dispatch]);

  // Show error toast for price plans API errors
  useEffect(() => {
    if (pricePlansError) {
      toast.error(`Failed to load price plans: ${pricePlansError}`, {
        position: "bottom-left",
        autoClose: 4000,
      });
    }
  }, [pricePlansError]);

  // Update order summary when selected plan changes
  useEffect(() => {
    const calculateOrderSummary = () => {
      let originalPrice = 0;
      let discountPercentage = 0;
      let discountAmount = 0;
      let finalPrice = 0;

      // Calculate prices based on selected plan
      if (selectedPlan !== "free") {
        const plan = [...premiumPlans, ...featuredPlans].find(
          (p) =>
            p._id === selectedPlan ||
            `${p.planType}-${p.duration}` === selectedPlan
        );
        if (plan) {
          originalPrice = plan.price;
          discountPercentage = plan.discountPercentage || 0;
          discountAmount =
            discountPercentage > 0
              ? (originalPrice * discountPercentage) / 100
              : 0;
          finalPrice = plan.discountedPrice || originalPrice;
        }
      }

      setOrderSummary({
        originalPrice,
        discountPercentage,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
      });
    };

    calculateOrderSummary();
  }, [selectedPlan, premiumPlans, featuredPlans]);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePayment = async () => {
    if (!draftData) {
      toast.error(
        "No draft data found. Please go back and fill out the form.",
        {
          position: "bottom-left",
          autoClose: 3000,
        }
      );
      return;
    }

    try {
      dispatch(clearError());
      setIsProcessingListing(true);

      // For free plans, create the listing immediately
      if (selectedPlan === "free") {
        const listingData = {
          categoryId: draftData.categoryId,
          storeId: draftData.storeId,
          values: draftData.values || {},
          files: draftData.files || {},
          city: draftData.city,
          plan: "free",
          planDuration: null,
        };

        const result = await dispatch(createListing(listingData));

        if (result.type === "listings/createListing/fulfilled") {
          // Clear draft after successful creation
          dispatch(clearDraft());

          navigate("/place-ad/success", {
            state: {
              listing: result.payload.data,
              plan: selectedPlan,
            },
          });
        } else {
          // Handle different error response structures
          let errorMessage = "Failed to create listing. Please try again.";

          if (result.payload) {
            if (typeof result.payload === "string") {
              errorMessage = result.payload;
            } else if (result.payload.message) {
              errorMessage = result.payload.message;
            } else if (result.payload.error) {
              errorMessage = result.payload.error;
            } else if (result.payload.errors) {
              if (
                Array.isArray(result.payload.errors) &&
                result.payload.errors.length > 0
              ) {
                errorMessage =
                  result.payload.errors[0].message || result.payload.errors[0];
              } else if (typeof result.payload.errors === "string") {
                errorMessage = result.payload.errors;
              }
            }
          }

          navigate("/place-ad/failure", {
            state: {
              error: errorMessage,
              plan: selectedPlan,
            },
          });
        }
      } else {
        // For paid plans, open Stripe payment modal
        const plan = [...premiumPlans, ...featuredPlans].find(
          (p) =>
            p._id === selectedPlan ||
            `${p.planType}-${p.duration}` === selectedPlan
        );

        if (!plan) {
          toast.error("Selected plan not found. Please try again.", {
            position: "bottom-left",
            autoClose: 3000,
          });
          setIsProcessingListing(false);
          return;
        }

        // Set the selected plan data and show payment modal
        setSelectedPlanData(plan);
        setShowPaymentModal(true);
        setIsProcessingListing(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setIsProcessingListing(false);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "bottom-left",
        autoClose: 4000,
      });
    }
  };

  const handlePaymentSuccess = () => {
    // Close payment modal - navigation will be handled by useEffect
    setShowPaymentModal(false);
    setSelectedPlanData(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedPlanData(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="flex items-center p-3 sm:p-4 bg-white">
        <button onClick={() => navigate(-1)} className="p-1 sm:p-2">
          <IoChevronBack className="text-xl sm:text-2xl text-[var(--color-dark)]" />
        </button>
        <h1 className="flex-1 text-center text-base sm:text-lg font-semibold text-[var(--color-dark)]">
          Select Plan
        </h1>
      </div>

      <div className="p-3 sm:p-4 section-container overflow-hidden">
        {/* Free Ads Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-dark)] mb-2">
            Free ads Post
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-dark)] mb-4">
            Select a package that works for you
          </p>

          {/* Free Plan Card */}
          <div className="bg-[#EDF8FF] rounded-xl p-3 sm:p-4 mb-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <RiVipDiamondFill className="text-xl sm:text-5xl text-[#72EEF6]" />
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-medium text-[var(--color-dark)]">
                  {freePlans[0].title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-dark)]">
                  {freePlans[0].subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Standard Plan */}
          <div
            className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${
              selectedPlan === "free"
                ? "border-[var(--color-primary)]"
                : "border-[var(--color-border)]"
            } cursor-pointer bg-white`}
            onClick={() => handlePlanSelect("free")}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedPlan === "free"}
                  onChange={() => handlePlanSelect("free")}
                  className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[var(--color-border)] rounded-sm appearance-none checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] cursor-pointer"
                />
                {selectedPlan === "free" && (
                  <IoCheckmarkOutline className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
              <span className="text-sm sm:text-base text-[var(--color-dark)]">
                Keep is Standard
              </span>
            </div>
            <span className="text-sm sm:text-base text-[var(--color-primary)]">
              Free
            </span>
          </div>
        </div>

        {/* Premium Ads Section */}
        {premiumPlans.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-dark)]">
                Premium Ads
              </h2>
              <span className="bg-[#FFD700] text-xs px-2 py-1 rounded">
                Premium
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-dark)] mb-4">
              Premium ads are placed on top of all ads Get upto 25X more offers
            </p>

            {premiumPlans.map((plan) => (
              <div
                key={plan._id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${
                  selectedPlan === plan._id ||
                  selectedPlan === `${plan.planType}-${plan.duration}`
                    ? "border-[var(--color-primary)]"
                    : "border-[var(--color-border)]"
                } cursor-pointer mb-3 sm:mb-4 bg-white`}
                onClick={() => handlePlanSelect(plan._id)}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={
                        selectedPlan === plan._id ||
                        selectedPlan === `${plan.planType}-${plan.duration}`
                      }
                      onChange={() => handlePlanSelect(plan._id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[var(--color-border)] rounded-sm appearance-none checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] cursor-pointer"
                    />
                    {(selectedPlan === plan._id ||
                      selectedPlan === `${plan.planType}-${plan.duration}`) && (
                      <IoCheckmarkOutline className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base text-[var(--color-dark)]">
                    Premium Ad for {plan.duration} days
                  </span>
                </div>
                <div className="text-right">
                  {plan.discountPercentage > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {plan.currency} {plan.price}
                      </span>
                      <span className="text-sm sm:text-base text-[var(--color-primary)] font-semibold">
                        {plan.currency} {plan.discountedPrice}
                      </span>
                      <span className="text-xs text-green-600">
                        {plan.discountPercentage}% off
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm sm:text-base text-[var(--color-primary)]">
                      {plan.currency} {plan.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show message if no premium/featured plans available */}
        {!categoryPlans && !pricePlansError && (
          <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-2"></div>
            <p className="text-sm text-[var(--color-dark)]">
              Loading price plans...
            </p>
          </div>
        )}

        {categoryPlans &&
          premiumPlans.length === 0 &&
          featuredPlans.length === 0 &&
          !pricePlansError && (
            <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 text-center">
              <p className="text-sm text-[var(--color-dark)]">
                No premium or featured plans available for this category.
              </p>
            </div>
          )}

        {/* Featured Ads Section */}
        {featuredPlans.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-dark)]">
                Featured Ads
              </h2>
              <span className="bg-blue-100 text-[var(--color-primary)] text-xs px-2 py-1 rounded">
                Featured
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-dark)] mb-4">
              Featured ads appear above the standard ads, and after the Premium
              ads
            </p>

            {featuredPlans.map((plan) => (
              <div
                key={plan._id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${
                  selectedPlan === plan._id ||
                  selectedPlan === `${plan.planType}-${plan.duration}`
                    ? "border-[var(--color-primary)]"
                    : "border-[var(--color-border)]"
                } cursor-pointer mb-3 sm:mb-4 bg-white`}
                onClick={() => handlePlanSelect(plan._id)}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={
                        selectedPlan === plan._id ||
                        selectedPlan === `${plan.planType}-${plan.duration}`
                      }
                      onChange={() => handlePlanSelect(plan._id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[var(--color-border)] rounded-sm appearance-none checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] cursor-pointer"
                    />
                    {(selectedPlan === plan._id ||
                      selectedPlan === `${plan.planType}-${plan.duration}`) && (
                      <IoCheckmarkOutline className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base text-[var(--color-dark)]">
                    Feature your ad for {plan.duration} days
                  </span>
                </div>
                <div className="text-right">
                  {plan.discountPercentage > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {plan.currency} {plan.price}
                      </span>
                      <span className="text-sm sm:text-base text-[var(--color-primary)] font-semibold">
                        {plan.currency} {plan.discountedPrice}
                      </span>
                      <span className="text-xs text-green-600">
                        {plan.discountPercentage}% off
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm sm:text-base text-[var(--color-primary)]">
                      {plan.currency} {plan.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-dark)] mb-4">
            Order Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-[var(--color-dark)]">
                Plan Price
              </span>
              <span className="text-sm sm:text-base text-[var(--color-dark)]">
                AED {orderSummary.originalPrice}
              </span>
            </div>

            {/* Show discount if available */}
            {orderSummary.discountPercentage > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm sm:text-base">
                  Discount ({orderSummary.discountPercentage}%)
                </span>
                <span className="text-sm sm:text-base">
                  -AED {orderSummary.discountAmount}
                </span>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sm sm:text-base text-[var(--color-dark)]">
                  Final Price
                </span>
                <span className="text-sm sm:text-base text-[var(--color-dark)]">
                  AED {orderSummary.finalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessingListing}
          className={`w-full py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-base font-medium ${
            isProcessingListing
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
          }`}
        >
          {isProcessingListing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {selectedPlan === "free"
                ? "Creating Listing..."
                : "Processing Payment..."}
            </div>
          ) : selectedPlan === "free" ? (
            "Create Free Listing"
          ) : (
            `Pay AED ${orderSummary.finalPrice}`
          )}
        </button>
      </div>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancel}
        plan={selectedPlanData}
        listingData={{
          categoryId: draftData?.categoryId,
          storeId: draftData?.storeId,
          values: draftData?.values || {},
          files: draftData?.files || {},
          city: draftData?.city,
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SelectPlanPage;
