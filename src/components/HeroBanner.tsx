import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { Movie, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  movies: Movie[] | undefined;
}

export default function HeroBanner({ movies }: Props) {
  const [idx, setIdx] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const safeMovies = movies ?? [];
  const featured = safeMovies.slice(0, 5);
  const current = featured[idx] ?? null;

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % Math.max(featured.length, 1));
  }, [featured.length]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + featured.length) % Math.max(featured.length, 1));
  }, [featured.length]);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [next, featured.length]);

  useEffect(() => {
    if (current) setInWatchlist(isInWatchlist(current.id));
  }, [current?.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  if (!current) return null;

  return (
    <div
      className="relative w-full h-[85vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden group/hero shadow-2xl"
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            src={imgUrl(current.backdrop_path, "original")}
            alt={getTitle(current)}
            className="w-full h-full object-cover"
          />
          {/* Mobile-first deeper gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent sm:via-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent hidden sm:block" />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 z-10">
        <motion.div
          key={current.id + "-content"}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-[10px] sm:text-sm font-black text-white/90 uppercase tracking-widest italic">
              <span className="flex items-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-current" />
                {current.vote_average.toFixed(1)}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1 opacity-60">
                <Calendar className="w-4 h-4" />
                {getYear(current)}
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter italic uppercase leading-[0.9]">
            {getTitle(current)}
          </h1>
          
          <p className="text-sm sm:text-lg text-white/70 max-w-xl mb-10 line-clamp-3 sm:line-clamp-4 font-medium leading-relaxed italic">
            {current.overview}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="h-16 sm:h-14 rounded-2xl px-10 gap-3 text-lg font-black uppercase italic tracking-tighter bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25">
              <Link to={`/watch/movie/${current.id}`}>
                <Play className="w-6 h-6 fill-current" />
                Play Now
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 sm:h-14 rounded-2xl px-8 gap-3 text-lg font-black uppercase italic tracking-tighter bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
              onClick={() => {
                const added = toggleWatchlist(current);
                setInWatchlist(added);
              }}
            >
              {inWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              {inWatchlist ? "Saved" : "Watchlist"}
            </Button>
          </div>
        </motion.div>
...
        {/* Indicators */}
        <div className="flex gap-2.5 mt-10">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === idx
                  ? "w-10 bg-primary shadow-glow"
                  : "w-5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
