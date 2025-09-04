// Import Firebase messaging for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyBXO2iHEWNCDuMsqvIo-t2iL41pbOiZpzQ",
  authDomain: "rixdu-4d2aa.firebaseapp.com",
  projectId: "rixdu-4d2aa",
  storageBucket: "rixdu-4d2aa.firebasestorage.app",
  messagingSenderId: "331347703968",
  appId: "1:331347703968:web:1ce5ba2ff4a36b9c5b31c5",
  measurementId: "G-WKL80MXSHG",
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.image || "/rixdu-logo.png",
    image: payload.notification?.image,
    badge: "/rixdu-logo.png",
    tag: "rixdu-notification",
    data: payload.data || {},
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/favicon.ico",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Handle notification click - navigate to relevant page
  const notificationData = event.notification.data;
  let targetUrl = "/";

  if (notificationData?.slug) {
    targetUrl = `/ad/${notificationData.slug}`;
  } else if (notificationData?.listingId) {
    targetUrl = `/ad/${notificationData.listingId}`;
  } else if (notificationData?.type === "listing_created") {
    targetUrl = "/notifications";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (
            client.url.includes(self.registration.scope) &&
            "focus" in client
          ) {
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: targetUrl,
              data: notificationData,
            });
            return client.focus();
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          const baseUrl = self.registration.scope.replace(/\/$/, "");
          return clients.openWindow(`${baseUrl}${targetUrl}`);
        }
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event);
});
