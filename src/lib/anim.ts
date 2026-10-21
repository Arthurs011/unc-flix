import { animate, stagger } from "animejs";

/**
 * Motion primitives for the Bootstrap rebuild.
 * All reveals are progressive: elements are visible by default and only get
 * hidden once an animation is actually about to run, so a failed or skipped
 * animation can never leave content stuck at opacity 0.
 */

export const EASE = "outExpo";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Animations only matter when someone is looking. A page in a hidden tab
 * never ticks requestAnimationFrame, so an entrance started there would
 * sit at opacity 0 until the tab is shown again — pointless motion that can
 * go wrong for no visible benefit. Skip it and let the content simply be.
 */
function canAnimate(): boolean {
  return (
    typeof document === "undefined" ||
    document.visibilityState !== "hidden"
  );
}

/**
 * Force an element back to its resting visible state, and cancel the
 * backstop that was waiting to do it. Every entrance that writes an inline
 * opacity: 0 reaches this one way or another.
 */
function makeBackstop(target: Element, settle: () => void) {
  const clear = () => clearTimeout(timer);
  // Wall clock, not rAF: if the tab is frozen mid-animation the timer is
  // overdue and fires the moment the page is able to run anything again.
  const timer = window.setTimeout(() => {
    clear();
    settle();
  }, 4000);
  return clear;
}

/** Fade + rise an element once on mount. No-op under reduced motion. */
export function revealNow(
  target: Element | null,
  options: { delay?: number; y?: number; duration?: number } = {}
): void {
  if (!target || prefersReducedMotion() || !canAnimate()) return;

  const settle = () => {
    (target as HTMLElement).style.opacity = "1";
    (target as HTMLElement).style.transform = "";
  };
  const clearBackstop = makeBackstop(target, settle);

  animate(target, {
    opacity: [0, 1],
    translateY: [options.y ?? 18, 0],
    duration: options.duration ?? 500,
    delay: options.delay ?? 0,
    ease: EASE,
    // Never let the animation strand the element invisible.
    onComplete: () => {
      clearBackstop();
      settle();
    },
  });
}

/**
 * Reveal an element the first time it scrolls into view.
 * The element is fully visible by default and only dips to 0 at the moment
 * the observer fires, so if IntersectionObserver is unavailable or never
 * fires, the content simply stays visible. No timers, no stuck-at-zero state.
 */
export function revealOnView(
  el: HTMLElement | null,
  options: { y?: number; duration?: number; delay?: number } = {}
): (() => void) | undefined {
  if (!el || prefersReducedMotion()) return undefined;
  if (typeof IntersectionObserver === "undefined") return undefined;

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        revealNow(el, options);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  io.observe(el);

  return () => io.disconnect();
}

/** Stagger-fade a list of elements (mount-time, not scroll-triggered). */
export function revealStagger(
  targets: Element[],
  options: { step?: number; y?: number; duration?: number } = {}
): void {
  if (!targets.length || prefersReducedMotion() || !canAnimate()) return;

  const settle = () => {
    targets.forEach((t) => {
      (t as HTMLElement).style.opacity = "1";
      (t as HTMLElement).style.transform = "";
    });
  };
  const clearBackstop = makeBackstop(targets[0], settle);

  animate(targets, {
    opacity: [0, 1],
    translateY: [options.y ?? 16, 0],
    delay: stagger(options.step ?? 40),
    duration: options.duration ?? 450,
    ease: EASE,
    onComplete: () => {
      clearBackstop();
      settle();
    },
  });
}
