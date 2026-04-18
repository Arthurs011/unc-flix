import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // When a new SW takes control, reload once so users see fresh code immediately
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // If an update is found, activate it immediately
        const promptUpdate = (sw: ServiceWorker | null) => {
          if (sw && sw.state === "installed" && navigator.serviceWorker.controller) {
            sw.postMessage("SKIP_WAITING");
          }
        };

        if (reg.waiting) promptUpdate(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => promptUpdate(sw));
        });

        // Check for updates on focus + every 60s
        const check = () => reg.update().catch(() => {});
        window.addEventListener("focus", check);
        setInterval(check, 60_000);
      })
      .catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
