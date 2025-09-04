import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { IoClose, IoShieldCheckmark, IoCard, IoTime } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiCheck, FiLock } from "react-icons/fi";

import {
  createPaymentIntent,
  confirmPayment,
  clearError,
  setProcessingPayment,
  resetPayment,
} from "../features/payment/paymentSlice";
import { clearDraft } from "../features/listings/draftSlice";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element options with glassmorphism styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontWeight: "400",
      "::placeholder": {
        color: "#9ca3af",
      },
      backgroundColor: "transparent",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
    complete: {
      color: "#059669",
      iconColor: "#059669",
    },
  },
  hidePostalCode: true,
};

// Payment form component
const PaymentForm = ({ plan, listingData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const {
    clientSecret,
    processingPayment,
    creatingIntent,
    error: paymentError,
    success,
  } = useSelector((state) => state.payment);

  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [listingImagePreview, setListingImagePreview] = useState(null);
  const intentCreatedRef = useRef(false);
  const currentPlanIdRef = useRef(null);

  // Get the first image from files that are being uploaded
  useEffect(() => {
    const getListingImagePreview = () => {
      const imageFields = [
        "images",
        "image",
        "photos",
        "pictures",
        "gallery",
        "mainImage",
        "coverImage",
        "thumbnail",
        "files",
        "file",
        "document",
        "profile",
      ];

      // Check files being uploaded
      if (listingData.files) {
        for (const field of imageFields) {
          const files = listingData.files[field];
          if (files && Array.isArray(files) && files.length > 0) {
            const firstFile = files[0];
            // Check if it's an image file
            if (
              firstFile &&
              firstFile.type &&
              firstFile.type.startsWith("image/")
            ) {
              // Create preview URL for the file
              return URL.createObjectURL(firstFile);
            }
          }
        }
      }

      // Fallback: check if there are any uploaded URLs in values
      if (listingData.values) {
        for (const field of imageFields) {
          const imageData = listingData.values[field];
          if (imageData) {
            // Handle array of images
            if (Array.isArray(imageData) && imageData.length > 0) {
              return imageData[0].url || imageData[0];
            }
            // Handle single image object
            if (imageData.url) {
              return imageData.url;
            }
            // Handle direct URL string
            if (typeof imageData === "string" && imageData.startsWith("http")) {
              return imageData;
            }
          }
        }
      }

      return null;
    };

    const preview = getListingImagePreview();
    setListingImagePreview(preview);

    // Cleanup function to revoke object URLs to prevent memory leaks
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [listingData]);

  useEffect(() => {
    // Create payment intent only once per plan and if not already created or creating
    if (
      plan &&
      listingData &&
      !intentCreatedRef.current &&
      !clientSecret &&
      !creatingIntent &&
      plan._id !== currentPlanIdRef.current
    ) {
      dispatch(clearError());
      dispatch(
        createPaymentIntent({
          planId: plan._id,
          listingData,
          currency: "aed",
        })
      );
      intentCreatedRef.current = true;
      currentPlanIdRef.current = plan._id;
    }
  }, [dispatch, plan, listingData, clientSecret, creatingIntent]);

  // Reset state when modal closes
  useEffect(() => {
    return () => {
      dispatch(resetPayment());
      intentCreatedRef.current = false;
      currentPlanIdRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    if (paymentError) {
      toast.error(`Payment Error: ${paymentError}`, {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [paymentError]);

  useEffect(() => {
    if (success) {
      toast.success("Payment successful! Your listing is being created...", {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Small delay to let user see the success message
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  }, [success, onSuccess]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready. Please try again.", {
        position: "bottom-left",
        autoClose: 3000,
      });
      return;
    }

    setProcessing(true);
    setCardError(null);
    dispatch(setProcessingPayment(true));

    const cardElement = elements.getElement(CardElement);

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: listingData.values?.name || "Customer",
            email: listingData.values?.email || undefined,
          },
        },
      }
    );

    if (error) {
      console.error("Payment confirmation error:", error);
      setCardError(error.message);
      setProcessing(false);
      dispatch(setProcessingPayment(false));
      toast.error(`Payment failed: ${error.message}`, {
        position: "bottom-left",
        autoClose: 4000,
      });
    } else if (paymentIntent.status === "succeeded") {
      // Extract files from listingData for upload
      const filesToUpload = {};
      if (listingData.files && Object.keys(listingData.files).length > 0) {
        Object.entries(listingData.files).forEach(([fieldName, files]) => {
          if (files && files.length > 0) {
            filesToUpload[fieldName] = files;
          }
        });
      }

      // Confirm payment on backend and create listing with files
      dispatch(
        confirmPayment({
          paymentIntentId: paymentIntent.id,
          files: filesToUpload,
        })
      );
      setProcessing(false);
    } else {
      setProcessing(false);
      dispatch(setProcessingPayment(false));
      toast.error("Payment was not completed. Please try again.", {
        position: "bottom-left",
        autoClose: 4000,
      });
    }
  };

  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  if (!plan || !listingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  if (creatingIntent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing payment...</p>
        </div>
      </div>
    );
  }

  const listingTitle =
    listingData.values?.title ||
    listingData.values?.name ||
    listingData.values?.adTitle ||
    listingData.values?.productName ||
    listingData.values?.serviceName ||
    "Your Listing";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Left Column - Listing Preview (Compact) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Order Summary
          </h3>

          {/* Compact Listing Preview */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              {listingImagePreview ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={listingImagePreview}
                    alt={listingTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-full h-full bg-[#e6eefa] flex items-center justify-center"
                    style={{ display: "none" }}
                  >
                    <span className="text-[#42a5f5] text-xs font-semibold">
                      AD
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#e6eefa] flex items-center justify-center border border-gray-200">
                  <span className="text-[#42a5f5] text-xs font-semibold">
                    AD
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                {listingTitle}
              </h4>
              <p className="text-xs text-gray-500">
                {plan.duration} days •{" "}
                {plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1)}{" "}
                Plan
              </p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan Price</span>
              <span className="text-gray-900">
                {plan.currency} {plan.price}
              </span>
            </div>
            {plan.discountPercentage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">
                  Discount ({plan.discountPercentage}%)
                </span>
                <span className="text-green-600">
                  -{plan.currency}{" "}
                  {(plan.price - plan.discountedPrice).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-[#42a5f5]">
                {plan.currency} {plan.discountedPrice || plan.price}
              </span>
            </div>
          </div>

          {/* Mini Benefits */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-2">Included benefits:</p>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <FiCheck className="text-[#42a5f5] text-sm" />
                <span>Priority placement</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <FiCheck className="text-[#42a5f5] text-sm" />
                <span>Verified badge</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <FiCheck className="text-[#42a5f5] text-sm" />
                <span>Enhanced visibility</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Payment Form (Spans 2 columns) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Details
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Input - More compact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 focus-within:border-[#42a5f5] focus-within:ring-1 focus-within:ring-[#42a5f5] transition-all">
                <CardElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                />
              </div>
              {cardError && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-xs flex items-center">
                    <IoClose className="mr-1 flex-shrink-0" />
                    {cardError}
                  </p>
                </div>
              )}
            </div>

            {/* Security Notice - More compact */}
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center space-x-2 text-green-700">
                <IoShieldCheckmark className="flex-shrink-0 text-sm" />
                <span className="text-xs font-medium">
                  Secured with 256-bit SSL encryption
                </span>
              </div>
            </div>

            {/* Action Buttons - More compact */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={processing || processingPayment}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !stripe || processing || processingPayment || !clientSecret
                }
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-white bg-[#42a5f5] hover:bg-[#2f6fd5] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {processing || processingPayment ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin mr-2 text-sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2 text-sm" />
                    Pay {plan.currency} {plan.discountedPrice || plan.price}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main payment modal component
const StripePaymentModal = ({
  isOpen,
  onClose,
  plan,
  listingData,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const handleSuccess = () => {
    // Clear draft silently (no toast)
    dispatch(clearDraft());

    // Close modal first
    onClose();

    // Then trigger success callback which should navigate to success page
    onSuccess();
  };

  const handleCancel = useCallback(() => {
    dispatch(resetPayment());
    onClose();
  }, [dispatch, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleCancel();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      ></div>

      {/* Modal Content - Centered and properly sized */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header - Compact and professional */}
        <div className="bg-gradient-to-r from-[#42a5f5] to-[#2196f3] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <IoCard className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Complete Payment</h2>
                <p className="text-sm text-blue-100">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-full hover:bg-white/20 transition-all duration-200 group"
            >
              <IoClose className="text-xl text-white group-hover:text-blue-100" />
            </button>
          </div>
        </div>

        {/* Payment Form - Scrollable content with better spacing */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] bg-gray-50">
          <div className="p-4 sm:p-6">
            <Elements stripe={stripePromise}>
              <PaymentForm
                plan={plan}
                listingData={listingData}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;
