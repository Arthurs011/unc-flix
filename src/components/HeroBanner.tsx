import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, imgUrl, getTitle } from "@/lib/tmdb";
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
    const t = setInterval(next, 7000);
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
      className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={imgUrl(current.backdrop_path, "original")}
            alt={getTitle(current)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground opacity-0 hover:opacity-100 focus-visible:opacity-100 tv-show-always transition-opacity"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground opacity-0 hover:opacity-100 focus-visible:opacity-100 tv-show-always transition-opacity"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 z-10">
        <motion.div
          key={current.id + "-content"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {idx < 10 && (
            <div className="inline-flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold rounded-lg px-3 py-1 mb-3">
              <span>TOP</span>
              <span className="text-base leading-none">{idx + 1}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3 max-w-2xl">
            {getTitle(current)}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mb-6 line-clamp-3">
            {current.overview}
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg" className="rounded-full px-8 gap-2 text-base font-semibold">
              <Link to={`/watch/movie/${current.id}`}>
                <Play className="w-5 h-5 fill-current" />
                Play
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full px-6 gap-2 text-base"
              onClick={() => {
                const added = toggleWatchlist(current);
                setInWatchlist(added);
              }}
            >
              {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {inWatchlist ? "Added" : "Watchlist"}
            </Button>
          </div>
        </motion.div>

        <div className="flex gap-2 mt-6">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === idx ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                i === idx
                  ? "w-8 bg-primary"
                  : "w-4 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
