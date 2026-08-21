import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className }: Props) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={className}
    >
      {children}
    </motion.main>
  );
}
