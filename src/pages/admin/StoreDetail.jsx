import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdFolder,
  MdChevronRight,
  MdHome,
  MdSettings,
} from "react-icons/md";
import AddCategoryModal from "../../components/admin/AddCategoryModal";
import FieldManagementModal from "../../components/admin/FieldManagementModal";
import BulkFieldManagementModal from "../../components/admin/BulkFieldManagementModal";
import {
  fetchCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  updateFieldsForAllLeafChildren,
  clearSuccess,
  resetCategories,
} from "../../features/admin/categoriesSlice";
import EditCategoryModel from "../../components/admin/EditCategoryModel";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toast } from "react-toastify";

const StoreDetail = ({ storeId, onBack }) => {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((state) => state.adminStores);
  const { categoryTree, loading, error, success } = useSelector(
    (state) => state.adminCategories
  );
  // Toast for error
  useEffect(() => {
    if (error) {
      toast.dismiss("category-error");
      toast.error(error?.message || error || "An unexpected error occurred", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "colored",
        toastId: "category-error",
      });
    }
  }, [error]);

  // Toast for success
  useEffect(() => {
    if (success) {
      toast.dismiss("category-success");
      toast.success("Operation completed successfully!", {
        position: "bottom-left",
        autoClose: 3000,
        theme: "colored",
        toastId: "category-success",
      });
    }
  }, [success]);

  const [currentPath, setCurrentPath] = useState([]);
  const [currentPathIds, setCurrentPathIds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageFieldsModalOpen, setIsManageFieldsModalOpen] = useState(false);
  const [isBulkFieldsModalOpen, setIsBulkFieldsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [bulkFieldsCategory, setBulkFieldsCategory] = useState(null);
  const [leafCategoriesCount, setLeafCategoriesCount] = useState(0);
  const [flatCategories, setFlatCategories] = useState([]);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const store = currentStore || {
    _id: storeId || "1",
    name: "Store",
    slug: "store",
    icon: { url: null },
    createdAt: new Date().toISOString(),
  };

  const flattenCategoryTree = React.useCallback((tree, parentId = null) => {
    const flat = [];

    tree.forEach((node) => {
      const { children, ...rest } = node;

      const flatNode = {
        ...rest,
        parentId,
        subcategories: children || [],
      };

      flat.push(flatNode);

      if (children && children.length > 0) {
        flat.push(...flattenCategoryTree(children, node._id));
      }
    });

    return flat;
  }, []);

  useEffect(() => {
    if (categoryTree && categoryTree.length > 0) {
      const flattened = flattenCategoryTree(categoryTree);
      setFlatCategories(flattened);
      if (currentPathIds.length > 0) {
        const newPath = currentPathIds
          .map((id) => flattened.find((cat) => cat._id === id))
          .filter(Boolean); // Remove nulls if not found
        setCurrentPath(newPath);
      }
    }
  }, [categoryTree, flattenCategoryTree, currentPathIds]);

  // Fetch category tree when component mounts or storeId changes
  useEffect(() => {
    if (storeId) {
      dispatch(fetchCategoryTree(storeId));
    }

    return () => {
      // Cleanup when component unmounts
      dispatch(resetCategories());
    };
  }, [dispatch, storeId]);

  // Handle success/error states
  useEffect(() => {
    if (success) {
      setIsAddModalOpen(false);
      setIsManageFieldsModalOpen(false);
      setIsBulkFieldsModalOpen(false);
      setSelectedCategory(null);
      setBulkFieldsCategory(null);
      dispatch(clearSuccess());
      if (storeId) {
        dispatch(fetchCategoryTree(storeId));
      }
    }
  }, [success, dispatch, storeId]);

  useEffect(() => {
    if (error) {
      console.error("Category operation error:", error);
      // You can show a toast notification here
    }
  }, [error]);

  // Get categories from Redux state
  const categories = flatCategories || [];

  // Handle updating fields for a category
  const handleFieldsUpdated = (updatedFields) => {
    if (selectedCategory) {
      // Dispatch updateCategory action with fields
      dispatch(
        updateCategory({
          categoryId: selectedCategory._id,
          categoryData: {
            fields: updatedFields,
            isLeaf: true, // Make it a leaf category when fields are added
          },
        })
      );
    }
  };

  const handleManageFields = (category) => {
    setSelectedCategory(category);
    setIsManageFieldsModalOpen(true);
  };

  // Count leaf categories under a parent category (recursively at any depth)
  const countLeafCategories = React.useCallback(
    (category) => {
      if (!category || !flatCategories) return 0;

      const countLeaves = (cat) => {
        if (cat.isLeaf) return 1;

        const children = flatCategories.filter(
          (child) => child.parentId === cat._id
        );
        return children.reduce((total, child) => total + countLeaves(child), 0);
      };

      return countLeaves(category);
    },
    [flatCategories]
  );

  // Check if current level has any leaf categories in the descendant tree
  const hasLeafCategoriesInTree = React.useCallback(() => {
    if (currentPath.length === 0) {
      // At store level - check if any category in the entire tree is a leaf
      return flatCategories.some((cat) => cat.isLeaf);
    } else {
      // At category level - check if current category has leaf descendants
      const currentCategory = currentPath[currentPath.length - 1];
      return countLeafCategories(currentCategory) > 0;
    }
  }, [currentPath, flatCategories, countLeafCategories]);

  const handleBulkManageFields = (category) => {
    let leafCount;

    if (category._id === store._id) {
      // Store level - count all leaf categories in the entire store
      leafCount = flatCategories.filter((cat) => cat.isLeaf).length;
    } else {
      // Category level - count leaf categories under this category
      leafCount = countLeafCategories(category);
    }

    setLeafCategoriesCount(leafCount);
    setBulkFieldsCategory(category);
    setIsBulkFieldsModalOpen(true);
  };

  const handleBulkFieldsUpdated = async (fields) => {
    if (bulkFieldsCategory) {
      try {
        if (bulkFieldsCategory._id === store._id) {
          // Store level - update all top-level categories
          const topLevelCategories = flatCategories.filter(
            (cat) => cat.parentId === null && !cat.isLeaf
          );

          if (topLevelCategories.length === 0) {
            toast.error("No top-level categories found to update.");
            return;
          }

          // Update each top-level category's leaf children
          const updatePromises = topLevelCategories.map((category) =>
            dispatch(
              updateFieldsForAllLeafChildren({
                categoryId: category._id,
                fields: fields,
              })
            ).unwrap()
          );

          await Promise.all(updatePromises);

          toast.success(
            `Successfully applied fields to ${leafCategoriesCount} leaf categories in store "${bulkFieldsCategory.name}"`
          );
        } else {
          // Category level - update this category's leaf children
          await dispatch(
            updateFieldsForAllLeafChildren({
              categoryId: bulkFieldsCategory._id,
              fields: fields,
            })
          ).unwrap();

          toast.success(
            `Successfully applied fields to ${leafCategoriesCount} leaf categories under "${bulkFieldsCategory.name}"`
          );
        }

        // Refresh the category tree to get updated data
        if (storeId) {
          dispatch(fetchCategoryTree(storeId));
        }
      } catch (error) {
        console.error("Failed to update bulk fields:", error);
        toast.error("Failed to update fields. Please try again.");
        throw error; // Let the modal handle the error state
      }
    }
  };

  const handleEditCategory = (category) => {
    console.log("Edit category:", category);
    dispatch(
      updateCategory({
        categoryId: category._id,
        categoryData: category,
      })
    );
  };

  const handleDeleteCategory = async (category) => {
    setDeleteCategoryData(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryData) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteCategory(deleteCategoryData._id)).unwrap();
      toast.success(
        `Category "${deleteCategoryData.name}" deleted successfully!`
      );
      setShowDeleteConfirm(false);
      setDeleteCategoryData(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle adding new category
  const handleCategoryAdded = (newCategory) => {
    const parentId =
      currentPath.length > 0 ? currentPath[currentPath.length - 1]._id : null;

    dispatch(
      createCategory({
        name: newCategory.name,
        isLeaf: newCategory.isLeaf,
        storeId: store._id,
        parent: parentId,
        icon: newCategory.icon,
      })
    );
  };

  const handleBackToStores = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Navigate back to stores list");
    }
  };

  // Generate breadcrumb based on current path
  const generateBreadcrumb = () => {
    const breadcrumbs = [
      {
        label: "Stores",
        isClickable: true,
        onClick: handleBackToStores,
      },
      {
        label: store.name,
        isClickable: currentPath.length > 0,
        onClick: currentPath.length > 0 ? () => setCurrentPath([]) : null,
      },
    ];

    // Add category path breadcrumbs if navigating through categories
    currentPath.forEach((pathItem, index) => {
      breadcrumbs.push({
        label: pathItem.name,
        isClickable: index < currentPath.length - 1,
        onClick: () => navigateToCategory(pathItem, index),
      });
    });

    return breadcrumbs;
  };

  const navigateToCategory = (category, index) => {
    // Navigate to a specific level in the category hierarchy
    const newPath = currentPath.slice(0, index + 1);
    const newPathIds = currentPathIds.slice(0, index + 1);
    setCurrentPath(newPath);
    setCurrentPathIds(newPathIds);
    console.log("Navigate to category level:", category, "Path:", newPath);
  };

  const handleCategoryClick = (category) => {
    if (category.isLeaf) {
      // If it's a leaf category, open field management modal
      handleManageFields(category);
    } else {
      // If it's not a leaf category, navigate into subcategories
      const newPath = [...currentPath, category];
      setCurrentPath(newPath);
      setCurrentPathIds([...currentPathIds, category._id]);
      console.log(
        "Navigating into category:",
        category.name,
        "New path:",
        newPath
      );
    }
  };

  // Get categories to display based on current path
  const getCurrentCategories = () => {
    if (currentPath.length === 0) {
      // Show top-level categories (categories with parentId: null)
      return categories.filter((cat) => cat.parentId === null);
    } else {
      // Show subcategories of the current category
      const currentCategory = currentPath[currentPath.length - 1];
      return currentCategory.subcategories || currentCategory.children || [];
    }
  };

  // Get fields to display when in a leaf category
  const getCurrentFields = () => {
    if (currentPath.length === 0 || !isCurrentCategoryLeaf()) {
      return [];
    }
    const currentCategory = currentPath[currentPath.length - 1];
    return currentCategory.fields || [];
  };

  const getCurrentPageTitle = () => {
    if (currentPath.length === 0) {
      return store.name;
    } else {
      return currentPath[currentPath.length - 1].name;
    }
  };

  // Check if current category is a leaf category
  const isCurrentCategoryLeaf = () => {
    if (currentPath.length === 0) return false;
    const currentCategory = currentPath[currentPath.length - 1];
    return currentCategory.isLeaf === true;
  };

  // Render field in the list view
  const renderFieldFlat = (field, fieldIndex) => {
    return (
      <div key={fieldIndex}>
        <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm sm:text-base text-gray-900 flex items-center flex-wrap gap-2">
                <span className="truncate">{field.name}</span>
                {field.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                    Required
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                <span className="sm:hidden">Type: </span>
                <span className="font-medium">{field.type}</span>
                {field.options && field.options.length > 0 && (
                  <span className="hidden sm:inline">
                    {" "}
                    • {field.options.length} options
                  </span>
                )}
                {field.type === "file" && (
                  <span className="hidden sm:inline">
                    {" "}
                    • {field.minFiles || 0}-{field.maxFiles || 1} files
                    {field.multiple && <span> • Multiple allowed</span>}
                  </span>
                )}
              </div>
              {field.options && field.options.length > 0 && (
                <div className="text-xs text-gray-500 sm:hidden">
                  {field.options.length} option
                  {field.options.length !== 1 ? "s" : ""}
                </div>
              )}
              {field.type === "file" && (
                <div className="text-xs text-gray-500 sm:hidden">
                  {field.minFiles || 0}-{field.maxFiles || 1} files
                  {field.multiple && <span> • Multiple</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs bg-blue-100 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {field.type}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render category in flat view (no nested expansion, just navigation)
  const renderCategoryFlat = (category) => {
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;
    const isLeaf = category.isLeaf === true;

    return (
      <div key={category._id}>
        <div
          className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer touch-manipulation"
          onClick={() => handleCategoryClick(category)}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {isLeaf ? (
              // Leaf category icon (product/listing icon)
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded"></div>
              </div>
            ) : hasSubcategories ? (
              <MdFolder className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
            ) : (
              <MdFolder className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm sm:text-base text-gray-900 hover:text-primary flex items-center flex-wrap gap-2">
                <span className="truncate">{category.name}</span>
                {isLeaf && (
                  <span className="text-xs bg-blue-100 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                    Leaf
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {category.slug}
              </div>
            </div>

            {!isLeaf && hasSubcategories && (
              <MdChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
            )}

            {isLeaf && (
              <span className="text-xs text-primary whitespace-nowrap hidden sm:inline">
                Manage Fields →
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {!isLeaf && hasSubcategories && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                <span className="hidden sm:inline">
                  {category.subcategories.length} subcategories
                </span>
                <span className="sm:hidden">
                  {category.subcategories.length}
                </span>
              </span>
            )}
            {isLeaf && (
              <span className="text-xs bg-blue-100 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                <span className="hidden sm:inline">
                  {category.fields?.length || 0} fields
                </span>
                <span className="sm:hidden">
                  {category.fields?.length || 0}
                </span>
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
                setEditCategoryData(category);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded touch-manipulation"
              title="Edit category"
            >
              <MdEdit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category);
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded touch-manipulation"
              title="Delete category"
            >
              <MdDelete className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto">
          {generateBreadcrumb().map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <MdChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1 flex-shrink-0" />
              )}
              {breadcrumb.isClickable ? (
                <button
                  onClick={breadcrumb.onClick}
                  className="flex items-center space-x-1 text-primary hover:text-secondary transition-colors whitespace-nowrap"
                >
                  {index === 0 && <MdHome className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span>{breadcrumb.label}</span>
                </button>
              ) : (
                <span className="flex items-center space-x-1 text-gray-900 font-medium whitespace-nowrap">
                  {index === 0 && <MdHome className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span>{breadcrumb.label}</span>
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
            {getCurrentPageTitle()}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {currentPath.length > 0
              ? isCurrentCategoryLeaf()
                ? `This is a leaf category. Manage field definitions for ${getCurrentPageTitle()} listings`
                : `Manage subcategories in ${getCurrentPageTitle()}`
              : "Manage categories in this store"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {currentPath.length > 0 && isCurrentCategoryLeaf() ? (
            // In a leaf category - only show "Manage Fields" button
            <button
              onClick={() =>
                handleManageFields(currentPath[currentPath.length - 1])
              }
              className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors w-full sm:w-auto"
            >
              <span className="flex items-center justify-center space-x-2">
                <MdSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Fields</span>
                <span className="sm:hidden">Fields</span>
              </span>
            </button>
          ) : (
            // In store or non-leaf category - show buttons based on context
            <div className="flex items-center space-x-3">
              {/* Show Add Form button at any level that has leaf categories in the tree */}
              {!isCurrentCategoryLeaf() && hasLeafCategoriesInTree() && (
                <button
                  onClick={() => {
                    if (currentPath.length > 0) {
                      // At category level - use current category
                      handleBulkManageFields(
                        currentPath[currentPath.length - 1]
                      );
                    } else {
                      // At store level - create a fake category object for the store
                      const storeAsCategory = {
                        _id: store._id,
                        name: store.name,
                        isLeaf: false,
                      };
                      handleBulkManageFields(storeAsCategory);
                    }
                  }}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <MdAdd className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Form</span>
                    <span className="sm:hidden">Form</span>
                  </span>
                </button>
              )}
              {/* Regular Add Category button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors w-full sm:w-auto"
              >
                <span className="flex items-center justify-center space-x-2">
                  <MdAdd className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Add {currentPath.length > 0 ? "Subcategory" : "Category"}
                  </span>
                  <span className="sm:hidden">
                    Add {currentPath.length > 0 ? "Sub" : "Cat"}
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Store Info - Only show at root level */}
      {currentPath.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {store.icon?.url ? (
                <img
                  src={store.icon.url}
                  alt={store.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                />
              ) : (
                <MdFolder className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                {store.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Slug: {store.slug}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {currentPath.length > 0
                ? isCurrentCategoryLeaf()
                  ? "Field Definitions"
                  : "Subcategories"
                : "Categories"}
            </h3>
            <div className="flex items-center justify-between sm:justify-end space-x-3">
              {currentPath.length > 0 && (
                <button
                  onClick={() => {
                    const newPath = currentPath.slice(0, -1);
                    setCurrentPath(newPath);
                    console.log("Go up one level, new path:", newPath);
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors touch-manipulation"
                >
                  ← <span className="hidden sm:inline">Go Up</span>
                  <span className="sm:hidden">Up</span>
                </button>
              )}
              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                {currentPath.length > 0 && isCurrentCategoryLeaf()
                  ? `${getCurrentFields().length} field${
                      getCurrentFields().length !== 1 ? "s" : ""
                    }`
                  : `${getCurrentCategories().length} ${
                      currentPath.length > 0 ? "sub" : "cat"
                    }${getCurrentCategories().length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Show different content based on whether we're in a leaf category or not */}
          {currentPath.length > 0 && isCurrentCategoryLeaf() ? (
            /* Leaf category - show fields */
            getCurrentFields().length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <MdFolder className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No field definitions found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  Define the fields that users will fill when creating listings
                  in this category
                </p>
                <button
                  onClick={() =>
                    handleManageFields(currentPath[currentPath.length - 1])
                  }
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <MdAdd className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      Add Field Definitions
                    </span>
                    <span className="sm:hidden">Add Fields</span>
                  </span>
                </button>
              </div>
            ) : (
              getCurrentFields().map((field, index) =>
                renderFieldFlat(field, index)
              )
            )
          ) : /* Non-leaf category or store level - show categories */
          getCurrentCategories().length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <MdFolder className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No {currentPath.length > 0 ? "subcategories" : "categories"}{" "}
                found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {currentPath.length > 0
                  ? `Get started by creating your first subcategory in ${getCurrentPageTitle()}`
                  : "Get started by creating your first category in this store"}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm sm:text-base"
              >
                <span className="flex items-center justify-center space-x-2">
                  <MdAdd className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Add First{" "}
                    {currentPath.length > 0 ? "Subcategory" : "Category"}
                  </span>
                  <span className="sm:hidden">
                    Add {currentPath.length > 0 ? "Sub" : "Cat"}
                  </span>
                </span>
              </button>
            </div>
          ) : (
            getCurrentCategories().map((category) =>
              renderCategoryFlat(category)
            )
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        storeId={store._id}
        parentCategory={
          currentPath.length > 0 ? currentPath[currentPath.length - 1] : null
        }
        onCategoryAdded={handleCategoryAdded}
      />
      {/* Edt Category Modal */}
      <EditCategoryModel
        isOpen={isEditModalOpen}
        categoryData={editCategoryData}
        onClose={() => setIsEditModalOpen(false)}
        onCategoryEdited={handleEditCategory}
      />

      {/* Field Management Modal */}
      <FieldManagementModal
        isOpen={isManageFieldsModalOpen}
        onClose={() => {
          setIsManageFieldsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onFieldsUpdated={handleFieldsUpdated}
      />

      {/* Bulk Field Management Modal */}
      <BulkFieldManagementModal
        isOpen={isBulkFieldsModalOpen}
        onClose={() => {
          setIsBulkFieldsModalOpen(false);
          setBulkFieldsCategory(null);
          setLeafCategoriesCount(0);
        }}
        parentCategory={bulkFieldsCategory}
        leafCategoriesCount={leafCategoriesCount}
        onFieldsUpdated={handleBulkFieldsUpdated}
      />

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteCategoryData(null);
        }}
        onConfirm={confirmDeleteCategory}
        type="danger"
        title="Delete Category"
        message={`Are you sure you want to delete the category "${
          deleteCategoryData?.name || "this category"
        }"? This action cannot be undone and will remove all subcategories and associated data.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default StoreDetail;
