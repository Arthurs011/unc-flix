import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Share2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, getYear, imgUrl, type Movie, type MovieDetails, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import WatchHeader from "@/components/WatchHeader";
import { EASE } from "@/lib/motion";

const CINESRC_ORIGIN = SOURCES[0].baseUrl;

export default function WatchMovie() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  useFullscreenOrientation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastSaveRef = useRef(0);
  const lastProgressRef = useRef<{ currentTime: number; duration: number } | null>(null);
  const seekTo = Math.max(0, Number(searchParams.get("t")) || 0);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0 });
    tmdb.movieDetails(Number(id)).then((data) => {
      setMovie(data);
      document.title = `Watch ${getTitle(data)} · UNCFLIX`;
    }).catch(() => setMovie(null));
    tmdb.movieRecommendations(Number(id)).then((data) => setRecommendations((data.results ?? []).slice(0, 10))).catch(() => setRecommendations([]));
    return () => { document.title = "UNCFLIX"; };
  }, [id]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CINESRC_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== "cinesrc:timeupdate" || typeof data.currentTime !== "number" || typeof data.duration !== "number" || data.duration <= 0 || !id) return;
      lastProgressRef.current = { currentTime: data.currentTime, duration: data.duration };
      const now = Date.now();
      if (now - lastSaveRef.current < 8000 || !movie) return;
      lastSaveRef.current = now;
      const progress = Math.min(100, Math.round((data.currentTime / data.duration) * 100));
      if (progress < 2) return;
      updateContinueWatching({ id: Number(id), type: "movie", title: getTitle(movie), poster_path: movie.poster_path, backdrop_path: movie.backdrop_path, progress, currentTime: data.currentTime, duration: data.duration, timestamp: now });
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      const last = lastProgressRef.current;
      if (last && id && movie) {
        const progress = Math.min(100, Math.round((last.currentTime / last.duration) * 100));
        if (progress >= 2) updateContinueWatching({ id: Number(id), type: "movie", title: getTitle(movie), poster_path: movie.poster_path, backdrop_path: movie.backdrop_path, progress, currentTime: last.currentTime, duration: last.duration, timestamp: Date.now() });
      }
    };
  }, [id, movie]);

  const embedSrc = SOURCES[0].build("movie", id || "") + (seekTo > 0 ? `&t=${seekTo}` : "");

  return (
    <PageShell className="min-h-screen overflow-x-hidden bg-[#030408] pb-24 text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        {movie?.backdrop_path && <img src={imgUrl(movie.backdrop_path, "w1280")} alt="" className="h-full w-full scale-110 object-cover opacity-[0.10] blur-3xl" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#040508]/92 to-black" />
      </div>

      <WatchHeader to={`/movie/${id}`} label="Feature film" title={movie ? getTitle(movie) : "Loading…"} />

      <div className="mx-auto w-full max-w-[1600px] px-0 pt-16 sm:px-6 sm:pt-20 md:pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="min-w-0">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
              <div className="overflow-hidden border-y border-white/[0.08] bg-black shadow-2xl sm:rounded-2xl sm:border">
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <iframe key={embedSrc} src={embedSrc} title={movie ? `${getTitle(movie)} player` : "Streaming player"} className="absolute inset-0 z-10 h-full w-full border-0" allowFullScreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" loading="eager" />
                </div>
              </div>
            </motion.section>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: EASE }} className="px-4 pt-6 sm:px-0 sm:pt-8">
              <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-white/70">HD</span>
                    {movie?.vote_average ? <span className="inline-flex items-center gap-1 text-amber-200"><Star className="h-3 w-3 fill-amber-300" />{movie.vote_average.toFixed(1)}</span> : null}
                    {movie && getYear(movie) ? <span>{getYear(movie)}</span> : null}
                    {movie?.runtime ? <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}
                  </div>
                  <h1 className="text-2xl font-black leading-tight tracking-[-0.04em] text-white sm:text-3xl md:text-4xl">{movie ? getTitle(movie) : "Loading…"}</h1>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                  <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#0c0d14]/70 p-1 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => { setLiked((value) => !value); setDisliked(false); }}
                      aria-label={liked ? "Remove like" : "Like"}
                      aria-pressed={liked}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${liked ? "bg-primary text-[#060e17] font-semibold" : "text-white/60 hover:bg-white/[0.08] hover:text-white"}`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
                      <span>{formatCount(likes(movie, liked))}</span>
                    </button>
                    <span className="mx-1 h-3.5 w-px bg-white/10" />
                    <button
                      type="button"
                      onClick={() => { setDisliked((value) => !value); setLiked(false); }}
                      aria-label={disliked ? "Remove dislike" : "Dislike"}
                      aria-pressed={disliked}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${disliked ? "bg-red-400 text-red-950 font-semibold" : "text-white/60 hover:bg-white/[0.08] hover:text-white"}`}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${disliked ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share movie link"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0c0d14]/70 px-3 text-xs font-medium text-white/60 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-5">
                <p className="max-w-3xl text-pretty text-sm leading-relaxed text-white/55 sm:text-base">{movie?.overview || "No description available."}</p>
                {movie?.genres && movie.genres.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {movie.genres.map((genre) => (
                      <Link key={genre.id} to={`/movies?genre=${genre.id}`} className="rounded border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40 transition-colors hover:border-white/20 hover:text-white/75">
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {recommendations.length > 0 && (
            <aside className="px-4 sm:px-6 lg:sticky lg:top-24 lg:self-start lg:px-0" aria-label="More like this">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">More like this</p>
                <span className="text-[10px] text-white/25">{recommendations.length} titles</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {recommendations.map((rec) => (
                  <Link key={rec.id} to={`/movie/${rec.id}`} className="group flex min-w-0 items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-white/[0.08] hover:bg-white/[0.035]">
                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md border border-white/[0.07] bg-[#0c0d14]">
                      {rec.poster_path && <img src={imgUrl(rec.poster_path, "w200")} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-xs font-semibold text-white/75 transition-colors group-hover:text-white">{getTitle(rec)}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">{getYear(rec)}{rec.vote_average ? ` · ${rec.vote_average.toFixed(1)}` : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function likes(movie: MovieDetails | null, boost: boolean): number {
  if (!movie) return 0;
  return Math.round(movie.vote_count * (movie.vote_average / 10)) + (boost ? 1 : 0);
}

function dislikes(movie: MovieDetails | null, boost: boolean): number {
  if (!movie) return 0;
  return Math.round(movie.vote_count * (1 - movie.vote_average / 10)) + (boost ? 1 : 0);
}
