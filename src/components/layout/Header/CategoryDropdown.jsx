import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CategoryDropdown = ({
  category,
  isActive,
  activePath = [], // Dynamic path array instead of fixed levels
  onItemHover, // Generic handler for any level
  onMouseLeave,
  index,
  totalCategories,
  depth = 0, // Current nesting depth
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
  }, [isActive, index, totalCategories]);

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
    // Build path for this item
    const newPath = [...activePath.slice(0, depth), category.id];
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
    const categoryElement = e.currentTarget.closest(".relative.group");

    if (categoryElement && categoryElement.contains(relatedTarget)) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      onMouseLeave();
    }, 100);
  };

  // Check if current item should show dropdown
  const shouldShowDropdown =
    isActive && category.subcategories && category.subcategories.length > 0;

  // Recursive function to render nested dropdowns
  const renderNestedDropdown = (items, currentDepth, currentPath) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="p-3 grid grid-cols-3 gap-2 justify-start items-start max-w-xl">
        {items.map((item, index) => {
          const itemPath = [...currentPath, item.id];
          const isItemActive =
            activePath.length > currentDepth &&
            activePath.slice(0, itemPath.length).join("/") ===
              itemPath.join("/");
          const hasChildren =
            item.subcategories && item.subcategories.length > 0;

          return (
            <div
              key={item.id || index}
              className="relative"
              onMouseEnter={() => onItemHover(itemPath)}
            >
              <Link
                to={item.link}
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-primary)] transition-colors no-underline rounded-lg border border-gray-100 hover:border-blue-200 w-full"
              >
                <span className="text-xs font-medium truncate flex-1 text-left">
                  {item.name}
                </span>
                {hasChildren && (
                  <svg
                    className="w-2.5 h-2.5 text-gray-400 flex-shrink-0 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </Link>

              {/* Recursive nested dropdown */}
              {hasChildren && isItemActive && (
                <div
                  className={`absolute top-0 bg-white shadow-lg border border-gray-200 z-50 dropdown-enter-active min-w-[500px] rounded-lg ${
                    dropdownPosition === "right"
                      ? "right-full border-r-0 mr-1"
                      : "left-full border-l-0 ml-1"
                  }`}
                  style={{ zIndex: 50 + currentDepth }} // Ensure proper stacking
                >
                  {renderNestedDropdown(
                    item.subcategories,
                    currentDepth + 1,
                    itemPath
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
          category.name?.toLowerCase() === "jobs"
            ? "/jobs/categories"
            : category.name?.toLowerCase().includes("health") &&
              category.name?.toLowerCase().includes("care")
            ? "/health-care"
            : category.name?.toLowerCase().includes("vehicles")
            ? "/garage"
            : category.link
        }
        className="flex items-center gap-1.5 px-2 lg:px-3 py-2 pr-3 lg:pr-4 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-300 no-underline category-item whitespace-nowrap"
      >
        <img src={category.icon} alt={category.name} className="w-4 h-4" />
        <span className="flex-1">{category.name}</span>
        {/* Show simple arrow if category has subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <svg
            className="w-2.5 h-2.5 ml-1.5 text-gray-400 group-hover:text-gray-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </Link>

      {/* Dynamic Dropdown Menu */}
      {shouldShowDropdown && (
        <div
          className={`absolute top-full bg-white shadow-lg border border-gray-200 z-50 dropdown-enter-active category-dropdown min-w-[550px] max-w-[700px] rounded-lg ${
            dropdownPosition === "right"
              ? "right-0 dropdown-right dropdown-right-positioned"
              : "left-0 dropdown-left"
          }`}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {renderNestedDropdown(category.subcategories, depth + 1, [
            category.id,
          ])}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
