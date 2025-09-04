import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MdAdd,
  MdStore,
  MdClose,
  MdCloudUpload,
  MdOutlineDeleteOutline,
} from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import StoreDetail from "./StoreDetail";
import {
  fetchStores,
  createStore,
  clearSuccess,
  setCurrentStore,
  updateStore,
  deleteStore,
} from "../../features/admin/storesSlice";
import { toast } from "react-toastify";

const Store = () => {
  const dispatch = useDispatch();
  const { stores, loading, error, success } = useSelector(
    (state) => state.adminStores
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateStore, setIsUpdateStore] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: null,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchStores({ level: 0, root: 0 }));
  }, [dispatch]);

  // Toast for error
  useEffect(() => {
    if (error) {
      toast.dismiss("store-error");
      toast.error(error?.message || error || "An unexpected error occurred", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "colored",
        toastId: "store-error",
      });
      setIsSubmitting(false);
    }
  }, [error]);

  // Toast for success
  useEffect(() => {
    if (success) {
      toast.dismiss("store-success");
      toast.success(
        isUpdateStore
          ? "Store updated successfully!"
          : "Store operation successful!",
        {
          position: "bottom-left",
          autoClose: 3000,
          theme: "colored",
          toastId: "store-success",
        }
      );
      setIsCreateModalOpen(false);
      setFormData({ name: "", icon: null });
      setIsUpdateStore(null);
      setFormError("");
      setIsSubmitting(false);
      dispatch(clearSuccess());
    }
  }, [success, dispatch, isUpdateStore]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim()) {
      setFormError("Store name is required");
      return;
    }
    setIsSubmitting(true);
    const storeData = {
      name: formData.name.trim(),
    };
    if (formData.icon) {
      storeData.icon = formData.icon;
    }
    if (isUpdateStore) {
      dispatch(
        updateStore({ storeId: isUpdateStore._id, storeData: storeData })
      );
    } else {
      dispatch(createStore(storeData));
    }
  };

  const handleUpdateStore = (e, store) => {
    e.stopPropagation();
    setIsUpdateStore(store);
    setFormData({ name: store.name, icon: null });
    setIconPreview(store.icon?.url || null);
    setIsCreateModalOpen(true);
    setFormError("");
  };

  const handleDeleteStore = async (e, store) => {
    e.preventDefault(); // extra safety
    e.stopPropagation();
    setIsSubmitting(true);
    try {
      await dispatch(deleteStore(store._id)).unwrap();
      toast.dismiss("store-success");
      toast.success("Store deleted successfully!", {
        position: "bottom-left",
        autoClose: 3000,
        theme: "colored",
        toastId: "store-success",
      });
    } catch (err) {
      toast.dismiss("store-error");
      toast.error(
        err?.message || err || "Failed to delete store. Please try again.",
        {
          position: "bottom-left",
          autoClose: 5000,
          theme: "colored",
          toastId: "store-error",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStoreClick = (store) => {
    dispatch(setCurrentStore(store));
    setSelectedStoreId(store._id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, icon: file }));
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: null }));
    setIconPreview(null);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsUpdateStore(null);
    setFormData({ name: "", icon: null });
    setIconPreview(null);
    setFormError("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {selectedStoreId ? (
        <StoreDetail
          storeId={selectedStoreId}
          onBack={() => setSelectedStoreId(null)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Stores
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your category stores
              </p>
            </div>
            <button
              onClick={() => {
                setIsUpdateStore(null);
                setFormData({ name: "", icon: null });
                setIconPreview(null);
                setIsCreateModalOpen(true);
                setFormError("");
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              <span className="flex items-center gap-2">
                <MdAdd className="w-4 h-4" />
                Create Store
              </span>
            </button>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-lg animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : stores.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <MdStore className="mx-auto text-gray-400 text-5xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No stores found
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first store
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  Create Your First Store
                </button>
              </div>
            ) : (
              stores.map((store) => (
                <div
                  key={store._id}
                  className="bg-white  p-4 rounded-lg hover:shadow-md cursor-pointer group"
                  onClick={() => handleStoreClick(store)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
                      {store.icon?.url ? (
                        <img
                          src={store.icon.url}
                          alt={store.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <MdStore className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate group-hover:text-primary">
                        {store.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {store.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 text-gray-400">
                    <FaRegEdit
                      className="cursor-pointer hover:text-blue-600"
                      onClick={(e) => handleUpdateStore(e, store)}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleDeleteStore(e, store)}
                      className="p-0 m-0 bg-transparent border-none cursor-pointer"
                      title="Delete store"
                      tabIndex={0}
                    >
                      <MdOutlineDeleteOutline className="cursor-pointer hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isUpdateStore ? "Update Store" : "Create Store"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                        formError ? "border-red-500" : ""
                      }`}
                      placeholder="Enter store name"
                      disabled={isSubmitting}
                    />
                    {formError && (
                      <div className="text-xs text-red-500 mt-1">
                        {formError}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Store Icon (Optional)
                    </label>
                    {iconPreview && (
                      <div className="flex flex-col items-center mb-2">
                        <img
                          src={iconPreview}
                          alt="Current Icon"
                          className="w-12 h-12 rounded-full mx-auto mb-1 object-cover border"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveIcon}
                          className="text-xs text-red-500 hover:underline mt-1"
                          disabled={isSubmitting}
                        >
                          Remove Icon
                        </button>
                      </div>
                    )}
                    <div className="border-2 border-dashed p-4 rounded-lg text-center">
                      <input
                        type="file"
                        id="icon-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="icon-upload" className="cursor-pointer">
                        <MdCloudUpload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600">
                          {formData.icon
                            ? formData.icon.name
                            : "Click to upload"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
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
                        ? isUpdateStore
                          ? "Updating..."
                          : "Creating..."
                        : isUpdateStore
                        ? "Update Store"
                        : "Create Store"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Store;
