import { io } from "socket.io-client";

const inferBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URI;
  if (envUrl) return envUrl;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl) return apiUrl;
  try {
    const loc = window.location;
    // Common dev fallback: swap 5173 -> 5000
    if (loc.port === "5173") return `${loc.protocol}//${loc.hostname}:5000`;
    return `${loc.protocol}//${loc.host}`;
  } catch {
    return "http://localhost:5000";
  }
};

const baseURL = inferBackendUrl();
const socket = io(baseURL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
  // Add reconnection options to prevent excessive reconnection attempts
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 5,
  timeout: 20000,
  // Disable ping/pong timeouts that can cause unnecessary disconnections
  pingTimeout: 60000,
  pingInterval: 25000,
});

socket.on("connect", () => {
  console.log("Socket connected successfully");
});

socket.on("connect_error", (err) => {
  // Surface connection issues during development
  if (import.meta.env.DEV) {
    console.warn("Socket connect_error:", err?.message || err);
  }
});

socket.on("disconnect", (reason) => {
  if (import.meta.env.DEV) {
    console.log("Socket disconnected:", reason);
  }
});

export default socket;
