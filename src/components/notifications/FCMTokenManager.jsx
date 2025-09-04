import React, { useEffect, useCallback, useRef } from "react";
import { useFCMToken } from "../../hooks/useFCMToken.jsx";

const FCMTokenManager = () => {
  const { fcmToken, isSupported, permissionStatus, requestPermissionAndToken } =
    useFCMToken();

  const hasCheckedAuthRef = useRef(false);
  const lastLogTimeRef = useRef(0);

  const checkAuthentication = useCallback(() => {
    const localToken = localStorage.getItem("token");
    return !!localToken;
  }, []);

  // Only check authentication once and request FCM token if needed
  useEffect(() => {
    if (hasCheckedAuthRef.current) return;

    const isUserAuthenticated = checkAuthentication();

    if (
      isUserAuthenticated &&
      isSupported &&
      permissionStatus === "granted" &&
      !fcmToken
    ) {
      hasCheckedAuthRef.current = true;
      requestPermissionAndToken();
    }
  }, [
    checkAuthentication,
    isSupported,
    permissionStatus,
    fcmToken,
    requestPermissionAndToken,
  ]);

  // Log FCM status periodically (not on every render)
  useEffect(() => {
    const isUserAuthenticated = checkAuthentication();
    const now = Date.now();

    // Only log every 30 seconds to avoid spam
    if (isUserAuthenticated && now - lastLogTimeRef.current > 30000) {
      lastLogTimeRef.current = now;
      console.log("FCM Status:", {
        isSupported,
        permissionStatus,
        hasToken: !!fcmToken,
        tokenLength: fcmToken?.length || 0,
        authMethod: "LocalStorage",
      });
    }
  }, [checkAuthentication, isSupported, permissionStatus, fcmToken]);

  return null;
};

export default FCMTokenManager;
