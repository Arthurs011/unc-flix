import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Film, Play, Tv, X } from "lucide-react";
import { Movie, getTitle, posterFallback, posterUrl } from "@/lib/tmdb";

interface Props {
  movie: Movie;
  type: "movie" | "tv";
  /** Position in the grid, used to stagger the entrance by index. */
  index: number;
  onRemove: (movie: Movie) => void;
}

/**
 * One saved title.
 *
 * The entrance runs from an inline, index-based animation delay — a CSS
 * animation always completes on its own, so the card can never be stranded at
 * opacity 0 the way an unresolved motion variant label used to strand the
 * whole library.
 *
 * Forwards its ref so the grid can measure cards when animating them out.
 */
const WatchlistCard = forwardRef<HTMLDivElement, Props>(function WatchlistCard(
  { movie, type, index, onRemove },
  ref,
) {
  const to = type === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const title = getTitle(movie);

  return (
    <div
      ref={ref}
      className="uf-poster-card position-relative"
      style={{
        animation: "route-fade-in 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
      }}
    >
      <Link to={to} className="uf-poster d-block border-0">
        <img
          src={posterUrl(movie, "w500")}
          alt={title}
          loading="lazy"
          // posterUrl already substitutes an inline poster when the title has no
          // artwork. This only covers a real network failure.
          onError={(e) => {
            e.currentTarget.src = posterFallback(title);
          }}
          className="uf-poster-img"
        />

        <div className="uf-poster-overlay d-flex flex-column align-items-center justify-content-end text-center p-3 pb-4">
          <span className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-glow-lg" style={{ width: "3rem", height: "3rem", background: "#fff", color: "#000" }}>
            <Play size={20} fill="currentColor" />
          </span>
          <p className="mb-0 fw-bold line-clamp-2" style={{ fontSize: "0.75rem" }}>{title}</p>
        </div>

        <span className="position-absolute top-2 start-2 rounded-3 d-flex align-items-center justify-content-center" style={{ padding: "0.375rem", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
          {type === "movie" ? <Film size={13} /> : <Tv size={13} />}
        </span>
      </Link>

      <button
        onClick={(e) => {
          // The button sits inside the card but not inside the Link, so the
          // click has to be kept from navigating.
          e.preventDefault();
          e.stopPropagation();
          onRemove(movie);
        }}
        aria-label={`Remove ${title} from watchlist`}
        className="uf-remove-btn position-absolute z-2 rounded-circle border-0"
      >
        <X size={16} />
      </button>
    </div>
  );
});

export default WatchlistCard;
