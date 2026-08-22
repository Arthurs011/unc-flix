import { Link } from "react-router-dom";
import { Play, X, ChevronLeft, ChevronRight, History } from "lucide-react";
import { getContinueWatching, removeContinueWatching, ContinueItem } from "@/lib/storage";
import { motion } from "motion/react";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { imgUrl } from "@/lib/tmdb";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { fadeUp, viewportOnce } from "@/lib/motion";

export default function ContinueRow() {
  const [items, setItems] = useState<ContinueItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    setItems(getContinueWatching());
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: dir * clientWidth * 0.8, behavior: "smooth" });
    }
  };

  const remove = (id: number) => {
    removeContinueWatching(id);
    setItems(getContinueWatching());
  };

  if (!items.length) return null;

  return (
    <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="mb-14">
      <div className="flex items-end justify-between mb-5 px-4 sm:px-0">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1.5">
            <History className="w-3 h-3" />
            Pick up where you left off
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Continue Watching
          </h2>
        </div>

        {items.length > 3 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!showLeft}
              aria-label="Scroll left"
              className={cn(
                "p-2.5 rounded-full ring-1 ring-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-25 disabled:pointer-events-none"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!showRight}
              aria-label="Scroll right"
              className={cn(
                "p-2.5 rounded-full ring-1 ring-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-25 disabled:pointer-events-none"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-4 snap-x snap-mandatory"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-shrink-0 w-[280px] sm:w-[330px] group relative snap-start"
            >
              <Link
                to={
                  item.type === "tv"
                    ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
                    : `/watch/movie/${item.id}`
                }
                className="block aspect-video rounded-2xl overflow-hidden bg-card relative ring-1 ring-white/[0.08] shadow-card group-hover:ring-primary/40 transition-all duration-300"
              >
                <img
                  src={imgUrl(item.backdrop_path || item.poster_path, "w780")}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {item.type === "tv" ? `S${item.season} · E${item.episode}` : "Movie"}
                    </span>
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                  </div>

                  <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(item.progress, 3)}%` }}
                      viewport={viewportOnce}
                      transition={{ type: "spring", stiffness: 55, damping: 16, delay: 0.15 }}
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                    />
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-glow-lg"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </motion.div>
                </div>
              </Link>

              <button
                onClick={(e) => { e.preventDefault(); remove(item.id); }}
                aria-label="Remove from continue watching"
                className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md ring-1 ring-white/10 text-white/50 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
