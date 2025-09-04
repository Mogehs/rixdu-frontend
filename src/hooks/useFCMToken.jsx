import { useState, useEffect, useCallback, useRef } from "react";
import {
  requestNotificationPermission,
  getDeviceId,
  onMessageListener,
} from "../firebase/config";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`;

export const useFCMToken = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState(
    Notification.permission
  );
  const isAuthenticated = localStorage.getItem("token");
  const navigate = useNavigate();

  // Refs to prevent duplicate calls
  const isRequestingRef = useRef(false);
  const hasRegisteredRef = useRef(false);
  const registrationTimeoutRef = useRef(null);

  // Register FCM token with backend
  const registerToken = useCallback(
    async (token) => {
      if (!isAuthenticated || !token || hasRegisteredRef.current) return;

      try {
        hasRegisteredRef.current = true;

        // Use the same token approach as other API calls in the app
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          console.warn(
            "No auth token found in localStorage for FCM registration"
          );
          hasRegisteredRef.current = false;
          return;
        }

        console.log("Registering FCM token with backend...", {
          hasToken: !!token,
          hasAuthToken: !!authToken,
          apiUrl: API_URL,
        });

        const deviceId = getDeviceId();

        const response = await fetch(`${API_URL}/fcm/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token,
            deviceId,
            userAgent: navigator.userAgent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("FCM registration failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: Failed to register FCM token`
          );
        }

        const result = await response.json();
        console.log("FCM token registered successfully:", result);
      } catch (error) {
        console.error("Error registering FCM token:", error);
        hasRegisteredRef.current = false;
      }
    },
    [isAuthenticated]
  );

  // Unregister FCM token from backend
  const unregisterToken = useCallback(
    async (token) => {
      if (!isAuthenticated || !token) return;

      try {
        hasRegisteredRef.current = false;

        // Use the same token approach as other API calls in the app
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          console.warn("No auth token found in localStorage");
          return;
        }

        const deviceId = getDeviceId();

        await fetch(`${API_URL}/fcm/unregister`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token,
            deviceId,
          }),
        });

        console.log("FCM token unregistered successfully");
      } catch (error) {
        console.error("Error unregistering FCM token:", error);
      }
    },
    [isAuthenticated]
  );

  // Request notification permission and get token
  const requestPermissionAndToken = useCallback(async () => {
    if (!isSupported || !isAuthenticated || isRequestingRef.current)
      return null;

    try {
      isRequestingRef.current = true;
      const token = await requestNotificationPermission();
      setFcmToken(token);
      setPermissionStatus("granted");

      if (token) {
        await registerToken(token);
      }

      return token;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setPermissionStatus("denied");
      return null;
    } finally {
      isRequestingRef.current = false;
    }
  }, [isSupported, isAuthenticated, registerToken]);

  // Initialize FCM
  useEffect(() => {
    // Check if FCM is supported
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      setIsSupported(false);
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service Worker registered successfully:", registration);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
        setIsSupported(false);
      });

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log("Received foreground message:", payload);

        // Push notifications should only appear in notification panel, not as toasts
        // The NotificationSocketBridge component will handle displaying in-app notifications
        console.log(
          "Push notification received, will be handled by notification panel"
        );
      })
      .catch((error) => {
        console.error("Error setting up foreground message listener:", error);
      });

    // Listen for service worker messages (notification clicks)
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "NOTIFICATION_CLICK") {
        navigate(event.data.url);
      }
    });
  }, [navigate]);

  // Handle initial token request for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !isSupported) return;

    // Clear any existing timeout
    if (registrationTimeoutRef.current) {
      clearTimeout(registrationTimeoutRef.current);
    }

    if (
      permissionStatus === "granted" &&
      !fcmToken &&
      !isRequestingRef.current
    ) {
      // User has permission but no token - get it now
      requestPermissionAndToken();
    } else if (permissionStatus === "default") {
      // Auto-request permission after a delay for new users
      registrationTimeoutRef.current = setTimeout(() => {
        if (!isRequestingRef.current) {
          requestPermissionAndToken();
        }
      }, 3000); // Increased delay to avoid blocking initial load
    }

    return () => {
      if (registrationTimeoutRef.current) {
        clearTimeout(registrationTimeoutRef.current);
      }
    };
  }, [
    isAuthenticated,
    isSupported,
    permissionStatus,
    fcmToken,
    requestPermissionAndToken,
  ]);

  // Periodic token refresh (FCM tokens can expire) - reduced frequency
  useEffect(() => {
    if (!isAuthenticated || !fcmToken) return;

    // Refresh token every 7 days instead of 24 hours
    const refreshInterval = setInterval(() => {
      if (!isRequestingRef.current) {
        requestPermissionAndToken();
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, fcmToken, requestPermissionAndToken]);

  // Handle cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && fcmToken) {
      unregisterToken(fcmToken);
      setFcmToken(null);
      hasRegisteredRef.current = false;
    }
  }, [isAuthenticated, fcmToken, unregisterToken]);

  return {
    fcmToken,
    isSupported,
    permissionStatus,
    requestPermissionAndToken,
    registerToken,
    unregisterToken,
  };
};
