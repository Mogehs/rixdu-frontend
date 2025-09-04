import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCard, {
  EmptyState,
} from "../../components/notifications/NotificationCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchStores } from "../../features/admin/storesSlice";
import {
  fetchNotifications,
  markAllAsRead as markAllAsReadThunk,
  toggleNotification,
  deleteNotificationById,
  deleteAllNotifications,
  fetchPreferences,
  upsertPreference,
} from "../../features/notifications/notificationsSlice";
import { useFCMToken } from "../../hooks/useFCMToken.jsx";
import {
  FiBell,
  FiMail,
  FiSmartphone,
  FiChevronDown,
  FiSearch,
  FiCheckCircle,
  FiTrash2,
} from "react-icons/fi";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const AllNotificationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // FCM Token Management
  const { isSupported, permissionStatus, requestPermissionAndToken } =
    useFCMToken();

  const { items: notifItems = [], preferences = [] } = useSelector(
    (state) => state.notifications || {}
  );

  // Tabs: notifications | settings
  const [activeTab, setActiveTab] = useState("notifications");
  const [filterType, setFilterType] = useState("all"); // all | unread
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State for active dropdown
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Toggle dropdown for a notification
  const toggleDropdown = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Mark a notification as read/unread (server-side)
  const toggleReadStatus = (id) => {
    dispatch(toggleNotification(id));
    setActiveDropdown(null);
  };

  // Delete a notification (server-side)
  const deleteNotification = (id) => {
    dispatch(deleteNotificationById(id));
    setActiveDropdown(null);
  };
  // Handle view notification details: mark as read if unread
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

  // Mark all notifications as read (server-side)
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

  // Derived list after filters & search
  // Map server items to UI card model
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

  // Group notifications by date (Today, Yesterday, Earlier)
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

      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(notification);
      return groups;
    },
    {}
  );

  // ---------------- Settings Tab (per-store notification preferences) ----------------
  const { stores: storeList, loading: storesLoading } = useSelector(
    (state) => state.adminStores || { stores: [], loading: false }
  );

  useEffect(() => {
    // Try to fetch stores if none available
    if (!storeList || storeList.length === 0) {
      try {
        dispatch(fetchStores({ root: 0, level: 0 }));
      } catch {
        /* noop - graceful fallback */
      }
    }
  }, [dispatch, storeList]);

  // Load notifications on mount (and when switching back to tab)
  const hasFetchedNotifs = useRef(false);
  useEffect(() => {
    if (activeTab !== "notifications") return;
    if (hasFetchedNotifs.current) return;
    // Only fetch once per mount/session; relies on socket for live updates
    dispatch(fetchNotifications());
    hasFetchedNotifs.current = true;
  }, [activeTab, dispatch]);

  // Always refresh preferences when the Settings tab is active
  useEffect(() => {
    if (activeTab !== "settings") return;
    dispatch(fetchPreferences());
  }, [activeTab, dispatch]);

  // Server preferences quick lookup
  const prefMap = useMemo(() => {
    return new Map(
      (preferences || []).map((p) => [
        p?.storeId?._id || p?.storeId,
        p?.channels || {},
      ])
    );
  }, [preferences]);

  const [openStoreDropdown, setOpenStoreDropdown] = useState(null);
  const [draft, setDraft] = useState(null); // { storeId, channels }
  const toggleStoreDropdown = (storeId) => {
    setOpenStoreDropdown((prev) => {
      const next = prev === storeId ? null : storeId;
      // When opening, initialize draft from latest server preferences
      if (next === storeId) {
        const ch = prefMap.get(storeId) || {};
        const fresh = {
          email: ch.email != null ? !!ch.email : true,
          inApp: ch.inApp != null ? !!ch.inApp : true,
          push: ch.push != null ? !!ch.push : true, // Enable push notifications by default
        };
        setDraft({ storeId, channels: fresh });
        // Optionally refresh from server (guarded by slice condition)
        dispatch(fetchPreferences());
      } else {
        setDraft(null);
      }
      return next;
    });
  };

  // Save status per store (manual Save only)
  const [saveStatus, setSaveStatus] = useState({}); // { [storeId]: { saving: bool, saved: bool, error?: string } }

  const triggerSave = (storeId) => {
    const channels =
      (draft && draft.storeId === storeId && draft.channels) ||
      (() => {
        const ch = prefMap.get(storeId) || {};
        return {
          email: ch.email != null ? !!ch.email : true,
          inApp: ch.inApp != null ? !!ch.inApp : true,
          push: ch.push != null ? !!ch.push : true, // Enable push notifications by default
        };
      })();

    setSaveStatus((s) => ({ ...s, [storeId]: { saving: true, saved: false } }));
    dispatch(upsertPreference({ storeId: String(storeId), channels }))
      .unwrap()
      .then(() => {
        setSaveStatus((s) => ({
          ...s,
          [storeId]: { saving: false, saved: true },
        }));
        // Refresh preferences from server so UI matches real state
        dispatch(fetchPreferences());
        // Reset saved after a brief moment
        setTimeout(
          () =>
            setSaveStatus((s) => ({
              ...s,
              [storeId]: { saving: false, saved: false },
            })),
          1200
        );
      })
      .catch((err) => {
        setSaveStatus((s) => ({
          ...s,
          [storeId]: {
            saving: false,
            saved: false,
            error: err?.message || "Failed",
          },
        }));
      });
  };

  const updateChannel = (storeId, key, val) => {
    setDraft((prev) => {
      const base =
        prev && prev.storeId === storeId
          ? prev.channels
          : (() => {
              const ch = prefMap.get(storeId) || {};
              return {
                email: ch.email != null ? !!ch.email : true,
                inApp: ch.inApp != null ? !!ch.inApp : true,
                push: ch.push != null ? !!ch.push : true, // Enable push notifications by default
              };
            })();
      return { storeId, channels: { ...base, [key]: val } };
    });
  };

  const saveStoreSettings = (storeId) => {
    // Persist on explicit Save click only
    triggerSave(storeId);
  };

  const Toggle = ({ enabled, onChange, label, children }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          {/* icon slot */}
          {children}
        </span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
          (enabled ? "bg-primary" : "bg-gray-300")
        }
        aria-pressed={enabled}
      >
        <span
          className={
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
            (enabled ? "translate-x-5" : "translate-x-1")
          }
        />
      </button>
    </div>
  );

  const renderSettings = () => {
    const hasStores = storeList && storeList.length > 0;
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Notification Settings
          </h2>
          <p className="text-sm text-gray-500">
            Manage how you receive notifications for each store.
          </p>
        </div>

        {/* Push Notification Permission Banner */}
        {isSupported && permissionStatus === "granted" && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <FiSmartphone className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Push Notifications Enabled
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You'll receive instant notifications even when Rixdu is
                  closed. You can disable this in your browser settings anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSupported && permissionStatus !== "granted" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <FiSmartphone className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Enable Push Notifications
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {permissionStatus === "denied"
                    ? "Push notifications are blocked. Please enable them in your browser settings to receive instant notifications."
                    : "Allow push notifications to get instant alerts even when Rixdu is closed."}
                </p>
                {permissionStatus !== "denied" && (
                  <button
                    onClick={requestPermissionAndToken}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                  >
                    <FiSmartphone className="h-3 w-3" />
                    Enable Push Notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!hasStores && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {storesLoading ? "Loading stores…" : "No stores found."}
          </div>
        )}

        {hasStores && (
          <div className="divide-y rounded-lg border border-gray-200 bg-white">
            {(storeList || []).map((s, idx) => {
              const id = s?._id || s?.id || s?.slug || s?.name || idx;
              const name = s?.name || s?.title || s?.slug || `Store ${idx + 1}`;
              const serverCh = prefMap.get(id) || {};
              const serverSettings = {
                email: serverCh.email != null ? !!serverCh.email : true,
                inApp: serverCh.inApp != null ? !!serverCh.inApp : true,
                push: serverCh.push != null ? !!serverCh.push : true, // Enable push notifications by default
              };
              const isOpen = openStoreDropdown === id;
              const settings =
                isOpen && draft?.storeId === id
                  ? draft.channels
                  : serverSettings;

              return (
                <div key={id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        Configure per-store notification channels
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleStoreDropdown(id)}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        Options
                        <FiChevronDown
                          className={
                            "h-4 w-4 transition-transform " +
                            (openStoreDropdown === id ? "rotate-180" : "")
                          }
                        />
                      </button>

                      {openStoreDropdown === id && (
                        <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                          <Toggle
                            enabled={!!settings.email}
                            onChange={(val) => updateChannel(id, "email", val)}
                            label="Email notifications"
                          >
                            <FiMail className="h-5 w-5" />
                          </Toggle>
                          <Toggle
                            enabled={!!settings.inApp}
                            onChange={(val) => updateChannel(id, "inApp", val)}
                            label="In‑app notifications"
                          >
                            <FiBell className="h-5 w-5" />
                          </Toggle>
                          <Toggle
                            enabled={!!settings.push}
                            onChange={(val) => updateChannel(id, "push", val)}
                            label="Push notifications"
                          >
                            <FiSmartphone className="h-5 w-5" />
                          </Toggle>

                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              onClick={() => setOpenStoreDropdown(null)}
                              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                            >
                              Close
                            </button>
                            <button
                              onClick={() => saveStoreSettings(id)}
                              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
                              disabled={!!saveStatus[id]?.saving}
                            >
                              {saveStatus[id]?.saving
                                ? "Saving…"
                                : saveStatus[id]?.saved
                                ? "Saved"
                                : "Save"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            className={
              "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium " +
              (activeTab === "notifications"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")
            }
            onClick={() => setActiveTab("notifications")}
          >
            All Notifications
          </button>
          <button
            className={
              "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium " +
              (activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")
            }
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>
      </div>

      {activeTab === "notifications" && (
        <>
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
                        bgColor={
                          notification.isRead ? "bg-white" : "bg-blue-50"
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </>
      )}

      {activeTab === "settings" && renderSettings()}

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

export default AllNotificationsPage;
