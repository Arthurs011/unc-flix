import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { motion } from "motion/react";
import { Movie, posterUrl, posterFallback, getTitle, getYear } from "@/lib/tmdb";
import { PRESS_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  movie: Movie;
  type?: "movie" | "tv";
  rank?: number;
  className?: string;
  priority?: boolean;
}

export default function MovieCard({ movie, type, rank, className, priority = false }: Props) {
  const mediaType = type || movie.media_type || "movie";
  const to = mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <div className={cn("uf-poster-card", className)}>
      <motion.div
        className="w-100"
        whileTap={{ scale: 0.985 }}
        transition={PRESS_TRANSITION}
      >
        <Link to={to} className="uf-poster w-100">
          <img
            src={posterUrl(movie, "w500")}
            alt={getTitle(movie)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = posterFallback(getTitle(movie));
            }}
            className="uf-poster-img"
          />

          <div className="uf-poster-scrim" />
          <div className="uf-poster-meta">
            <p className="mb-0 fw-bold line-clamp-2 text-white" style={{ fontSize: "0.75rem", lineHeight: 1.35 }}>
              {getTitle(movie)}
            </p>
            <div className="uf-poster-cta">
              <span className="text-uppercase fw-semibold" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>
                {getYear(movie) || mediaType}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: "9999px", background: "rgba(255,255,255,0.2)" }} />
              <span className="d-flex align-items-center gap-1 fw-bold text-primary" style={{ fontSize: "10px" }}>
                <Play size={10} className="fill-current" />
                Watch
              </span>
            </div>
          </div>

          {movie.vote_average > 0 && (
            <div className="uf-poster-badge">
              <Star size={10} className="fill-warning text-warning" />
              <span className="fw-bold text-white" style={{ fontSize: "9px" }}>
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}

          {rank !== undefined && rank <= 10 && (
            <div className="uf-poster-rank">#{rank}</div>
          )}
        </Link>
      </motion.div>
    </div>
  );
}
