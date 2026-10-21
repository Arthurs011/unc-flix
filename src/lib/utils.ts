import { clsx, type ClassValue } from "clsx";

/** Join class names. (Tailwind is gone; plain clsx, no conflict-merging.) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Scroll the window to a position, but only when there is anything to scroll.
 *
 * A page shorter than the viewport cannot scroll, and calling scrollTo on one
 * is a no-op in the browser and an error in jsdom.
 */
export function scrollTo(top: number, smooth = false) {
  if (typeof document === "undefined") return;
  if (document.documentElement.scrollHeight <= window.innerHeight + 1) return;
  window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
}
