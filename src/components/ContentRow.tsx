import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  title: string;
  movies: Movie[] | undefined;
  type?: "movie" | "tv";
  showRank?: boolean;
}

export default function ContentRow({ title, movies, type, showRank }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const safeMovies = movies ?? [];

  const updateArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [safeMovies]);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: dir * clientWidth * 0.8, behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scroll(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scroll(-1);
    }
  };

  if (!safeMovies.length) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-16 last:mb-20"
    >
      <div className="flex items-end justify-between mb-6 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
          {title}
          <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
        </h2>
        {safeMovies.length > 5 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!showLeft}
              className={cn(
                "p-2 rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:border-primary transition-all disabled:opacity-30 disabled:hover:bg-white/5",
                !showLeft && "cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!showRight}
              className={cn(
                "p-2 rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:border-primary transition-all disabled:opacity-30 disabled:hover:bg-white/5",
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
          onKeyDown={handleKeyDown}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-6 snap-x snap-mandatory"
        >
          {safeMovies.map((m, i) => (
            <MovieCard key={m.id} movie={m} type={type} rank={showRank ? i + 1 : undefined} />
          ))}
          <div className="flex-shrink-0 w-4 sm:w-0" /> {/* Padding at the end */}
        </div>
      </div>
    </motion.section>
  );
}
