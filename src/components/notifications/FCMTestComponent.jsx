import React, { useState, useEffect } from "react";
import { useFCMToken } from "../../hooks/useFCMToken.jsx";
import { useAuth0 } from "@auth0/auth0-react";

const FCMTestComponent = () => {
  const { isAuthenticated } = useAuth0();
  const { fcmToken, isSupported, permissionStatus, requestPermissionAndToken } =
    useFCMToken();

  const [testStatus, setTestStatus] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  useEffect(() => {
    setIsVisible(import.meta.env.DEV && isAuthenticated);
  }, [isAuthenticated]);

  const testApiConnection = async () => {
    setTestStatus("Testing API connection...");

    try {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/notifications/test`);

      if (response.ok) {
        const data = await response.json();
        setTestStatus(`✅ API Connected: ${data.message}`);
      } else {
        setTestStatus(
          `❌ API Error: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      setTestStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  const testFCMRegistration = async () => {
    if (!fcmToken) {
      setTestStatus("❌ No FCM token. Please enable notifications first.");
      return;
    }

    setTestStatus("Testing FCM token registration...");

    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        setTestStatus("❌ No auth token found. Please login again.");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/notifications/fcm/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token: fcmToken,
          deviceId: `test-device-${Date.now()}`,
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestStatus(
          `✅ FCM Registration successful: ${
            data.message || "Token registered"
          }`
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestStatus(
          `❌ FCM Registration failed: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      setTestStatus(`❌ Registration error: ${error.message}`);
    }
  };

  const testCreateNotification = async () => {
    setTestStatus("Creating test notification...");

    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        setTestStatus("❌ No auth token found. Please login again.");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/notifications/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: "FCM Test Notification",
          message:
            "This is a test notification created via the FCM test panel!",
          type: "fcm_test",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestStatus(
          `✅ Test notification created! Check your notifications and push notifications. Result: ${JSON.stringify(
            result
          )}`
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestStatus(
          `❌ Failed to create notification: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      setTestStatus(`❌ Create notification error: ${error.message}`);
    }
  };

  const testPushNotification = async () => {
    setTestStatus("Testing push notifications via direct FCM...");

    try {
      // This would test if we can send a notification directly
      // For now, just show that we have the token
      if (fcmToken) {
        setTestStatus(
          `✅ FCM Token available. Length: ${fcmToken.length} chars. Ready for push notifications!`
        );
      } else {
        setTestStatus(
          "❌ No FCM token available for testing push notifications."
        );
      }
    } catch (error) {
      setTestStatus(`❌ Push test error: ${error.message}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="text-sm font-semibold text-gray-800 mb-2">
        🧪 FCM Test Panel (Dev Only)
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Supported:</strong> {isSupported ? "✅" : "❌"}
        </div>
        <div>
          <strong>Permission:</strong> {permissionStatus}
        </div>
        <div>
          <strong>Token:</strong> {fcmToken ? "✅ Ready" : "❌ None"}
        </div>
        {fcmToken && (
          <div className="bg-gray-100 p-2 rounded text-xs break-all">
            {fcmToken.substring(0, 20)}...
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <button
          onClick={testApiConnection}
          className="w-full px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
        >
          Test API Connection
        </button>

        {permissionStatus !== "granted" && (
          <button
            onClick={requestPermissionAndToken}
            className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Enable Push Notifications
          </button>
        )}

        {fcmToken && (
          <>
            <button
              onClick={testFCMRegistration}
              className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Test FCM Registration
            </button>
            <button
              onClick={testCreateNotification}
              className="w-full px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
            >
              Create Test Notification
            </button>
            <button
              onClick={testPushNotification}
              className="w-full px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
            >
              Test Push Token
            </button>
          </>
        )}
      </div>

      {testStatus && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">{testStatus}</div>
      )}
    </div>
  );
};

export default FCMTestComponent;
