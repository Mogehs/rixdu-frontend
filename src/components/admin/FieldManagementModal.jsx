import React, { useState, useEffect } from "react";
import { MdClose, MdAdd, MdDelete } from "react-icons/md";

const FieldManagementModal = ({
  isOpen,
  onClose,
  category,
  onFieldsUpdated,
}) => {
  const [fields, setFields] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      setFields(category.fields || []);
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (!isOpen) {
      setFields([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        type: "text",
        required: false,
        options: [],
        multiple: false,
        maxFiles: 1,
        minFiles: 0,
        accept: "",
      },
    ]);
  };

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index, updates) => {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...updates } : field))
    );
  };

  const addOption = (fieldIndex) => {
    updateField(fieldIndex, {
      options: [...(fields[fieldIndex].options || []), ""],
    });
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const newOptions = [...fields[fieldIndex].options];
    newOptions[optionIndex] = value;
    updateField(fieldIndex, { options: newOptions });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const newOptions = fields[fieldIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    updateField(fieldIndex, { options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validFields = fields.filter((field) => field.name.trim());

      if (validFields.length === 0) {
        alert("Please add at least one field with a name");
        setIsSubmitting(false);
        return;
      }

      // Validate file upload fields
      for (const field of validFields) {
        if (field.type === "file") {
          const minFiles = field.minFiles || 0;
          const maxFiles = field.maxFiles || 1;

          if (minFiles > maxFiles) {
            alert(
              `Field "${field.name}": Minimum files (${minFiles}) cannot be greater than maximum files (${maxFiles})`
            );
            setIsSubmitting(false);
            return;
          }

          if (minFiles < 0) {
            alert(`Field "${field.name}": Minimum files cannot be negative`);
            setIsSubmitting(false);
            return;
          }

          if (maxFiles < 1) {
            alert(`Field "${field.name}": Maximum files must be at least 1`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      onFieldsUpdated(validFields);
      onClose();
    } catch (error) {
      console.error("Error updating fields:", error);
      alert("Failed to update fields. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "select", label: "Select (Dropdown)" },
    { value: "checkbox", label: "Checkbox (Multi-Select)" },
    { value: "radio", label: "Radio (Single Select)" },
    { value: "date", label: "Date" },
    { value: "file", label: "File Upload" },
    { value: "input", label: "Input" },
    { value: "point", label: "Point/Location" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Manage Field Definitions
            </h2>
            <p className="text-sm text-gray-600">
              Define fields for <strong>{category?.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center sticky -top-8 bg-white z-10 p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Fields ({fields.length})
              </h3>
              <button
                type="button"
                onClick={addField}
                className="flex items-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
              >
                <MdAdd className="mr-1" />
                Add Field
              </button>
            </div>

            {fields.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                No fields yet. Add one to get started.
              </div>
            )}

            {fields.map((field, fieldIndex) => (
              <div
                key={field.id || fieldIndex}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">
                    Field {fieldIndex + 1}
                    {field.name && (
                      <span className="text-gray-600 ml-2">– {field.name}</span>
                    )}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeField(fieldIndex)}
                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                    title="Delete field"
                  >
                    <MdDelete />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateField(fieldIndex, { name: e.target.value })
                      }
                      required
                      placeholder="e.g., Brand, Color"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:ring-2"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(fieldIndex, { type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:ring-2"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Required */}
                  <div className="flex items-center mt-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(fieldIndex, {
                            required: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Required</span>
                    </label>
                  </div>
                </div>

                {/* Multiple Selection Control for Checkbox */}
                {field.type === "checkbox" && (
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.multiple !== false}
                        onChange={(e) =>
                          updateField(fieldIndex, {
                            multiple: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Allow Multiple Selections
                      </span>
                    </label>
                    <span className="text-xs text-gray-500 ml-2">
                      (Unchecked = Single selection like radio buttons)
                    </span>
                  </div>
                )}

                {/* Options UI for Select, Checkbox, or Radio */}
                {["select", "checkbox", "radio"].includes(field.type) && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {field.type === "select"
                          ? "Dropdown Options"
                          : field.type === "radio"
                          ? "Radio Options"
                          : field.multiple !== false
                          ? "Checkbox Options (Multiple)"
                          : "Checkbox Options (Single Selection)"}
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(fieldIndex)}
                        className="text-sm text-primary hover:text-secondary"
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(field.options || []).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(
                                fieldIndex,
                                optionIndex,
                                e.target.value
                              )
                            }
                            placeholder="Option value"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeOption(fieldIndex, optionIndex)
                            }
                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Configuration */}
                {field.type === "file" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Multiple Files */}
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.multiple || false}
                            onChange={(e) =>
                              updateField(fieldIndex, {
                                multiple: e.target.checked,
                                maxFiles: e.target.checked
                                  ? field.maxFiles || 1
                                  : 1,
                                minFiles: e.target.checked
                                  ? field.minFiles || 0
                                  : 0,
                              })
                            }
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">
                            Allow Multiple Files
                          </span>
                        </label>
                      </div>

                      {/* Min Files */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Min Files
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={field.minFiles || 0}
                          onChange={(e) =>
                            updateField(fieldIndex, {
                              minFiles: parseInt(e.target.value) || 0,
                            })
                          }
                          disabled={!field.multiple}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      {/* Max Files */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Max Files
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={field.maxFiles || 1}
                          onChange={(e) =>
                            updateField(fieldIndex, {
                              maxFiles: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:ring-2"
                        />
                      </div>
                    </div>

                    {/* File Accept Types */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Accepted File Types (Optional)
                      </label>
                      <input
                        type="text"
                        value={field.accept || ""}
                        onChange={(e) =>
                          updateField(fieldIndex, { accept: e.target.value })
                        }
                        placeholder="e.g., .jpg,.png,.pdf or image/*,application/pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:ring-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use file extensions (.jpg, .png) or MIME types (image/*,
                        application/pdf). Leave empty to allow all file types.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white hover:bg-secondary disabled:opacity-50 rounded-lg"
            >
              {isSubmitting ? "Saving..." : "Save Fields"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldManagementModal;
