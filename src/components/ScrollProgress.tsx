import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.35 });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 shadow-[0_0_18px_rgba(56,189,248,0.32)]"
    />
  );
}
