import { useParams, Link } from "react-router-dom";
import { Star, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, Movie, MovieDetails, formatCount, getYear } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import WatchHeader from "@/components/WatchHeader";
import { EASE, springSnappy } from "@/lib/motion";

const CINESRC_ORIGIN = SOURCES[0].baseUrl;

export default function WatchMovie() {
  const { id } = useParams();
  useFullscreenOrientation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const lastSaveRef = useRef(0);

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0 });

    tmdb.movieDetails(Number(id)).then((m) => {
      setMovie(m);
      document.title = `Watch ${getTitle(m)} · UNCFLIX`;
    }).catch(() => {});

    tmdb.movieRecommendations(Number(id)).then((res) => {
      setRecommendations((res.results ?? []).slice(0, 10));
    }).catch(() => setRecommendations([]));

    return () => { document.title = "UNCFLIX"; };
  }, [id]);

  // CineSrc progress sync
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CINESRC_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "cinesrc:timeupdate" && typeof data.currentTime === "number" && typeof data.duration === "number" && data.duration > 0 && id) {
        const now = Date.now();
        if (now - lastSaveRef.current < 15000 || !movie) return;
        lastSaveRef.current = now;
        updateContinueWatching({
          id: Number(id),
          type: "movie",
          title: getTitle(movie),
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          progress: Math.min(100, Math.round((data.currentTime / data.duration) * 100)),
          timestamp: now,
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id, movie]);

  const embedSrc = SOURCES[0].build("movie", id || "");

  return (
    <PageShell className="min-h-screen text-white pb-32 overflow-x-hidden">
      {/* Ambient backdrop */}
      <div className="fixed inset-0 -z-10">
        {movie?.backdrop_path && (
          <img
            src={imgUrl(movie.backdrop_path, "w1280")}
            alt=""
            className="w-full h-full object-cover opacity-20 scale-110 blur-2xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
      </div>

      {/* Floating pill header */}
      <WatchHeader
        to={`/movie/${id}`}
        label="Feature Film"
        title={movie ? getTitle(movie) : "Loading..."}
      />

      {/* Two-column cinema layout */}
      <div className="w-full max-w-[1600px] mx-auto mt-5 sm:mt-7 px-0 sm:px-6 pt-16 md:pt-24">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,1fr)_410px] gap-6 xl:gap-8">

          {/* ===== Left: stage + info ===== */}
          <div className="min-w-0">
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="relative group/stage sm:px-6 lg:px-0">
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
              <div className="sm:hidden flex justify-center mt-3 relative z-20 px-4">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              className="px-4 sm:px-6 lg:px-0 mt-12 sm:mt-14"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <Link to={`/movie/${id}`} className="rounded-full bg-white/[0.07] ring-1 ring-white/10 px-3 py-1 text-[10px] normal-case text-white/75 hover:ring-primary/40 transition-all">HD</Link>
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

              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-[0.95] mb-5">
                {movie ? getTitle(movie) : "Loading..."}
              </h2>

              <p className="text-base text-white/55 leading-relaxed max-w-2xl">
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
          </div>

          {/* ===== Right: recommendations sidebar ===== */}
          {recommendations.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="w-full min-w-0 px-4 sm:px-6 lg:px-0 lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">More Like This</p>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
                {recommendations.map((rec) => (
                  <motion.button
                    key={rec.id}
                    whileHover={{ x: 4 }}
                    transition={springSnappy}
                    className="flex gap-3.5 p-2 rounded-xl bg-white/[0.03] ring-1 ring-transparent hover:ring-primary/30 hover:bg-white/[0.05] transition-colors text-left w-full"
                  >
                    <div className="w-12 h-[72px] rounded-lg overflow-hidden shrink-0 ring-1 ring-white/[0.08] bg-card">
                      <img src={imgUrl(rec.poster_path, "w200")} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-1">
                      <p className="text-xs font-bold line-clamp-2 leading-snug">{getTitle(rec)}</p>
                      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mt-1">
                        {getYear(rec)}
                        {rec.vote_average ? ` · ★ ${rec.vote_average.toFixed(1)}` : ""}
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
