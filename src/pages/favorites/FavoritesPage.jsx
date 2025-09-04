import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AdCard } from "../../components/common";
import {
  getFavorites,
  toggleFavorite,
} from "../../features/profile/publicProfileSlice";
import { toast } from "react-toastify";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);

  const { favorites } = useSelector((state) => state.publicProfile);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: favoriteItems, loading, error } = favorites;

  // Fetch once on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getFavorites());
    }
  }, [dispatch, isAuthenticated]);

  // Toggle favorite
  const handleToggleFavorite = (listingId) => {
    if (!isAuthenticated) {
      toast.info("Please login to save favorites");
      return;
    }

    if (isProcessingFavorite) return;

    setIsProcessingFavorite(true);

    dispatch(toggleFavorite(listingId))
      .unwrap()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        toast.error(`Error: ${err}`);
      })
      .finally(() => setIsProcessingFavorite(false));
  };

  // Sort favorites if "recent" is active
  const sortedFavorites = useMemo(() => {
    if (!favoriteItems || favoriteItems.length === 0) return [];

    if (activeTab === "recent") {
      return [...favoriteItems].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || 0);
        const dateB = new Date(b.timestamp || b.createdAt || 0);
        return dateB - dateA;
      });
    }

    return favoriteItems;
  }, [favoriteItems, activeTab]);

  // Render
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          Failed to load favorites: {error}
        </div>
      );
    }

    if (!sortedFavorites || sortedFavorites.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You don't have any favorites yet.
          </p>
          <Link
            to="/all-listings"
            className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition-colors shadow-sm"
          >
            Browse Properties
          </Link>
        </div>
      );
    }

    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {sortedFavorites.map((item, index) => (
          <AdCard
            key={item._id || index}
            item={item}
            index={index}
            onToggleFavorite={handleToggleFavorite}
            isProcessingFavorite={isProcessingFavorite}
            showFavourite={true}
            inAllFav={true}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <Link
          to="/dashboard/favorites/categories"
          className="text-[var(--color-secondary)] hover:underline"
        >
          View by Categories
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium text-base transition-colors ${
              activeTab === "all"
                ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Favorites
          </button>
          <button
            className={`py-3 px-6 font-medium text-base transition-colors ${
              activeTab === "recent"
                ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recently Added
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default FavoritesPage;
