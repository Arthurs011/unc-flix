import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { Movie, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { motion } from "motion/react";
import { springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  movie: Movie;
  type?: "movie" | "tv";
  rank?: number;
  className?: string;
}

export default function MovieCard({ movie, type, rank, className }: Props) {
  const mediaType = type || movie.media_type || "movie";
  const to = mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.97 }}
      transition={springSoft}
      className={cn("group relative w-full", className)}
    >
      <Link
        to={to}
        className="block relative aspect-[2/3] rounded-2xl overflow-hidden bg-card ring-1 ring-white/[0.08] shadow-card group-hover:ring-primary/40 transition-[box-shadow,border-color] duration-300"
      >
        <img
          src={imgUrl(movie.poster_path)}
          alt={getTitle(movie)}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Bottom gradient + info */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="text-xs font-bold text-white leading-tight line-clamp-2">
            {getTitle(movie)}
          </p>
          <div className="flex items-center gap-2 mt-1.5 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">
              {getYear(movie) || mediaType}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
              <Play className="w-2.5 h-2.5 fill-current" />
              Watch
            </span>
          </div>
        </div>

        {/* Rating chip */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-1 ring-1 ring-white/10">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[9px] font-bold text-white">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Rank badge */}
        {rank !== undefined && rank <= 10 && (
          <div className="absolute top-0 left-0 rounded-br-2xl rounded-tl-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-2.5 py-1 shadow-glow-sm">
            <span className="text-[10px] font-extrabold text-white">#{rank}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
