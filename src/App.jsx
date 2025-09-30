import React, { Suspense, lazy } from "react";
// import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollRestoration from "./components/ScrollRestoration";
import AuthInitializer from "./components/auth/AuthInitializer";
// import LoadingScreen from "./components/LoadingScreen";
import "./App.css";

// Lazy load heavy components that can delay initial render
const NotificationSocketBridge = lazy(() =>
  import("./components/notifications/NotificationSocketBridge")
);
const FCMTokenManager = lazy(() =>
  import("./components/notifications/FCMTokenManager")
);

const App = () => {
  return (
    <AuthInitializer>
      <ScrollRestoration />
      {/* <Suspense fallback={<LoadingScreen />}> */}
      <NotificationSocketBridge />
      <FCMTokenManager />
      {/* </Suspense> */}
      <AppRoutes />
    </AuthInitializer>
  );
};

export default App;
