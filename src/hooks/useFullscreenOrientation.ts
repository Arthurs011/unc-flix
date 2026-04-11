import { useEffect } from "react";

export function useFullscreenOrientation() {
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFullscreen = !!document.fullscreenElement;

      if (!screen.orientation?.lock) return;

      if (isFullscreen) {
        try {
          await screen.orientation.lock("landscape");
        } catch {
          // Device may not support orientation lock — ignore
        }
      } else {
        try {
          screen.orientation.unlock();
        } catch {
          // Ignore
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      // Unlock orientation when leaving the watch page
      try {
        screen.orientation?.unlock?.();
      } catch {
        // Ignore
      }
    };
  }, []);
}
