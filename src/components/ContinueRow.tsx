import { Link } from "react-router-dom";
import { Play, X, ChevronLeft, ChevronRight, History } from "lucide-react";
import { removeContinueWatching } from "@/lib/storage";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { imgUrl } from "@/lib/tmdb";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { revealOnView } from "@/lib/anim";

export default function ContinueRow() {
  const items = useContinueWatching();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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
  }, [updateArrows, items.length]);

  // Scroll-reveal the whole section once.
  useEffect(() => revealOnView(sectionRef.current, { y: 24 }), [items.length]);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: dir * clientWidth * 0.8, behavior: "smooth" });
    }
  };

  const remove = (id: number, type: "movie" | "tv") => {
    removeContinueWatching(id, type);
  };

  if (!items.length) return null;

  return (
    <section ref={sectionRef} className="mb-5 mb-md-5 pb-2" style={{ marginBottom: "3.5rem" }}>
      <div className="d-flex align-items-end justify-content-between mb-4 px-3 px-sm-0">
        <div>
          <p className="kicker d-flex align-items-center gap-2 mb-2">
            <History size={13} />
            Pick up where you left off
          </p>
          <h2 className="uf-section-title mb-0">Continue Watching</h2>
        </div>

        {items.length > 3 && (
          <div className="d-none d-sm-flex align-items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!showLeft}
              aria-label="Scroll left"
              className="uf-btn uf-btn-ghost rounded-circle border-0"
              style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!showRight}
              aria-label="Scroll right"
              className="uf-btn uf-btn-ghost rounded-circle border-0"
              style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="uf-rail-wrap">
        <div ref={scrollRef} onScroll={updateArrows} className="uf-rail">
          {items.map((item) => (
            <div key={`${item.type}:${item.id}`} className="uf-continue-card position-relative">
              <Link
                to={
                  item.type === "tv"
                    ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
                    : `/watch/movie/${item.id}`
                }
                className="uf-poster d-block position-relative rounded-4 overflow-hidden border-0 shadow-card"
                style={{ aspectRatio: "16 / 9", width: "280px" }}
              >
                <img
                  src={imgUrl(item.backdrop_path || item.poster_path, "w780", true)}
                  alt={item.title}
                  loading="eager"
                  className="uf-poster-img"
                />

                <div className="uf-poster-scrim" style={{ height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3) 55%, transparent)" }} />

                <div className="position-absolute bottom-0 start-0 end-0 p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="btn-gradient rounded-pill px-2 py-0 text-uppercase border-0" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", boxShadow: "none" }}>
                      {item.type === "tv" ? `S${item.season} · E${item.episode}` : "Movie"}
                    </span>
                    <p className="mb-0 text-truncate small fw-semibold text-white">{item.title}</p>
                  </div>

                  <div className="w-100 rounded-pill overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.15)" }}>
                    <div
                      className="uf-progress-fill rounded-pill"
                      data-progress={Math.max(item.progress, 3)}
                      style={{ width: `var(--uf-progress, ${Math.max(item.progress, 3)}%)` }}
                    />
                  </div>
                </div>

                <div className="position-absolute top-0 bottom-0 start-0 end-0 d-flex align-items-center justify-content-center uf-hover-reveal">
                  <span className="rounded-circle d-flex align-items-center justify-content-center shadow-glow-lg" style={{ width: "3.5rem", height: "3.5rem", background: "#fff", color: "#000", transition: "transform 250ms ease" }}>
                    <Play size={24} fill="currentColor" />
                  </span>
                </div>
              </Link>

              <button
                onClick={(e) => { e.preventDefault(); remove(item.id, item.type); }}
                aria-label="Remove from continue watching"
                className="uf-icon-btn position-absolute top-2 end-2 z-2 rounded-circle border-0 uf-remove-btn"
                style={{ width: "2rem", height: "2rem", background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.5)" }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        {showLeft && <div className="uf-rail-fade uf-rail-fade-start" />}
        {showRight && <div className="uf-rail-fade uf-rail-fade-end" />}
      </div>
    </section>
  );
}
