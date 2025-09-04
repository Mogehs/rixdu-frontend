import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBXO2iHEWNCDuMsqvIo-t2iL41pbOiZpzQ",
  authDomain: "rixdu-4d2aa.firebaseapp.com",
  projectId: "rixdu-4d2aa",
  storageBucket: "rixdu-4d2aa.firebasestorage.app",
  messagingSenderId: "331347703968",
  appId: "1:331347703968:web:1ce5ba2ff4a36b9c5b31c5",
  measurementId: "G-WKL80MXSHG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
// Initialize Storage
const storage = getStorage(app);
// Initialize Auth
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase messaging initialization failed:", error);
}

export { db, storage, auth, messaging };

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  if (!messaging) {
    throw new Error("Firebase messaging not initialized");
  }

  try {
    // Check if notification permission is already granted
    if (Notification.permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BGOG4JHqPExaqUoneqaJASA74CIErLyV1D0Z_OIS6YZEe2MNfA4tgaZtlSRNEEVjUmz1GCLlknSMIZLngb1GN5k",
      });
      return token;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BGOG4JHqPExaqUoneqaJASA74CIErLyV1D0Z_OIS6YZEe2MNfA4tgaZtlSRNEEVjUmz1GCLlknSMIZLngb1GN5k",
      });
      return token;
    } else {
      throw new Error("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    throw error;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// Generate device ID for tracking
export const getDeviceId = () => {
  let deviceId = localStorage.getItem("fcm_device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("fcm_device_id", deviceId);
  }
  return deviceId;
};
