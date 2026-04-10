import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check } from "lucide-react";
import { Movie, imgUrl, getTitle } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  movies: Movie[];
}

export default function HeroBanner({ movies }: Props) {
  const [idx, setIdx] = useState(0);
  const featured = movies.slice(0, 5);
  const current = featured[idx];

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  if (!current) return null;

  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    setInWatchlist(isInWatchlist(current.id));
  }, [current.id]);

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
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
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 z-10">
        <motion.div
          key={current.id + "-content"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
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

        {/* Indicators */}
        <div className="flex gap-2 mt-6">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
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
