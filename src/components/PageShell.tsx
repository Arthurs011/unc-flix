import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className }: Props) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: EASE }}
      className={className}
    >
      {children}
    </motion.main>
  );
}
