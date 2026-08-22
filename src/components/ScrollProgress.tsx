import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[80] rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 shadow-glow-sm pointer-events-none"
    />
  );
}
