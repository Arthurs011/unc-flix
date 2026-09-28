import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Play, Star } from "lucide-react";
import { getTitle, getYear, imgUrl, posterFallback, type Movie } from "@/lib/tmdb";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  movie: Movie;
  type?: "movie" | "tv";
  rank?: number;
  className?: string;
}

export default function MovieCard({ movie, type, rank, className }: Props) {
  const reduceMotion = useReducedMotion();
  const isTv = type === "tv" || movie.media_type === "tv";
  const title = getTitle(movie);
  const year = getYear(movie);
  const image = movie.poster_path ?? movie.backdrop_path;
  const href = isTv ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn("group/card relative min-w-0 select-none", className)}
    >
      <Link
        to={href}
        aria-label={`${title}${year ? `, ${year}` : ""}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070a] rounded-xl"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0d14] shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out group-hover/card:scale-[1.03] group-hover/card:-translate-y-1 group-hover/card:border-white/[0.16] group-hover/card:shadow-[0_16px_36px_rgba(0,0,0,0.8)]">
          {image ? (
            <img
              src={imgUrl(image, "w342")}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:brightness-[1.04]"
              onError={(event) => {
                event.currentTarget.src = posterFallback(title);
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#0d0f17] text-[10px] font-bold tracking-[0.2em] text-white/20">
              UNCFLIX
            </div>
          )}

          {rank !== undefined && (
            <span className="absolute left-2.5 top-2.5 flex h-6 min-w-6 items-center justify-center rounded-md border border-white/10 bg-black/60 px-1.5 font-mono text-[10px] font-bold text-white/90 backdrop-blur-md">
              {String(rank + 1).padStart(2, "0")}
            </span>
          )}

          {/* Restrained hover overlay: Bottom gradient with quick info */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
            <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
              <span className="flex items-center gap-1">
                {movie.vote_average > 0 && (
                  <>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </>
                )}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-2 min-w-0 px-0.5">
        <Link
          to={href}
          className="block truncate text-[13px] font-medium text-white/88 transition-colors hover:text-white"
        >
          {title}
        </Link>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
          <span>{isTv ? "Series" : "Film"}</span>
          {year && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
              <span>{year}</span>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
