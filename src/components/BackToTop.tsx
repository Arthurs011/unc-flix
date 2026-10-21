import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { revealNow } from "@/lib/anim";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const onWatchPage = pathname.startsWith("/watch");
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (visible) revealNow(ref.current, { y: 12, duration: 300 });
  }, [visible]);

  if (!visible) return null;

  return (
    <button
      ref={ref}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`uf-icon-btn uf-backtotop position-fixed z-40 rounded-4 glass-strong shadow-card-lg border-0 ${
        onWatchPage ? "uf-backtotop-watch" : ""
      }`}
      style={{ color: "rgba(255,255,255,0.7)" }}
    >
      <ArrowUp size={20} />
    </button>
  );
}
