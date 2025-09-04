import React, { useEffect, useState } from "react";
import { MdClose, MdFolder, MdUpload } from "react-icons/md";

const EditCategoryModel = ({
  isOpen,
  onClose,
  storeId,
  parentCategory = null,
  categoryData,
  onCategoryEdited,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    isLeaf: false,
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || "",
        isLeaf: categoryData.isLeaf || false,
      });

      // If categoryData has an icon URL, use it as preview
      if (categoryData.icon && typeof categoryData.icon === "string") {
        setIconPreview(categoryData.icon);
      }
    }
  }, [categoryData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("storeId", storeId);
      submitData.append("name", formData.name);
      submitData.append("isLeaf", formData.isLeaf ? "true" : "false");

      if (parentCategory) {
        submitData.append("parent", parentCategory._id);
      }

      if (iconFile) {
        submitData.append("icon", iconFile);
      }

      // Simulated API update
      setTimeout(() => {
        setIsSubmitting(false);
        if (onCategoryEdited) {
          onCategoryEdited({
            _id: categoryData._id,
            name: formData.name,
            isLeaf: formData.isLeaf,
            icon: iconFile || categoryData.icon,
          });
        }
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating category:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", isLeaf: false });
    setIconFile(null);
    setIconPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Edit Category
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {parentCategory && (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </h3>
              <div className="flex items-center space-x-2">
                <MdFolder className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-900">
                  {parentCategory.name}
                </span>
              </div>
            </div>
          )}

          {/* Category Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>

          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Icon (Optional)
            </label>

            {iconPreview ? (
              <div className="flex items-center space-x-4">
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeIcon}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove Icon
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <MdUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label
                    htmlFor="icon-upload"
                    className="cursor-pointer text-primary hover:text-secondary"
                  >
                    <span>Upload an icon</span>
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Is Leaf */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isLeaf"
              name="isLeaf"
              checked={formData.isLeaf}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="isLeaf"
              className="ml-2 block text-sm text-gray-700"
            >
              This is a leaf category (cannot have subcategories)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="px-4 py-2 bg-primary text-white hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModel;
