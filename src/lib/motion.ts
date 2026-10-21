import type { Transition } from "motion/react";

/**
 * Motion (motion.dev) layer — additive to anime.js.
 *
 * Anime.js owns the hero timeline, parallax and scroll choreography. Motion
 * owns React-level interaction states: press feedback, shared layout moves and
 * AnimatePresence exits. Both use the same numbers as the CSS layer so a tap
 * feels identical whether CSS or Motion answers it.
 *
 * Reduced motion is handled globally by `<MotionConfig reducedMotion="user">`
 * in App.tsx — Motion then skips transform/layout animations for those users.
 */

/** Hover / focus / open-close: 180ms outExpo, exactly like the CSS tokens. */
export const STATE_TRANSITION: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};

/** Press: answer immediately. */
export const PRESS_TRANSITION: Transition = {
  duration: 0.1,
  ease: [0.22, 1, 0.36, 1],
};

/** Shared element (dock indicator) move. */
export const LAYOUT_TRANSITION: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

/** Sheet / overlay slide. */
export const SHEET_TRANSITION: Transition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
};

/** One press scale for every tappable surface. */
export const PRESS_SCALE = 0.97;
