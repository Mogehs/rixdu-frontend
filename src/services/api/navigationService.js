import {
  transformApiToNavigation,
  categoryIconMap,
  validateNavigationStructure,
} from '../../data/navigationData';

class NavigationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://api.rixdu.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async fetchNavigationData(useCache = true) {
    const cacheKey = 'navigation_data';

    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/api/navigation/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      // Transform API data to our navigation structure
      const navigationData = transformApiToNavigation(
        apiData.data || apiData,
        categoryIconMap
      );

      // Validate the structure
      if (!validateNavigationStructure(navigationData)) {
        console.warn('Navigation structure validation failed');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: navigationData,
        timestamp: Date.now(),
      });

      return navigationData;
    } catch (error) {
      console.error('Failed to fetch navigation data:', error);
      // Return fallback data or empty array
      return this.getFallbackNavigation();
    }
  }

  /**
   * Get fallback navigation data when API fails
   * @returns {Array} Fallback navigation structure
   */
  getFallbackNavigation() {
    return [
      {
        id: 'classified',
        name: 'Classified',
        link: '/category/classified',
        icon: categoryIconMap['classified'],
        subcategories: [],
      },
      {
        id: 'jobs',
        name: 'Jobs',
        link: '/category/jobs',
        icon: categoryIconMap['jobs'],
        subcategories: [],
      },
    ];
  }

  searchNavigation(categories, searchTerm) {
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

    search(categories, searchTerm);
    return results;
  }

  getItemByPath(categories, path) {
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

    return findItem(categories, path);
  }

  /**
   * Clear navigation cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
export const navigationService = new NavigationService();

// ========================================
// REACT HOOK FOR NAVIGATION DATA
// ========================================

import { useState, useEffect } from 'react';

export const useNavigationData = (useApi = false) => {
  const [navigationData, setNavigationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNavigation = async () => {
      if (!useApi) {
        // Use static data from navigationData.js
        const { categoryNavigation } = await import(
          '../../data/navigationData'
        );
        setNavigationData(categoryNavigation);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await navigationService.fetchNavigationData();
        setNavigationData(data);
      } catch (err) {
        setError(err.message);
        // Fallback to static data
        const { categoryNavigation } = await import(
          '../../data/navigationData'
        );
        setNavigationData(categoryNavigation);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();
  }, [useApi]);

  const searchItems = (searchTerm) => {
    return navigationService.searchNavigation(navigationData, searchTerm);
  };

  const getItemByPath = (path) => {
    return navigationService.getItemByPath(navigationData, path);
  };

  const refreshData = () => {
    navigationService.clearCache();
    return loadNavigation();
  };

  return {
    navigationData,
    loading,
    error,
    searchItems,
    getItemByPath,
    refreshData,
  };
};
