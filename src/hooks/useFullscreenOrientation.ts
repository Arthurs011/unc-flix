import { useEffect } from "react";

export function useFullscreenOrientation() {
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFullscreen = !!document.fullscreenElement;

      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      };

      if (!orientation?.lock) return;

      if (isFullscreen) {
        try {
          await orientation.lock("landscape");
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
