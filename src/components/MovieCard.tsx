import { Link } from "react-router-dom";
import { Star, Play, Calendar } from "lucide-react";
import { Movie, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { motion } from "framer-motion";

interface Props {
  movie: Movie;
  type?: "movie" | "tv";
  rank?: number;
}

export default function MovieCard({ movie, type, rank }: Props) {
  const mediaType = type || movie.media_type || "movie";
  const to = mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 w-[130px] sm:w-[180px] group snap-start"
    >
      <Link to={to} className="block relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 active:border-primary/50 transition-colors shadow-xl">
        <img
          src={imgUrl(movie.poster_path)}
          alt={getTitle(movie)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Simplified Mobile Badge */}
        {rank !== undefined && rank <= 10 && (
          <div className="absolute top-0 left-0 bg-primary text-[8px] font-black px-2 py-1 rounded-br-xl uppercase italic tracking-tighter">
            #{rank}
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[8px] font-black border border-white/10">
          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
          {movie.vote_average.toFixed(1)}
        </div>

        {/* Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6 opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black uppercase italic tracking-tighter text-white line-clamp-1">
            {getTitle(movie)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
