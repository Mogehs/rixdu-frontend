import { useState, useEffect } from 'react';
import { categoryNavigation } from '../data/navigationData';

/**
 * Custom hook for navigation data with API integration
 * @param {boolean} useApi - Whether to fetch from API or use static data
 * @returns {Object} Navigation state and utilities
 */
export const useNavigationData = (useApi = false) => {
  const [navigationData, setNavigationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulate API call for demonstration
  const fetchFromApi = async () => {
    // Replace with your actual API endpoint
    const response = await fetch('/api/navigation/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch navigation data');
    }
    return response.json();
  };

  // Transform API response to navigation structure
  const transformApiResponse = (apiData) => {
    // Example transformation - adjust based on your API structure
    return apiData.map((item) => ({
      id: item.id,
      name: item.name,
      link: item.link || `/category/${item.slug}`,
      icon: item.icon_url, // You might need to map this to local icons
      subcategories: item.children ? transformApiResponse(item.children) : [],
    }));
  };

  useEffect(() => {
    const loadNavigation = async () => {
      if (!useApi) {
        // Use static data
        setNavigationData(categoryNavigation);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiData = await fetchFromApi();
        const transformedData = transformApiResponse(apiData);
        setNavigationData(transformedData);
      } catch (err) {
        setError(err.message);
        // Fallback to static data
        setNavigationData(categoryNavigation);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();
  }, [useApi]);

  /**
   * Search navigation items recursively
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching navigation items
   */
  const searchItems = (searchTerm) => {
    const results = [];
    const search = (items, term, path = []) => {
      items.forEach((item) => {
        const itemPath = [...path, item.name];
        if (item.name.toLowerCase().includes(term.toLowerCase())) {
          results.push({
            ...item,
            breadcrumb: itemPath.join(' > '),
          });
        }
        if (item.subcategories) {
          search(item.subcategories, term, itemPath);
        }
      });
    };

    search(navigationData, searchTerm);
    return results;
  };

  /**
   * Get navigation item by path
   * @param {Array} path - Path array ['category-id', 'subcategory-id', ...]
   * @returns {Object|null} Navigation item
   */
  const getItemByPath = (path) => {
    if (!path.length) return null;

    const findItem = (items, targetPath, currentIndex = 0) => {
      for (const item of items) {
        if (item.id === targetPath[currentIndex]) {
          if (currentIndex === targetPath.length - 1) {
            return item;
          }
          if (item.subcategories) {
            return findItem(item.subcategories, targetPath, currentIndex + 1);
          }
        }
      }
      return null;
    };

    return findItem(navigationData, path);
  };

  return {
    navigationData,
    loading,
    error,
    searchItems,
    getItemByPath,
  };
};
