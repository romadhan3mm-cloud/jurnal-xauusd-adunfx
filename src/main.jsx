import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { installViewportGap, installDebugOverlay } from "./viewportGap.js";

installViewportGap();
window.addEventListener("load", () => installDebugOverlay());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Kunci zoom (pinch & double-tap) supaya halaman tetap — iOS mengabaikan user-scalable=no.
["gesturestart", "gesturechange", "gestureend"].forEach((ev) =>
  document.addEventListener(ev, (e) => e.preventDefault(), { passive: false })
);
document.addEventListener(
  "touchmove",
  (e) => { if (e.touches.length > 1) e.preventDefault(); },
  { passive: false }
);
