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
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={springSnappy}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-[#0a0c12]/80 text-white/50 shadow-cinema backdrop-blur-xl transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary md:right-8 ${
            onWatchPage ? "bottom-6 md:bottom-8" : "bottom-24 md:bottom-8"
          }`}
        >
          <ArrowUp className="h-[18px] w-[18px]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
