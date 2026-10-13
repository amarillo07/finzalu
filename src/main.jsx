import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./index.css";

// When a new version is published, install it and reload automatically so
// nobody has to refresh by hand. Also check for updates every time the app
// comes back to the foreground.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() { updateSW(true); },
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && navigator.onLine) reg.update().catch(() => {});
    });
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
