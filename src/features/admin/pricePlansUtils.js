// Price plan utility functions

/**
 * Format price with currency
 * @param {number} price - The price amount
 * @param {string} currency - The currency code (default: 'AED')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = "AED") => {
  return `${currency} ${parseFloat(price).toFixed(2)}`;
};

/**
 * Calculate discounted price
 * @param {number} originalPrice - The original price
 * @param {number} discountPercentage - The discount percentage
 * @returns {number} The discounted price
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) return originalPrice;
  return originalPrice - (originalPrice * discountPercentage) / 100;
};

/**
 * Get plan type color classes
 * @param {string} planType - The plan type ('premium' or 'featured')
 * @returns {object} Object containing color classes
 */
export const getPlanTypeColors = (planType) => {
  const colors = {
    premium: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: "text-yellow-500",
    },
    featured: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "text-blue-500",
    },
  };
  return colors[planType] || colors.featured;
};

/**
 * Get plan duration display text
 * @param {number} duration - Duration in days
 * @returns {string} Formatted duration text
 */
export const formatDuration = (duration) => {
  if (duration === 1) return "1 day";
  if (duration < 7) return `${duration} days`;
  if (duration === 7) return "1 week";
  if (duration < 30) {
    const weeks = Math.floor(duration / 7);
    const remainingDays = duration % 7;
    if (remainingDays === 0) {
      return weeks === 1 ? "1 week" : `${weeks} weeks`;
    }
    return `${weeks} week${weeks > 1 ? "s" : ""} ${remainingDays} day${
      remainingDays > 1 ? "s" : ""
    }`;
  }
  if (duration === 30) return "1 month";
  const months = Math.floor(duration / 30);
  const remainingDays = duration % 30;
  if (remainingDays === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  }
  return `${months} month${months > 1 ? "s" : ""} ${remainingDays} day${
    remainingDays > 1 ? "s" : ""
  }`;
};

/**
 * Validate price plan data
 * @param {object} planData - The price plan data to validate
 * @returns {object} Validation result with isValid boolean and errors array
 */
export const validatePricePlan = (planData) => {
  const errors = [];

  if (!planData.categoryId) {
    errors.push("Category is required");
  }

  if (!planData.storeId) {
    errors.push("Store is required");
  }

  if (
    !planData.planType ||
    !["premium", "featured"].includes(planData.planType)
  ) {
    errors.push("Valid plan type is required");
  }

  if (!planData.duration || planData.duration <= 0) {
    errors.push("Duration must be greater than 0");
  }

  if (!planData.price || planData.price <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (
    planData.discountPercentage &&
    (planData.discountPercentage < 0 || planData.discountPercentage > 100)
  ) {
    errors.push("Discount percentage must be between 0 and 100");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate default plan configurations
 * @returns {array} Array of default plan configurations
 */
export const getDefaultPlanConfigurations = () => {
  return [
    {
      planType: "premium",
      duration: 7,
      price: 28,
      features: [
        "Premium listing",
        "Priority placement",
        "Extended visibility",
      ],
    },
    {
      planType: "premium",
      duration: 14,
      price: 56,
      features: [
        "Premium listing",
        "Priority placement",
        "Extended visibility",
        "Featured badge",
      ],
    },
    {
      planType: "premium",
      duration: 30,
      price: 112,
      features: [
        "Premium listing",
        "Priority placement",
        "Extended visibility",
        "Featured badge",
        "Top placement",
      ],
    },
    {
      planType: "featured",
      duration: 7,
      price: 18,
      features: ["Featured listing", "Enhanced visibility"],
    },
    {
      planType: "featured",
      duration: 14,
      price: 36,
      features: ["Featured listing", "Enhanced visibility", "Featured badge"],
    },
    {
      planType: "featured",
      duration: 30,
      price: 79,
      features: [
        "Featured listing",
        "Enhanced visibility",
        "Featured badge",
        "Priority support",
      ],
    },
  ];
};

/**
 * Filter price plans based on criteria
 * @param {array} plans - Array of price plans
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered price plans
 */
export const filterPricePlans = (plans, filters) => {
  return plans.filter((plan) => {
    if (filters.categoryId && plan.categoryId._id !== filters.categoryId) {
      return false;
    }
    if (filters.storeId && plan.storeId._id !== filters.storeId) {
      return false;
    }
    if (filters.planType && plan.planType !== filters.planType) {
      return false;
    }
    if (filters.isActive !== undefined && plan.isActive !== filters.isActive) {
      return false;
    }
    return true;
  });
};

/**
 * Sort price plans by various criteria
 * @param {array} plans - Array of price plans
 * @param {string} sortBy - Sort criteria ('price', 'duration', 'created', 'name')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {array} Sorted price plans
 */
export const sortPricePlans = (plans, sortBy = "created", order = "desc") => {
  const sortedPlans = [...plans];

  sortedPlans.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "price":
        comparison = a.price - b.price;
        break;
      case "duration":
        comparison = a.duration - b.duration;
        break;
      case "name":
        comparison = (a.categoryId?.name || "").localeCompare(
          b.categoryId?.name || ""
        );
        break;
      case "created":
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sortedPlans;
};
