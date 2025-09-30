import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StoreDropdown = ({
  store,
  isActive,
  activePath = [],
  onItemHover,
  onMouseLeave,
  index,
  totalStores,
  depth = 0,
}) => {
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState("left");

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isActive && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280;
      const buffer = 20;

      const spaceOnRight = viewportWidth - rect.left;
      const spaceOnLeft = rect.right;

      if (spaceOnRight >= dropdownWidth + buffer) {
        setDropdownPosition("left");
      } else if (spaceOnLeft >= dropdownWidth + buffer) {
        setDropdownPosition("right");
      } else {
        setDropdownPosition(spaceOnRight > spaceOnLeft ? "left" : "right");
      }
    }
  }, [isActive, index, totalStores]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Build path for this store
    const newPath = [...activePath.slice(0, depth), store._id];
    onItemHover(newPath);
  };

  const handleMouseLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    const dropdownElement = dropdownRef.current;

    if (dropdownElement && dropdownElement.contains(relatedTarget)) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      onMouseLeave();
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    const storeElement = e.currentTarget.closest(".relative.group");

    if (storeElement && storeElement.contains(relatedTarget)) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      onMouseLeave();
    }, 100);
  };

  const shouldShowDropdown =
    isActive && store.categories && store.categories.length > 0;

  const getFilteredCategories = (categories, storeName) => {
    if (storeName.toLowerCase() === "jobs") {
      const hiringCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase().includes("i'm hiring") ||
          cat.name.toLowerCase().includes("hiring")
      );

      if (hiringCategory) {
        if (hiringCategory.children && hiringCategory.children.length > 0) {
          return hiringCategory.children;
        }

        if (hiringCategory.childrenCount > 0) {
          console.warn(
            "Jobs store hiring category has children but they are not loaded. Consider fetching with nested data."
          );
          return [];
        }
      }
      return [];
    }
    return categories;
  };

  // Calculate dynamic dropdown width based on number of categories
  const getDynamicDropdownWidth = (categoriesCount) => {
    if (categoriesCount <= 3) {
      return "min-w-[320px] max-w-[320px]"; // 1 row of 3 items
    } else if (categoriesCount <= 6) {
      return "min-w-[480px] max-w-[480px]"; // 2 rows of 3 items each
    } else {
      return "min-w-[480px] max-w-[600px]"; // 3+ rows, allow more width
    }
  };

  // Recursive function to render nested category dropdowns
  const renderNestedDropdown = (categories, currentDepth, currentPath) => {
    if (!categories || categories.length === 0) return null;

    return (
      <div className="p-3 flex flex-wrap gap-2 justify-start items-start w-full">
        {categories.map((category) => {
          const categoryPath = [...currentPath, category._id];
          const isCategoryActive =
            activePath.length > currentDepth &&
            activePath.slice(0, categoryPath.length).join("/") ===
              categoryPath.join("/");
          const hasChildren = category.children && category.children.length > 0;

          // Special routing for Jobs store
          let linkTo;
          if (store.name.toLowerCase().includes("jobs")) {
            linkTo = `/jobs/categories?category=${category.slug}`;
          } else if (store.name.toLowerCase().includes("health")) {
            linkTo = `/health-care/services/category/${category.slug}`;
          } else if (store.name.toLowerCase().includes("vehicles")) {
            linkTo = `/garage/all-services?category=${category.slug}`;
          } else {
            // Use store slug and category slug for all-listings navigation
            linkTo = `/all-listings?store=${store.slug}&category=${category.slug}`;
          }

          return (
            <div
              key={category._id}
              className="relative group flex-none w-32"
              onMouseEnter={() => onItemHover(categoryPath)}
            >
              <Link
                to={linkTo}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-primary)] transition-colors no-underline rounded-lg border border-gray-100 hover:border-blue-200 w-full justify-between"
              >
                <span className="text-xs font-medium truncate flex-1 text-left">
                  {category.name}
                </span>
                {hasChildren && (
                  <svg
                    className="w-2 h-2 text-gray-300 flex-shrink-0 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </Link>

              {/* Recursive nested dropdown for children */}
              {hasChildren && isCategoryActive && (
                <div
                  className={`absolute top-0 bg-white shadow-lg border border-gray-200 rounded-lg z-50 dropdown-enter-active ${getDynamicDropdownWidth(
                    category.children.length
                  )} ${
                    dropdownPosition === "right"
                      ? "right-full border-r-0 mr-1"
                      : "left-full border-l-0 ml-1"
                  }`}
                  style={{ zIndex: 50 + currentDepth }}
                >
                  {renderNestedDropdown(
                    category.children,
                    currentDepth + 1,
                    categoryPath
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={
          store.name.toLowerCase() === "jobs"
            ? "/jobs/categories"
            : store.name?.toLowerCase().includes("health") &&
              store.name?.toLowerCase().includes("care")
            ? "/health-care"
            : store.name?.toLowerCase().includes("vehicles")
            ? "/garage"
            : `/category/${store.slug}`
        }
        className="flex items-center gap-1 px-1.5 lg:px-2 py-1.5 pr-2 lg:pr-2.5  md:text-xs xl:text-md font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-300 no-underline category-item whitespace-nowrap"
      >
        <img
          src={store.icon?.url || "/default-store-icon.png"}
          alt={store.name}
          className="w-3.5 h-3.5"
        />
        <span className="flex-1">{store.name}</span>
        {/* Show arrow if store has categories */}
        {store.categories && store.categories.length > 0 && (
          <svg
            className="w-1 h-1 ml-0 text-gray-300 group-hover:text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </Link>

      {/* Dynamic Dropdown Menu */}
      {shouldShowDropdown && (
        <div
          className={`absolute top-full bg-white shadow-lg border border-gray-200 rounded-lg z-50 dropdown-enter-active category-dropdown ${getDynamicDropdownWidth(
            getFilteredCategories(store.categories, store.name).length
          )} ${
            dropdownPosition === "right"
              ? "right-0 dropdown-right dropdown-right-positioned"
              : "left-0 dropdown-left"
          }`}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {renderNestedDropdown(
            getFilteredCategories(store.categories, store.name),
            depth + 1,
            [store._id]
          )}
        </div>
      )}
    </div>
  );
};

export default StoreDropdown;
