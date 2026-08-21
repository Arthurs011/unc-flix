import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { springSnappy } from "@/lib/motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const onWatchPage = pathname.startsWith("/watch");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          transition={springSnappy}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className={`fixed right-4 md:right-8 z-40 w-11 h-11 rounded-full glass-strong ring-1 ring-white/10 shadow-card-lg text-white/70 hover:text-primary hover:ring-primary/40 flex items-center justify-center transition-colors ${onWatchPage ? "bottom-6 md:bottom-8" : "bottom-24 md:bottom-8"}`}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
