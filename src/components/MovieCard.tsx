import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Movie, imgUrl, getTitle } from "@/lib/tmdb";
import { motion } from "framer-motion";

interface Props {
  movie: Movie;
  type?: "movie" | "tv";
}

export default function MovieCard({ movie, type }: Props) {
  const mediaType = type || movie.media_type || "movie";
  const to = mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex-shrink-0 w-[160px] sm:w-[180px] group"
    >
      <Link to={to} className="block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
          <img
            src={imgUrl(movie.poster_path)}
            alt={getTitle(movie)}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs font-semibold">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {getTitle(movie)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
