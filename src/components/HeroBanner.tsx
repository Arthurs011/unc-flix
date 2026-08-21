import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star, Shuffle } from "lucide-react";
import { Movie, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { EASE, springSnappy } from "@/lib/motion";

interface Props {
  movies: Movie[] | undefined;
}

const AUTOPLAY_MS = 8000;

export default function HeroBanner({ movies }: Props) {
  const [idx, setIdx] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const safeMovies = useMemo(() => movies ?? [], [movies]);
  const featured = useMemo(() => safeMovies.slice(0, 8), [safeMovies]);
  const current = featured[idx] ?? null;
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % Math.max(featured.length, 1));
  }, [featured.length]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + featured.length) % Math.max(featured.length, 1));
  }, [featured.length]);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [next, idx, featured.length]);

  useEffect(() => {
    if (current) setInWatchlist(isInWatchlist(current.id));
  }, [current]);

  const handleShuffle = () => {
    if (!safeMovies.length) return;
    setIdx(Math.floor(Math.random() * featured.length));
  };

  if (!current) return null;

  const words = getTitle(current).split(" ");

  return (
    <div ref={heroRef} className="relative w-full h-[82vh] sm:h-[88vh] overflow-hidden">
      {/* Backdrop with parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <AnimatePresence>
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img
              initial={{ scale: 1.12 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: 9, ease: "linear" }}
              src={imgUrl(current.backdrop_path, "w1280")}
              alt={getTitle(current)}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/20 to-transparent hidden sm:block" />
      </motion.div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-6 xl:left-12 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full glass text-white/70 hover:text-white hover:bg-white/10 opacity-0 group-hover/hero:opacity-100 md:opacity-0 md:focus:opacity-100 transition-all duration-300 hidden md:block"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-6 xl:right-12 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full glass text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 hidden md:block"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 z-10 max-w-7xl mx-auto w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-glow-sm">
                Featured
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                {current.vote_average.toFixed(1)}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <span className="text-xs font-semibold tracking-wider text-white/50 uppercase">
                {getYear(current)}
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tighter leading-[0.95] drop-shadow-2xl">
              {words.map((word, i) => (
                <motion.span
                  key={`${current.id}-${i}`}
                  variants={{
                    hidden: { opacity: 0, y: 34 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                  }}
                  className="inline-block mr-[0.24em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="text-sm sm:text-base text-white/65 max-w-xl mb-8 line-clamp-3 leading-relaxed"
            >
              {current.overview}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="flex flex-wrap items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springSnappy}
                className="flex items-center gap-2.5 h-13 pl-7 pr-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow-lg hover:shadow-glow"
              >
                <Link to={`/watch/movie/${current.id}`} className="flex items-center gap-2.5">
                  <Play className="w-5 h-5 fill-current" />
                  Play Now
                </Link>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springSnappy}
                onClick={() => setInWatchlist(toggleWatchlist(current))}
                className="flex items-center gap-2.5 h-13 px-7 rounded-full glass ring-1 ring-white/15 text-white font-bold text-sm hover:bg-white/10 transition-colors"
              >
                {inWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                {inWatchlist ? "Saved" : "My List"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08, rotate: 12 }}
                whileTap={{ scale: 0.92 }}
                transition={springSnappy}
                onClick={handleShuffle}
                aria-label="Surprise me"
                title="Surprise me"
                className="w-13 h-13 rounded-full glass ring-1 ring-white/15 text-white/70 hover:text-primary flex items-center justify-center transition-colors"
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="flex gap-2 mt-10 pb-2">
          {featured.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className={`relative h-1 rounded-full overflow-hidden transition-all duration-500 ${
                i === idx ? "w-14 bg-white/20" : "w-5 bg-white/15 hover:bg-white/30"
              }`}
            >
              {i === idx && (
                <motion.span
                  key={`progress-${idx}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
