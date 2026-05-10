import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, X, ExternalLink, RefreshCw, Zap, ThumbsUp, ThumbsDown, Bookmark, Share2, Play, Star, Calendar, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, Movie, MovieDetails, formatCount } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { getEmbedUrl, SOURCES, getPreferredSourceIndex, setPreferredSourceIndex, discoverBestSource, getDownloadUrl } from "@/lib/servers";
import { Button } from "@/components/ui/button";

export default function WatchMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  useFullscreenOrientation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [showFallback, setShowFallback] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(getPreferredSourceIndex());
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Smart Auto-Detection
    discoverBestSource().then((best) => {
      if (localStorage.getItem("uncflix_preferred_source_index") === null) {
        setSourceIndex(best);
      }
      setIsAutoDetecting(false);
    });

    if (!id) return;
    
    // Fetch Movie Details
    tmdb.movieDetails(Number(id)).then(setMovie).catch(() => {});

    // Sync Continue Watching
    tmdb.movieDetails(Number(id)).then((m) => {
      updateContinueWatching({
        id: m.id,
        type: "movie",
        title: getTitle(m),
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        progress: Math.floor(Math.random() * 60) + 10,
        timestamp: Date.now(),
      });
    }).catch(() => {});

    // Recommendations
    tmdb.movieRecommendations(Number(id)).then((res) => {
      setRecommendations((res.results ?? []).slice(0, 10));
    }).catch(() => setRecommendations([]));
  }, [id]);

  useEffect(() => {
    setShowFallback(false);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      setShowFallback(true);
    }, 15000);
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [id, sourceIndex]);

  const embedSrc = id ? getEmbedUrl(sourceIndex, "movie", id) : "";

  const handleSwitchSource = () => {
    const nextIndex = (sourceIndex + 1) % SOURCES.length;
    setSourceIndex(nextIndex);
    setPreferredSourceIndex(nextIndex);
  };

  // Calculate dynamic likes/dislikes
  const likes = movie ? Math.round(movie.vote_count * (movie.vote_average / 10)) : 0;
  const dislikes = movie ? Math.round(movie.vote_count * (1 - (movie.vote_average / 10))) : 0;

  return (
    <div className="min-h-screen bg-black text-white pb-32 sm:pb-20">
      {/* Top Header */}
      <div className="h-16 sm:h-20 flex items-center px-4 sm:px-8 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link to={`/movie/${id}`} className="p-2 rounded-full hover:bg-white/10 transition-colors mr-2 sm:mr-4">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Now Playing</span>
          <h1 className="text-xs sm:text-sm font-bold truncate pr-4 uppercase italic tracking-tight">
            {movie ? getTitle(movie) : "Loading..."}
          </h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isAutoDetecting ? (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-bold animate-pulse">
                <Zap className="w-3 h-3 fill-current" />
                <span className="hidden xs:inline">Detecting...</span>
             </div>
          ) : (
            <button
              onClick={handleSwitchSource}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-primary transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-white/10"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden xs:inline">{SOURCES[sourceIndex].name}</span>
              <span className="xs:hidden">Switch</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Player Area */}
      <div className="w-full aspect-video bg-zinc-900 relative group overflow-hidden shadow-2xl">
        <iframe
          key={`${id}-${sourceIndex}`}
          src={embedSrc}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Movie Player"
          onLoad={() => {
            if (fallbackTimerRef.current) {
              clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }
            setShowFallback(false);
          }}
        />

        {showFallback && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="text-center p-10 bg-zinc-900 rounded-[2rem] max-w-sm border border-white/5 shadow-2xl">
              <RefreshCw className="w-12 h-12 text-primary animate-spin-slow mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Source Timeout</h3>
              <p className="text-sm text-white/50 mb-8 leading-relaxed">The server is responding slowly. Let's try another one.</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSwitchSource}
                  className="h-14 rounded-full bg-primary text-white font-black uppercase italic tracking-tighter hover:scale-105 transition-all"
                >
                  Switch Source
                </Button>
                <a
                  href={embedSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 flex items-center justify-center gap-2 rounded-full bg-white/5 text-white font-bold uppercase text-xs border border-white/10 hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Player
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 mt-6 sm:mt-10">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
          
          {/* Left Column: Metadata */}
          <div className="flex-1 order-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="space-y-2">
                <h3 className="text-primary font-bold uppercase tracking-widest text-[10px] sm:text-sm italic">
                  Full Movie
                </h3>
                <h1 className="text-2xl sm:text-5xl font-black tracking-tighter leading-[0.9] italic uppercase">
                  {movie ? getTitle(movie) : "Loading Title..."}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-black text-white/80 uppercase">U/A 16+</span>
                  <span className="text-white/40 font-bold text-xs uppercase">•</span>
                  <span className="flex items-center gap-1.5 text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                     <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                     {movie?.vote_average.toFixed(1)}
                  </span>
                  <span className="text-white/40 font-bold text-xs uppercase">•</span>
                  <span className="text-white/40 font-bold text-[10px] sm:text-xs uppercase">{movie?.release_date || "Unknown"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                 <button className="flex-1 sm:flex-none flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                    <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
                 <button className="flex-1 sm:flex-none flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8 py-4 border-y border-white/5">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <ThumbsUp className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                    <span className="text-sm font-black italic">{formatCount(likes)}</span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer">
                    <ThumbsDown className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                    <span className="text-sm font-black italic">{formatCount(dislikes)}</span>
                </div>

                <a 
                    href={getDownloadUrl("movie", id || "")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors"
                >
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-black italic uppercase tracking-tighter">Download</span>
                </a>

                <div className="ml-auto flex items-center gap-4 text-white/40 font-black uppercase text-[10px] tracking-widest italic">
                    <span className="hidden sm:inline">Share Movie</span>
                    <Share2 className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
                </div>
            </div>

            <div className="space-y-4 max-w-4xl">
                <p className="text-white/70 text-base sm:text-lg leading-relaxed font-medium">
                    {movie?.overview || "No description available for this title."}
                </p>
                <button className="text-primary font-black uppercase italic tracking-tighter text-sm hover:underline">
                    Show More
                </button>
            </div>
          </div>

          {/* Right Column: Up Next */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-6 sm:space-y-8 order-2">
            
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Recommended</h4>
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec) => (
                    <Link key={rec.id} to={`/movie/${rec.id}`} className="group flex gap-4 p-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary transition-all duration-500">
                        <div className="w-24 h-32 shrink-0 rounded-xl overflow-hidden relative shadow-lg">
                            <img src={imgUrl(rec.poster_path, "w200")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={getTitle(rec)} />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-6 h-6 fill-current" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-1 overflow-hidden">
                            <h5 className="font-black italic uppercase text-xs sm:text-sm line-clamp-2 group-hover:text-white">{getTitle(rec)}</h5>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black bg-white/10 px-1.5 py-0.5 rounded uppercase">{rec.release_date?.substring(0, 4)}</span>
                                <span className="text-[8px] font-bold text-white/40 uppercase group-hover:text-white/80 italic">Highly Rated</span>
                            </div>
                        </div>
                    </Link>
                  ))}
                </div>
            </div>

            <Button variant="outline" asChild className="w-full h-14 rounded-full border-white/10 bg-transparent font-black uppercase italic tracking-tighter hover:bg-white hover:text-black transition-all gap-3">
                <Link to="/">
                    <Play className="w-4 h-4 fill-current" />
                    Browse All Content
                </Link>
            </Button>

          </div>

        </div>
      </div>
    </div>
  );
}
