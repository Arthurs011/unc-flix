import type { Variants, Transition } from "motion/react";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 26 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 30 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;
