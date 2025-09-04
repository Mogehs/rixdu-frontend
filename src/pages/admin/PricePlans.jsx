import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MdAdd,
  MdAttachMoney,
  MdClose,
  MdEdit,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
  MdAutoAwesome,
  MdStar,
} from "react-icons/md";
import { toast } from "react-toastify";
import {
  fetchPricePlans,
  createPricePlan,
  updatePricePlan,
  deletePricePlan,
  togglePricePlanStatus,
  bulkCreateDefaultPlans,
  clearSuccess,
  clearError,
} from "../../features/admin/pricePlansSlice";
import { fetchCategoriesByStore } from "../../features/admin/categoriesSlice";
import { fetchStores } from "../../features/admin/storesSlice";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PricePlans = () => {
  const dispatch = useDispatch();
  const { pricePlans, loading, error, success, pagination } = useSelector(
    (state) => state.adminPricePlans
  );
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.adminCategories
  );
  const { stores, loading: storesLoading } = useSelector(
    (state) => state.adminStores
  );

  // Debug: Log categories when they change
  useEffect(() => {
    console.log("Categories updated:", categories);
    console.log("Categories loading:", categoriesLoading);
    if (categories.length > 0) {
      console.log(
        "Leaf categories:",
        categories.filter((cat) => cat.isLeaf)
      );
    }
  }, [categories, categoriesLoading]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdatePlan, setIsUpdatePlan] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    storeId: "",
    planType: "premium",
    duration: 7,
    price: 0,
    currency: "AED",
    features: [""],
    description: "",
    discountPercentage: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePlanData, setDeletePlanData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "",
    storeId: "",
    planType: "",
    isActive: "",
    page: 1,
  });
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [bulkCreateData, setBulkCreateData] = useState({
    categoryId: "",
    storeId: "",
  });

  useEffect(() => {
    dispatch(fetchPricePlans(filters));
    dispatch(fetchStores({ limit: 100 }));
    // Only fetch categories when we have a store selected
  }, [dispatch, filters]);

  // Fetch categories when store is selected in form
  useEffect(() => {
    if (formData.storeId) {
      console.log("Fetching categories for store (form):", formData.storeId);
      dispatch(fetchCategoriesByStore(formData.storeId));
    } else {
      console.log("No store selected in form, clearing categories");
      // Could dispatch a clear action here if needed
    }
  }, [dispatch, formData.storeId]);

  // Fetch categories when store is selected in bulk create
  useEffect(() => {
    if (bulkCreateData.storeId) {
      console.log(
        "Fetching categories for store (bulk):",
        bulkCreateData.storeId
      );
      dispatch(fetchCategoriesByStore(bulkCreateData.storeId));
    }
  }, [dispatch, bulkCreateData.storeId]);

  // Fetch categories for filter when store filter is selected
  useEffect(() => {
    if (filters.storeId) {
      console.log("Fetching categories for store (filter):", filters.storeId);
      dispatch(fetchCategoriesByStore(filters.storeId));
    }
  }, [dispatch, filters.storeId]);

  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "bottom-left",
        autoClose: 5000,
        theme: "colored",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle success notifications
  useEffect(() => {
    if (success) {
      toast.success(
        isUpdatePlan
          ? "Price plan updated successfully!"
          : "Price plan operation successful!",
        {
          position: "bottom-left",
          autoClose: 3000,
          theme: "colored",
        }
      );
      setIsCreateModalOpen(false);
      setShowBulkCreate(false);
      resetForm();
      dispatch(clearSuccess());
      setIsSubmitting(false);
    }
  }, [success, dispatch, isUpdatePlan]);

  const resetForm = () => {
    setFormData({
      categoryId: "",
      storeId: "",
      planType: "premium",
      duration: 7,
      price: 0,
      currency: "AED",
      features: [""],
      description: "",
      discountPercentage: 0,
      isActive: true,
    });
    setIsUpdatePlan(null);
    setFormError("");
    setBulkCreateData({ categoryId: "", storeId: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.categoryId || !formData.storeId || !formData.price) {
      setFormError("Category, Store, and Price are required");
      return;
    }

    if (formData.price <= 0) {
      setFormError("Price must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    const planData = {
      ...formData,
      features: formData.features.filter((f) => f.trim() !== ""),
    };

    if (isUpdatePlan) {
      dispatch(updatePricePlan({ planId: isUpdatePlan._id, planData }));
    } else {
      dispatch(createPricePlan(planData));
    }
  };

  const handleBulkCreate = (e) => {
    e.preventDefault();
    if (!bulkCreateData.categoryId || !bulkCreateData.storeId) {
      toast.error("Please select both category and store", {
        position: "bottom-left",
        theme: "colored",
      });
      return;
    }

    setIsSubmitting(true);
    dispatch(bulkCreateDefaultPlans(bulkCreateData));
  };

  const handleUpdatePlan = (plan) => {
    setIsUpdatePlan(plan);
    setFormData({
      categoryId: plan.categoryId._id,
      storeId: plan.storeId._id,
      planType: plan.planType,
      duration: plan.duration,
      price: plan.price,
      currency: plan.currency,
      features: plan.features || [""],
      description: plan.description || "",
      discountPercentage: plan.discountPercentage || 0,
      isActive: plan.isActive,
    });
    setIsCreateModalOpen(true);
  };

  const handleDeletePlan = async (plan) => {
    setDeletePlanData(plan);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePlan = async () => {
    if (!deletePlanData) return;

    setIsDeleting(true);
    try {
      await dispatch(deletePricePlan(deletePlanData._id)).unwrap();
      toast.success("Price plan deleted successfully!", {
        position: "bottom-left",
        theme: "colored",
      });
      setShowDeleteConfirm(false);
      setDeletePlanData(null);
    } catch (err) {
      console.error("Failed to delete price plan:", err);
      toast.error(err || "Failed to delete price plan", {
        position: "bottom-left",
        theme: "colored",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      await dispatch(togglePricePlanStatus(plan._id)).unwrap();
    } catch (err) {
      toast.error(err || "Failed to toggle price plan status", {
        position: "bottom-left",
        theme: "colored",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    console.log("Input changed:", name, value);

    // If store is changed, reset category selection
    if (name === "storeId") {
      console.log("Store changed to:", value);
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        categoryId: "", // Reset category when store changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, features: newFeatures }));
    }
  };

  const handleFilterChange = (filterName, value) => {
    // If store filter is changed, reset category filter
    if (filterName === "storeId") {
      setFilters((prev) => ({
        ...prev,
        [filterName]: value,
        categoryId: "", // Reset category when store changes
        page: 1,
      }));
    } else {
      setFilters((prev) => ({ ...prev, [filterName]: value, page: 1 }));
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setShowBulkCreate(false);
    resetForm();
    setIsSubmitting(false);
  };

  const getPlanTypeIcon = (planType) => {
    return planType === "premium" ? (
      <MdStar className="w-4 h-4 text-yellow-500" />
    ) : (
      <MdAutoAwesome className="w-4 h-4 text-blue-500" />
    );
  };

  const getPlanTypeBadge = (planType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (planType === "premium") {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    return `${baseClasses} bg-blue-100 text-blue-800`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Price Plans
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage pricing plans for categories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkCreate(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MdAutoAwesome className="w-4 h-4" />
              Bulk Create
            </span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            <span className="flex items-center gap-2">
              <MdAdd className="w-4 h-4" />
              Create Plan
            </span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            value={filters.storeId}
            onChange={(e) => handleFilterChange("storeId", e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>

          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
            disabled={!filters.storeId}
          >
            <option value="">
              {!filters.storeId
                ? "Select Store First"
                : categoriesLoading
                ? "Loading Categories..."
                : "All Categories"}
            </option>
            {filters.storeId &&
              categories
                .filter((category) => category.isLeaf === true)
                .map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
          </select>

          <select
            value={filters.planType}
            onChange={(e) => handleFilterChange("planType", e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Types</option>
            <option value="premium">Premium</option>
            <option value="featured">Featured</option>
          </select>

          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange("isActive", e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            onClick={() =>
              setFilters({
                categoryId: "",
                storeId: "",
                planType: "",
                isActive: "",
                page: 1,
              })
            }
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Price Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : pricePlans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MdAttachMoney className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No price plans found
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first price plan to get started
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          pricePlans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getPlanTypeIcon(plan.planType)}
                  <span className={getPlanTypeBadge(plan.planType)}>
                    {plan.planType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {plan.isActive ? (
                      <MdToggleOn className="w-5 h-5 text-green-500" />
                    ) : (
                      <MdToggleOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdatePlan(plan)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <MdEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <MdDelete className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {plan.categoryId?.name || "Unknown Category"}
                </h3>
                <p className="text-sm text-gray-600">
                  Store: {plan.storeId?.name || "Unknown Store"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {plan.currency} {plan.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {plan.duration} days
                  </span>
                </div>
                {plan.discountPercentage > 0 && (
                  <p className="text-sm text-green-600">
                    {plan.discountPercentage}% discount
                  </p>
                )}
                {plan.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.description}
                  </p>
                )}
                {plan.features && plan.features.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Features:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-gray-400">
                          +{plan.features.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page <= 1}
            className="px-3 py-1 rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.min(pagination.pages, prev.page + 1),
              }))
            }
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-1 rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Update Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {isUpdatePlan ? "Update Price Plan" : "Create Price Plan"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store *
                  </label>
                  <select
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={isSubmitting || storesLoading}
                  >
                    <option value="">Select Store First</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={
                      isSubmitting || categoriesLoading || !formData.storeId
                    }
                  >
                    <option value="">
                      {!formData.storeId
                        ? "Select Store First"
                        : categoriesLoading
                        ? "Loading Categories..."
                        : "Select Category"}
                    </option>
                    {formData.storeId &&
                      categories
                        .filter((category) => category.isLeaf === true)
                        .map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Type *
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={isSubmitting}
                  >
                    <option value="premium">Premium</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={isSubmitting}
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                  placeholder="Optional description for the plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter feature"
                        disabled={isSubmitting}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          disabled={isSubmitting}
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-primary hover:underline"
                    disabled={isSubmitting}
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isUpdatePlan
                      ? "Updating..."
                      : "Creating..."
                    : isUpdatePlan
                    ? "Update Plan"
                    : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Create Default Plans
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store *
                </label>
                <select
                  value={bulkCreateData.storeId}
                  onChange={(e) =>
                    setBulkCreateData((prev) => ({
                      ...prev,
                      storeId: e.target.value,
                      categoryId: "", // Reset category when store changes
                    }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                >
                  <option value="">Select Store First</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={bulkCreateData.categoryId}
                  onChange={(e) =>
                    setBulkCreateData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting || !bulkCreateData.storeId}
                >
                  <option value="">
                    {!bulkCreateData.storeId
                      ? "Select Store First"
                      : categoriesLoading
                      ? "Loading Categories..."
                      : "Select Category"}
                  </option>
                  {bulkCreateData.storeId &&
                    categories
                      .filter((category) => category.isLeaf === true)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                This will create default plans:
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Premium: 7, 14, 30 days</li>
                  <li>• Featured: 7, 14, 30 days</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Default Plans"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Price Plan Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletePlanData(null);
        }}
        onConfirm={confirmDeletePlan}
        type="danger"
        title="Delete Price Plan"
        message={`Are you sure you want to delete the price plan "${
          deletePlanData?.name || "this plan"
        }"? This action cannot be undone and will remove the plan from all associated categories.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PricePlans;
