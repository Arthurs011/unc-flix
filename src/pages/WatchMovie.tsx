import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Share2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, Movie, MovieDetails, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";

export default function WatchMovie() {
  const { id } = useParams();
  useFullscreenOrientation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  useEffect(() => {
    if (!id) return;

    tmdb.movieDetails(Number(id)).then((m) => {
      setMovie(m);
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
      setRecommendations((res.results ?? []).slice(0, 10));
    }).catch(() => setRecommendations([]));
  }, [id]);

  const embedSrc = SOURCES[0].build("movie", id || "");

  const likes = movie ? Math.round(movie.vote_count * (movie.vote_average / 10)) : 0;
  const dislikes = movie ? Math.round(movie.vote_count * (1 - (movie.vote_average / 10))) : 0;

  return (
    <PageShell className="min-h-screen bg-black text-white pb-28 overflow-x-hidden">
      {/* Header */}
      <div className="h-16 flex items-center px-4 sm:px-6 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to={`/movie/${id}`} aria-label="Back to details" className="p-2 rounded-full hover:bg-white/10 mr-3 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-semibold truncate tracking-tight text-white/70">
          {movie ? getTitle(movie) : "Loading..."}
        </h1>
      </div>

      {/* Player */}
      <div className="w-full max-w-[1600px] mx-auto mt-4 sm:mt-6 px-0 sm:px-8">
        <div className="w-full aspect-video bg-zinc-900 relative overflow-hidden shadow-card-lg rounded-none sm:rounded-3xl ring-1 ring-white/10">
          <iframe
            key={embedSrc}
            src={embedSrc}
            className="w-full h-full border-0 relative z-10"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
            title="Streaming Player"
            loading="eager"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <div className="mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Now Streaming</p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[0.95] mb-4">
                {movie ? getTitle(movie) : "Loading..."}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <span className="rounded-full bg-white/[0.07] px-3 py-1 text-[10px] text-white/70">HD</span>
                {movie?.vote_average ? (
                  <span className="flex items-center gap-1.5 text-white/60 normal-case">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                ) : null}
                {movie?.release_date && <span>{movie.release_date}</span>}
              </div>
            </div>

            <div className="flex items-center gap-6 py-5 border-y border-white/[0.06] mb-8">
              <div className="flex items-center gap-2 cursor-pointer group">
                <ThumbsUp className="w-[18px] h-[18px] group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold">{formatCount(likes)}</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group">
                <ThumbsDown className="w-[18px] h-[18px] group-hover:text-red-500 transition-colors" />
                <span className="text-sm font-bold">{formatCount(dislikes)}</span>
              </div>
              <div className="ml-auto flex items-center gap-5">
                <Share2 className="w-[18px] h-[18px] cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              {movie?.overview}
            </p>
          </div>

          {/* Recommendations */}
          <div className="w-full lg:w-80 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-5">More Like This</p>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec) => (
                <Link key={rec.id} to={`/movie/${rec.id}`} className="flex gap-4 group">
                  <div className="w-20 h-[120px] rounded-xl overflow-hidden shrink-0 ring-1 ring-white/[0.08]">
                    <img src={imgUrl(rec.poster_path, "w200")} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{getTitle(rec)}</h4>
                    <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mt-1.5">
                      {rec.release_date?.substring(0, 4)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/"
              className="mt-6 w-full h-12 flex items-center justify-center gap-2.5 rounded-full ring-1 ring-white/15 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
