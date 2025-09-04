import React, { useEffect, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";

/**
 * Dropdown menu component for notification actions
 */
export const NotificationDropdown = ({
  isOpen,
  notification,
  onMarkRead,
  onDelete,
  style = {},
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-5 top-0 mt-0 w-48 bg-white rounded-md shadow-xl z-[10] border border-gray-200"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={style}
    >
      <div className="py-1">
        <button
          type="button"
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
        >
          Mark as {notification.isRead ? "unread" : "read"}
        </button>
        <button
          type="button"
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

/**
 * Reusable notification card component
 */
const NotificationCard = ({
  notification,
  onView,
  onMarkRead,
  onDelete,
  isDropdownOpen,
  onToggleDropdown,
  useRelativeDropdown = true,
  bgColor, // Optional custom background color
  cardClassNames = "", // Optional additional class names
  // groupTitle (unused)
}) => {
  // Each card has its own dropdown ref
  const cardDropdownRef = useRef(null);

  // Handle clicks outside this specific card's dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cardDropdownRef.current &&
        !cardDropdownRef.current.contains(event.target) &&
        isDropdownOpen
      ) {
        onToggleDropdown(notification.id, event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, notification.id, onToggleDropdown]);
  // Just pass the event to the toggle function
  const handleToggleDropdown = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onToggleDropdown(id, e);
  };

  // Background color logic
  const getBackgroundColor = () => {
    if (bgColor) return bgColor; // Custom color if provided
    return notification.isRead ? "bg-white" : "bg-blue-50";
  };

  return (
    <div
      className={`${getBackgroundColor()} rounded-lg overflow-hidden shadow-sm transition-all border border-gray-100 relative cursor-pointer ${cardClassNames}`}
    >
      {/* Main content */}
      <div
        className="flex flex-col sm:flex-row p-4"
        onClick={(e) => {
          if (!cardDropdownRef.current?.contains(e.target) && !isDropdownOpen) {
            onView(notification.id);
          }
        }}
      >
        {/* Notification Image */}
        {notification.image && (
          <div className="h-20 w-20 flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 mx-auto sm:mx-0">
            <img
              src={notification.image}
              alt={notification.title || "Notification"}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
          </div>
        )}
        {/* Content and Actions */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            {/* Title and Description */}
            <div>
              <h3
                className={`text-lg font-semibold ${
                  notification.isRead ? "text-gray-700" : "text-gray-800"
                }`}
              >
                {notification.title}
              </h3>
              <p
                className={`${
                  notification.isRead ? "text-gray-500" : "text-gray-600"
                }`}
              >
                {notification.description}
              </p>
            </div>

            {/* Dropdown Menu */}
            <div className="relative" ref={cardDropdownRef}>
              {" "}
              <button
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleDropdown(notification.id, e);
                }}
                aria-label="More options"
              >
                <FaEllipsisV />
              </button>
              {/* Show dropdown if using relative positioning */}
              {useRelativeDropdown && (
                <NotificationDropdown
                  isOpen={isDropdownOpen}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>

          {/* Date */}
          <div className="mt-2 text-sm text-gray-500">{notification.date}</div>
        </div>
      </div>{" "}
      {/* Always render dropdown within the component, regardless of useRelativeDropdown setting */}
      {!useRelativeDropdown && (
        <NotificationDropdown
          isOpen={isDropdownOpen}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

// Empty state component
export const EmptyState = () => (
  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
    <p className="text-gray-500 text-lg">No notifications to display</p>
    <p className="text-gray-400 mt-2">You're all caught up!</p>
  </div>
);

export default NotificationCard;
