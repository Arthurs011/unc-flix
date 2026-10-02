import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        // Escape hatch for devices pinned to a worker that caches /sw.js, which
        // can never discover a newer one. Those clients sit on an old bundle
        // indefinitely, so drop every cache and take the network copy instead.
        // Once per session, so a worker that keeps re-creating an old cache
        // cannot put the page in a reload loop.
        const RECOVERED = "uncflix_cache_recovered";
        try {
          const names = await caches.keys();
          const stale = names.filter((n) => !n.startsWith("aplmov-v5"));
          if (stale.length && !sessionStorage.getItem(RECOVERED)) {
            sessionStorage.setItem(RECOVERED, "1");
            reg.active?.postMessage("CLEAR_CACHES");
            await Promise.all(stale.map((n) => caches.delete(n)));
            window.location.reload();
            return;
          }
        } catch {
          // No Cache Storage support: nothing to clear.
        }
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
