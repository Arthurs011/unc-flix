import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star, Shuffle } from "lucide-react";
import { motion } from "motion/react";
import { Movie, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { useWatchlistItem } from "@/hooks/useWatchlist";
import { animate } from "animejs";
import { prefersReducedMotion, revealStagger } from "@/lib/anim";
import { PRESS_TRANSITION } from "@/lib/motion";

interface Props {
  movies: Movie[] | undefined;
}

const AUTOPLAY_MS = 8000;

export default function HeroBanner({ movies }: Props) {
  const [idx, setIdx] = useState(0);
  const safeMovies = useMemo(() => movies ?? [], [movies]);
  const featured = useMemo(() => safeMovies.slice(0, 8), [safeMovies]);
  const current = featured[idx] ?? null;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  const { saved: inWatchlist, toggle } = useWatchlistItem(current);

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

  const handleShuffle = () => {
    if (!safeMovies.length) return;
    setIdx(Math.floor(Math.random() * featured.length));
  };

  // Animate title words on slide change. The words are visible by default;
  // revealStagger owns the hide-first moment and its backstop.
  useEffect(() => {
    if (!titleRef.current) return;
    revealStagger(Array.from(titleRef.current.querySelectorAll<HTMLElement>(".hero-word")), {
      step: 70,
      y: 40,
      duration: 600,
    });
  }, [current?.id]);

  // Progress bar animation.
  useEffect(() => {
    if (!progressRef.current || prefersReducedMotion()) return;
    animate(progressRef.current, {
      scaleX: [0, 1],
      duration: AUTOPLAY_MS,
      ease: "linear",
    });
  }, [idx]);

  if (!current) return null;

  const words = getTitle(current).split(" ");

  return (
    <div className="uf-hero">
      {/* Backdrop */}
      <div className="position-absolute top-0 bottom-0 start-0 end-0">
        <img
          key={current.id}
          src={imgUrl(current.backdrop_path, "w1280", true)}
          alt={getTitle(current)}
          loading="eager"
          decoding="async"
          className="uf-hero-img"
        />
        <div className="uf-hero-scrim-bottom" />
        <div className="uf-hero-scrim-left" />
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="uf-hero-arrow position-absolute z-2 glass rounded-4 border-0 d-none d-md-flex align-items-center justify-content-center uf-hero-arrow-start"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="uf-hero-arrow position-absolute z-2 glass rounded-4 border-0 d-none d-md-flex align-items-center justify-content-center uf-hero-arrow-end"
      >
        <ChevronRight size={20} />
      </button>

      {/* Content */}
      <div className="uf-hero-content position-absolute bottom-0 start-0 end-0 z-1 page-container" style={{ maxWidth: "80rem", marginInline: "auto" }}>
        <div style={{ maxWidth: "48rem" }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="btn-gradient rounded-pill text-uppercase text-white flex-shrink-0" style={{ padding: "0.4rem 0.9rem", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", boxShadow: "0 0 10px rgba(14,165,233,0.25)" }}>
              Featured
            </span>
            <span className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>
              <Star size={14} className="fill-warning text-warning" />
              {current.vote_average.toFixed(1)}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: "9999px", background: "rgba(255,255,255,0.25)" }} />
            <span className="text-uppercase fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>
              {getYear(current)}
            </span>
          </div>

          <h1 ref={titleRef} className="fw-black text-white mb-4" style={{ fontSize: "clamp(2.75rem, 8vw, 6rem)", letterSpacing: "-0.05em", lineHeight: 0.9, textShadow: "0 12px 48px rgba(0,0,0,0.5)" }}>
            {words.map((word, i) => (
              <span key={`${current.id}-${i}`} className="hero-word">
                {word}
              </span>
            ))}
          </h1>

          <p className="mb-4 line-clamp-3" style={{ maxWidth: "36rem", fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>
            {current.overview}
          </p>

          <div className="d-flex flex-wrap align-items-center gap-3">
            <Link to={`/watch/movie/${current.id}`} className="uf-btn uf-btn-lg btn-gradient text-decoration-none">
              <Play size={20} className="fill-current" />
              Play Now
            </Link>

            <motion.button
              onClick={toggle}
              className="uf-btn uf-btn-lg uf-btn-glass"
              whileTap={{ scale: 0.97 }}
              transition={PRESS_TRANSITION}
            >
              {inWatchlist ? <Check size={20} style={{ color: "#34d399" }} /> : <Plus size={20} />}
              {inWatchlist ? "Saved" : "My List"}
            </motion.button>

            <motion.button
              onClick={handleShuffle}
              aria-label="Surprise me"
              title="Surprise me"
              className="uf-btn uf-btn-lg uf-btn-glass"
              style={{ width: "3.5rem", padding: 0 }}
              whileTap={{ scale: 0.94 }}
              transition={PRESS_TRANSITION}
            >
              <Shuffle size={20} />
            </motion.button>
          </div>

          {/* Progress indicators */}
          <div className="d-flex gap-2 mt-4 pt-3 pb-2">
            {featured.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`uf-hero-dot border-0 p-0 ${i === idx ? "uf-hero-dot-active" : ""}`}
              >
                {i === idx && (
                  <span
                    ref={progressRef}
                    className="uf-hero-dot-fill position-absolute top-0 bottom-0 start-0 end-0 rounded-pill"
                    style={{ transform: "scaleX(0)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
