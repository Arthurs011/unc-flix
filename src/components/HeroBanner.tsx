import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Info, Pause, Play, Plus, Shuffle, Star } from "lucide-react";
import { getTitle, getYear, imgUrl, type Movie } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";
import { EASE } from "@/lib/motion";

interface Props {
  movies: Movie[] | undefined;
}

const AUTOPLAY_MS = 8000;

export default function HeroBanner({ movies }: Props) {
  const [idx, setIdx] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [paused, setPaused] = useState(false);
  const safeMovies = useMemo(() => movies ?? [], [movies]);
  const featured = useMemo(() => safeMovies.slice(0, 8), [safeMovies]);
  const current = featured[idx] ?? null;
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const progressSpring = useSpring(1, { stiffness: 100, damping: 24, mass: 0.5 });

  const next = useCallback(() => {
    setIdx((index) => (index + 1) % Math.max(featured.length, 1));
  }, [featured.length]);

  const previous = useCallback(() => {
    setIdx((index) => (index - 1 + featured.length) % Math.max(featured.length, 1));
  }, [featured.length]);

  useEffect(() => {
    if (idx >= featured.length) setIdx(0);
  }, [featured.length, idx]);

  useEffect(() => {
    if (!featured.length || paused) return;
    const timer = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [featured.length, next, paused, idx]);

  useEffect(() => {
    if (current) setInWatchlist(isInWatchlist(current.id, getItemType(current)));
  }, [current]);

  if (!current) return null;

  const title = getTitle(current);
  const year = getYear(current);
  const overview = current.overview || "A new story awaits in the UNCFLIX archive.";
  const type = getItemType(current);
  const watchHref = type === "tv" ? `/watch/tv/${current.id}?season=1&episode=1` : `/watch/movie/${current.id}`;
  const detailsHref = type === "tv" ? `/tv/${current.id}` : `/movie/${current.id}`;

  return (
    <section
      ref={heroRef}
      aria-roledescription="carousel"
      aria-label="Featured titles"
      className="group/hero relative h-[72svh] min-h-[34rem] sm:h-[82svh] sm:min-h-[40rem] max-h-[56rem] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={`${type}:${current.id}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="absolute inset-0"
          >
            <img
              src={imgUrl(current.backdrop_path, "w1280")}
              alt=""
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-[center_20%]"
            />
          </motion.div>
        </AnimatePresence>
        {/* Multi-layered intentional gradients */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#06070a]/80 via-[#06070a]/30 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-full max-w-3xl bg-gradient-to-r from-[#06070a] via-[#06070a]/75 to-transparent pointer-events-none" />
        <div className="cinema-vignette absolute inset-0 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06070a] via-[#06070a]/70 to-transparent pointer-events-none" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="section-shell flex h-full items-end pb-12 sm:pb-16 lg:pb-20">
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="pointer-events-auto w-full"
            aria-live={paused ? "polite" : "off"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${type}:${current.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="max-w-2xl"
              >
                <div className="mb-3.5 flex flex-wrap items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  <span className="text-primary font-bold">Featured</span>
                  <span className="h-1 w-1 rounded-full bg-white/25" />
                  <span>{year}</span>
                  {current.vote_average > 0 && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-white/25" />
                      <span className="inline-flex items-center gap-1 text-white/80 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {current.vote_average.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="max-w-[15ch] text-balance text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] text-white drop-shadow-md sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                <p className="mt-3.5 max-w-lg text-pretty text-xs leading-relaxed text-white/60 sm:text-sm sm:leading-6 line-clamp-3 sm:line-clamp-4">
                  {overview}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={watchHref}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#06070a] shadow-md transition-all hover:bg-white/90 active:scale-[0.98]"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Watch Now
                  </Link>

                  <button
                    type="button"
                    onClick={() => setInWatchlist(toggleWatchlist({ ...current, media_type: type }))}
                    aria-label={inWatchlist ? `Remove ${title} from my list` : `Add ${title} to my list`}
                    aria-pressed={inWatchlist}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/[0.14] active:scale-[0.98]"
                  >
                    {inWatchlist ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                    <span>{inWatchlist ? "In List" : "Add to List"}</span>
                  </button>

                  <Link
                    to={detailsHref}
                    aria-label={`View details for ${title}`}
                    className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <Info className="h-4 w-4" />
                    <span className="hidden sm:inline">Details</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIdx(Math.floor(Math.random() * featured.length))}
                    aria-label="Show a random featured title"
                    className="hidden h-11 w-11 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white sm:inline-flex"
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-3 sm:mt-10">
              <div className="flex items-center gap-1.5" aria-label="Choose featured title">
                {featured.map((movie, index) => (
                  <button
                    key={`${getItemType(movie)}:${movie.id}:${index}`}
                    type="button"
                    onClick={() => setIdx(index)}
                    aria-label={`Show ${getTitle(movie)}`}
                    aria-current={index === idx}
                    className={`relative h-1 overflow-hidden rounded-full transition-all duration-300 ${
                      index === idx ? "w-8 bg-white/30" : "w-3 bg-white/20 hover:bg-white/40"
                    }`}
                  >
                    {index === idx && (
                      <motion.span
                        key={`${type}:${current.id}-progress`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: paused ? 0.45 : 1 }}
                        transition={{ duration: paused ? 0.25 : AUTOPLAY_MS / 1000, ease: "linear" }}
                        className="absolute inset-0 origin-left rounded-full bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white/80"
                aria-label={paused ? "Resume featured slideshow" : "Pause featured slideshow"}
              >
                {paused ? <Play className="h-2.5 w-2.5 fill-current" /> : <Pause className="h-2.5 w-2.5" />}
                <span>{paused ? "Play" : "Pause"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center md:flex">
        <div className="section-shell flex w-full justify-between">
          <button
            type="button"
            onClick={previous}
            aria-label="Previous featured title"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-black/30 text-white/60 opacity-0 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white focus:opacity-100 group-hover/hero:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next featured title"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-black/30 text-white/60 opacity-0 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white focus:opacity-100 group-hover/hero:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function getItemType(item: Movie): "movie" | "tv" {
  return item.media_type === "tv" || (!item.title && item.name) ? "tv" : "movie";
}
