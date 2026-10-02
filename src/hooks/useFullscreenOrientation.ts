import { useEffect } from "react";

/**
 * `ScreenOrientation.lock` is part of the Screen Orientation API but is not in
 * the DOM lib TypeScript ships, and most desktop browsers do not implement it.
 * `unlock` is typed; `lock` is not. Treat both as optional so the hook is a
 * no-op where the browser has neither.
 */
type Orientatable = {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

function getOrientation(): Orientatable | null {
  if (typeof screen === "undefined") return null;
  return (screen.orientation as Orientatable | undefined) ?? null;
}

export function useFullscreenOrientation() {
  useEffect(() => {
    const orientation = getOrientation();

    const handleFullscreenChange = async () => {
      if (!orientation) return;

      if (document.fullscreenElement) {
        try {
          await orientation.lock?.("landscape");
        } catch {
          // Device may not support orientation lock — ignore
        }
      } else {
        try {
          orientation.unlock?.();
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
        orientation?.unlock?.();
      } catch {
        // Ignore
      }
    };
  }, []);
}