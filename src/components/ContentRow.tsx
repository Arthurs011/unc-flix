import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";
import { revealOnView } from "@/lib/anim";

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
  const sectionRef = useRef<HTMLElement>(null);
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

  // Scroll reveal: the section is visible by default; when it first enters
  // the viewport anime.js plays the entrance. A missed animation can never
  // leave the row invisible.
  useEffect(() => revealOnView(sectionRef.current, { y: 24, duration: 600 }), [safeMovies]);

  // Per-card stagger as a CSS animation (also used as fallback for cards
  // below the fold before the section reveals).
  const cardDelay = (i: number) => ({ animationDelay: `${Math.min(i * 0.04, 0.4)}s` });

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: dir * clientWidth * 0.8, behavior: "smooth" });
    }
  };

  if (!safeMovies.length) return null;

  return (
    <section ref={sectionRef} className={cn("mb-5", className)} style={{ marginBottom: "3.5rem" }}>
      <div className="d-flex align-items-end justify-content-between mb-4 px-3 px-sm-0">
        <div>
          {kicker && <p className="kicker mb-2">{kicker}</p>}
          <h2 className="uf-section-title mb-0">{title}</h2>
        </div>
        <div className="d-flex align-items-center gap-3">
          {exploreTo && safeMovies.length > 5 && (
            <Link
              to={exploreTo}
              className="d-none d-md-flex align-items-center gap-2 text-uppercase text-decoration-none mb-1"
              style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}
            >
              Explore all
              <ArrowRight size={14} />
            </Link>
          )}
          {safeMovies.length > 5 && (
            <div className="d-none d-sm-flex align-items-center gap-2">
              <button
                onClick={() => scroll(-1)}
                disabled={!showLeft}
                aria-label="Scroll left"
                className="uf-btn uf-btn-ghost rounded-4 border-0"
                style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll(1)}
                disabled={!showRight}
                aria-label="Scroll right"
                className="uf-btn uf-btn-ghost rounded-4 border-0"
                style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="uf-rail-wrap">
        <div ref={scrollRef} onScroll={updateArrows} className="uf-rail" style={{ gap: "1.25rem" }}>
          {safeMovies.map((m, i) =>
            showRank ? (
              <div key={`${m.id}-${i}`} className="content-card d-flex align-items-end" style={cardDelay(i)}>
                <span aria-hidden className="rank-num flex-shrink-0" style={{ fontSize: "64px", marginRight: "-0.75rem", zIndex: 10 }}>
                  {i + 1}
                </span>
                <MovieCard movie={m} type={type} priority={i < 5} className="uf-rail-card" />
              </div>
            ) : (
              <div key={`${m.id}-${i}`} className="content-card" style={cardDelay(i)}>
                <MovieCard movie={m} type={type} priority={i < 5} className="uf-rail-card" />
              </div>
            )
          )}
        </div>
        {showLeft && <div className="uf-rail-fade uf-rail-fade-start" />}
        {showRight && <div className="uf-rail-fade uf-rail-fade-end" />}
      </div>
    </section>
  );
}
