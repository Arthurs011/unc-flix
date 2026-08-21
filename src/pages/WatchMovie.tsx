import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Download, ThumbsUp, ThumbsDown, Share2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, Movie, MovieDetails, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";

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
    <div className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 bg-zinc-950 sticky top-0 z-50">
        <Link to={`/movie/${id}`} className="p-2 rounded-full hover:bg-white/10 mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-sm font-bold truncate tracking-tight uppercase italic text-white/80">
          {movie ? getTitle(movie) : "Loading..."}
        </h1>
      </div>

      {/* Player Container */}
      <div className="w-full max-w-[1600px] mx-auto mt-4 sm:mt-8 px-0 sm:px-8">
        <div className="w-full aspect-video bg-zinc-900 relative group overflow-hidden shadow-2xl rounded-none sm:rounded-2xl border border-white/5">
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
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
             <div className="space-y-2 mb-8">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] italic">Now Streaming</span>
                <h1 className="text-3xl sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
                  {movie ? getTitle(movie) : "Loading..."}
                </h1>
                <div className="flex items-center gap-4 pt-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">HD Quality</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white/60">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    {movie?.vote_average.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{movie?.release_date}</span>
                </div>
             </div>

            <div className="flex items-center gap-8 py-6 border-y border-white/5 mb-8">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <ThumbsUp className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="text-sm font-black italic tracking-tighter">{formatCount(likes)}</span>
              </div>
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <ThumbsDown className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                <span className="text-sm font-black italic tracking-tighter">{formatCount(dislikes)}</span>
              </div>
              <div className="ml-auto flex items-center gap-6">
                 <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group">
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline text-xs font-black uppercase tracking-tighter">Fast Download</span>
                 </div>
                 <Share2 className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-4xl font-medium">
              {movie?.overview}
            </p>
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">More Like This</h3>
            <div className="space-y-5">
              {recommendations.slice(0, 5).map((rec) => (
                <Link key={rec.id} to={`/movie/${rec.id}`} className="flex gap-4 group">
                  <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0 shadow-2xl border border-white/5">
                    <img src={imgUrl(rec.poster_path, "w200")} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-black uppercase italic text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">{getTitle(rec)}</h4>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase">{rec.release_date?.substring(0, 4)}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-bold text-primary uppercase italic">Action</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <Link to="/" className="w-full h-14 flex items-center justify-center rounded-full border border-white/10 bg-transparent font-black uppercase italic tracking-tighter hover:bg-white hover:text-black transition-all gap-3 mt-4">
              <Play className="w-4 h-4 fill-current" />
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
