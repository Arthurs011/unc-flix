import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { fadeUp, viewportOnce } from "@/lib/motion";

interface Props {
  title: string;
  kicker?: string;
  movies: Movie[] | undefined;
  type?: "movie" | "tv";
  showRank?: boolean;
  exploreTo?: string;
  className?: string;
}

export default function ContentRow({ title, kicker, movies, type, showRank, exploreTo, className }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const safeMovies = useMemo(() => movies ?? [], [movies]);

  const updateArrows = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [safeMovies, updateArrows]);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: dir * clientWidth * 0.8, behavior: "smooth" });
    }
  };

  if (!safeMovies.length) return null;

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn("mb-14 last:mb-8", className)}
    >
      <div className="flex items-end justify-between mb-5 px-4 sm:px-0">
        <div>
          {kicker && (
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1.5">
              {kicker}
            </p>
          )}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {exploreTo && safeMovies.length > 5 && (
            <Link
              to={exploreTo}
              className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/35 hover:text-primary transition-colors mb-0.5"
            >
              Explore all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {safeMovies.length > 5 && (
            <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!showLeft}
              aria-label="Scroll left"
              className={cn(
                "p-2.5 rounded-full ring-1 ring-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white hover:ring-white/20 transition-all disabled:opacity-25 disabled:pointer-events-none"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!showRight}
              aria-label="Scroll right"
              className={cn(
                "p-2.5 rounded-full ring-1 ring-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white hover:ring-white/20 transition-all disabled:opacity-25 disabled:pointer-events-none"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-4 snap-x snap-mandatory"
        >
          {safeMovies.map((m, i) =>
            showRank ? (
              <div key={`${m.id}-${i}`} className="flex items-end flex-shrink-0 snap-start">
                <span
                  aria-hidden
                  className="select-none leading-none font-black text-[64px] sm:text-[84px] tracking-tighter -mr-3 sm:-mr-4 relative z-10 text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.28)]"
                >
                  {i + 1}
                </span>
                <MovieCard movie={m} type={type} className="w-[136px] sm:w-[160px]" />
              </div>
            ) : (
              <MovieCard
                key={`${m.id}-${i}`}
                movie={m}
                type={type}
                className="flex-shrink-0 w-[136px] sm:w-[172px] snap-start"
              />
            )
          )}
        </div>
        {/* Edge fades */}
        <div className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
          showLeft ? "opacity-100" : "opacity-0 sm:hidden"
        )} />
        <div className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
          showRight ? "opacity-100" : "opacity-0"
        )} />
      </div>
    </motion.section>
  );
}
