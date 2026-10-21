import { useEffect } from "react";

interface Options {
  onNext?: () => void;
  onPrevious?: () => void;
  onFullscreen?: () => void;
}

/**
 * Keyboard control for the player.
 *
 * The arrows move between episodes and F goes fullscreen, which is what every
 * other player does and what people expect without being told. Shortcuts are
 * ignored while the visitor is typing into a field.
 */
export function usePlayerShortcuts({ onNext, onPrevious, onFullscreen }: Options) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        if (!onFullscreen) return;
        e.preventDefault();
        onFullscreen();
        return;
      }
      if (e.key === "ArrowRight") {
        if (!onNext) return;
        e.preventDefault();
        onNext();
        return;
      }
      if (e.key === "ArrowLeft") {
        if (!onPrevious) return;
        e.preventDefault();
        onPrevious();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrevious, onFullscreen]);
}

/** Put the player into fullscreen, or leave it. */
export function toggleStageFullscreen() {
  if (typeof document === "undefined") return;
  const stage = document.querySelector(".uf-stage-frame");
  if (!stage) return;
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
    return;
  }
  (stage as HTMLElement).requestFullscreen?.().catch(() => {});
}
