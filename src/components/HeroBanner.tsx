import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star, Calendar, Zap } from "lucide-react";
import { Movie, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

interface Props {
  movies: Movie[] | undefined;
}

export default function HeroBanner({ movies }: Props) {
  const [idx, setIdx] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const safeMovies = movies ?? [];
  const featured = safeMovies.slice(0, 8);
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

  const handleShuffle = () => {
    const randomIdx = Math.floor(Math.random() * safeMovies.length);
    setIdx(randomIdx % featured.length);
  };

  if (!current) return null;

  return (
    <div
      className="relative w-full h-[85vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden group/hero shadow-2xl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <motion.img
            initial={{ scale: 1.1, filter: "blur(10px)" }}
            animate={{ scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 10, ease: "easeOut" }}
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

      {/* Navigation Arrows (Desktop) */}
      <button
        onClick={prev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/5 hover:bg-primary text-white opacity-0 group-hover/hero:opacity-100 transition-all duration-500 hidden md:flex border border-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/5 hover:bg-primary text-white opacity-0 group-hover/hero:opacity-100 transition-all duration-500 hidden md:flex border border-white/10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 z-10">
        <motion.div
          key={current.id + "-content"}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary px-3 py-1 rounded text-[10px] font-black uppercase italic tracking-[0.2em] shadow-glow">
              Hot Now
            </div>
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

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter italic uppercase leading-[0.85]">
            {getTitle(current)}
          </h1>
          
          <p className="text-sm sm:text-lg text-white/70 max-w-xl mb-12 line-clamp-3 sm:line-clamp-4 font-medium leading-relaxed italic border-l-2 border-primary/50 pl-6">
            {current.overview}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="h-16 sm:h-14 rounded-2xl px-10 gap-3 text-lg font-black uppercase italic tracking-tighter bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25">
              <Link to={`/watch/movie/${current.id}`}>
                <Play className="w-6 h-6 fill-current" />
                Play Now
              </Link>
            </Button>
            <div className="flex gap-4">
                <Button
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none h-16 sm:h-14 rounded-2xl px-8 gap-3 text-lg font-black uppercase italic tracking-tighter bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
                onClick={() => {
                    const added = toggleWatchlist(current);
                    setInWatchlist(added);
                }}
                >
                {inWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {inWatchlist ? "Saved" : "My List"}
                </Button>
                <Button
                variant="outline"
                size="lg"
                className="h-16 sm:h-14 w-16 sm:w-14 p-0 rounded-2xl bg-white/5 border-white/10 text-white hover:text-primary transition-all group"
                onClick={handleShuffle}
                title="Surprise Me"
                >
                    <Zap className="w-6 h-6 group-hover:fill-current transition-all" />
                </Button>
            </div>
          </div>
        </motion.div>

        {/* Indicators */}
        <div className="flex gap-2 mt-12 overflow-x-auto scrollbar-hide pb-4">
          {featured.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all duration-500 shrink-0 ${
                i === idx
                  ? "w-12 bg-primary shadow-glow"
                  : "w-4 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
