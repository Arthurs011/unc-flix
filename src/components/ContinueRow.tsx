import { Link } from "react-router-dom";
import { Play, X, ChevronLeft, ChevronRight, History } from "lucide-react";
import { getContinueWatching, removeContinueWatching, ContinueItem } from "@/lib/storage";
import { imgUrl } from "@/lib/tmdb";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ContinueRow() {
  const [items, setItems] = useState<ContinueItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    setItems(getContinueWatching());
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

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
    <section className="mb-16">
      <div className="flex items-end justify-between mb-6 px-4 sm:px-0">
        <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
                Jump Back In
                <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
            </h2>
        </div>
        
        {items.length > 3 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!showLeft}
              className={cn(
                "p-2 rounded-full border border-white/10 bg-white/5 hover:bg-primary transition-all disabled:opacity-30",
                !showLeft && "cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!showRight}
              className={cn(
                "p-2 rounded-full border border-white/10 bg-white/5 hover:bg-primary transition-all disabled:opacity-30",
                !showRight && "cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="relative group/row -mx-4 sm:mx-0">
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-6 snap-x snap-mandatory"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] group relative snap-start"
            >
              <Link
                to={
                  item.type === "tv"
                    ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
                    : `/watch/movie/${item.id}`
                }
                className="block aspect-video rounded-2xl overflow-hidden bg-secondary relative shadow-xl border border-white/5 group-hover:border-primary/50 transition-all duration-500"
              >
                <img
                  src={imgUrl(item.backdrop_path || item.poster_path, "w780")}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase italic">
                        {item.type === 'tv' ? `S${item.season} E${item.episode}` : 'Movie'}
                    </span>
                    <p className="text-xs font-black uppercase italic tracking-tighter line-clamp-1">{item.title}</p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      className="h-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </div>
                </div>
              </Link>
              
              <button
                onClick={(e) => { e.preventDefault(); remove(item.id); }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/40 hover:text-white hover:bg-destructive transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-white/10"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex-shrink-0 w-4 sm:w-0" />
        </div>
      </div>
    </section>
  );
}
