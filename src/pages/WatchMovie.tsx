import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, Movie, MovieDetails, formatCount, getYear } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import { EASE, springSnappy } from "@/lib/motion";

export default function WatchMovie() {
  const { id } = useParams();
  useFullscreenOrientation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    if (!id) return;

    tmdb.movieDetails(Number(id)).then((m) => {
      setMovie(m);
      document.title = `Watch ${getTitle(m)} · UNCFLIX`;
      updateContinueWatching({
        id: m.id,
        type: "movie",
        title: getTitle(m),
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        progress: 0,
        timestamp: Date.now(),
      });
    }).catch(() => {});

    tmdb.movieRecommendations(Number(id)).then((res) => {
      setRecommendations((res.results ?? []).slice(0, 8));
    }).catch(() => setRecommendations([]));

    return () => { document.title = "UNCFLIX"; };
  }, [id]);

  const embedSrc = SOURCES[0].build("movie", id || "");

  return (
    <PageShell className="min-h-screen text-white pb-32 overflow-x-hidden">
      {/* Ambient backdrop */}
      <div className="fixed inset-0 -z-10">
        {movie?.backdrop_path && (
          <img
            src={imgUrl(movie.backdrop_path, "original")}
            alt=""
            className="w-full h-full object-cover opacity-20 scale-110 blur-2xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
      </div>

      {/* Top bar */}
      <header className="h-16 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-50 glass-strong ring-1 ring-white/[0.06]">
        <Link
          to={`/movie/${id}`}
          aria-label="Back to details"
          className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary leading-none mb-1">Feature Film</p>
          <h1 className="text-sm font-semibold truncate tracking-tight text-white/90 leading-none">
            {movie ? getTitle(movie) : "Loading..."}
          </h1>
        </div>
      </header>

      {/* Cinema stage */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="w-full max-w-[1500px] mx-auto mt-5 sm:mt-7 px-0 sm:px-6"
      >
        <div className="relative group/stage">
          <div className="absolute -inset-1 rounded-none sm:rounded-[2rem] bg-gradient-to-r from-sky-500/25 via-indigo-500/15 to-transparent blur-xl opacity-60" />
          <div className="relative p-px rounded-none sm:rounded-[1.75rem] bg-gradient-to-b from-white/20 via-white/[0.07] to-transparent shadow-card-lg">
            <div className="aspect-video w-full overflow-hidden rounded-none sm:rounded-[1.7rem] bg-black relative">
              <iframe
                key={embedSrc}
                src={embedSrc}
                className="absolute inset-0 w-full h-full border-0 z-10"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer-when-downgrade"
                title={movie ? `${getTitle(movie)} player` : "Streaming player"}
                loading="eager"
              />
            </div>
          </div>

          {/* Action dock */}
          <div className="hidden sm:flex absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 items-center gap-1 glass-strong ring-1 ring-white/10 rounded-full px-2 py-1.5 shadow-card-lg">
            <button
              onClick={() => { setLiked(!liked); setDisliked(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${liked ? "bg-primary text-white shadow-glow-sm" : "text-white/60 hover:text-white hover:bg-white/[0.08]"}`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {formatCount(likes(movie, liked))}
            </button>
            <span className="w-px h-5 bg-white/10" />
            <button
              onClick={() => { setDisliked(!disliked); setLiked(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${disliked ? "bg-red-500 text-white" : "text-white/60 hover:text-white hover:bg-white/[0.08]"}`}
            >
              <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
              {formatCount(dislikes(movie, disliked))}
            </button>
            <span className="w-px h-5 bg-white/10" />
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              aria-label="Share"
              className="flex items-center px-4 py-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="sm:hidden flex justify-center -mt-4 relative z-20">
          <div className="flex items-center gap-1 glass-strong ring-1 ring-white/10 rounded-full px-2 py-1.5 shadow-card-lg">
            <button onClick={() => { setLiked(!liked); setDisliked(false); }} aria-label="Like" className={`flex items-center px-4 py-2.5 rounded-full transition-all ${liked ? "bg-primary text-white" : "text-white/60"}`}>
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => { setDisliked(!disliked); setLiked(false); }} aria-label="Dislike" className={`flex items-center px-4 py-2.5 rounded-full transition-all ${disliked ? "bg-red-500 text-white" : "text-white/60"}`}>
              <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => navigator.clipboard?.writeText(window.location.href)} aria-label="Share" className="flex items-center px-4 py-2.5 rounded-full text-white/60">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Info */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-14 sm:mt-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="flex-1 min-w-0"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
              <span className="rounded-full bg-white/[0.07] ring-1 ring-white/10 px-3 py-1 text-[10px] text-white/75">HD</span>
              {movie?.vote_average ? (
                <span className="flex items-center gap-1.5 text-yellow-400 normal-case font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                  <span className="text-white/30 font-semibold">/ 10</span>
                </span>
              ) : null}
              {movie && getYear(movie) && <span>{getYear(movie)}</span>}
              {movie?.runtime ? (
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              ) : null}
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[0.95] mb-6">
              {movie ? getTitle(movie) : "Loading..."}
            </h2>

            <p className="text-base sm:text-lg text-white/55 leading-relaxed max-w-2xl">
              {movie?.overview || "No description available."}
            </p>

            {movie?.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    to={`/movies?genre=${g.id}`}
                    className="rounded-full bg-white/[0.05] ring-1 ring-white/[0.09] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/55 hover:text-white hover:bg-white/[0.09] hover:ring-white/20 transition-all"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* More like this */}
          {recommendations.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
              className="w-full lg:w-80 shrink-0"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-5">More Like This</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {recommendations.slice(0, 6).map((rec) => (
                  <motion.button
                    key={rec.id}
                    whileHover={{ x: 4 }}
                    transition={springSnappy}
                    className="flex gap-3.5 p-2.5 rounded-2xl bg-white/[0.03] ring-1 ring-transparent hover:ring-white/[0.12] hover:bg-white/[0.06] transition-colors text-left w-full"
                  >
                    <div className="w-14 h-[84px] rounded-xl overflow-hidden shrink-0 ring-1 ring-white/[0.08] bg-card">
                      <img src={imgUrl(rec.poster_path, "w200")} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-1">
                      <p className="text-xs font-bold line-clamp-2 leading-snug">{getTitle(rec)}</p>
                      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mt-1.5">
                        {getYear(rec)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function likes(movie: MovieDetails | null, boost: boolean): number {
  if (!movie) return 0;
  const base = Math.round(movie.vote_count * (movie.vote_average / 10));
  return base + (boost ? 1 : 0);
}

function dislikes(movie: MovieDetails | null, boost: boolean): number {
  if (!movie) return 0;
  const base = Math.round(movie.vote_count * (1 - movie.vote_average / 10));
  return base + (boost ? 1 : 0);
}
