import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Film, Play, Tv, X } from "lucide-react";
import { motion } from "motion/react";
import { Movie, getTitle, posterFallback, posterUrl } from "@/lib/tmdb";
import { springSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
 * Animates on explicit values, never on a variant label. A label-based
 * `animate` depends on a parent resolving the matching variant, and that
 * dependency failed to hold when the grid mounted mid-session, which left the
 * whole library at opacity 0 under a correct item count.
 *
 * Forwards its ref because the grid renders these inside AnimatePresence with
 * mode="popLayout", which measures each child to take it out of flow while it
 * animates out. Without the ref, popLayout could not measure the card and
 * React warned about the ref on every mount.
 */
const WatchlistCard = forwardRef<HTMLDivElement, Props>(function WatchlistCard(
  { movie, type, index, onRemove },
  ref,
) {
  const to = type === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const title = getTitle(movie);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      // Index-based stagger. The grid used to pass staggerChildren, which only
      // reaches children that declare variants, so it silently did nothing.
      transition={{ ...springSnappy, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative"
    >
      <Link
        to={to}
        className={cn(
          "block aspect-[2/3] rounded-2xl overflow-hidden bg-card relative",
          "ring-1 ring-white/[0.08] group-hover:ring-primary/40 shadow-card",
          "transition-all duration-300",
        )}
      >
        <img
          src={posterUrl(movie, "w500")}
          alt={title}
          loading="lazy"
          // posterUrl already substitutes an inline poster when the title has no
          // artwork. This only covers a real network failure.
          onError={(e) => {
            e.currentTarget.src = posterFallback(title);
          }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-end p-4 pb-5 text-center",
            "bg-gradient-to-t from-black/95 via-black/20 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          )}
        >
          <span className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-3 shadow-glow-lg">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </span>
          <p className="text-xs font-bold leading-tight line-clamp-2">{title}</p>
        </div>

        <span className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md ring-1 ring-white/10 text-white/70">
          {type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
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
        className={cn(
          "absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-red-500 text-white",
          "flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100",
          "hover:bg-red-600 active:scale-90 transition-all",
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
});

export default WatchlistCard;