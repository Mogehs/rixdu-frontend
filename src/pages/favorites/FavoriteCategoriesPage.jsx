import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AdCard } from "../../components/common";
import AdCardHorizontal from "../../components/common/AdCardHorizontal";
import {
  getFavorites,
  toggleFavorite,
} from "../../features/profile/publicProfileSlice";
import { toast } from "react-toastify";

const FavoriteCategoriesPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
  const isSmallerScreen = window.innerWidth <= 768;
  const hasFetched = useRef(false); // Track if we've already fetched

  // Get favorites data from Redux store
  const { favorites } = useSelector((state) => state.publicProfile);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: favoriteItems, loading, error } = favorites;

  // Fetch favorites data only once when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      dispatch(getFavorites());
      hasFetched.current = true;
    }
  }, [dispatch, isAuthenticated]);

  // Function to handle toggling favorites
  const handleToggleFavorite = (listingId) => {
    if (!isAuthenticated) {
      toast.info("Please login to save favorites", {
        position: "bottom-left",
        autoClose: 3000,
      });
      return Promise.reject("Not authenticated");
    }

    if (isProcessingFavorite) {
      return Promise.reject("Request already in progress");
    }

    setIsProcessingFavorite(true);

    return dispatch(toggleFavorite(listingId))
      .unwrap()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        toast.error(`Error: ${error}`, {
          position: "bottom-left",
          autoClose: 3000,
        });
        throw error;
      })
      .finally(() => {
        setIsProcessingFavorite(false);
      });
  };

  // Organize favorites by category
  const favoritesByCategory = useMemo(() => {
    if (!favoriteItems || favoriteItems.length === 0) return [];

    const categoriesMap = {};

    favoriteItems.forEach((item) => {
      if (item && item.categoryId) {
        const categoryId = item.categoryId._id;
        const categoryName = item.categoryId.name;

        if (!categoriesMap[categoryId]) {
          categoriesMap[categoryId] = {
            id: categoryId,
            name: categoryName,
            items: [],
          };
        }

        categoriesMap[categoryId].items.push(item);
      }
    });

    return Object.values(categoriesMap);
  }, [favoriteItems]);

  // Handle tab selection
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Prepare the item for AdCard component
  const prepareItemForAdCard = (item) => {
    if (!item) return null;

    return {
      _id: item._id,
      values: item.values,
      isVerified: true,
      isFeatured: false,
    };
  };

  // Check if we have the data to render
  const hasData = favoriteItems && favoriteItems.length > 0;

  // Loading state
  if (loading && !hasData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium text-base transition-colors ${
              activeTab === "all"
                ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabClick("all")}
          >
            All Favorites
          </button>
          <button
            className={`py-3 px-6 font-medium text-base transition-colors ${
              activeTab === "lists"
                ? "text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabClick("lists")}
          >
            By Categories
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              hasFetched.current = false;
              dispatch(getFavorites());
              hasFetched.current = true;
            }}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && (!favoriteItems || favoriteItems.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You don't have any favorite listings yet.
          </p>
          <Link
            to="/all-listings"
            className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-secondary transition-colors shadow-sm"
          >
            Browse Listings
          </Link>
        </div>
      )}

      {/* Tab content */}
      {!loading && !error && favoriteItems && favoriteItems.length > 0 && (
        <>
          {activeTab === "all" && (
            <div>
              <div
                className={
                  isSmallerScreen
                    ? "grid grid-cols-1 gap-5"
                    : "grid grid-cols-1 gap-5"
                }
              >
                {favoriteItems.map((item, index) => {
                  const preparedItem = prepareItemForAdCard(item);
                  return isSmallerScreen ? (
                    <AdCard
                      key={item._id || index}
                      item={preparedItem}
                      index={index}
                      passedFavorites={favoriteItems}
                      onToggleFavorite={handleToggleFavorite}
                      isProcessingFavorite={isProcessingFavorite}
                    />
                  ) : (
                    <AdCardHorizontal
                      key={item._id || index}
                      item={preparedItem}
                      index={index}
                      passedFavorites={favoriteItems}
                      onToggleFavorite={handleToggleFavorite}
                      isProcessingFavorite={isProcessingFavorite}
                    />
                  );
                })}
              </div>

              {favoriteItems.length > 8 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => {
                      hasFetched.current = false;
                      dispatch(getFavorites());
                      hasFetched.current = true;
                    }}
                    className="px-6 py-2.5 bg-secondary text-white font-medium rounded-full hover:bg-secondary transition-colors shadow-sm"
                  >
                    Refresh Favorites
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "lists" && (
            <div>
              {favoritesByCategory.length > 0 ? (
                favoritesByCategory.map((category) => (
                  <div key={category.id} className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <Link
                        to={`/category/${category.id}`}
                        className="text-[var(--color-secondary)] text-sm font-medium hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div
                      className={
                        isSmallerScreen
                          ? "grid grid-cols-1 gap-5"
                          : "grid grid-cols-1 gap-5"
                      }
                    >
                      {category.items.slice(0, 3).map((item, index) => {
                        const preparedItem = prepareItemForAdCard(item);
                        return isSmallerScreen ? (
                          <AdCard
                            key={item._id || index}
                            item={preparedItem}
                            index={index}
                            passedFavorites={favoriteItems}
                            onToggleFavorite={handleToggleFavorite}
                            isProcessingFavorite={isProcessingFavorite}
                          />
                        ) : (
                          <AdCardHorizontal
                            key={item._id || index}
                            item={preparedItem}
                            index={index}
                            passedFavorites={favoriteItems}
                            onToggleFavorite={handleToggleFavorite}
                            isProcessingFavorite={isProcessingFavorite}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    No categorized favorites found.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoriteCategoriesPage;
