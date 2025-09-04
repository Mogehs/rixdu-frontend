import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const ReviewForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    stars: 0,
    message: "",
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [touched, setTouched] = useState({});

  const handleStarClick = (rating) => {
    setFormData({ ...formData, stars: rating });
    setTouched({ ...touched, stars: true });
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.stars === 0 || !formData.message.trim()) {
      setTouched({ stars: true, message: true });
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });
  };

  const getStarColor = (starIndex) => {
    const rating = hoveredStar || formData.stars;
    return starIndex <= rating ? "text-[#FACC15]" : "text-gray-300";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <FaStar className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Write a Review
          </h3>
          <p className="text-sm text-gray-600">
            Share your experience with this doctor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className={`text-2xl transition-colors duration-150 hover:scale-110 transform ${getStarColor(
                  star
                )}`}
              >
                <FaStar />
              </button>
            ))}
          </div>
          {touched.stars && formData.stars === 0 && (
            <p className="text-red-500 text-xs mt-1">Please select a rating</p>
          )}
          {formData.stars > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {formData.stars === 1 && "Poor"}
              {formData.stars === 2 && "Fair"}
              {formData.stars === 3 && "Good"}
              {formData.stars === 4 && "Very Good"}
              {formData.stars === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Review Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review *
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your experience with this healthcare professional..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
          {touched.message && !formData.message.trim() && (
            <p className="text-red-500 text-xs mt-1">
              Please write a review message
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={
              loading || formData.stars === 0 || !formData.message.trim()
            }
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
