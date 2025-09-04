import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCard, {
  EmptyState,
} from "../../components/notifications/NotificationCard";
import { FiSearch, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllAsRead as markAllAsReadThunk,
  toggleNotification,
  deleteNotificationById,
  deleteAllNotifications,
} from "../../features/notifications/notificationsSlice";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: notifItems = [] } = useSelector((s) => s.notifications || {});
  // Local UI state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all | unread
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasFetchedNotifs = useRef(false);
  useEffect(() => {
    if (hasFetchedNotifs.current) return;
    dispatch(fetchNotifications());
    hasFetchedNotifs.current = true;
  }, [dispatch]);
  console.log("Notifications:", notifItems);

  // Action handlers
  const toggleDropdown = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const toggleReadStatus = (id) => {
    dispatch(toggleNotification(id));
    toggleDropdown(id);
  };

  const deleteNotification = (id) => {
    dispatch(deleteNotificationById(id));
    toggleDropdown(id);
  };

  const viewNotificationDetails = (id) => {
    const n = notifItems.find((x) => x._id === id || x.id === id);
    if (!n) return;

    const { metadata, listingId, isRead, _id } = n;
    const slug = metadata?.slug;

    if (slug) {
      switch (listingId?.serviceType) {
        case "others":
          navigate(`/ad/${slug}`);
          break;
        case "vehicles":
          navigate(`/garage/service/${slug}`);
          break;
        case "healthcare":
          navigate(`/health-care/doctor/${slug}`);
          break;
        default:
          if (listingId?.id) navigate(`/ad/${listingId.id}`);
      }
    } else if (listingId?.id) {
      navigate(`/ad/${listingId.id}`);
    }

    if (!isRead) {
      dispatch(toggleNotification(_id || n.id));
    }
  };

  const markAllAsRead = () => {
    dispatch(markAllAsReadThunk());
  };

  // Delete all notifications (server-side)
  const deleteAll = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAll = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await dispatch(deleteAllNotifications()).unwrap();
      // Show success message using existing toast pattern
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      // Show error message using existing toast pattern if available
    } finally {
      setIsDeleting(false);
    }
  };

  const cards = useMemo(() => {
    return (notifItems || []).map((n) => {
      const dateISO = n.createdAt || n.date || new Date().toISOString();
      return {
        id: n._id || n.id,
        title: n.title || n.type || "Notification",
        description: n.message || n.description || n.body || "",
        image:
          (n.metadata && (n.metadata.image || n.metadata.icon)) ||
          "/rixdu-logo.png",
        dateISO,
        date: new Date(dateISO).toLocaleString(),
        isRead: !!n.isRead,
        href: n?.metadata?.slug ? `/ad/${n.metadata.slug}` : undefined,
      };
    });
  }, [notifItems]);

  const unreadCount = useMemo(
    () => cards.filter((n) => !n.isRead).length,
    [cards]
  );

  const visibleNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cards.filter((n) => {
      if (filterType === "unread" && n.isRead) return false;
      if (!q) return true;
      const hay = (n.title || n.description || "").toString().toLowerCase();
      return hay.includes(q);
    });
  }, [cards, filterType, searchQuery]);

  const groupedNotifications = visibleNotifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.dateISO || notification.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let group;
      if (date.toDateString() === today.toDateString()) {
        group = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        group = "Yesterday";
      } else {
        group = "Earlier";
      }

      if (!groups[group]) groups[group] = [];
      groups[group].push(notification);
      return groups;
    },
    {}
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (filterType === "all"
                  ? "bg-white text-primary shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-800")
              }
            >
              All ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unread")}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (filterType === "unread"
                  ? "bg-white text-primary shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-800")
              }
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-64 rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={deleteAll}
            disabled={isDeleting || cards.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiTrash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete All"}
          </button>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCheckCircle className="h-4 w-4" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* When no visible notifications after filters/search */}
      {visibleNotifications.length === 0 ? (
        cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
            No notifications
            {searchQuery
              ? " matching your search."
              : filterType === "unread"
              ? " marked as unread."
              : "."}
          </div>
        )
      ) : (
        // Group notifications by date
        Object.entries(groupedNotifications).map(
          ([group, groupNotifications]) => (
            <div key={group} className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                  {group}
                </span>
                <span className="text-xs text-gray-400">
                  {groupNotifications.length}
                </span>
              </div>

              <div className="space-y-4">
                {groupNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onView={viewNotificationDetails}
                    onMarkRead={toggleReadStatus}
                    onDelete={deleteNotification}
                    isDropdownOpen={activeDropdown === notification.id}
                    onToggleDropdown={toggleDropdown}
                    useRelativeDropdown={true}
                    bgColor={notification.isRead ? "bg-white" : "bg-blue-50"}
                  />
                ))}
              </div>
            </div>
          )
        )
      )}

      {/* Delete All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAll}
        type="danger"
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone and all your notifications will be permanently removed."
        confirmText="Delete All"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default NotificationsPage;
