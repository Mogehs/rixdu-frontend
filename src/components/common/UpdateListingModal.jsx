import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryById, clearCurrentCategory } from '../../features/admin/categoriesSlice';
import { updateListing, selectUpdatingListing, selectListingsError, selectValidationErrors, clearError } from '../../features/listings/listingsSlice';
import CustomLocationPicker from '../maps/CustomLocationPicker';
import {
    FaCamera,
    FaTimes,
    FaImage,
    FaEdit,
    FaCog,
    FaMapMarkerAlt,
    FaFileAlt,
    FaTrash
} from 'react-icons/fa';

const UpdateListingModal = ({ listing, onClose }) => {
    const dispatch = useDispatch();
    const fileInputRefs = useRef({});

    const { currentCategory, loading: categoryLoading, error: categoryError } = useSelector((state) => state.adminCategories);
    const isUpdating = useSelector(selectUpdatingListing);
    const listingsError = useSelector(selectListingsError);
    const validationErrors = useSelector(selectValidationErrors);

    const [formData, setFormData] = useState({ dynamicFields: {} });
    const [retainedFiles, setRetainedFiles] = useState({});

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearCurrentCategory());
        if (listing?.categoryId) {
            dispatch(fetchCategoryById(listing.categoryId._id || listing.categoryId));
        }
    }, [dispatch, listing]);

    useEffect(() => {
        if (currentCategory && currentCategory.fields && listing) {
            const initialDynamicFields = {};
            const initialRetainedFiles = {};

            currentCategory.fields.forEach(field => {
                const value = listing.values[field.name];
                if (field.type === 'image' || field.type === 'file') {
                    initialDynamicFields[field.name] = field.multiple ? [] : null;
                    initialRetainedFiles[field.name] = value || [];
                } else {
                    initialDynamicFields[field.name] = value !== undefined ? value : (field.multiple ? [] : '');
                }
            });
            setFormData({ dynamicFields: initialDynamicFields });
            setRetainedFiles(initialRetainedFiles);
        }
    }, [currentCategory, listing]);

    const handleFileChange = (fieldName, files, isMultiple = false) => {
        const fileList = Array.from(files);
        if (isMultiple) {
            setFormData(prev => ({
                ...prev,
                dynamicFields: { ...prev.dynamicFields, [fieldName]: [...(prev.dynamicFields[fieldName] || []), ...fileList] }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                dynamicFields: { ...prev.dynamicFields, [fieldName]: fileList[0] || null }
            }));
        }
    };

    const removeNewFile = (fieldName, fileIndex, isMultiple = false) => {
        if (isMultiple) {
            setFormData(prev => ({
                ...prev,
                dynamicFields: { ...prev.dynamicFields, [fieldName]: prev.dynamicFields[fieldName].filter((_, index) => index !== fileIndex) }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                dynamicFields: { ...prev.dynamicFields, [fieldName]: null }
            }));
        }
    };

    const removeRetainedFile = (fieldName, fileUrl, isMultiple = false) => {
        if (isMultiple) {
            setRetainedFiles(prev => ({
                ...prev,
                [fieldName]: prev[fieldName].filter(file => file.url !== fileUrl)
            }));
        } else {
            setRetainedFiles(prev => ({ ...prev, [fieldName]: [] }));
        }
    };

    const handleDynamicFieldChange = (fieldName, value, isCheckbox = false, isMultiple = false) => {
        setFormData(prev => ({
            ...prev,
            dynamicFields: {
                ...prev.dynamicFields,
                [fieldName]: isCheckbox
                    ? isMultiple
                        ? (prev.dynamicFields[fieldName] || []).includes(value)
                            ? (prev.dynamicFields[fieldName] || []).filter(v => v !== value)
                            : [...(prev.dynamicFields[fieldName] || []), value]
                        : prev.dynamicFields[fieldName] === value ? "" : value
                    : value
            }
        }));
    };

    const handleLocationChange = (fieldName, locationData) => {
        setFormData(prev => ({
            ...prev,
            dynamicFields: { ...prev.dynamicFields, [fieldName]: locationData }
        }));
    };

    const renderDynamicFields = () => {
        if (!currentCategory || !currentCategory.fields) return null;

        const imageFields = currentCategory.fields.filter(f => f.type === 'image');
        const textFields = currentCategory.fields.filter(f => f.type === 'text' || f.type === 'input');
        const otherFields = currentCategory.fields.filter(f =>
            f.type !== 'image' && f.type !== 'text' && f.type !== 'input'
        );

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Images */}
                {imageFields.length > 0 && (
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <FaImage className="text-blue-600 text-lg" />
                            <h3 className="text-lg font-semibold text-gray-800">Images</h3>
                        </div>
                        {imageFields.map(field => (
                            <div key={field.name} className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    {field.label || field.name}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
                                    <input
                                        ref={el => fileInputRefs.current[field.name] = el}
                                        type="file"
                                        multiple={field.multiple}
                                        accept="image/*"
                                        onChange={e => handleFileChange(field.name, e.target.files, field.multiple)}
                                        className="hidden"
                                    />
                                    <button type="button" onClick={() => fileInputRefs.current[field.name]?.click()}
                                        className="flex flex-col items-center justify-center w-full p-4 hover:bg-blue-50 rounded-lg transition-colors">
                                        <FaCamera className="text-4xl text-blue-400 mb-3" />
                                        <span className="text-blue-600 font-semibold text-lg">Add Photos</span>
                                        <span className="text-sm text-gray-500 mt-1">Upload high-quality images to attract more viewers</span>
                                    </button>
                                </div>

                                {/* Display existing and new images with preview - like CreateAdFormPage */}
                                <div className="mt-4">
                                    {/* Show existing retained images */}
                                    {(retainedFiles[field.name] || []).length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {(retainedFiles[field.name] || []).map((file, index) => (
                                                    <div key={`retained-${index}`} className="relative group">
                                                        <img src={file.url} alt="existing" className="w-full h-24 object-cover rounded-lg shadow-sm" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRetainedFile(field.name, file.url, field.multiple)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                                                            Current
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show new images being uploaded */}
                                    {field.multiple && formData.dynamicFields[field.name] && formData.dynamicFields[field.name].length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {formData.dynamicFields[field.name].map((file, fileIndex) => (
                                                    <div key={`new-${fileIndex}`} className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`New ${fileIndex + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg shadow-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewFile(field.name, fileIndex, field.multiple)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                        <div className="absolute bottom-1 left-1 bg-green-500 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
                                                            {fileIndex + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Single image handling - like CreateAdFormPage */}
                                    {!field.multiple && formData.dynamicFields[field.name] && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">New Image:</p>
                                            <div className="relative inline-block">
                                                <img
                                                    src={URL.createObjectURL(formData.dynamicFields[field.name])}
                                                    alt="New preview"
                                                    className="w-32 h-32 object-cover rounded-lg shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(field.name, 0, false)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Middle Column: Basic Fields */}
                <div className={`${imageFields.length > 0 ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <FaEdit className="text-blue-600 text-lg" />
                        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                    </div>
                    <div className="space-y-4">
                        {textFields.map(field => {
                            const fieldValue = formData.dynamicFields[field.name];
                            return (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label || field.name}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {field.type === 'text' ? (
                                        <textarea
                                            value={fieldValue || ''}
                                            onChange={e => handleDynamicFieldChange(field.name, e.target.value)}
                                            rows={field.name.toLowerCase().includes('description') ? 5 : 3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                                            placeholder={`Enter ${field.name.toLowerCase()}...`}
                                        />
                                    ) : (
                                        <input
                                            type={field.name.toLowerCase().includes('price') ? 'number' : 'text'}
                                            value={fieldValue || ''}
                                            onChange={e => handleDynamicFieldChange(field.name, e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder={`Enter ${field.name.toLowerCase()}...`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Additional Fields */}
                {otherFields.length > 0 && (
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <FaCog className="text-blue-600 text-lg" />
                            <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
                        </div>
                        <div className="space-y-4">
                            {otherFields.map(field => {
                                const fieldValue = formData.dynamicFields[field.name];
                                return (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.type === 'location' && <FaMapMarkerAlt className="inline mr-1 text-blue-600" />}
                                            {(field.type === 'file' || field.type === 'document') && <FaFileAlt className="inline mr-1 text-blue-600" />}
                                            {field.label || field.name}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderField(field, fieldValue)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderField = (field, fieldValue) => {
        const commonProps = {
            className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        };
        switch (field.type) {
            case 'input':
            case 'number':
            case 'email':
            case 'tel':
            case 'url':
            case 'date':
            case 'time':
                return <input type={field.type} value={fieldValue || ''} onChange={e => handleDynamicFieldChange(field.name, e.target.value)} {...commonProps} />;
            case 'text':
                return <textarea value={fieldValue || ''} onChange={e => handleDynamicFieldChange(field.name, e.target.value)} rows={4} {...commonProps} />;
            case 'select':
                return (
                    <select value={fieldValue || ''} onChange={e => handleDynamicFieldChange(field.name, e.target.value)} {...commonProps}>
                        <option value="">Select an option</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'checkbox':
                return (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {field.options?.map(option => (
                            <label key={option} className="inline-flex items-center">
                                <input type="checkbox" checked={(field.multiple ? (fieldValue || []) : fieldValue) === option} onChange={() => handleDynamicFieldChange(field.name, option, true, field.multiple)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                                <span className="ml-2 text-sm text-gray-600">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'radio':
                return (
                    <div className="mt-2 space-y-2">
                        {field.options?.map(option => (
                            <label key={option} className="flex items-center">
                                <input type="radio" name={field.name} value={option} checked={fieldValue === option} onChange={() => handleDynamicFieldChange(field.name, option)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                                <span className="ml-3 block text-sm font-medium text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'location':
                return <CustomLocationPicker onLocationSelect={locationData => handleLocationChange(field.name, locationData)} initialLocation={fieldValue} />;
            default:
                return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const filesToUpload = {};
        Object.keys(formData.dynamicFields).forEach(fieldName => {
            const field = currentCategory.fields.find(f => f.name === fieldName);
            if ((field.type === 'image' || field.type === 'file') && formData.dynamicFields[fieldName]) {
                filesToUpload[fieldName] = Array.isArray(formData.dynamicFields[fieldName]) ? formData.dynamicFields[fieldName] : [formData.dynamicFields[fieldName]];
            }
        });

        const listingData = {
            values: formData.dynamicFields,
            retainedFiles: retainedFiles,
            files: filesToUpload,
        };

        const result = await dispatch(updateListing({ listingId: listing._id, listingData }));
        if (result.type === 'listings/updateListing/fulfilled') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-xl bg-opacity-75 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col mt-4">
                <div className="flex justify-between items-center border-b p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaEdit className="text-blue-600 text-lg" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Edit Your Listing</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                        <FaTimes size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8">
                    {categoryLoading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading category details...</span>
                        </div>
                    )}
                    {categoryError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <div className="flex items-center">
                                <FaTimes className="mr-2" />
                                <span>{categoryError}</span>
                            </div>
                        </div>
                    )}
                    {listingsError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <div className="flex items-center">
                                <FaTimes className="mr-2" />
                                <span>{listingsError}</span>
                            </div>
                        </div>
                    )}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <div className="flex items-start">
                                <FaTimes className="mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium mb-2">Please fix the following errors:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {validationErrors.map((err, i) => <li key={i}>{err.field}: {err.message}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {renderDynamicFields()}
                </form>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t p-6 flex justify-end gap-4 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2">
                        <FaTimes size={14} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
                    >
                        {isUpdating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaEdit size={14} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateListingModal;
