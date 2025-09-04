// ========================================
// NAVIGATION API SERVICE
// ========================================

import {
  transformApiToNavigation,
  categoryIconMap,
  validateNavigationStructure,
} from '../data/navigationData';

/**
 * Navigation API Service
 * Handles fetching and transforming navigation data from API
 */
class NavigationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://api.rixdu.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch navigation data from API
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Array>} Navigation categories
   */
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

  /**
   * Search navigation items recursively
   * @param {Array} categories - Navigation categories
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching navigation items
   */
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

  /**
   * Get navigation item by path
   * @param {Array} categories - Navigation categories
   * @param {Array} path - Path array ['category-id', 'subcategory-id', ...]
   * @returns {Object|null} Navigation item
   */
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

export default NavigationService;
